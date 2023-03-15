import mongoose from "mongoose";

const mobilesSchema = new mongoose.Schema({  
    id: { type: String,unique:true ,required:true},
    category:String ,
    brand:String ,
    name: String,
    img: String,
    rating:Number,
    ratingDesc:String,
    details:Object,
    price: Number,
    assured: Boolean,
    prevPrice: Number,
    discount: Number,
    EMI:String,
    exchange:String,
    ram: Number,
    popularity: Number,
});
const Mobile = mongoose.model("mobile", mobilesSchema);

export default Mobile;
