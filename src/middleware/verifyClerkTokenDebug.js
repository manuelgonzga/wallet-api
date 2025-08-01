// Middleware temporal para debugging - NO USAR EN PRODUCCIÓN
export async function verifyClerkTokenDebug(req, res, next) {
  try {
    console.log("=== DEBUG TOKEN VERIFICATION ===");
    const authHeader = req.headers.authorization;
    console.log("Authorization header:", authHeader ? "Present" : "Missing");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Invalid authorization header format");
      return res.status(401).json({ error: "Missing or invalid Authorization header." });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token extracted, length:", token ? token.length : 0);

    // TEMPORAL: Bypass real verification for debugging
    // Extract user ID from token payload manually (unsafe but for debugging)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("Token payload:", payload);
      
      if (payload.sub) {
        req.auth = { userId: payload.sub };
        console.log("User ID extracted:", payload.sub);
        next();
        return;
      }
    } catch (decodeError) {
      console.log("Failed to decode token payload:", decodeError.message);
    }

    // Si no funciona el bypass, intentar verificación real
    try {
      const { verifyToken } = await import("@clerk/clerk-sdk-node");
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      console.log("Token verified successfully, user ID:", payload.sub);
      req.auth = { userId: payload.sub };
      next();
    } catch (verifyError) {
      console.error("Token verification failed:", verifyError.message);
      return res.status(401).json({ error: "Unauthorized", details: verifyError.message });
    }

  } catch (error) {
    console.error("=== TOKEN VERIFICATION ERROR ===");
    console.error("Error details:", error);
    return res.status(401).json({ error: "Unauthorized", details: error.message });
  }
}
