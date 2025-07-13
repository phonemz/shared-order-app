// server.js
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Log mongoose connection events
mongoose.connection.on("connected", () => {
        console.log("MongoDB connected");
});
mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
});
mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected");
});

// Connect to MongoDB and start server only after connection succeeds
mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
})
        .then(() => {
                // Middleware
                app.use(express.json());
                app.use(express.static(path.join(__dirname))); // Serve static files

                // Schema and Model
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

                // API Routes
                app.post("/api/orders", async (req, res) => {
                        try {
                                if (mongoose.connection.readyState !== 1) {
                                        return res
                                                .status(503)
                                                .json({
                                                        message: "Database not connected",
                                                });
                                }
                                const newOrder = new Order(req.body);
                                await newOrder.save();
                                res.status(201).json({
                                        message: "Order saved",
                                });
                        } catch (err) {
                                console.error("POST /api/orders error:", err);
                                res.status(500).json({
                                        message: "Failed to save order",
                                });
                        }
                });

                app.get("/api/orders", async (req, res) => {
                        try {
                                if (mongoose.connection.readyState !== 1) {
                                        return res
                                                .status(503)
                                                .json({
                                                        message: "Database not connected",
                                                });
                                }
                                const orders = await Order.find().sort({
                                        createdAt: -1,
                                });
                                res.json(orders);
                        } catch (err) {
                                console.error("GET /api/orders error:", err);
                                res.status(500).json({
                                        message: "Failed to fetch orders",
                                });
                        }
                });

                // Admin page
                app.get("/admin", (req, res) => {
                        res.sendFile(path.join(__dirname, "admin.html"));
                });

                // SPA fallback (optional)
                app.get("/*", (req, res) => {
                        res.sendFile(path.join(__dirname, "index.html"));
                });

                // Start server
                app.listen(PORT, () => {
                        console.log(`Server running on port ${PORT}`);
                });
        })
        .catch((err) => {
                console.error("Failed to connect to MongoDB", err);
                process.exit(1);
        });
