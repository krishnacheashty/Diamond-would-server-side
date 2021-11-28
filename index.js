const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const ObjectId=require('mongodb').ObjectId;
/* mongo connect */
const { MongoClient } = require('mongodb');
/* port */
const port =process.env.PORT|| 5000;

/* middle wire */
app.use(cors())
app.use(express.json())

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