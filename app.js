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
});

function changeQty(btn, delta) {
        const input = btn.parentElement.querySelector("input");
        let val = parseInt(input.value) + delta;
        input.value = Math.max(0, val);
}

document.getElementById("orderForm").addEventListener(
        "submit",
        async function (e) {
                e.preventDefault();

                const nameInput = document.getElementById("username");
                const name = nameInput.value.trim();
                if (!name) {
                        alert("နာမည်ထည့်ပါ");
                        return;
                }

                const items = [];

                document.querySelectorAll(".combo-builder").forEach(
                        (builder) => {
                                const itemName = builder.dataset.item;
                                builder.querySelectorAll("li").forEach((li) => {
                                        const options = JSON.parse(
                                                li.dataset.options
                                        );
                                        const qty = parseInt(li.dataset.qty);
                                        items.push({
                                                item: itemName,
                                                options,
                                                quantity: qty,
                                        });
                                });
                                builder.querySelector(".combo-list").innerHTML =
                                        "";

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
                        }
                );

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

                try {
                        const response = await fetch("/api/orders", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ name, items }),
                        });

                        if (response.ok) {
                                alert("အော်ဒါတင်ပြီးပါပြီ!");
                                nameInput.value = "";
                                nameInput.blur();
                        } else {
                                alert("အော်ဒါတင်ရန် မအောင်မြင်ပါ");
                        }
                } catch (error) {
                        alert("အော်ဒါတင်ရန် အဆင်မပြေပါ");
                }
        }
);
