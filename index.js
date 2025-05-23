const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rclirmd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri, process.env.DB_USER, process.env.DB_PASSWORD);


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("gardenhub");
    const tips = database.collection("tips");

    app.post('/tips', async (req, res) => {
        const newTip = req.body;
        const result = await tips.insertOne(newTip);
        res.send(result);
    })

    app.get('/tips', async (req, res) => {
        const result = await tips.find().toArray();
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Application Requests is Working");
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})