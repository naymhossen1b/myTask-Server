require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//// Middle Ware \\\\\
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASS}@firstpractice.poejscf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db("myTask").collection("users");
    const tasksCollection = client.db("myTask").collection("tasks");

    // tasksCollection save \\\
    app.post("/tasks", async (req, res) => {
      const task = req.body;
      const result = await tasksCollection.insertOne(task);
      res.send(result);
    });

    app.get("/tasks", async (req, res) => {
      const result = await tasksCollection.find().toArray();
      res.send(result);
    });
    // Update task by ID
    app.put("/tasks/:id", async (req, res) => {
      const { id } = req.params;
      const { title, description, priority } = req.body;
      const filter = { _id: new ObjectId(id) };
      const update = {
        $set: { title, description, priority },
      };
      const options = { returnDocument: "after" };
      const updatedTask = await tasksCollection.findOneAndUpdate(filter, update, options);
      res.send(updatedTask);
    });

    // Delete task by ID
    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params;
      const filter = { _id: new ObjectId(id) };
      const deletedTask = await tasksCollection.deleteOne(filter);
      res.send(deletedTask);
    });

    // / User data collection
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const userData = req.body;
      const result = await userCollection.insertOne(userData);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB! 😎");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Task!😍");
});

app.listen(port, () => {
  console.log(`MY Task app listening on port ${port} 😝`);
});
