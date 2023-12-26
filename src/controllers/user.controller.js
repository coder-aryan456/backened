import ApiError from "../utils/Apierror.js";
import { asynchandler } from "../utils/ascynchandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import APiresponse from "../utils/ApiResponse.js";
// import APiresponse from "../utils/ApiResponse.js";
const generateandrereshtoen = async (userId) => {
    try {
        const user = await User.findById(userId)
        // console.log(user)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        console.log(user)
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
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
    console.log(req.files.avatar);
    console.log(avatarlocalpath)
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

    const { email, username, password } = req.body;
    if (!username && !email) {
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
    //  console.log(user._id )
    const { accesToken, refreshToken } = await generateandrereshtoen(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accesToken", accesToken, options).
        cookie("refreshToken", refreshToken, options).json
        (
            new APiresponse(
                200,
                {
                    user: loggedInUser, accesToken, refreshToken
                },
                "User logged in Successfully"
            )
        )
})

const logout = asynchandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
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

export { registerUser, loginuser, logout } //