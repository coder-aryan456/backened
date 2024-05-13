import { Router } from "express"
import { upload } from "../middlewares/multer.middleware"
import { verifyjwt } from "../middlewares/auth.middleware"
import {
    getallVideoes,
    publishvideoes,
    getvideoById,
    updateVideo,
    deletevideo
} from "../controllers/video.controller"
const router = Router()
router.use(verifyjwt)
router.route("/").get(getallVideoes).post(
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishvideoes
)
router.route("/:videoId").get(getvideoById).patch(upload.single("thumbnai"),
updateVideo).delete(deletevideo)
export default router
