import ApiError from "../utils/Apierror.js";
import { asynchandler } from "../utils/ascynchandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import APiresponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
// import APiresponse from "../utils/ApiResponse.js";
const generateandrereshtoen = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    }
    catch (err) {
        throw new ApiError(500, "something went wrong while generating refresh and acces token")
    }
}
const registerUser = asynchandler(async (req, res) => {
    // get user details from frontened 
    //  validation
    // check is string is not empty
    // check for image , and avatar
    // upload them
    // remvve password and refresh token field from response
    // check for user creation
    // return  response
    const { fullname, email, username, password } = req.body
    console.log(email)
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "ALL field are compulsory")
    }
    const existeduser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existeduser) {
        throw new ApiError(409, "user with email or username already exists")
    }
    const avatarlocalpath = req.files?.avatar[0]?.path;
    //const coverImagelocalpath = req.files?.coverImage[0]?.path; 
    // console.log(req.files.avatar);
    // console.log(avatarlocalpath)
    let coverImagelocalpath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImagelocalpath = req.files.coverImage[0].path
    }
    if (!avatarlocalpath) {
        throw new ApiError(400, "Avatar files is required")
    }
    const avatar = await uploadOnCloudinary(avatarlocalpath);
    const coverImage = await uploadOnCloudinary(coverImagelocalpath);
    if (!avatar) {
        throw new ApiError(400, "avatar file is required")
    }
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering")
    }
    return res.status(201).json(
        new APiresponse(200, createdUser, "User registered succesfully")
    )

})
const loginuser = asynchandler(async (req, res) => {
    const { email, username, password } = req.body
    if (!username || !email) {
        throw new ApiError(400, "username  or email is  required")
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw ApiError(400, "user doesnt found")
    }
    // console.log(user)
    const ispasswordvalid = await user.isPasswordCorrect(password);
    if (!ispasswordvalid) {
        throw new ApiError(401, "password is not correct")
    }

    const { accessToken, refreshToken } = await generateandrereshtoen(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    //  console.log(accessToken)
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accesToken", accessToken, options).
        cookie("refreshToken", refreshToken, options).json
        (
            new APiresponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in Successfully"
            )
        )
})
const logout = asynchandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,// this req.user came from auth middleware
        {
            $unset: {
                refreshToken: 1
            }
        }, {
        new: true
    }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accesToken", options)
        .clearCookie("refreshToken", options).json(
            new APiresponse(200, {}, "user logged out")
        )
})
const refreshAccessToken = asynchandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) throw new ApiError(401, "unauthorised request")
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded?._id);
    if (!user) {
        throw new ApiError(401, "invalid refresh token")
    }
    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "refresh token is expired or used")
    }
    const options = {
        httpOnly: true,
        secure: true
    }
    const { accessToken, newRefreshToken } = await generateandrereshtoen(user?._id)
    return res.
        status(200).
        cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new APiresponse(
                200, { accessToken, refreshToken: newRefreshToken },
                "Access token refreshed"
            )
        )
})
const ChangeCurrentPassword = asynchandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(new APiresponse(200, {}, "password change succesfully"))
})
const getCurrentUser = asynchandler(async (req, res) => {
    return res.status(200).json(new APiresponse(200, req.user, "current user fetched succesfully"))
})
const updateAccoundDetails = asynchandler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname || !email) {
        throw new ApiError(400, "all fields are empty")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200).json(
        new APiresponse(200, user, "account details updated succeffuly")
    )
})
const updateUserAvatar = asynchandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    // delete old avatar from cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }).select("-password")
    return res.status(200).json(
        new APiresponse(200, user, "avatar is updated succesfully")
    )
})
const updateUserCoverImage = asynchandler(async (req, res) => {
    const coverimagepath = req.file?.path
    if (!coverimagepath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    const coverImage = await uploadOnCloudinary(coverimagepath)
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading coverImage")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }).select("-password")
    return res.status(200), json(
        new APiresponse(200, user, "coverImage is updated succesfully")
    )
})
const getUserChannelProfile = asynchandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }
    // bascically when user clicked on some channel in match by username it matches the clicked user
    //  in User nd look the its subscriber and the subscribed to
    const channel = await User.aggregate([

        {
            $match: {
                username: username?.toLowerCase()
            }// we found the one user based on the username
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",// this is also id belonging to some user
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCounts: {
                    $size: "$subscribers"
                },
                channelsSubscriberToCounts: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] }, // checing if the login user is subscribed or not
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscriberCounts: 1,
                channelsSubscriberToCounts: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])
    if (!channel?.length) {
        throw new ApiError(404, "channel doesnot exist")
    }
    return res.status(200).json(
        new APiresponse(200,channel[0], "USer channel fetched succesfully")
    )
})
// nested lookup because user have wachhiistory and that have videos schema and in 
//  video schema there is user schema that watchhistory belongs to
const getWatchHistory = asynchandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)// matching to find the user from user schema
            }
        },
        {
            $lookup: {
                from: "videoes",// we got all videoes that have in history of current user
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                // using piplines to get the owener of each video that have saved in watchHistory
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[// we use this we dont want all the things in user like coverimage etc
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {// we got the array from owner so we want object so we extracted from 0th index of array
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res.status(200).json(
        new APiresponse(200,user[0].watchHistory,"watch history fetched succesfully")
    )
})
export {
    registerUser, loginuser,
    logout, refreshAccessToken,
    getCurrentUser, ChangeCurrentPassword, updateAccoundDetails,
    updateUserAvatar, updateUserCoverImage,
    getUserChannelProfile,getWatchHistory
} //
/// 