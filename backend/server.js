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

app.get("/", (req, res) => {
  res.send("DropZone by fm-anderson");
});

io.on("connection", (socket) => {
  console.log("a user connected: " + socket.id);
  connectedUsers[socket.id] = { id: socket.id };

  io.emit("users-list", Object.values(connectedUsers));

  socket.on("disconnect", () => {
    console.log("user disconnected: " + socket.id);
    delete connectedUsers[socket.id];
    io.emit("users-list", Object.values(connectedUsers));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
