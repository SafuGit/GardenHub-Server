require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const gardeners = require('./data');

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
    // await client.connect();

    const database = client.db("gardenhub");
    const tips = database.collection("tips");
    const gardenersCollection = database.collection("gardeners");

    app.get('/gardeners', async (req, res) => {
        const result = await gardenersCollection.find().toArray();
        res.send(result);
    })

    app.get('/gardeners/active', async (req, res) => {
        const query = {status: 'active'};
        const result = await gardenersCollection.find(query).limit(6).toArray();
        res.send(result);
    })

    app.get('/gardeners/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await gardenersCollection.findOne(query);
        res.send(result);
    })

    app.get('/gardenSort/:sortBy', async (req, res) => {
        const sortBy = req.params.sortBy;
        if (sortBy === 'asc') {
            const result = await gardenersCollection.find().sort({name: 1}).toArray();
            res.send(result);
        } else if (sortBy === 'desc') {
            const result = await gardenersCollection.find().sort({name: -1}).toArray();
            res.send(result);
        } else {
            res.status(400).send({error: "Invalid sort parameter"});
        }
    })

    app.get('/gardenFilter/age', async (req, res) => {
        const age = req.query.age;
        let query = {};

        if (age === 'under30') {
            query.age = { $lt: 30 };
        } else if (age === '30to39') {
            query.age = { $gte: 30, $lte: 39 };
        } else if (age === '40to49') {
            query.age = { $gte: 40, $lte: 49 };
        } else if (age === '50plus') {
            query.age = { $gte: 50 };
        }

        const result = await gardenersCollection.find(query).toArray();
        res.send(result);
    })

    app.post('/tips', async (req, res) => {
        const newTip = req.body;
        const result = await tips.insertOne(newTip);
        res.send(result);
    })

    app.get('/tips/6', async (req, res) => {
        const result = await tips.find({availability: "public"}).limit(6).toArray();
        res.send(result);
    })

    app.put('/tips/like/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await tips.updateOne(query, {
            $inc: {
                totalLikes: 1
            }
        });
        res.send(result);
    })

    app.get('/tips', async (req, res) => {
        const result = await tips.find().toArray();
        res.send(result);
    })

    app.get('/tips/public', async (req, res) => {
        const result = await tips.find({availability: "public"}).toArray();
        res.send(result);
    })

    app.get('/tips/user/:email', async (req, res) => {
        const email = req.params.email;
        const query = {userEmail: email};
        const result = await tips.find(query).toArray();
        res.send(result);
    })

    app.get('/tips/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await tips.findOne(query);
        res.send(result);
    })

    app.get('/tips/public/difficulty/:difficulty', async (req, res) => {
        const difficulty = req.params.difficulty;
        const query = {difficulty: difficulty, availability: "public"};
        const result = await tips.find(query).toArray();
        res.send(result);
    })

    app.delete('/tips/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await tips.deleteOne(query);
        res.send(result);
    })

    app.put('/tips/:id', async (req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const options = { upsert: true };
        const updatedTip = req.body;
        const updatedDoc = {
            $set: updatedTip,
        }
        const result = await tips.updateOne(filter, updatedDoc, options);
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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