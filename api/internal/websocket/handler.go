package websocket

import (
	"log"
	"net/http"

	"foundersignal/internal/dto/response"
	"foundersignal/internal/pkg/auth"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		return origin == "http://localhost:3000"
	},
}

// ServeWs handles websocket requests from the peer.
func ServeWs(hub *Hub, tokenAuthenticator auth.TokenAuthenticator, w http.ResponseWriter, r *http.Request) {
	// Authenticate user from token in query param
	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "Missing auth token", http.StatusUnauthorized)
		return
	}

	userID, err := tokenAuthenticator.ValidateToken(r.Context(), token)
	if err != nil {
		log.Printf("WebSocket authentication failed: %v", err)
		http.Error(w, "Invalid auth token", http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{
		hub:    hub,
		conn:   conn,
		send:   make(chan *response.ActivityItem, 256), // Buffer size for send channel
		UserID: userID,
	}
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()

	log.Printf("WebSocket connection established for user: %s", userID)
}
