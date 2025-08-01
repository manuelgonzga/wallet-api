import { verifyToken } from "@clerk/clerk-sdk-node"; 

export async function verifyClerkToken(req, res, next) {
  try {
    console.log("=== TOKEN VERIFICATION DEBUG ===");
    const authHeader = req.headers.authorization;
    console.log("Authorization header:", authHeader ? "Present" : "Missing");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Invalid authorization header format");
      return res.status(401).json({ error: "Missing or invalid Authorization header." });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token extracted, length:", token ? token.length : 0);

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    console.log("Token verified successfully, user ID:", payload.sub);
    req.auth = { userId: payload.sub };
    next();

  } catch (error) {
    console.error("=== TOKEN VERIFICATION ERROR ===");
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "Unauthorized." });
  }
}
