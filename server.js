import http from "http";

const PORT = 3000;

const routes = {
  "/": (req, res) => {
    res.end("Welcome to the homepage!");
  },
  "/about": (req, res) => {
    res.end("Welcome to the about page!");
  },
"/contact": (req, res) => {
    res.end("Welcome to the contact page!");
},
};

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  routes[req.url](req, res);
});

server.listen(PORT, () => {
    console.log("Server running at http://localhost:3000/");
});
