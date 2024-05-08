// This is the main file that starts the server and listens for incoming socket connections.
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const traceRoute = require("./utils/trace-route.js");
const iplocation = require("./utils/ip-location.js");
const e = require("express");

app.use(express.static("public"));

// listen for incoming socket connections
io.on("connection", (socket) => {
  console.log("A user connected");
  // listen for the trace event
  socket.on("trace", (destination) => {
    traceRoute(destination, (complete, error, hop) => {
      if (complete) {
        socket.emit("trace-complete");
      } else if (error) {
        socket.emit("trace-error", error);
      } else {
        iplocation(hop.ip, (error, location) => {
          if (error) {
            socket.emit("location-error", error);
          } else {
            location.hop = hop;
            socket.emit("location", location);
          }
        });
      }
    });
  });
  // listen for the disconnect event
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.get("/api/ip-location", (req, res) => {
  iplocation(req.query.ip, (error, location) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.send(location);
    }
  });
});

// listen for incoming HTTP requests on port 3000
http.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
