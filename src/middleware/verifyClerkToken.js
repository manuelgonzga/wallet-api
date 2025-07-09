import { verifyToken } from "@clerk/backend"; 

export async function verifyClerkToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header." });
    }

    const token = authHeader.split(" ")[1];

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    req.auth = { userId: payload.sub };
    next();

  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "Unauthorized." });
  }
}
