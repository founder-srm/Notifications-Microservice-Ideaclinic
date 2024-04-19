const express = require("express");
const { Novu } = require("@novu/node");
require('dotenv').config({ path: '.env.local' });

const novu = new Novu(process.env.NOVU_API_KEY);
const app = express();
app.use(express.json());


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

        res.status(201).send({ message: 'Thread created successfully' });
    } catch (error) {
        res.status(500).send({ error: `An error occurred while creating the thread: ${error}` });
    }
});

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;