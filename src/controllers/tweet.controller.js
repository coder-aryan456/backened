import ApiError from "../utils/Apierror";
import { asynchandler } from "../utils/ascynchandler";
import { Tweet } from "../models/tweet.model";
import APiresponse from "../utils/ApiResponse";
import mongoose from "mongoose";
export const createTweet = asynchandler(async (req, res) => {
    const { tweetcontent } = req.body
    if (!tweetcontent) throw new ApiError(400, "tweet content is needed")
    const tweetCreated = await Tweet.create({
        owner: req.user?._id,
        content: tweetcontent
    })
    if (!tweetCreated) throw new ApiError(400, "something went wrong while creating tweet")
    return res.status(200).json(
        new APiresponse(200, tweetCreated,
            "tweet created successfully")
    )
})
export const getUserTweets = asynchandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) throw new ApiError(400, "userId is required")
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                content: 1
            }
        }
    ])
    if (!tweets) throw new ApiError(400, "something went wrong  while finding tweets")
    return res.status(200).json(new APiresponse(200, tweets, "uset tweets"))

})
export const updateTweets = asynchandler(async (req, res) => {
    const { tweetId } = req.params
    const { tweetdata } = req.params
    if (!tweetId) throw new ApiError(400, "tweetId is required")
    if (!tweetdata) throw new ApiError(404, "tweetdata is required")
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new ApiError(404, "tweet doesnot found")
    const updatedtweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: tweetdata
            }
        },
        { new: true }
    )
    if (!updateTweets) throw new ApiError(400, "something went wrong while updating tweets")
    return res.status(200).json(new APiresponse(200, updateTweets,
        "tweet updated successfully"
    ))

})
export const deletetweets = asynchandler(async (req, res) => {
    const { tweetId } = req.params
    if (!tweetId) throw new ApiError(404, "tweet id is required")
    const tweetfound = await Tweet.findById(tweetId)
    if (!tweetfound) throw new ApiError(400, "tweet doesnot exist")

    try {
        const tweetdelete = await Tweet.findByIdAndDelete(
            tweetId
        )
        if (!tweetdelete) throw new ApiError(400, "something went wrong while deleting  tweet")
        return res.status(200).json(new APiresponse(200, tweetdelete, "tweet deleted successfully"))
    } catch (error) {
        throw new ApiError(401, error?.message || "tweet cannot be found")
    }
})