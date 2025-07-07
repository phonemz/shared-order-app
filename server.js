const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();
const PORT = 4000;

const ORDERS_FILE = path.join(__dirname, "orders.json");

// Middleware
app.use(bodyParser.json());

// Serve static files (index.html, css, js) from project root folder
app.use(express.static(__dirname));

// Session setup for admin login
app.use(
        session({
                secret: "your_secret_key_here",
                resave: false,
                saveUninitialized: false,
        })
);

// Load orders from JSON file or empty array
function loadOrders() {
        try {
                const data = fs.readFileSync(ORDERS_FILE, "utf8");
                return JSON.parse(data);
        } catch {
                return [];
        }
}

// Save orders to JSON file
function saveOrders(orders) {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// API endpoint to receive order POST request
app.post("/order", (req, res) => {
        const { name, items } = req.body;
        if (!name || !items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: "Invalid order data" });
        }

        const orders = loadOrders();
        orders.push({ name, items, time: new Date().toISOString() });
        saveOrders(orders);

        res.json({ message: "Order saved" });
});

// Admin login page (simple HTML)
app.get("/admin/login", (req, res) => {
        res.send(`
    <h2>Admin Login</h2>
    <form method="POST" action="/admin/login">
      <input name="username" placeholder="Username" required /><br/>
      <input name="password" placeholder="Password" type="password" required /><br/>
      <button type="submit">Login</button>
    </form>
  `);
});

// Parse urlencoded form data for admin login POST
app.use("/admin/login", express.urlencoded({ extended: true }));

// Admin login POST handler
app.post("/admin/login", (req, res) => {
        const { username, password } = req.body;
        // Change these credentials as needed
        if (username === "admin" && password === "password123") {
                req.session.admin = true;
                res.redirect("/admin/orders");
        } else {
                res.send(
                        'Invalid username or password. <a href="/admin/login">Try again</a>'
                );
        }
});

// Middleware to protect admin pages
function adminAuth(req, res, next) {
        if (req.session.admin) next();
        else res.redirect("/admin/login");
}

// Admin logout route
app.get("/admin/logout", adminAuth, (req, res) => {
        req.session.destroy(() => {
                res.redirect("/admin/login");
        });
});

// Admin orders listing page
app.get("/admin/orders", adminAuth, (req, res) => {
        const orders = loadOrders();

        let html = `
    <h2>All Orders</h2>
    <a href="/admin/logout">Logout</a>
    <ul>
  `;

        orders.forEach((order) => {
                const itemsSummary = order.items
                        .map((i) => {
                                if (i.options && i.options.length > 0) {
                                        return `${i.item} (${i.options.join(
                                                ", "
                                        )}) x${i.quantity}`;
                                }
                                return `${i.item} x${i.quantity}`;
                        })
                        .join("; ");

                html += `<li><strong>${order.name}</strong> - ${itemsSummary} <br/><small>${order.time}</small></li>`;
        });

        html += "</ul>";

        res.send(html);
});

app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
});
