//importing

import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher'
import cors from'cors'

// app config
const app=express();
const port= process.env.PORT || 9000

//middleware
app.use(express.json());
// app.use((req,res,next)=>{
//     res.setHeader("Access-Control-Allow-Origin","*");
//     res.setHeader("Access-Control-Allow-Headers","*");
//     next();
// })
app.use(cors())


//DB config
const connection_url='mongodb+srv://admin:rs.9897637879@cluster0.q5kco.mongodb.net/whatsappdb?retryWrites=true&w=majority'

mongoose.connect(connection_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})

const db=mongoose.connection
db.once('open',()=>{
    console.log("DB is connected");
    const msgCollection=db.collection("messagecontents");

    const changeStream=msgCollection.watch();       
    changeStream.on('change',(change)=>{
        console.log(change);
        if(change.operationType==='insert'){
            const messageDetails=change.fullDocument;
            pusher.trigger('messages','inserted',{
                name:messageDetails.name,
                message:messageDetails.message,
                timestamp:messageDetails.timestamp,
                recieved:messageDetails.recieved
            })
        }
        else{
            console.log('Error triggering Pusher')
        }

    })
})



const pusher = new Pusher({
    appId: "1237411",
    key: "257ecbbf7d3543e9da9d",
    secret: "38233be7e405aa982ac2",
    cluster: "ap2",
    useTLS: true
  });

//?????


//api routes
app.get('/',(req,res)=>{
    res.status(200).send("Hello from Rohan's Server");
})

app.post('/messages/new',(req,res)=>{
    const dbMessage=req.body;

    Messages.create(dbMessage,(err,data)=>{
        if(err){
            res.status(500).send(err);
        }
        else{
            res.status(201).send(data);
        }
    })
})

app.get('/messages/sync',(req,res)=>{
    

    Messages.find((err,data)=>{
        if(err){
            res.status(500).send(err);
        }
        else{
            res.status(200).send(data);
        }
    })
})
//listen

app.listen(port,()=>{console.log(`Listening on port : ${port}`)})
