import { asynchandler } from "../utils/ascynchandler";
import { Subscription } from "../models/subscription.model"
import { User } from "../models/user.model";
export const toggleSubscription = asynchandler(async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.user?._id;

        // Check if both userId and channelId are provided
        if (!userId || !channelId) {
            return res.status(400).json({ message: "User ID and Channel ID are required" });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the channel exists
        const channel = await User.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }

        // Check if the user is already subscribed to the channel
        const existingSubscription = await Subscription.findOne({ subscriber: userId, channel: channelId });

        if (existingSubscription) {
            // User is already subscribed, so we should unsubscribe
            await Subscription.findOneAndDelete({ subscriber: userId, channel: channelId });
            res.status(200).json({ message: "Unsubscribed successfully" });
        } else {
            // User is not subscribed, create a new subscription
            const newSubscription = new Subscription({ subscriber: userId, channel: channelId });
            await newSubscription.save();
            res.status(201).json({ message: "Subscribed successfully" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
export const getUserChannelSubscribers = asynchandler(async (req, res) => {
    const { channelId } = req.params;
    const channel = await User.findById(channelId);
    if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
    }
    const subscribersCount = await Subscription.aggregate([
        {
            $match: {
                channel: mongoose.Types.ObjectId(channelId) 
            }
        },
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
    ]);
    const count = subscribersCount.length > 0 ? subscribersCount[0].count : 0;
    res.status(200).json({ count });

});
export const getSubscribedChannels = asynchandler(async (req, res) => {
    const { subscribedId } = req.params;
    const user = await User.findById(subscribedId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const subscribedChannelsCount = await Subscription.aggregate([
        {
            $match: {
                subscriber: mongoose.Types.ObjectId(subscribedId) // Convert subscribedId to ObjectId
            }
        },
        {
            $group: {
                _id: "$channel",
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: null,
                totalChannels: { $sum: 1 }
            }
        }
    ]);
    const totalChannels = subscribedChannelsCount.length > 0 ? subscribedChannelsCount[0].totalChannels : 0;

    res.status(200).json({ totalChannels });
});
