import { Router } from "express";
import { verify } from "jsonwebtoken";
import { createPlaylist,
    getUserPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist
 } from "../controllers/playlist.controller"
const router=Router()
router.use(verify)
router.route("/").post(createPlaylist)
router.route("/:playlistID/:userId").get(getUserPlaylist).delete(deletePlaylist)
router.route("/add/:playlistId/:videoId").patch(addVideoToPlaylist)
router.route("/remove/:playlistId/:videoId").patch(removeVideoFromPlaylist)


