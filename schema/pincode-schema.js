import mongoose from "mongoose";

const pincodeSchema = new mongoose.Schema({
    pincode: Number,
    mobileList:Object
});
const Pincode = mongoose.model("pincode", pincodeSchema);

export default Pincode;
