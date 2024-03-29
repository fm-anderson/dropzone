import { useEffect, useState } from "react";
import io from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

const SocketTest = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [receivedFiles, setReceivedFiles] = useState([]);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("Connected to the server");
    });

    socket.on("users-list", (connectedUsers) => {
      // filter current user out of the active users list
      setUsers(connectedUsers.filter((user) => user.id !== socket.id));
    });

    socket.on("receive-file", ({ fileData, fileName, from }) => {
      console.log(`Received file: ${fileName} from ${from}`);
      setReceivedFiles((prevFiles) => [
        ...prevFiles,
        { fileData, fileName, from },
      ]);
    });

    if (selectedFile && selectedUser) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log(e.target.result);
        socket.emit("send-file", {
          fileData: e.target.result,
          fileName: selectedFile.name,
          to: selectedUser,
        });
      };
      reader.readAsDataURL(selectedFile);
    }

    // clean up
    return () => {
      socket.disconnect();
    };
  }, [selectedFile, selectedUser]);

  const handleFileChange = (e) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    const file = e.target.files[0];
    if (file && file.size > MAX_FILE_SIZE) {
      alert("File size exceeds the 5MB limit.");

      e.target.value = null;
    } else {
      setSelectedFile(file);
    }
  };

  const handleUserSelection = (e) => {
    setSelectedUser(e.target.value);
  };

  const downloadFile = (fileData, fileName) => {
    // Convert base64 string to a Blob
    const byteString = atob(fileData.split(",")[1]);
    const mimeString = fileData.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-bold text-2xl uppercase">Send File</h1>

      <select onChange={handleUserSelection} value={selectedUser}>
        <option value="">Select a user</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.id}
          </option>
        ))}
      </select>
      <input type="file" onChange={handleFileChange} />

      <div>
        <h2>Received Files</h2>
        {receivedFiles.map((file, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span>
              {file.fileName} from {file.from}
            </span>
            <button onClick={() => downloadFile(file.fileData, file.fileName)}>
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocketTest;
