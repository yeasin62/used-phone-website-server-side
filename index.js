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

function verifyJWT (req,res,next) {
    console.log('token inside jwt', req.headers.authorization);
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('Unauthorized Access');
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function(error, decoded){
        if(error){
            return res.status(403).send({message: 'forbidden Access'});
        }
        req.decoded = decoded;
        next();
    })
}
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

        app.get('/orders',verifyJWT, async(req,res)=>{
            const email = req.query.email;
            //console.log('token', req.headers.authorization);
            // const decodedEmail = req.decoded.email;
            // if(email !== decodedEmail){
            //     return res.status(403).send({message: 'Forbidden access'});
            // }
            const query = {email: email};
            const orders = await phoneCollection.find(query).toArray();
            res.send(orders);
        })

        // All sellers api
        app.get('/sellers', async(req,res)=>{
            const query = {sellerAccount: "Seller"};
            const sellers = await usersCollection.find(query).toArray();
            res.send(sellers);
        })
        // All buyers api
        app.get('/allbuyers', async(req,res)=>{
            const query = {sellerAccount: false};
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
                const token = jwt.sign({email},process.env.ACCESS_TOKEN,{expiresIn: '500h'});
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

        app.get('/users/admin/:id', async(req,res)=>{
            const email= req.params.email;
            const query = {email};
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'})
        })
        


        app.post('/booking', async(req,res)=>{
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        app.put('/users/admin/:id', verifyJWT, async(req,res)=>{
            const decodedEmail = req.decoded.email;
            const query = {userEmail: decodedEmail};
            const user = await usersCollection.findOne(query);
            console.log(query);
            // if(user?.role !== 'admin'){
            //     req.status(403).send({message: 'Forbidden access'})
            // }

            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updatedDoc = {
                $set : {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter,updatedDoc,options);
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