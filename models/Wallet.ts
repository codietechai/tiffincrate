import mongoose from "mongoose";

const wallet =new mongoose.Schema({
    current_wallet_amount:{
        type:Number,
    }
})