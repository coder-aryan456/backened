import ApiError from "../utils/Apierror.js";
import { asynchandler } from "../utils/ascynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyjwt = asynchandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accesToken || req.header("Authorization")?.replace("Bearer", "");
        console.log(token)
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
        console.log("hurry");
        // console.log(process.env.ACCESS_TOKEN_SECRET);
        try {
            console.log(typeof(token))
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            console.log("hsdad");

            const user = await User.findById(decoded?._id).select("-password -refreshToken");
            console.log(user);
            console.log("hurry");

            if (!user) {
                throw new ApiError(401, "Invalid Access Token");
            }

            req.user = user;
            next();
        } catch (error) {
            console.error("Error verifying JWT:", error);
            throw new ApiError(401, "Invalid Access Token");
        }
    } catch (error) {
        throw new ApiError(401, "Invalid access token");
    }
});
