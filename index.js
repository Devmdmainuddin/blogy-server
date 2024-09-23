const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors=require('cors');
 
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

app.use(cors({
    origin: ['http://localhost:5173',
      'http://localhost:5174',
      '',
      '',
      
    ],
    credentials: true
  }));
  app.use(express.json());

// ...............................


const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.sk1ew0y.mongodb.net/?retryWrites=true&w=majority&appName=cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    // await client.connect();
    
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  
    // await client.close();
  }
}
run().catch(console.dir);









//   ................................
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})