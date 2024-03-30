import ApiError from "../utils/Apierror.js";
import { asynchandler } from "../utils/ascynchandler.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import APiresponse from "../utils/ApiResponse.js";
export const getVideoComments = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(400, "videoId is required for getting comments");
    }
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "video not found")
    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
    ]);
    Comment.aggregatePaginate(comments, {
        page, limit
    }).then((results) => {
        return res.status(201).json(new APiresponse(200, results, "comments fetched successfully"))
    }).catch((err) => {
        throw new ApiError(404, "something went wrong during comments fetching")
    })
});
export const addComment = asynchandler(async (req, res) => {
    const { videoId } = req.params
    const comment = req.body
    if (!videoId) {
        throw new ApiError(400, "videoId is required for getting comments");
    }
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "video not found")
    if (!comment) throw new ApiError(400, "comment is required for comment")
    const newcomment = await Comment.create({
        content: comment,
        video: videoId,
        owner: req.user?._id
    })
    if (!newcomment) throw new ApiError(400, "something went wrong while creating comment")
    return res.status(200).json(
        new APiresponse(
            200, newcomment, "comment created succesfully"
        )
    )
})
export const updatecomment = asynchandler(async (req, res) => {
    const { commentId } = req.params
    const { comments } = req.body
    if (!commentId) throw new ApiError(400, "comment id is required")
    if (!comments) throw new ApiError(400, "updated comment is required")
    const commentfound = Comment.findById(commentId)
    if (!commentfound) {
        throw new ApiError(400, "comment doesnot found")
    }
    if (!(commentfound.owner.toString() === req.user?._id.toString())) {
        throw new ApiError(400, "cannot update only login user can update")
    }
    try {
        const updatedcomment = await Comment.findByIdAndUpdate(
            commentId,
            {
                $set: {
                    content: comments
                }
            },
            { new: true }
        )
        if (!updatecomment) throw new ApiError(400, "something went wrong while updating comment")
        return res.status(200).json(new APiresponse(200, updatedcomment, "comment updated successfully"))
    }
    catch (error) {
        throw new ApiError(400, "while updating comment somethign went wrong")
    }
})
export const deletecomment = asynchandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId) {
        throw new ApiError(400, "comment id is required");
    }
    // Finding the comment
    const foundcomment = await Comment.findById(commentId);
    if (!foundcomment) {
        throw new ApiError(404, "comment not found");
    }
    // Checking if the user is the owner of the comment
    if (!(foundcomment.owner.toString() === req.user?._id.toString())) {
        throw new ApiError(403, "you are not authorized to delete this comment");
    }
    // Deleting the comment
    try {
        const deletecomment = await Comment.findByIdAndDelete(commentId);
        if (!deletecomment) {
            throw new ApiError(500, "something went wrong while deleting comment");
        }
        return res.status(200).json(new APiresponse(200, {}, "successfully deleted comment"));
    } catch (error) {
        console.error("Error in deletecomment:", error);
        throw new ApiError(500, "something went wrong during comment deletion");
    }
});

