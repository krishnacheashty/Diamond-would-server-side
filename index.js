const express = require('express')
/* for ssl commers  */
// const SSLCommerzPayment = require('sslcommerz')

const app = express()
const cors = require('cors')
require('dotenv').config()
const ObjectId=require('mongodb').ObjectId;
/* mongo connect */
const { MongoClient } = require('mongodb');
const { json } = require('express/lib/response')
/* port */
const port =process.env.PORT|| 5000;
 
/* middle wire */
app.use(cors())
app.use(express.json())

app.use(express.urlencoded({extended:true}));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2rqzc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  /* run the function */
async function run() {
    try {
      await client.connect();
      /* connection database */
      const database=client.db('diamond_shop')
      const productCollection=database.collection('products')
      const orderCollection=database.collection('order')
      const usersCollection=database.collection('users')
      const reviewCollection=database.collection('review')
      

      /* get product */
    app.get('/products',async(req,res)=>{
      const query={}
      const cursor=productCollection.find(query)
      const products=await cursor.toArray();
      res.json(products);
    })
    /* order in my order page */
    app.post('/products',async(req,res)=>{
      const order=req.body
      const result=await productCollection.insertOne(order)
      res.json(result);
  })
  /* product add */
    app.post('/products',async(req,res)=>{
      const order=req.body
      const result=await orderCollection.insertOne(order)
      res.json(result);
  })
  /* review post */
  app.post('/review',async(req,res)=>{
    const review=req.body
    const result=await reviewCollection.insertOne(review)
    res.json(result)
  })

  /* review get */
  app.get('/review',async(req,res)=>{
    const query={}
    const cursor=reviewCollection.find(query)
    const products=await cursor.toArray();
    res.json(products);

  })

    /* get a single data for order place */
    app.get('/products/:id',async(req,res)=>{
      const id=req.params.id
      // console.log("hitting suceess",id)
      const query={_id:ObjectId(id)}
      const products=await productCollection.findOne(query)
      res.json(products)
  })




  /* put save data in database */
  app.post('/order',async(req,res)=>{
      const myOrder=req.body
    /*  console.log("our data",myOrder) */
      const result=await orderCollection.insertOne(myOrder)
      res.json(result);
  })

  /* my all oder get here */
  app.get('/order',async(req,res)=>{
      const query={};
      const cursor=orderCollection.find(query)
      const event=await cursor.toArray()
      res.json(event)

  })
  /* amer id admin kina ta check korchi */
  app.get('/users/:email',async(req,res)=>{
    const email=req.params.email;
    /* find email */
    const query={email:email}; 
    const user=await usersCollection.findOne(query); 
    let isAdmin=false;
    if(user?.role==='admin'){
      isAdmin=true;
    }
    res.json({admin:isAdmin})

  })

  /* delete my order */
  app.delete('/order/:id',async(req,res)=>{
      const id=req.params.id
      console.log(id)
      const query={_id:ObjectId(id)}
      const order=await orderCollection.deleteOne(query)
      console.log("deleted count",order)
      res.json(order)

  })
  app.post('/users',async(req,res)=>{
    const user=req.body;
    const result=await usersCollection.insertOne(user)
    
    res.json(result);
})

/* add user at google login and prevent re-enter data in user database  */
app.put('/users' ,async(req,res)=>{
  const user=req.body;
  console.log('put',user)
  const filter={email:user.email};
  const option={ upsert: true};
  const updateDoc={$set:user};
  const result=await usersCollection.updateOne(filter,updateDoc,option);
  
    res.json(result)

})
  
/* add role as admin a user */
app.put('/users/admin', async(req,res)=>{
const  user=req.body;
/* console.log('put',user) */
const filter={email:user.email};
const updateDoc={$set:{role:'admin'}};
const result=await usersCollection.updateOne(filter,updateDoc);
res.json(result)
})

/* update status */
app.put('/order/:id',async(req,res)=>{
  const id=req.params.id
      console.log(id)
      const query={_id:ObjectId(id)}
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status:'approved'
        },
      };
      const result=await orderCollection.updateOne(query,updateDoc,options);
      res.json(result)
})

//sslcommerz initialize 
/* app.post('/init', (req, res) => {
  const data = {
      total_amount: 100,
      currency: 'BDT',
      tran_id: 'REF123',
      success_url: 'http://localhost:5000/success',
      fail_url: 'http://localhost:5000/fail',
      cancel_url: 'http://localhost:5000/cancel',
      ipn_url: 'http://localhost:5000/ipn',
      shipping_method: 'Courier',
      product_name: 'Computer.',
      product_category: 'Electronic',
      product_profile: 'general',
      cus_name: 'Customer Name',
      cus_email: 'cust@yahoo.com',
      cus_add1: 'Dhaka',
      cus_add2: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '01711111111',
      cus_fax: '01711111111',
      ship_name: 'Customer Name',
      ship_add1: 'Dhaka',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
      multi_card_name: 'mastercard',
      value_a: 'ref001_A',
      value_b: 'ref002_B',
      value_c: 'ref003_C',
      value_d: 'ref004_D'
  };
  const sslcommer = new SSLCommerzPayment(process.env.SSL_ID,process.env.SSL_PASSWORD,false) //true for live default false for sandbox
  sslcommer.init(data).then(data => {
      //process the response that got from sslcommerz 
      //https://developer.sslcommerz.com/doc/v4/#returned-parameters
      res.redirect(data.GatewayPageUrl)
  });
})
app.post('/success', async(req,res)=>{
  console.log(req.body)
  res.status(200).json(req.body)
})
app.post('/fail', async(req,res)=>{
  console.log(req.body)
  res.status(400).json(req.body)
})
app.post('/cancel', async(req,res)=>{
  console.log(req.body)
  res.status(200).json(req.body)
}) */



      console.log('connected ok ')
    } finally {
      
    //   await client.close(); 
    }
  }
  run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('server is running at 5000 port')
})

app.listen(port, () => {
  console.log(`Listening at ${port}`)
})