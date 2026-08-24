import jwt from "jsonwebtoken";
import { User } from "../Models/User.js";

export const authMiddleware = async(req, res, next) => {
    try{

      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            success:false,
            message: "No token provided",
        });
      }

       const token = authHeader.split(" ")[1];

     const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "yash_jwt_secret"
    );

  const user = await User.findById(decoded.id).select("-password");

  if(!user){
    return res.status(404).json({
        success: false,
        message: "User not found",
    });
  }

  req.user = user;
next();
}catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}