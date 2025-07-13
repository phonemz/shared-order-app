window.addEventListener("load", () => {
        // Setup quantity controls for simple items
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

        // Setup combo buttons
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

                        if (selected.length === 0)
                                return alert("Option တစ်ခုခု ရွေးပါ");
                        if (qty <= 0) return alert("အရေအတွက်မှန်မှန်ဖြည့်ပါ");

                        const list = builder.querySelector(".combo-list");
                        const li = document.createElement("li");
                        li.textContent = `${itemName} (${selected.join(
                                ", "
                        )}) x${qty}`;
                        li.dataset.item = itemName;
                        li.dataset.options = JSON.stringify(selected);
                        li.dataset.qty = qty;
                        list.appendChild(li);

                        builder.querySelectorAll("input").forEach((input) => {
                                if (
                                        input.type === "radio" ||
                                        input.type === "checkbox"
                                )
                                        input.checked = false;
                        });

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
                if (!name) return alert("နာမည်ထည့်ပါ");

                const items = [];

                // Collect combo items
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
                                builder.querySelector(".combo-qty").value = 1;
                        }
                );

                // Collect simple items
                document.querySelectorAll(".simple-item").forEach((item) => {
                        const qtyInput = item.querySelector(".quantity");
                        const qty = parseInt(qtyInput.value);
                        const itemName = item.dataset.name;
                        if (qty > 0)
                                items.push({
                                        item: itemName,
                                        options: [],
                                        quantity: qty,
                                });
                        qtyInput.value = 0;
                });

                if (items.length === 0)
                        return alert("အနည်းဆုံးတစ်ခုတော့ အော်ဒါတင်ပါ");

                try {
                        const res = await fetch("/api/orders", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ name, items }),
                        });

                        if (res.ok) {
                                showToast("အော်ဒါတင်ပြီးပါပြီ!");
                                nameInput.value = "";
                                nameInput.blur();
                        } else {
                                alert("အော်ဒါတင်ရန် မအောင်မြင်ပါ");
                        }
                } catch (err) {
                        alert("Server အဆင်မပြေတာကြောင့် အော်ဒါမတင်နိုင်ပါ");
                        console.error(err);
                }
        }
);

function showToast(message) {
        // Create or reuse overlay element
        let overlay = document.getElementById("toast-overlay");
        if (!overlay) {
                overlay = document.createElement("div");
                overlay.id = "toast-overlay";
                Object.assign(overlay.style, {
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent black
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "white",
                        fontSize: "20px",
                        fontWeight: "bold",
                        zIndex: 10000,
                        opacity: 0,
                        transition: "opacity 0.3s",
                        pointerEvents: "auto", // block clicks
                        userSelect: "none",
                        textAlign: "center",
                        padding: "20px",
                        boxSizing: "border-box",
                });
                document.body.appendChild(overlay);
        }
        overlay.textContent = message;
        overlay.style.opacity = 1;

        // After 2 seconds, fade out and remove overlay
        setTimeout(() => {
                overlay.style.opacity = 0;
                setTimeout(() => {
                        overlay.remove();
                }, 300);
        }, 2000);
}
