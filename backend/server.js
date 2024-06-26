const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.use(cors());

let connectedUsers = {};
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_BASE64_SIZE = (MAX_FILE_SIZE * 4) / 3; // Adjusting for base64 overhead

app.get("/", (req, res) => {
  res.send("DropZone by fm-anderson");
});

io.on("connection", (socket) => {
  console.log("a user connected: " + socket.id);
  connectedUsers[socket.id] = { id: socket.id };

  io.emit("users-list", Object.values(connectedUsers));

  socket.on("send-file", ({ fileData, fileName, to }) => {
    if (fileData.length > MAX_BASE64_SIZE) {
      console.log("File size exceeds limit.");
      socket.emit("error", { message: "File size exceeds the 5MB limit." });
      return;
    }
    socket.to(to).emit("receive-file", { fileData, fileName, from: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected: " + socket.id);
    delete connectedUsers[socket.id];
    io.emit("users-list", Object.values(connectedUsers));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
