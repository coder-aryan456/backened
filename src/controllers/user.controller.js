import { asynchandler } from "../utils/ascynchandler.js";

const registerUser=asynchandler(async (req,res)=>{
    res.status(200).json({
        message:"sab chal rha hai"
    })
})

export {registerUser} //