require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

const orderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model("Order", orderSchema);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(async () => {
                console.log("MongoDB connected");
                const result = await Order.deleteMany({});
                console.log(`Deleted ${result.deletedCount} documents`);
                mongoose.disconnect();
        })
        .catch((err) => {
                console.error("Error:", err);
        });
