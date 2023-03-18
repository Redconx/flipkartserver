import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  url: String,
  mobileId: String,
  ratings: Object,
});
const Review = mongoose.model("review", reviewSchema);

export default Review;
