import mongoose, { Schema } from "mongoose";
const SubscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,// the one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.type.ObjectId,// one to whome subscriber is subscribing
        ref: "User"
    }
}, { timestamps: true })
export const Subscription = mongoose.model("Subscription", SubscriptionSchema)