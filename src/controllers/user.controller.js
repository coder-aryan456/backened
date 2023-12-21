import ApiError from "../utils/Apierror.js";
import { asynchandler } from "../utils/ascynchandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import APiresponse from "../utils/ApiResponse.js";
// import APiresponse from "../utils/ApiResponse.js";
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
    const coverImagelocalpath = req.files?.coverImage[0]?.path;
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
        new APiresponse(200,createdUser,"User registered succesfully")
    )

})

export { registerUser } //