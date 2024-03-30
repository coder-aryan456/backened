import mongoose from "mongoose";
import { User } from "../models/user.model";
import ApiError from "../utils/Apierror";
import { asynchandler } from "../utils/ascynchandler";
import APiresponse from "../utils/ApiResponse";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { Video } from "../models/video.model";
const getallVideoes = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortyBy, sortType, userId } = req.query;
    if (!userId) {
        throw new ApiError(404, "user id is required");
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "user not found");
    }

    // Aggregate pipeline to fetch videos owned by the user
    const getvideoes = await User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        }
    ]);
    const videos = getvideoes.length > 0 ? getvideoes[0].videos : [];
    const paginatedVideos = videos.slice((page - 1) * limit, page * limit);
    return res.status(200).json(new APiresponse(200, paginatedVideos, "videoes fetched successfully"));
});
export const publishvideoes = asynchandler(async (req, res) => {
    const { title, description } = req.body;

    if (!(title && description)) {
        throw new ApiError(400, "Title and description are required");
    }

    const videolocalPath = req.files?.video[0]?.path;
    const thumbnailLocalpath = req.files?.thumbnail[0]?.path;

    if (!(videolocalPath && thumbnailLocalpath)) {
        throw new ApiError(400, "Video and thumbnail are required");
    }

    // Upload video and thumbnail to Cloudinary
    const videoUpload = await uploadOnCloudinary(videolocalPath);
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalpath);

    if (!(videoUpload && thumbnailUpload)) {
        throw new ApiError(500, "Something happened while uploading to Cloudinary");
    }
    const videodata = await Video.create({
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload.url,
        title: title,
        description: description,
        duration: videoUpload.duration,
        views: 0,
        isPublished: true,
        owner: req?.user?._id
    });

    if (!videodata) {
        throw new ApiError(500, "Something went wrong while creating video data");
    }

    return res.status(200).json(new APiresponse(200, videodata, "Video published"));
});
export const getvideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    res.status(200).json({
        success: true,
        data: video,
        message: "Video found"
    });

})
export const updateVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    const { updatedtitle, updateddescription } = req.body;

    // Check if videoId is provided
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }
    if (!req.files || !req.files.video || !req.files.thumbnail) {
        throw new ApiError(400, "Updated video file and thumbnail are required");
    }
    const videoFile = req.files.video[0].path;
    const thumbnail = req.files.thumbnail[0].path;
    const updatedvideofile = await uploadOnCloudinary(videoFile)
    const updatedthumbnail = await uploadOnCloudinary(thumbnail)
    if (!(updateVideo && updatedthumbnail)) throw new ApiError(404, "something went wrong while uploading on cloudinary")
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: updatedtitle,
                description: updateddescription,
                videoFile: updatedvideofile.url,
                thumbnail: updatedthumbnail.url
            }
        },
        { new: true }
    );
    if (!updatedVideo) {
        throw new ApiError(404, "Video not found");
    }
    res.status(200).json({
        success: true,
        data: updatedVideo,
        message: "Video updated successfully"
    });

})
export const deletevideo = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(404, "Video ID is required");
    }
    const video = await Video.findById(videoId);
    if (!video || video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(404, "Video not found or you are not authorized to delete this video");
    }
    const deletedVideo = await Video.findByIdAndDelete(videoId);
    if (!deletedVideo) {
        throw new ApiError(404, "Something went wrong while deleting the video");
    }
    res.status(200).json(new APiresponse(200, deletedVideo, "Deleted successfully"));
});
export default getallVideoes;