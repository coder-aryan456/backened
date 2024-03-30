import {Playlist} from "../models/playlist.model"
import { asynchandler } from "../utils/ascynchandler"
import {ApiError} from "../utils/Apierror"
import { User } from "../models/user.model";
import mongoose from "mongoose";
import { Video } from "../models/video.model";
export const createPlaylist = asynchandler(async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !description) {
            return res.status(400).json({ error: "Name and description are required" });
        }

        const userID = req.user?._id;
        if (!userID) {
            return res.status(401).json({ error: "User not authorized" });
        }

        const playlist = await Playlist.create({
            name: name,
            owner: userID,
            description: description
        });

        if (!playlist) {
            return res.status(500).json({ error: "Failed to create playlist" });
        }
        res.status(201).json({ success: true, playlist: playlist });
    } catch (error) {
        console.error("Error creating playlist:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
export const getUserPlaylist = asynchandler(async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const userExisted = await User.findById(userId);
        if (!userExisted) {
            return res.status(404).json({ error: "User not found" });
        }
        const allPlaylist = await Playlist.find({ owner: userId });
        res.status(200).json({ success: true, playlists: allPlaylist });
    } catch (error) {
        console.error("Error fetching user playlists:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
export const addVideoToPlaylist = asynchandler(async (req, res) => {
    try {
        const { playlistId, videoId } = req.params;
        const userId = req.user?._id;

        if (!playlistId || !videoId || !userId) {
            return res.status(400).json({ error: "Playlist ID, Video ID, and User ID are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });
        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found or does not belong to the current user" });
        }
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }
        playlist.videoes.push(videoId);
        await playlist.save();

        res.status(200).json({ success: true, message: "Video added to playlist successfully" });
    } catch (error) {
        console.error("Error adding video to playlist:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
export const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    try {
        const { playlistId, videoId } = req.params;
        const userId = req.user?._id;
        if (!playlistId || !videoId || !userId) {
            return res.status(400).json({ error: "Playlist ID, Video ID, and User ID are required" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });
        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found or does not belong to the current user" });
        }
        playlist.videoes.pull(videoId);
        await playlist.save();
        res.status(200).json({ success: true, message: "Video removed from playlist successfully" });
    } catch (error) {
        console.error("Error removing video from playlist:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
export const deletePlaylist = asynchandler(async (req, res) => {
    try {
        const { playlistID } = req.params;
        if (!playlistID) {
            return res.status(400).json({ error: "Playlist ID is required" });
        }
        const playlistExist = await Playlist.findById(playlistID);
        if (!playlistExist) {
            return res.status(404).json({ error: "Playlist not found" });
        }
        await playlistExist.remove();
        res.status(200).json({ success: true, message: "Playlist deleted successfully" });
    } catch (error) {
        console.error("Error deleting playlist:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


