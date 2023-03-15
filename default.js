import {products} from "./constants/data.js";
import { mobiles } from "./constants/data.js";
import { pinCodes } from "./constants/data.js";
import Product from "./schema/product-schema.js";
import Mobile from "./schema/mobile-schema.js";
import Pincode from "./schema/pincode-schema.js";

const DefaultData =async () => {
  try {
    // await Product.deleteMany()
    await Product.insertMany(products);
    console.log("product Data imported succesfully");
  } catch (error) {
    console.log(`Error while inserting default product data ${error.message}`);
  }

  try {
    await Mobile.insertMany(mobiles)
    console.log("mobile Data imported succesfully");
  } catch (error) {
    console.log(`Error while inserting default mobile data ${error.message}`);
  }
  
  try {
    await Pincode.insertMany(pinCodes)
    console.log("pincode imported succesfully");
  } catch (error) {
    console.log(`Error while inserting default pincode data ${error.message}`);
  }
};

export default DefaultData;
