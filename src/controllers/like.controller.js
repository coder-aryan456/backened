import { asynchandler } from "../utils/ascynchandler";
import {Video} from "../models/video.model"
import { Like } from "../models/like.model";
import {Comment} from "../models/comment.model"
import { User } from "../models/user.model";
import { Tweet } from "../models/tweet.model";
import mongoose from "mongoose";
export const toggleVideoLike = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req?.user?._id;
    try {
        const videoExists = await Video.exists({ _id: videoId });
        if (!videoExists) {
            return res.status(404).json({ message: "Video not found" });
        }
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }
        const alreadyLiked = await Like.exists({ video: videoId, likedby: userId });
        if (alreadyLiked) {
            await Like.findOneAndDelete({ video: videoId, likedby: userId });
            return res.status(200).json({ message: "Unliked successfully" });
        } else {
            const newLike = new Like({ video: videoId, likedby: userId });
            await newLike.save();
            return res.status(201).json({ message: "Liked successfully" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
export const toggleCommentLike = asynchandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req?.user?._id;
    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const alreadyLiked = await Like.exists({ comment: commentId, likedby: userId });

        if (alreadyLiked) {
            await Like.findOneAndDelete({ comment: commentId, likedby: userId });
            return res.status(200).json({ message: "Unliked successfully" });
        } else {
            const newLike = new Like({ comment: commentId, likedby: userId });
            await newLike.save();
            return res.status(201).json({ message: "Liked successfully" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
export const toggletweetLike = asynchandler(async (req, res) => {
    const { tweetID } = req.params;
    const userId = req?.user?._id;

    try {
        const tweet = await Tweet.findById(tweetID);
        if (!tweet) {
            return res.status(404).json({ message: "Tweet not found" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const alreadyLiked = await Like.exists({ tweet: tweetID, likedby: userId });
        if (alreadyLiked) {
            await Like.findOneAndDelete({ tweet: tweetID, likedby: userId });
            return res.status(200).json({ message: "Unliked successfully" });
        } else {
            const newLike = new Like({ tweet: tweetID, likedby: userId });
            await newLike.save();
            return res.status(201).json({ message: "Liked successfully" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
export const getLikedVideo = asynchandler(async (req, res) => {
    const userId = req?.user?._id;
    try {
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const likedVideos = await Like.aggregate([
            {
                $match: {
                    likedby: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup: {
                    from: "videoes", // Assuming the name of the videos collection is "videos"
                    localField: "video",
                    foreignField: "_id",
                    as: "likedvideo"
                }
            },
            {
                $count: "totalLikedVideos"
            }
        ]);
        const totalLikedVideos = likedVideos.length > 0 ? likedVideos[0].totalLikedVideos : 0;
        res.status(200).json({ count: totalLikedVideos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

