let orders = [];

window.addEventListener("load", () => {
        // Setup simple-item quantity controls
        document.querySelectorAll(".simple-item").forEach((item) => {
                const name = item.dataset.name;
                item.innerHTML = `
      <span>${name}</span>
      <div class="quantity-control">
        <button type="button" onclick="changeQty(this, -1)">−</button>
        <input type="number" class="quantity" value="0" min="0" />
        <button type="button" onclick="changeQty(this, 1)">+</button>
      </div>
    `;
        });

        // Setup add combo buttons
        document.querySelectorAll(".add-combo").forEach((button) => {
                button.addEventListener("click", () => {
                        const builder = button.closest(".combo-builder");
                        const itemName = builder.dataset.item;
                        let selected = [];

                        if (itemName === "လက်ဖက်ရည်") {
                                const checked = builder.querySelector(
                                        "input[type=radio]:checked"
                                );
                                if (checked) selected = [checked.value];
                        } else {
                                selected = Array.from(
                                        builder.querySelectorAll(
                                                "input[type=checkbox]:checked"
                                        )
                                ).map((c) => c.value);
                        }

                        const qty = parseInt(
                                builder.querySelector(".combo-qty").value
                        );

                        if (selected.length === 0) {
                                alert("Option တစ်ခုခု ရွေးပါ");
                                return;
                        }
                        if (qty <= 0) {
                                alert("အရေအတွက်မှန်မှန်ဖြည့်ပါ");
                                return;
                        }

                        const list = builder.querySelector(".combo-list");
                        const li = document.createElement("li");
                        li.textContent = `${itemName} (${selected.join(
                                ", "
                        )}) x${qty}`;
                        li.dataset.item = itemName;
                        li.dataset.options = JSON.stringify(selected);
                        li.dataset.qty = qty;
                        list.appendChild(li);

                        if (itemName === "လက်ဖက်ရည်") {
                                builder.querySelectorAll(
                                        "input[type=radio]"
                                ).forEach((r) => (r.checked = false));
                        } else {
                                builder.querySelectorAll(
                                        "input[type=checkbox]"
                                ).forEach((c) => (c.checked = false));
                        }
                        builder.querySelector(".combo-qty").value = 1;
                });
        });

        // Load saved orders from localStorage
        const saved = localStorage.getItem("orders");
        if (saved) {
                orders = JSON.parse(saved);
                updateOrderList();
                updateTotals();
        }
});

function changeQty(btn, delta) {
        const input = btn.parentElement.querySelector("input");
        let val = parseInt(input.value) + delta;
        input.value = Math.max(0, val);
}

document.getElementById("orderForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const nameInput = document.getElementById("username");
        const name = nameInput.value.trim();
        if (!name) {
                alert("နာမည်ထည့်ပါ");
                return;
        }

        const items = [];

        document.querySelectorAll(".combo-builder").forEach((builder) => {
                const itemName = builder.dataset.item;
                builder.querySelectorAll("li").forEach((li) => {
                        const options = JSON.parse(li.dataset.options);
                        const qty = parseInt(li.dataset.qty);
                        items.push({ item: itemName, options, quantity: qty });
                });
                builder.querySelector(".combo-list").innerHTML = "";

                if (itemName === "လက်ဖက်ရည်") {
                        builder.querySelectorAll("input[type=radio]").forEach(
                                (r) => (r.checked = false)
                        );
                } else {
                        builder.querySelectorAll(
                                "input[type=checkbox]"
                        ).forEach((c) => (c.checked = false));
                }
                builder.querySelector(".combo-qty").value = 1;
        });

        document.querySelectorAll(".simple-item").forEach((item) => {
                const qtyInput = item.querySelector(".quantity");
                const qty = parseInt(qtyInput.value);
                const itemName = item.dataset.name;
                if (qty > 0) {
                        items.push({
                                item: itemName,
                                options: [],
                                quantity: qty,
                        });
                }
                qtyInput.value = 0;
        });

        if (items.length === 0) {
                alert("အနည်းဆုံးတစ်ခုတော့ အော်ဒါတင်ပါ");
                return;
        }

        orders.push({ name, items });
        localStorage.setItem("orders", JSON.stringify(orders));

        updateOrderList();
        updateTotals();

        // Clear the username input properly
        nameInput.value = "";
        nameInput.blur(); // remove focus from input after submit
});

function updateOrderList() {
        const list = document.getElementById("orderList");
        if (!list) return; // skip if admin panel not present

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
        const totalList = document.getElementById("totals");
        if (!totalList) return; // skip if admin panel not present

        const totalMap = {};
        orders.forEach((order) => {
                order.items.forEach((i) => {
                        const key = i.options.length
                                ? `${i.item} (${i.options.join(", ")})`
                                : i.item;
                        totalMap[key] = (totalMap[key] || 0) + i.quantity;
                });
        });

        totalList.innerHTML = "";
        Object.entries(totalMap).forEach(([item, count]) => {
                const li = document.createElement("li");
                li.textContent = `${item}: ${count}`;
                totalList.appendChild(li);
        });
}
