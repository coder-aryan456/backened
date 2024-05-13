import { Router } from "express";
import {
    getVideoComments,
    updatecomment,
    addComment,
    deletecomment
} from "../controllers/comment.controller"
import { verifyjwt } from "../middlewares/auth.middleware";
const router=Router()
router.use(verifyjwt)
router.route("/:videoId").get(getVideoComments).post(addComment)
router.route("/c/:commendId").delete(deletecomment).patch(updatecomment)
export default router