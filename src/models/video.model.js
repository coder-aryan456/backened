import mongoose, { Schema } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const VideSchema = new Schema(
    {
        videoFile: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: String,
            required: true
        },
        views: {
            type: String,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId, // refresshing with users
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)
// VideSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", VideSchema)
