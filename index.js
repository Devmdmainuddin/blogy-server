const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

app.use(cors({
  origin: [
    'http://localhost:5173', // Frontend running locally
    'http://localhost:5174', // Another local instance
    'https://blogy-2.netlify.app', // Hosted frontend on Netlify
    'https://blogy-server-ten.vercel.app' // Your hosted backend
  ],
  credentials: true, // Allow cookies to be included in requests

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
    const blogsCollection = client.db("blogy").collection("blogs")
    const userCollection = client.db("blogy").collection("users")
    const commentCollection = client.db("blogy").collection("comments")
    // const contactUSCollection = client.db("blogy").collection("contactUS")

    // ....................................
    // auth related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCRSS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ token })
    })

    // Logout
    app.post('/logout', async (req, res) => {
      const user = req.body;

      res.clearCookie('token', { maxAge: 0 }).send({ success: true })
    })

    // middlewares 

    const verifyToken = async (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access,1' });
      }
      const data = req.headers.authorization.split(' ');
      const token = data[1]

      jwt.verify(token, process.env.ACCRSS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access ,2' })
        }
        req.decoded = decoded;
        next();
      })
    }

    // .................................................
    app.get('/comments', async (req, res) => {
      const result = await commentCollection.find().toArray()
      res.send(result)

    })
    // add comment
    app.post('/comment', async (req, res) => {
      const blog = req.body;
      const result = await commentCollection.insertOne(blog)
      res.send(result);
    })
    //   delete blogs
    app.delete('/comment/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await commentCollection.deleteOne(query)
      res.send(result)
    })

    // .................................................

    app.get('/blogs', async (req, res) => {
      const result = await blogsCollection.find().toArray()
      res.send(result)

    })
    app.get('/blogs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await blogsCollection.findOne(query)
      res.send(result);
    })
    //..................................................
    // add blogs
    app.post('/blogs', async (req, res) => {
      const blog = req.body;
      const result = await blogsCollection.insertOne(blog)
      res.send(result);
    })

    //  update
    app.put('/blogs/:id', async (req, res) => {
      const id = req.params.id
      const blogsData = req.body
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          ...blogsData,
        },
      }
      const result = await blogsCollection.updateOne(query, updateDoc, options)
      res.send(result)
    })
    //   delete blogs
    app.delete('/blogs/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await blogsCollection.deleteOne(query)
      res.send(result)
    })
    // ...............................users...................................

    app.put('/user', async (req, res) => {
      const user = req.body
      const query = { email: user?.email }
      const isExist = await userCollection.findOne(query)
      if (isExist) {
        if (user.status === 'Requested') {
          const result = await userCollection.updateOne(query, {
            $set: { status: user?.status },
          })
          return res.send(result)
        } else {
          return res.send(isExist)
        }
      }

      const options = { upsert: true }

      const updateDoc = {
        $set: {
          ...user,
          Timestamp: Date.now(),
        },
      }
      const result = await userCollection.updateOne(query, updateDoc, options)
      res.send(result)
    })

    app.get('/user/:email', async (req, res) => {
      const email = req.params.email
      const result = await userCollection.findOne({ email })
      res.send(result)
    })

    // .............................................
    app.get('/filteruser', async (req, res) => {
      const filter = req.query.filter
      const sort = req.query.sort
      let query = {}
      if (filter) query.role = filter
      let options = {}
      if (sort) options = { sort: { Timestamp: sort === 'asc' ? 1 : -1 } }
      const result = await userCollection.find(query, options).toArray()
      res.send(result)
    })

    // ...........................
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray()
      res.send(result)
    })

    app.patch('/users/:email', async (req, res) => {
      const email = req.params.email
      const user = req.body
      const query = { email }
      const updateDoc = {
        $set: { ...user, Timestamp: Date.now() },
      }
      const result = await userCollection.updateOne(query, updateDoc)
      res.send(result)
    })


    app.patch('/users/update/:email', async (req, res) => {
      const email = req.params.email
      const user = req.body
      const query = { email }
      const updateDoc = {
        $set: { ...user, Timestamp: Date.now() },

      }
      const result = await userCollection.updateOne(query, updateDoc)
      res.send(result)
    })
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })

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