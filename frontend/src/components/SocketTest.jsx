import React, { useEffect } from "react";
import io from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

const SocketTest = () => {
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("Connected to the server");
    });
    // clean up
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Socket.io Connection Test</h1>
    </div>
  );
};

export default SocketTest;
