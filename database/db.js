import mongoose from "mongoose";

export const Connection = async (USERNAME,PASSWORD) => {
    console.log(USERNAME,PASSWORD)
  const URL = `mongodb+srv://${USERNAME}:${PASSWORD}@ecommerce.lipcdaz.mongodb.net/?retryWrites=true&w=majority`;
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
