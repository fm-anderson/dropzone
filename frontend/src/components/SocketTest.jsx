import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

const SocketTest = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target.result;
        socket.emit("file-selected", {
          file: fileData,
          fileName: selectedFile.name,
        });
      };
      reader.readAsDataURL(selectedFile);
    }

    socket.on("connect", () => {
      console.log("Connected to the server");
    });

    // clean up
    return () => {
      socket.disconnect();
    };
  }, [selectedFile]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <div>
      <h1>Socket.io Connection Test</h1>
      <input type="file" onChange={handleFileChange} />
    </div>
  );
};

export default SocketTest;
