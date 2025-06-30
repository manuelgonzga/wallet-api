import ratelimit from "../config/upstash.js";

const rateLimiter = async(req,res,next) => {
    try {
        //Hay que cambiarlo para que no todos los usuarios tengan la misma cuota
        const {success} = await ratelimit.limit("my-rate-limit");

        if(!success){
            return res.status(429).json({message: "Too many request, please try again later"});
        }

        next()
    } catch (error) {
        console.log("Rate limit error", error);
        next(error);
    }
};

export default rateLimiter;