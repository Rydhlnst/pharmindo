import { app } from "./src/routes.js";
import { serve } from "@hono/node-server";

// We will mock the authMiddleware by hacking the route just for this test
app.get("/test-aspirations-endpoint", async (c) => {
  // Mock the session user
  c.set("sessionUser", { id: "712ac8b5-8352-4677-a3e1-8ff19c28cd59", role: "WARGA", name: "Faiq" });
  
  // Forward to /aspirations logic
  const req = new Request("http://localhost/aspirations?page=1&limit=50");
  const res = await app.request(req, {
    // we inject the mock context manually? No, app.request creates a new context.
    // Instead we can just redefine the route here to test the logic
  });
});

console.log("We need to mock properly");
