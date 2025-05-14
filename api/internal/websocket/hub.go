package websocket

import (
	"foundersignal/internal/dto/response"
	"log"
	"sync"
)

// Hub maintains the set of active clients and broadcasts messages to the clients.
type Hub struct {
	clients    map[*Client]bool
	clientsMux sync.RWMutex

	userClients    map[string]map[*Client]bool // Map userID to a set of their clients
	userClientsMux sync.RWMutex

	broadcast  chan *response.ActivityItem // Inbound messages from the services
	register   chan *Client
	unregister chan *Client
}

func NewHub() *Hub {
	return &Hub{
		broadcast:   make(chan *response.ActivityItem),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
		clients:     make(map[*Client]bool),
		userClients: make(map[string]map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clientsMux.Lock()
			h.clients[client] = true
			h.clientsMux.Unlock()

			h.userClientsMux.Lock()
			if _, ok := h.userClients[client.UserID]; !ok {
				h.userClients[client.UserID] = make(map[*Client]bool)
			}
			h.userClients[client.UserID][client] = true
			h.userClientsMux.Unlock()
			log.Printf("Client registered for user %s", client.UserID)

		case client := <-h.unregister:
			h.clientsMux.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.clientsMux.Unlock()

			h.userClientsMux.Lock()
			if userConns, ok := h.userClients[client.UserID]; ok {
				if _, clientOk := userConns[client]; clientOk {
					delete(userConns, client)
					if len(userConns) == 0 {
						delete(h.userClients, client.UserID)
					}
				}
			}
			h.userClientsMux.Unlock()
			log.Printf("Client unregistered for user %s", client.UserID)

		case message := <-h.broadcast: // This channel will be used by the Broadcaster
			// This is a generic broadcast to all. We need user-specific.
			// This specific broadcast channel on the hub might not be directly used if
			// all broadcasts are user-specific via BroadcastToUser.
			// For now, let's assume it's for potential global messages or testing.
			var clientsToUnregister []*Client
			h.clientsMux.RLock()
			log.Printf("Broadcasting message to all clients: %s", message.Message)
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					// close(client.send)
					// delete(h.clients, client)

					// Mark client for unregistration if its send buffer is full
					log.Printf("Client send channel full during generic broadcast for client %s (conn: %p). Marking for unregistration.", client.UserID, client.conn)
					clientsToUnregister = append(clientsToUnregister, client)
				}
			}
			h.clientsMux.RUnlock()

			// Unregister clients outside the RLock critical section
			for _, client := range clientsToUnregister {
				// Ensure unregistering is safe and doesn't deadlock
				// Sending to unregister channel is generally safer
				go func(c *Client) { c.hub.unregister <- c }(client)
			}
		}
	}
}

// BroadcastToUser sends a message to all clients of a specific user.
func (h *Hub) BroadcastToUser(userID string, message *response.ActivityItem) {
	h.userClientsMux.RLock()
	defer h.userClientsMux.RUnlock()

	if userConns, ok := h.userClients[userID]; ok {
		log.Printf("Broadcasting to user %s, activity: %s", userID, message.Message)
		for client := range userConns {
			select {
			case client.send <- message:
			default:
				// If send buffer is full, client is too slow.
				// Consider closing the connection or dropping the message.
				// For now, we'll let the writePump handle closing on error.
				log.Printf("Client send channel full for user %s. Message dropped for one client.", userID)
			}
		}
	} else {
		log.Printf("No active clients for user %s to broadcast message.", userID)
	}
}
