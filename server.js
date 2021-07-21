const express = require("express");
const app = express();
require("dotenv").config();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 8000;
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const messageRoute = require("./routes/conversation");
const path = require("path");
app.use(express.static(path.join(__dirname, "client")));

require("./utils/mongoConnection");

io.on("connection", (socket) => {
  // console.log(socket.id);
  // console.log(socket.handshake.query.user);
  socket.join(socket.handshake.query.user);
  app.set("socket", socket);
});

app.set("io", io);
app.use(cors());

app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api", authRoute);
app.use("/api", messageRoute);

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "build/index.html"));
// });

app.get("*", function (req, res) {
  const index = path.join(__dirname, "client", "index.html");
  res.sendFile(index);
});

server.listen(PORT);
