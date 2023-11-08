const express = require('express');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5001

app.use(cors());
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.exa7jan.mongodb.net/?retryWrites=true&w=majority`;

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

    
    await client.connect();
    const assignmentCollection = client.db("AssignmentDB").collection("Assignment")
    const takeAssignmentCollection = client.db("AssignmentDB").collection("takeAssignment")
    
    app.get('/assignments', async(req,res)=>{
        const cursor = assignmentCollection.find()
        const result = await cursor.toArray()
        res.send(result) 
      })

      app.get('/assignments/:id', async(req,res)=>{
        const id = req.params.id
        const query = { _id: new ObjectId(id)}
        const result = await assignmentCollection.findOne(query)
        res.send(result)
      })

      // update
      app.put('/assignments/:id' , async(req,res) => {
        const id = req.params.id;
        const updatedAssignment = req.body;
        const filter = {_id : new ObjectId(id)}
        const options = {upsert : true}
        const update = {
          $set: {
            title: updatedAssignment.title,
            description: updatedAssignment.description,
            Image: updatedAssignment.Image,
            type: updatedAssignment.type,
            marks: updatedAssignment.marks,
            date: updatedAssignment.date
            
  
          }
        }
        const result = await assignmentCollection.updateOne(filter,update,options)
        res.send(result)
        
      })

      app.patch('/takeAssignment/:id', async(req,res)=>{
        const id = req.params.id
        const filter = {_id: new ObjectId(id)}
        const updateAssignment = req.body
        console.log(updateAssignment)
        const updateDoc ={
          $set:{
            status: updateAssignment.status
          }
        }
        const result = await takeAssignmentCollection.updateOne(filter, updateDoc)
        res.send(result)
      })

    app.post('/assignments', async(req,res)=>{
        const newAssignment= req.body;
        console.log(newAssignment);
        const result = await assignmentCollection.insertOne(newAssignment);
        res.send(result)
      })

      

      app.get('/takeAssignment', async(req,res)=>{
        console.log(req.query.email)
        let query = {}
        if(req.query?.email){
          query = {email: req.query.email}
        }
        const result = await takeAssignmentCollection.find(query).toArray()
        
        res.send(result)
      })

      app.delete('/takeAssignment/:id', async(req,res)=>{
        const id = req.params.id
        const query = {_id : new ObjectId(id)}
        const result = await takeAssignmentCollection.deleteOne(query)
        res.send(result)

      })

      app.post('/takeAssignments', async(req,res)=>{
        const newValue = req.body;
        console.log(newValue)
        const result = await takeAssignmentCollection.insertOne(newValue)
        res.send(result)
      })
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('my server is running')
})

app.listen(port,()=>{
    console.log(`my server is running on port:${port}`)
})