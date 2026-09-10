// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");


const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // 1. Check if header exists and has 'Bearer ' prefix
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access token missing or invalid format. Expected 'Bearer <token>'"
            });
        }

        // 2. Extract and trim the token string
        const token = authHeader.split(" ")[1]?.trim();

        if (!token || token === "undefined" || token === "null") {
            return res.status(401).json({
                success: false,
                message: "Malformed or empty token provided."
            });
        }

        // 3. Verify signature using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Attach user data to req object
        req.user = decoded;

        next();
        console.log("Token is verified")
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired. Please refresh or log in again."
            });
        }
        return res.status(401).json({
            success: false,
            message: "Authentication failed",
            error: error.message
        });
    }
};

module.exports = {verifyToken};


