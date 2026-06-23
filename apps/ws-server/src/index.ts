import prisma from "@repo/db/client";
import { auth } from "@repo/auth/server";
import { WebSocketServer } from "ws";
import type { IncomingMessage } from "http";

const ws = new WebSocketServer({ port: 8080 });

/**
 * Authenticate a WebSocket connection using the session token.
 *
 * Clients should connect with the token as a query parameter:
 *   ws://localhost:8080?token=<session-token>
 *
 * Or via the Authorization header:
 *   Authorization: Bearer <session-token>
 */
async function authenticateWs(req: IncomingMessage) {
  try {
    // Try query parameter first
    const url = new URL(req.url || "", `http://localhost:8080`);
    const token = url.searchParams.get("token");

    if (token) {
      // Use Bearer token auth
      const session = await auth.api.getSession({
        headers: new Headers({
          Authorization: `Bearer ${token}`,
        }),
      });
      return session;
    }

    // Try Authorization header
    const authHeader = req.headers["authorization"];
    if (authHeader) {
      const session = await auth.api.getSession({
        headers: new Headers({
          Authorization: authHeader,
        }),
      });
      return session;
    }

    // Try cookie-based auth
    const cookie = req.headers["cookie"];
    if (cookie) {
      const session = await auth.api.getSession({
        headers: new Headers({
          cookie,
        }),
      });
      return session;
    }

    return null;
  } catch (error) {
    console.error("[WS Auth] Error:", error);
    return null;
  }
}

ws.on("connection", async (socket, req) => {
  // Authenticate the connection
  const session = await authenticateWs(req);

  if (!session) {
    socket.send(JSON.stringify({ error: "Unauthorized — valid session required" }));
    socket.close(1008, "Unauthorized");
    return;
  }

  const user = session.user;
  console.log(`[WS] Client connected: ${user.name} (${user.email}), role=${user.role}`);

  socket.send(
    JSON.stringify({
      type: "welcome",
      message: `Welcome ${user.name}!`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  );

  socket.on("message", (data) => {
    console.log(`[WS] Message from ${user.name}: ${data}`);
  });

  socket.on("close", () => {
    console.log(`[WS] Client disconnected: ${user.name}`);
  });
});

console.log("🔌 WebSocket server running on ws://localhost:8080");
