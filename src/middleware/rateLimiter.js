import ratelimit from "../config/upstash.js";

const rateLimiter = async(req, res, next) => {
    try {
        // Usar IP del usuario como identificador único
        const identifier = req.ip || req.connection.remoteAddress || 'unknown';
        
        // Rate limit específico por IP
        const { success } = await ratelimit.limit(`rate-limit:${identifier}`);

        if (!success) {
            return res.status(429).json({
                error: "Too many requests",
                message: "Rate limit exceeded. Please try again later.",
                retryAfter: 60 // segundos
            });
        }

        next();
    } catch (error) {
        console.error("Rate limit error:", error);
        // En caso de error con rate limiting, permitir la request pero loggear el error
        next();
    }
};

export default rateLimiter;