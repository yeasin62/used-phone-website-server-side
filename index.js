const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rvsy5g6.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run (){
    try {
        const phoneCollection = client.db("usedPhoneStore").collection("phoneDetails");
        const usersCollection = client.db("usedPhoneStore").collection("users");
        const bookingCollection = client.db("usedPhoneStore").collection("booking");
        const categoryCollection = client.db("usedPhoneStore").collection("categories");

        app.get('/phones', async(req,res)=>{
            const query = {};
            const options = await phoneCollection.find(query).toArray();
            res.send(options);
        })

        app.get('/categories', async(req,res)=>{
            const query = {};
            const options = await categoryCollection.find(query).toArray();
            res.send(options);
        })

        app.get('/category/:id', async(req,res)=> {
            const id = req.params.id;
            const query = {};
            const allphones = await phoneCollection.find(query).toArray();
            const findCat = allphones.filter(n => n.category === id);
            res.send(findCat);
        })

        app.get('/phone/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const singlePhone = await phoneCollection.findOne(query);
            res.send(singlePhone);
        })

        app.get('/orders', async(req,res)=>{
            const email = req.query.email;
            const query = {email: email};
            const orders = await phoneCollection.find(query).toArray();
            res.send(orders);
        })

        app.get('/sellers', async(req,res)=>{
            const seller = req.query.sellerAccount;
            console.log(seller);
            const query = {sellerAccount: seller};
            const sellers = await usersCollection.find(query).toArray();
            res.send(sellers);
        })

        app.post('/add', async(req,res)=>{
            const phone = req.body;
            const result = await phoneCollection.insertOne(phone);
            res.send(result);
        })

        app.get('/jwt', async(req,res)=>{
            const email = req.query.email;
            const query = {userEmail: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email},process.env.ACCESS_TOKEN,{expiresIn: '1h'});
                res.send({accessToken: token});
            }
            else {
                res.status(403).send({accessToken: ''});
            }
        })

        app.post('/users', async(req,res)=>{
            const users = req.body;
            const result = await usersCollection.insertOne(users);
            res.send(result);
        })

        app.post('/booking', async(req,res)=>{
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
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