const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rvsy5g6.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run (){
    try {
        const phoneCollection = client.db("usedPhoneStore").collection("phoneDetails");
        const usersCollection = client.db("usedPhoneStore").collection("users");

        app.get('/phones', async(req,res)=>{
            const query = {};
            const options = await phoneCollection.find(query).toArray();
            res.send(options);
        })

        app.get('/phone/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const singlePhone = await phoneCollection.findOne(query);
            res.send(singlePhone);
        })

        app.post('/add', async(req,res)=>{
            const phone = req.body;
            const result = await phoneCollection.insertOne(phone);
            res.send(result);
        })

        app.post('/users', async(req,res)=>{
            const users = req.body;
            const result = await usersCollection.insertOne(users);
            res.send(result);
        })
    }
    catch {

    }
}

run().catch(error=> console.log(error));

app.get('', (req,res)=> {
    res.send('Used product server is running');
})

app.listen(port,()=> {
    console.log(`Used product server is running on ${port}`);
})