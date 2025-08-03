"use client";

import { webSocketService } from "@/lib/ws";
import { Activity } from "@/types/activity";
import { useAuth } from "@clerk/nextjs";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { getInitialActivity } from "./get-activity";

const MAX_DISPLAY_ACTIVITIES = 20;

interface ActivityContextType {
  activities: Activity[];
  isConnected: boolean;
  isLoadingInitial: boolean; // loading state
  unreadCount: number;
  markAllAsRead: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined
);

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [initialActivitiesFetched, setInitialActivitiesFetched] =
    useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { getToken } = useAuth();

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    const getInitialData = async () => {
      if (!initialActivitiesFetched) {
        setIsLoadingInitial(true);
        try {
          // getToken is not directly needed for getInitialActivity as it's a server action
          // and will use server-side auth context if necessary.
          // However, we might only want to fetch if the user is logged in.
          const token = await getToken(); // Check if user is authenticated
          if (token) {
            const initialData = await getInitialActivity(
              MAX_DISPLAY_ACTIVITIES
            );
            setActivities(initialData);
            setUnreadCount(initialData.length); // Set unread count based on initial activities
          } else {
            console.log(
              "ActivityProvider: No auth token, not fetching initial activities."
            );
            setActivities([]);
          }
        } catch (error) {
          console.error(
            "ActivityProvider: Error fetching initial activities:",
            error
          );
          setActivities([]);
        } finally {
          setIsLoadingInitial(false);
          setInitialActivitiesFetched(true);
        }
      }
    };

    getInitialData();
  }, [getToken, initialActivitiesFetched]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    const manageConnection = async () => {
      if (!initialActivitiesFetched || isLoadingInitial) {
        // Wait for initial activities to be fetched
        return;
      }

      const token = await getToken();

      if (token && isMounted) {
        try {
          webSocketService.connect(
            token,
            () => {
              // onOpen
              if (isMounted) setIsConnected(true);
            },
            () => {
              // onClose
              if (isMounted) setIsConnected(false);
            }
          );

          unsubscribe = webSocketService.subscribe((newActivity) => {
            if (isMounted) {
              setActivities((prevActivities) => {
                // Prevent duplicates if the same activity ID arrives
                const activityExists = prevActivities.some(
                  (act) => act.id === newActivity.id
                );
                if (activityExists) {
                  return prevActivities;
                }
                const updatedActivities = [newActivity, ...prevActivities];

                if (newActivity.message) {
                  toast.info(newActivity.message, {
                    id: `activity-${newActivity.id}`,
                    position: "top-right",
                    duration: 5000,
                    dismissible: true,
                    ...(newActivity.referenceUrl && {
                      action: {
                        label: "View",
                        onClick: () => {
                          console.log(
                            "Navigating to activity:",
                            newActivity.id
                          );
                          window.open(newActivity.referenceUrl, "_blank");
                        },
                      },
                      actionButtonStyle: {
                        color: "var(--primary-foreground)",
                        backgroundColor: "var(--primary)",
                        borderRadius: "calc(var(--radius)  - 2px)",
                      },
                    }),
                  });
                }

                setUnreadCount((prev) => prev + 1);
                return updatedActivities.slice(0, MAX_DISPLAY_ACTIVITIES);
              });
            }
          });
        } catch (error) {
          console.error("ActivityProvider: WebSocket connection error:", error);
          if (isMounted) setIsConnected(false);
        }
      } else {
        if (isMounted) {
          console.log(
            "ActivityProvider: No auth token or component unmounted, WebSocket not connected."
          );
          setIsConnected(false);
          if (webSocketService.isConnected()) {
            webSocketService.disconnect();
          }
        }
      }
    };

    manageConnection();

    return () => {
      isMounted = false; // Cleanup function to prevent state updates on unmounted component
      if (unsubscribe) {
        unsubscribe();
      }
      // Disconnect WebSocket when the provider unmounts or dependencies change leading to re-run
      if (webSocketService.isConnected()) {
        webSocketService.disconnect();
      }
      setIsConnected(false); // Reset connection state
    };
  }, [getToken, initialActivitiesFetched, isLoadingInitial]);

  return (
    <ActivityContext.Provider
      value={{
        activities,
        isConnected,
        isLoadingInitial,
        unreadCount,
        markAllAsRead,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = (): ActivityContextType => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
};
