import dotevn from "dotenv"
import connectdb from "./db/index.js";
import { app } from "./app.js";

dotevn.config({
    path:'./env'
})  
connectdb().then(()=>{
 app.listen(process.env.PORT || 3000,()=>{
    console.log(`server is running at port ${process.env.PORT}`)
 })   
}).catch((err)=>{
    console.log("mongo connection failed", err);
})

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