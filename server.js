import express, { request, response } from "express";
import dotenv from "dotenv";
import Connection from "./database/db.js";
import DefaultData from "./default.js";
import cors from "cors";
// import bodyParser from "body-parser";
import { v4 as uuid } from "uuid";
import paytmchecksum from './paytm/PaytmChecksum.js'
import formidable from "formidable";
import https from 'https'

//schemas
import User from "./schema/user-schema.js"
import Product from "./schema/product-schema.js";
import Mobile from "./schema/mobile-schema.js";
import Pincode from "./schema/pincode-schema.js";
import Review from "./schema/review-schema.js";




const app = express();
dotenv.config();



app.use(express.json()); //because we were getting undefined body
// const corsOpts = {
//   origin: '*',
//   credentials: true,
//   methods: ['GET','POST','HEAD','PUT','PATCH','DELETE'],
//   allowedHeaders: ['Content-Type'],
//   exposedHeaders: ['Content-Type']
// };
app.use(cors());

const USERNAME = process.env.DB_USERNAME;
const PASSWORD = process.env.DB_PASSWORD;

const URL = process.env.MONGODB_URI || `mongodb+srv://${USERNAME}:${PASSWORD}@ecommerce.lipcdaz.mongodb.net/?retryWrites=true&w=majority`;

var PORT = process.env.PORT||2410;

let paytmMerchantKey=process.env.PAYTM_MERCHANT_KEY;
let paytmParams={}
// paytmParams['MID']=process.env.PAYTM_MID;
// paytmParams['WEBSITE']=process.env.PAYTM_WEBSITE;
// paytmParams['CHANNEL_ID']=process.env.PAYTM_CHANNEL_ID;
// paytmParams['INDUSTRY_TYPE_ID']=process.env.PAYTM_INDUSTRY_TYPE_ID;
// paytmParams['ORDER_ID']=uuid();
// paytmParams['TOKEN']=process.env.PAYTM_CUST_ID;
// paytmParams['TXN_AMOUNT']='100';
// paytmParams['CALLBACK_URL']='http://localhost:2410/callback'
// paytmParams['EMAIL']='ajaynaugain907@gmail.com'
// paytmParams['MOBILE_NO']='1234567890';


paytmParams.body = {
  "requestType"   : "Payment",
  "mid"           : process.env.PAYTM_MID,
  "websiteName"   : process.env.PAYTM_WEBSITE,
  "orderId"       : uuid(),
  "callbackUrl"   : "http://localhost:2410/callback",
  "txnAmount"     : {
      "value"     : "1.00",
      "currency"  : "INR",
  },
  "userInfo"      : {
      "custId"    : "CUST_001",
  },
};






// app.use(cors());


// because we were getting undefined body
// app.use(bodyParser.json({extended:true}))
// app.use(bodyParser.urlencoded({extended:true}))

const paginate = (items, page , perPage ) => {
  const offset = perPage * (page - 1);
  const totalPages = Math.ceil(items.length / perPage);
  const paginatedItems = items.slice(offset, perPage * page);

  return {
      previousPage: page - 1 ? page - 1 : null,
      nextPage: (totalPages > page) ? page + 1 : null,
      total: items.length,
      totalPages: totalPages,
      items: paginatedItems
  };
};
app.post("/signup", async function (req, res) {
  console.log("singup", req.body);
  const exist = await User.findOne({ username: req.body.username });
  if (exist) {
    return res.status(401).send("Username already exist");
  }
  try {
    const user = req.body;
    const newUser = new User(user);
    await newUser.save();
    res.send(newUser);
  } catch (error) {
    res.send(error);
  }
});

app.post("/login", async function (req, res) {
  try {
    const { username, password } = req.body;
    let user = await User.findOne({ username: username, password: password });
    if (user) {
      return res.status(200).send(user);
    } else {
      return res.status(401).send("invalidlogin");
    }
  } catch (error) {}
});

app.get("/getProducts", async function (req, res) {
  try {
    const products = await Product.find({});
    res.send(products);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/getPincodes", async function (req, res) {
  try {
    const pincodes = await Pincode.find({})
    res.send(pincodes);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/getMobiles", async function (req, res) {
  const {brand,ram,rating,price}=req.query
  
  try {
    let mobiles = await Mobile.find({});
    
    if(brand){
      mobiles=mobiles.filter(ele=>brand.includes(ele.brand))
    }
    if(ram){
      mobiles=mobiles.filter(ele=>ram.includes(ele.ram+''))
    }
    if(rating){
      let rating1=rating.split(",")
      let max=rating1.reduce((acc,crr)=>(+acc)>(+crr) ? +acc:+crr,0)
      mobiles=mobiles.filter(ele=>ele.rating>=max)
    }
    if(price){
      let mobiles1=[...mobiles]
      let mobiles2=[]
      let price1=price.split(",")
      console.log(price1)
      if(price1.includes('0-5000')){
        mobiles2=[...mobiles2,...mobiles1.filter(ele=>ele.price>=0 && ele.price<=5000)]
      }

      if(price1.includes('5000-10000')){
        mobiles2=[...mobiles2,...mobiles1.filter(ele=>ele.price>=5000 && ele.price<=10000)]
      }

      if(price1.includes('10000-20000')){
        mobiles2=[...mobiles2,...mobiles1.filter(ele=>ele.price>=10000 && ele.price<=20000)]
      }

      if(price1.includes('20000')){
        mobiles2=[...mobiles2,...mobiles1.filter(ele=>ele.price>=20000)]
      }
      mobiles=mobiles2
    }

    res.send(mobiles);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/product/:id", async function (req, res) {
  try {
    let { id } = req.params;
    const product = await Product.findOne({ 'id': id });
    // console.log(product)
    res.send(product);
  } catch (error) {
    res.send(500).send(error.message);
  }
});

app.get("/mobile/:id", async function (req, res) {
  try {
    let { id } = req.params;
    const mobile = await Mobile.findOne({ 'id': id });
    res.send(mobile);
  } catch (error) {
    res.send(500).send(error.message);
  }
});


app.get('/reviews/:id', async (req, res) => {
  // destructure page and limit and set default values
  let id=req.params.id
  const { reviewPage = 1, limit = 5 } = req.query;
  console.log(id)
  try {
    // execute query with page and limit values
    let resRev = await Review.find({mobileId:id})
    let {ratings}=resRev[0]
    console.log(reviewPage)
    const reviewArr=paginate(ratings,+reviewPage,+limit)
    res.send(reviewArr);
  } catch (err) {
    console.error('err',err.message);
  }
});


app.post("/payment",async function(req,res){
  try {
    let paytmChecksum=await paytmchecksum.generateSignature(JSON.stringify(paytmParams.body) ,paytmMerchantKey)
    // console.log(paytmChecksum,'in /pay api')
    console.log(paytmChecksum)
    paytmParams.head = {
      "signature"    : paytmChecksum
  };
  //  let params={...paytmParams, 'CHECKSUMHASH' : paytmChecksum }
   res.send(paytmParams)
} catch (error) {
  res.status(500).send(error.message)
}

app.post("/callback",function(req,res){
  const form=new formidable.IncomingForm()
  // console.log(req.body)
  // let paytmCheckSum='zH1WmgjZY7GNROtBkDMb5qxwLm18hWTKldYMuYNKcPV3TpQWnkna94henety387QNZAMgmMF3HQbrHuZg+vJzh08RTfkTbkVCZTAY/DrXvE'
  let paytmCheckSum=req.body.CHECKSUMHASH
  delete req.body.CHECKSUMHASH
  // console.log(paytmCheckSum,'in index checksum')

  let isVerifySignature=paytmchecksum.verifySignature(req.body,paytmMerchantKey,paytmCheckSum)
  if(isVerifySignature){
    let paytmParams1={}
    paytmParams1['MID']=req.body.MID
    paytmParams1['ORDERID']=req.body.ORDERID

    
    paytmchecksum.generateSignature(paytmParams1,paytmMerchantKey).then(function(checksum){
      paytmParams["CHECKSUMHASH"] = checksum;
      let post_data = JSON.stringify(paytmParams1);
      let options = {
        hostname: "securegw-stage.paytm.in",
        port: 443,
        path: "/order/status",
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': post_data.length,
        },
      };
      let res=""
      let post_req = https.request(options, function (post_res) {
        post_res.on('data', function (chunk) {
          res += chunk;
        });
        post_res.on("end", function () {
          let result = JSON.parse(res);
          response.redirect("http://localhost:3000/");
        });
      });

      post_req.write(post_data);
      post_req.end();
    })

  }else{
    console.log('checksumis Mismatched')
  }
})


})


  Connection(URL);

  DefaultData();

  app.listen(PORT, () =>
    console.log(`server is running succesfully on port ${PORT}`)
  );




