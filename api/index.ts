const express = require("express");
const { Novu } = require("@novu/node");
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });

import { TriggerRecipientsTypeEnum } from '@novu/node'

const novu = new Novu(process.env.NOVU_API_KEY);
const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'https://ideaclinic-forum.vercel.app'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.post("/create-thread", async (req, res) => {
    const { threadId, userId, title } = req.body;

    if (!threadId || !userId || !title) {
        return res.status(400).send({ error: 'Missing required fields' });
    }
    try {
        await novu.topics.create({
            key: threadId,
            name: title,
        });
        await novu.topics.addSubscribers(threadId, {
            subscribers: [userId],
        });

        res.status(201).send({ message: 'Notification sent successfully' });
    } catch (error) {
        res.status(500).send({ error: `An error occurred while creating the thread: ${error}` });
    }
});

app.post("/on-comment", async (req, res) => {
    const { threadId, commentData } = req.body;

    if (!threadId || !commentData ) {
        return res.status(400).send({ error: 'Missing required fields' });
    }
    try {
        await novu.trigger("replies-to-post", {
            to: [{ type: TriggerRecipientsTypeEnum.TOPIC, topicKey: threadId }],
            payload: {
              post_id: threadId,
              comment:commentData,
            }
        });
        res.status(201).send({ message: 'Comment created successfully' });
    } catch (error) {
        res.status(500).send({ error: `An error occurred while creating the Comment: ${error}` });
    }
});

app.post("/register-notification", async (req, res) => {
    const { id, email, firstName, lastName, title } = req.body;

    if (!id || !email || !firstName || !lastName || !title) {
        return res.status(400).send({ error: 'Missing required fields' });
    }
    try{
        await novu.subscribers.identify(id, { 
            email: email, 
            firstName: firstName, 
            lastName: lastName, 
            data: { 'title' : title }
        });
        res.status(201).send({ message: 'Account created successfully' });
    } catch (error) {
        res.status(500).send({ error: `An error occurred while creating the Account: ${error}` });
    }
});

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;