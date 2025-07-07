document.getElementById("login-form").addEventListener(
        "submit",
        async function (e) {
                e.preventDefault();
                const name = document.getElementById("admin-name").value.trim();
                const pass = document.getElementById("admin-password").value;

                if (name === "admin" && pass === "1234") {
                        document.getElementById("admin-panel").classList.remove(
                                "hidden"
                        );
                        document.getElementById("login-form").classList.add(
                                "hidden"
                        );
                        fetchOrders();
                } else {
                        alert("Login failed");
                }
        }
);

async function fetchOrders() {
        try {
                const res = await fetch("/api/orders");
                const data = await res.json();
                renderOrders(data);
        } catch (err) {
                alert("Failed to load orders");
                console.error(err);
        }
}

function renderOrders(data) {
        const list = document.getElementById("admin-orders");
        list.innerHTML = "";

        const totals = {};

        data.forEach((order) => {
                const li = document.createElement("li");
                const summary = order.items
                        .map((i) => {
                                const label = i.options.length
                                        ? `${i.item} (${i.options.join(", ")})`
                                        : i.item;

                                if (!totals[label]) totals[label] = 0;
                                totals[label] += i.quantity;

                                return `${label} x${i.quantity}`;
                        })
                        .join(", ");
                li.textContent = `👤 ${order.name}: ${summary}`;
                list.appendChild(li);
        });

        const totalList = document.getElementById("admin-totals");
        totalList.innerHTML = "";
        Object.entries(totals).forEach(([label, qty]) => {
                const li = document.createElement("li");
                li.textContent = `${label}: ${qty}`;
                totalList.appendChild(li);
        });
}
