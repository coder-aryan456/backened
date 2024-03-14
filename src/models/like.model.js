import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const likeSchema = new Schema(
    {
    video: {
        type: String,
        ref: "Video"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet",
    },
    likedby:{
        type:String,
        ref:"User"
    },
},
{
    timestamps:true
})
export const Like=mongoose.model("Like",likeSchema)