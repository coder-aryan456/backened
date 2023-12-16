import mongoose from "mongoose";

const connectdb = async () => {
    try {
        const connection_name = await mongoose.connect(`${process.env.MONGO_URI}/backened`)
        console.log(`mogodb connection db host ${connection_name
            } `)
    }
    catch (error) {
        console.log("mongo connection error", error);
        process.exit(1)
    }
}
export default connectdb