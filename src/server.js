import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { sendNotification } from "./producer/notifyProducer.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "RabbitMQ API is running 🚀" }));

app.post("/send", async (req, res) => {
  try {
    const { type, channel, data } = req.body;
    await sendNotification(type, channel, data);
    res.json({ success: true, sent: { type, channel, data } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 55555;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));