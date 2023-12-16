import dotevn from "dotenv"
import connectdb from "./db/index.js";

dotevn.config({
    path:'./env'
})  
connectdb()


// import express from "express"
// const app=express()
// (async () => {
//     try {
//        await mongoose.connect(`${process.env.MONGO_URI}/${db_name}`)
//        app.on("error",(error)=>{
//         console.log("errr: ",error);
//         throw error
//        })
//        app.listen(process.env.PORT,()=>{
//         console.log(`app is listening on port ${process.env.PORT}`)
//        })
//     }
//     catch (error) {
//         console.error("ERROR", error)
//         throw error
//     }
// })()