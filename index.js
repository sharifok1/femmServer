// femmewearbd.com
// developer: Md Shariful Islam
// Admin: Rasheduzzam

const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

// ...

// CORS Configuration
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/var/productImg");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

// const uri = mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@innerfashion.rsckbv2.mongodb.net/?retryWrites=true&w=majority
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@innerfashion.rsckbv2.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri)

async function run() {
  try {
    await client.connect();
    const database = client.db("innerFashion");
    const allProducts = database.collection("Allproducts");
    const order = database.collection("Orders");
    const orderStatus = database.collection("orderStatus");
    const banner = database.collection("banner");
    const coupon = database.collection("coupon");

    // --------------------------get all products//----------------get
    app.get("/allproducts", async (req, res) => {
      const allProduct = allProducts.find();
      const result = await allProduct.toArray();
      res.send(result);
    });

    //--------------------------Add A product-------------------product---post
    app.post("/allproducts", async (req, res) => {
      const allProduct = req.body;
      const result = await allProducts.insertOne(allProduct);
      res.json(result);
    });
    //------------------------Delete a product------------------product---delete
    app.delete("/allproducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await allProducts.deleteOne(query);
    });
    //--------------------------Add A banner-------------------banner---post
    app.post("/update_banner", async (req, res) => {
      const baners = req.body;
      const result = await banner.insertOne(baners);
      res.json(result);
      console.log(baners);
    });
    // --------------------------get banner info-------------banner---get
    app.get("/banner", async (req, res) => {
      const baner = banner.find();
      const result = await baner.toArray();
      res.send(result);
    });

    //------------------------Delete a banner------------------banner---delete
    app.delete("/baner/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await banner.deleteOne(query);
    });

    //--------------------------Received a Order-------------------order--post
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await order.insertOne(orders);
      console.log(orders);
      for (let i = 0; i < orders.newOrder.length - 1; i++) {
        const updateResult = await allProducts.updateOne(
          { _id: new ObjectId(orders.newOrder[i]._id) },
          { $set: { size: orders.newOrder[i].size } }
        );
        console.log(updateResult);
      }
      res.json(result);
    });
    // --------------------------get all Order//------------------all order---get
    app.get("/orders", async (req, res) => {
      const orders = order.find();
      const result = await orders.toArray();
      res.send(result);
      // console.log(result)
    });
    //--------------------------shipping order---------------------shipping--put/update
    app.put("/order/status", async (req, res) => {
      const id = req.body.id;
      const status = req.body.status;
      const updateStatus = await order.updateOne(
        { _id: ObjectId(id) },
        { $set: { orderStatus: status } },
        { upsert: true }
      );
      res.json(updateStatus);
    });
    //------------------------Delete order for return------------------return---delete
    app.delete("/order/:id", async (req, res) => {
      const result = await order.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
    });
    //--------------------------store status order---------------------post
    app.post("/orderStatus", async (req, res) => {
      const newStatus = req.body;
      const result = await orderStatus.insertOne(newStatus);
      res.json(result);
    });
    //--------------------------get status order--------------------get
    app.get("/orderStatus", async (req, res) => {
      const statusOrder = orderStatus.find();
      const result = await statusOrder.toArray();
      res.send(result);
    });
    //------------------------Delete status order---------------------delete
    app.delete("/orderStatus/:id", async (req, res) => {
      const {id} = req.params;
      const result = await orderStatus.deleteOne({_id:id});
      res.send(result);
      console.log(result,id)
    });

    // Add an product image to the hostainger server (path: var/productImg)
    app.post('/uploadProductImg', upload.single('image'), async (req, res) => {
            // File has been uploaded to the /var/productImg directory
            // You can access the file details via req.file
            const filePath = req.file.path;
            const imageUrl = `https://api.femmewearbd.com${filePath}`;
            console.log('File uploaded:', imageUrl);   
            res.json({ message: 'image uploaded successfully', imageUrl:imageUrl});
          });

    // get image file from server//
    app.get("/var/productImg/:filename", (req, res) => {
      const { filename } = req.params;
      const imageUrl = path.join("/", "var", "productImg", filename);

      // Check if the image file exists
      if (fs.existsSync(imageUrl)) {
        // Send the image file as a response
        res.sendFile(imageUrl);
      } else {
        // Image file not found
        res.status(404).json({ message: "Image not found" });
      }
    });

 //--------------------------Add Coupon Code----------------Coupon---post
 app.post("/coupons", async (req, res) => {
  const coupons = req.body;
  const result = await coupon.insertOne(coupons);
  res.json(result);
});
//------------------------Delete a coupon------------------coupon---delete
app.delete("/coupons/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await coupon.deleteOne(query);
  res.send(result)
  // console.log(result)
});

//------------------------get coupon code------------------coupon----get
app.get("/coupons", async (req, res) => {
  const coupons = coupon.find();
  const result = await coupons.toArray();
  res.send(result);
});

  } finally {
    // await client.close(); //
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("femmewearbd server IS RUNNING...");
});

app.listen(port, () => {
  console.log(`femmewearbd server is running from port ${port}`)
})