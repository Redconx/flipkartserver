import mongoose from "mongoose";

export const Connection = async (URL) => {
  try {
    await mongoose.connect(URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log('db connected succesfully')
  } catch (error) {
    console.log(`Error while connecting with database`, error.message);
  }
};
export default Connection;
