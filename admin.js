let orders = [];
const ADMIN_PASSWORD = "yourStrongPasswordHere"; // change this to your desired password

window.addEventListener("load", () => {
        const loginBtn = document.getElementById("loginBtn");
        const passwordInput = document.getElementById("adminPassword");
        const loginError = document.getElementById("loginError");
        const adminPanel = document.getElementById("adminPanel");
        const passwordPrompt = document.getElementById("passwordPrompt");

        loginBtn.addEventListener("click", () => {
                const entered = passwordInput.value;
                if (entered === ADMIN_PASSWORD) {
                        passwordPrompt.style.display = "none";
                        adminPanel.style.display = "block";

                        const saved = localStorage.getItem("orders");
                        if (saved) {
                                orders = JSON.parse(saved);
                                updateOrderList();
                                updateTotals();
                        } else {
                                document.getElementById(
                                        "orderList"
                                ).textContent = "No orders yet.";
                        }
                } else {
                        loginError.style.display = "block";
                        passwordInput.value = "";
                        passwordInput.focus();
                }
        });

        // Optional: allow pressing Enter key to submit password
        passwordInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                        loginBtn.click();
                }
        });
});

function updateOrderList() {
        const list = document.getElementById("orderList");
        list.innerHTML = "";
        orders.forEach((order) => {
                const li = document.createElement("li");
                const summary = order.items
                        .map((i) =>
                                i.options.length
                                        ? `${i.item} (${i.options.join(
                                                  ", "
                                          )}) x${i.quantity}`
                                        : `${i.item} x${i.quantity}`
                        )
                        .join(", ");
                li.textContent = `${order.name}: ${summary}`;
                list.appendChild(li);
        });
}

function updateTotals() {
        const totalMap = {};
        orders.forEach((order) => {
                order.items.forEach((i) => {
                        const key = i.options.length
                                ? `${i.item} (${i.options.join(", ")})`
                                : i.item;
                        totalMap[key] = (totalMap[key] || 0) + i.quantity;
                });
        });

        const totalList = document.getElementById("totals");
        totalList.innerHTML = "";
        Object.entries(totalMap).forEach(([item, count]) => {
                const li = document.createElement("li");
                li.textContent = `${item}: ${count}`;
                totalList.appendChild(li);
        });
}
