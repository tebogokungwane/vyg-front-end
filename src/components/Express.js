const http = require("http");

const allowedOrigin = "http://localhost:3000";

const server = http.createServer((req, res) => {
  // Enable CORS manually
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Simulated response for login
  if (req.url === "/api/member/login" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const requestData = JSON.parse(body);
      const { email, password } = requestData;

      if (email === "admin@example.com" && password === "password123") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ token: "fake-jwt-token", member: { email } }));
      } else {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid email or password" }));
      }
    });

    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(2025, () => {
  console.log("🚀 Server is running on http://localhost:2025");
});
