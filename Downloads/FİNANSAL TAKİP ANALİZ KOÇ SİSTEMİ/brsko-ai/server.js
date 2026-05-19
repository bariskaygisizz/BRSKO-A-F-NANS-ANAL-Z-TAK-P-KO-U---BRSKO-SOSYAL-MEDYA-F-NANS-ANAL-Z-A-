const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for the hackathon
    methods: ["GET", "POST"]
  }
});

let onlineUsers = 0;

io.on("connection", (socket) => {
  onlineUsers++;
  console.log(`User connected. Online: \${onlineUsers}`);
  
  // Broadcast updated user count
  io.emit("system_update", { type: "user_count", count: onlineUsers });
  io.emit("receive_message", { 
    id: Date.now(),
    text: "Bir yatırımcı sohbete katıldı.", 
    sender: "Sistem", 
    isSystem: true,
    timestamp: new Date().toLocaleTimeString()
  });

  socket.on("send_message", (data) => {
    // Broadcast message to everyone
    io.emit("receive_message", {
      ...data,
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString()
    });
  });

  socket.on("disconnect", () => {
    onlineUsers--;
    console.log(`User disconnected. Online: \${onlineUsers}`);
    io.emit("system_update", { type: "user_count", count: onlineUsers });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`BRSKO AI Live Chat Server running on port \${PORT}`);
});
