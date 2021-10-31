const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;


const app = express();
const port = process.env.PORT || 5000;

// middleware   
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@test1.trceg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("Travelley");
        const packageCollection = database.collection("Packages");
        const bookingCollection = database.collection("Booking");

        // POST API for adding package
        app.post('/packages', async (req, res) => {
            const newPackage = req.body;
            const result = await packageCollection.insertOne(newPackage);
            // console.log('got new user', req.body);
            // console.log('added user', result);
            res.json(result);
        });


        // GET API for all packages
        app.get('/packages', async (req, res) => {
            const cursor = packageCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        });

        //GET A SINGLE package by id
        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await packageCollection.findOne(query);
            // console.log('load user with id: ', id);
            res.send(user);
        })

        // POST API for booking
        app.post('/bookings', async (req, res) => {
            const newBooking = req.body;
            const result = await bookingCollection.insertOne(newBooking);
            // console.log('got new booking', req.body);
            // console.log('added booking', result);
            res.json(result);
        });


        //My Orders
        app.get('/myOrders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const orders = await bookingCollection.find(query).toArray();
            // console.log('get orders by email: ', email);
            res.send(orders);
        })

        // DELETE Orders
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            // console.log('deleting user with id ', result);
            res.json(result);
        })


        // get all orders 
        app.get('/orders', async (req, res) => {
            const cursor = bookingCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });


        //UPDATE status
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "Approved",
                    color: "green"
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc, options)
            // console.log('updating', id)
            // console.log(result)
            res.json(result)
        })





    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running Travelley Server!')
})

app.listen(port, () => {
    console.log('Running Server on Port', port)
})