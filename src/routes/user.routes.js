import { Router } from "express";
import { ChangeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginuser, logout, refreshAccessToken, registerUser, updateAccoundDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";
const router = Router()
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
        , {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)
router.route("/login").post(loginuser);
router.route("/logout").post(verifyjwt,logout) 
router.route("/refresh-token").post(refreshAccessToken);  
router.route("/change-password").post(verifyjwt,ChangeCurrentPassword)
router.route("/current-user").get(verifyjwt,getCurrentUser)
router.route("/update-account").patch(verifyjwt,updateAccoundDetails)
router.route("/avatar").patch(verifyjwt,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyjwt,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyjwt,getUserChannelProfile)
router.route("/history").get(verifyjwt,getWatchHistory)
export default router
//
