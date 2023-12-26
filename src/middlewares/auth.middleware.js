import ApiError from "../utils/Apierror.js";
import { asynchandler } from "../utils/ascynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
export const verifyjwt = asynchandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accesToken || req.header("Authorization")?.replace("Bearer", "")
        if (!token) {
            throw new ApiError(401, "unauthorized request")
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "invalid Access Token");
        }
        req.user = user;
        next()
    } catch (error) {
      throw new ApiError(401,"invalid access token")
    }

})