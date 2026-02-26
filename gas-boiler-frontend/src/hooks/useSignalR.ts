import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

interface SignalRConnection {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  error: string | null;
}

export const useSignalR = (
  hubUrl: string,
  token: string,
): SignalRConnection => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          const delay = Math.min(
            2000 * Math.pow(2, retryContext.previousRetryCount),
            30000,
          );
          console.log(
            `🔄 Reconnecting in ${delay / 1000}s... (attempt ${retryContext.previousRetryCount + 1})`,
          );
          return delay;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    connection.onreconnecting((error) => {
      console.log("🔄 SignalR reconnecting...", error);
      setIsConnected(false);
      setError("Reconnecting...");
    });

    connection.onreconnected((connectionId) => {
      console.log("✅ SignalR reconnected:", connectionId);
      setIsConnected(true);
      setError(null);
    });

    connection.onclose((error) => {
      console.log("❌ SignalR connection closed", error);
      setIsConnected(false);
      setError(error?.message || "Connection closed");
    });

    const startConnection = async () => {
      try {
        await connection.start();
        console.log(
          "✅ SignalR connected! ConnectionId:",
          connection.connectionId,
        );
        setIsConnected(true);
        setError(null);
      } catch (err: any) {
        console.error("❌ SignalR connection failed:", err.message);
        setError(err.message);
        setIsConnected(false);
        console.log("⏳ Retrying in 5 seconds...");
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    return () => {
      if (connection.state === signalR.HubConnectionState.Connected) {
        console.log("🔌 Disconnecting SignalR...");
        connection.stop();
      }
    };
  }, [hubUrl, token]);

  return {
    connection: connectionRef.current,
    isConnected,
    error,
  };
};

export const useSignalREvent = <T>(
  connection: signalR.HubConnection | null,
  eventName: string,
  handler: (data: T) => void,
) => {
  useEffect(() => {
    if (!connection) return;

    connection.on(eventName, handler);
    console.log(`Listening for "${eventName}" events`);

    return () => {
      connection.off(eventName, handler);
      console.log(`Stopped listening for "${eventName}" events`);
    };
  }, [connection, eventName, handler]);
};
