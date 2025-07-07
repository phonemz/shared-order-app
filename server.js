require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
})
        .then(() => console.log("MongoDB connected"))
        .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());

// Serve static files from root directory
app.use(express.static(path.join(__dirname)));

const orderSchema = new mongoose.Schema({
        name: { type: String, required: true },
        items: [
                {
                        item: String,
                        options: [String],
                        quantity: Number,
                },
        ],
        createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

// POST new order
app.post("/api/orders", async (req, res) => {
        try {
                const newOrder = new Order(req.body);
                await newOrder.save();
                res.status(201).json({ message: "Order saved" });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Failed to save order" });
        }
});

// GET all orders (admin)
app.get("/api/orders", async (req, res) => {
        try {
                const orders = await Order.find().sort({ createdAt: -1 });
                res.json(orders);
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Failed to fetch orders" });
        }
});

// Serve admin.html for admin page
app.get("/admin", (req, res) => {
        res.sendFile(path.join(__dirname, "admin.html"));
});

app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
});
