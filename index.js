const express = require ('express');
const { MongoClient } = require("mongodb");
const cors = require('cors');
// const fileupload = require('express-fileupload');
const app = express()
require('dotenv').config();
const  ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT||5000

app.use(cors());
app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@innerfashion.rsckbv2.mongodb.net/?retryWrites=true&w=majority`
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@innerfashion.rsckbv2.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri)

async function run(){
  try {
    await client.connect();
    const database = client.db('innerFashion');
    const allProducts = database.collection('Allproducts');
    const order = database.collection('Orders');
    const deliveryStatus = database.collection('orderStatus');
    const banner = database.collection('banner');
    


    // --------------------------get all products//----------------get
    app.get('/allproducts',async(req, res)=>{
      const allProduct = allProducts.find()
      const result  = await allProduct.toArray()
      res.send(result);
    })
  
    //--------------------------Add A product-------------------product---post
    app.post('/allproducts',async(req, res)=>{
      const allProduct = req.body;
      const result = await allProducts.insertOne(allProduct);
      res.json(result);
    })
    //------------------------Delete a product------------------product---delete
    app.delete('/allproducts/:id', async (req,res)=>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await allProducts.deleteOne(query);
  })
    //--------------------------Add A banner-------------------banner---post
    app.post('/update_banner',async(req, res)=>{
      const baners = req.body;
      const result = await banner.insertOne(baners);
      res.json(result);
      console.log(baners)
    })
      // --------------------------get banner info-------------banner---get
      app.get('/banner',async(req, res)=>{
        const baner = banner.find()
        const result  = await baner.toArray()
        res.send(result);
      })
    
    //------------------------Delete a banner------------------banner---delete
    app.delete('/baner/:id', async (req,res)=>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await banner.deleteOne(query);
  })
  
  //--------------------------Received a Order-------------------order--post
  app.post('/orders',async(req, res)=>{
    const orders = req.body;
    const result = await order.insertOne(orders);
    res.json(result);
  })
  // --------------------------get all Order//------------------all order---get
  app.get('/orders',async(req, res)=>{
    const orders = order.find()
    const result  = await orders.toArray()
    res.send(result);
    console.log(result)
  })
  //--------------------------shipping order---------------------shipping--put/update
  app.put('/order/status', async(req,res)=>{
    const id = req.body.id;
    const status = req.body.status;
    const updateStatus = await order.updateOne({_id:ObjectId(id)},{$set:{orderStatus:status}},{upsert: true});
    res.json(updateStatus);
  })
    //------------------------Delete order for return------------------return---delete
    app.delete('/order/:id', async (req, res) => {
      const result = await order.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
    });
    //--------------------------store status order---------------------post
  app.post('/orderStatus',async(req, res)=>{
    const newStatus = req.body;
    const result = await deliveryStatus.insertOne(newStatus);
    res.json(result);
  })
    //--------------------------get status order--------------------get
  app.get('/orderStatus',async(req, res)=>{
    const statusOrder = deliveryStatus.find()
    const result = await statusOrder.toArray()
    res.send(result);
  })
    //------------------------Delete status order---------------------delete
    app.delete("/deliveryStatus/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      console.log("Deleting user with id", id);
      try {
        const result = await deliveryStatus.deleteOne(query);
        console.log("Deletion result:", result);
        res.json(result);
      } catch (error) {
        console.error("Error occurred during deletion:", error);
        res.status(500).json({ error: "An error occurred during deletion" });
      }
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('inner fashion server IS RUNNING...')
})

app.listen(port, () => {
  console.log(`innerfashion server is running from port ${port}`)
})