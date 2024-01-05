import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  // _ meaning ho66e akhane res ta user ho66e na sei karone dayoa ata. That call production level code 
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");
  
    if (!token) {
      throw new ApiError(401, "Unautorized request");
    }
   
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  
    //database query
   const user =  await User.findById(decodedToken?._id).select("-password -refreshToken")
  
   if(!user){
      throw new ApiError("401", "Unauthroized user access")
   }
  
   req.user = user;
   next();
  
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
  }
});
