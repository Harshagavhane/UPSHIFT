// ================================
// LOGIN PROTECTION
// ================================

const currentPage = window.location.pathname.split("/").pop();

const protectedPages = [
    "index.html",
    "vargani.html",
    "expenses.html",
    "reports.html"
];

if (
    protectedPages.includes(currentPage) &&
    localStorage.getItem("adminLoggedIn") !== "true"
) {
    window.location.href = "login.html";
}
// ===============================
// VARGANI MANAGEMENT
// ===============================

let varganiRecords = JSON.parse(localStorage.getItem("varganiRecords")) || [];
function generateReceiptNumber() {
    const records = JSON.parse(localStorage.getItem("varganiRecords")) || [];

    const nextNumber = records.length + 1;

    return `PGMM-${String(nextNumber).padStart(3, "0")}`;
}
const varganiForm = document.getElementById("varganiForm");

if (varganiForm) {

    varganiForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const donorName = document.getElementById("donorName").value;
        const amount = Number(document.getElementById("amount").value);
        const date = document.getElementById("date").value;
        const collectedBy = document.getElementById("collectedBy").value;
        const paymentMethod = document.getElementById("paymentMethod").value;
       let receiptNo = document.getElementById("receiptNo").value.trim();

if (!receiptNo) {
    receiptNo = generateReceiptNumber();
}

if (!receiptNo) {
    receiptNo = generateReceiptNumber();
}

        const newRecord = {
            id: Date.now(),
            donorName: donorName,
            amount: amount,
            date: date,
            collectedBy: collectedBy,
            paymentMethod: paymentMethod,
            receiptNo: receiptNo
        };

        varganiRecords.push(newRecord);

        localStorage.setItem(
            "varganiRecords",
            JSON.stringify(varganiRecords)
        );

        varganiForm.reset();

        displayVarganiRecords();
        updateVarganiSummary();

        alert("Vargani added successfully! 🙏");
    });

    displayVarganiRecords();
    updateVarganiSummary();
}


// ===============================
// DISPLAY RECORDS
// ===============================

function displayVarganiRecords() {
    const table = document.getElementById("varganiTable");

    if (!table) return;

    table.innerHTML = "";

    if (varganiRecords.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7">No Vargani records yet.</td>
            </tr>
        `;
        return;
    }

    varganiRecords.forEach(function(record) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${record.receiptNo || "-"}</td>
            <td>${record.donorName}</td>
            <td>₹${record.amount}</td>
            <td>${record.date}</td>
            <td>${record.collectedBy}</td>
            <td>${record.paymentMethod}</td>
            <td>
                <button onclick="printReceipt(${record.id})" class="receipt-btn">
    🧾 Receipt
</button>

<button onclick="editVargani(${record.id})" class="edit-btn">
    ✏️ Edit
</button>

<button onclick="deleteVargani(${record.id})" class="delete-btn">
    🗑️ Delete
</button>
            </td>
        `;

        table.appendChild(row);
    });
}

    varganiRecords.forEach(function(record) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${record.receiptNo || "-"}</td>
            <td>${record.donorName}</td>
            <td>₹${record.amount}</td>
            <td>${record.date}</td>
            <td>${record.collectedBy}</td>
            <td>${record.paymentMethod}</td>
        `;

        table.appendChild(row);
    });
}


// ===============================
// UPDATE SUMMARY
// ===============================

function updateVarganiSummary() {

    const totalVargani = varganiRecords.reduce(
        (total, record) => total + record.amount,
        0
    );

    const totalEntries = varganiRecords.length;

    const average =
        totalEntries > 0
            ? totalVargani / totalEntries
            : 0;

    const cards = document.querySelectorAll(".card");

    if (cards.length >= 3) {

        cards[0].querySelector("p").textContent =
            `₹${totalVargani}`;

        cards[1].querySelector("p").textContent =
            totalEntries;

        cards[2].querySelector("p").textContent =
            `₹${Math.round(average)}`;
    }
}
// ===============================
// EXPENSE MANAGEMENT
// ===============================
function deleteVargani(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this Vargani record?"
    );

    if (!confirmDelete) return;

    varganiRecords = varganiRecords.filter(function(record) {
        return record.id !== id;
    });

    localStorage.setItem(
        "varganiRecords",
        JSON.stringify(varganiRecords)
    );

    displayVarganiRecords();
    updateVarganiSummary();
    updateDashboard();
updateCollectorChart(vargani);
    alert("Vargani record deleted.");
}


function editVargani(id) {
    const record = varganiRecords.find(function(item) {
        return item.id === id;
    });

    if (!record) return;

    document.getElementById("donorName").value = record.donorName;
    document.getElementById("amount").value = record.amount;
    document.getElementById("date").value = record.date;
    document.getElementById("collectedBy").value = record.collectedBy;
    document.getElementById("paymentMethod").value = record.paymentMethod;
    document.getElementById("receiptNo").value = record.receiptNo || "";

    varganiRecords = varganiRecords.filter(function(item) {
        return item.id !== id;
    });

    localStorage.setItem(
        "varganiRecords",
        JSON.stringify(varganiRecords)
    );

    displayVarganiRecords();
    updateVarganiSummary();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    alert("Edit the details and submit again.");
}
let expenseRecords =
    JSON.parse(localStorage.getItem("expenseRecords")) || [];

const expenseForm = document.getElementById("expenseForm");

if (expenseForm) {

    expenseForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const expenseName =
            document.getElementById("expenseName").value;

        const amount =
            Number(document.getElementById("expenseAmount").value);

        const date =
            document.getElementById("expenseDate").value;

        const paidBy =
            document.getElementById("paidBy").value;

        const category =
            document.getElementById("expenseCategory").value;

        const payment =
            document.getElementById("expensePayment").value;


        const newExpense = {
            id: Date.now(),
            expenseName: expenseName,
            amount: amount,
            date: date,
            paidBy: paidBy,
            category: category,
            payment: payment
        };


        expenseRecords.push(newExpense);


        localStorage.setItem(
            "expenseRecords",
            JSON.stringify(expenseRecords)
        );


        expenseForm.reset();

        displayExpenseRecords();
        updateExpenseSummary();

        alert("Expense added successfully! ✅");
    });


    displayExpenseRecords();
    updateExpenseSummary();
}


// ===============================
// DISPLAY EXPENSES
// ===============================

function displayExpenseRecords() {
    const table = document.getElementById("expenseTable");

    if (!table) return;

    table.innerHTML = "";

    if (expenseRecords.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="8">No expense records yet.</td>
            </tr>
        `;
        return;
    }

    expenseRecords.forEach(function(record) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${record.expenseName}</td>
            <td>₹${record.amount}</td>
            <td>${record.date}</td>
            <td>${record.paidBy}</td>
            <td>${record.category}</td>
            <td>${record.payment}</td>
            <td>
                <button onclick="editExpense(${record.id})" class="edit-btn">
                    ✏️ Edit
                </button>

                <button onclick="deleteExpense(${record.id})" class="delete-btn">
                    🗑️ Delete
                </button>
            </td>
        `;

        table.appendChild(row);
    });
}
function deleteExpense(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) return;

    expenseRecords = expenseRecords.filter(function(record) {
        return record.id !== id;
    });

    localStorage.setItem(
        "expenseRecords",
        JSON.stringify(expenseRecords)
    );

    displayExpenseRecords();
    updateExpenseSummary();
    updateDashboard();

    alert("Expense deleted.");
}


function editExpense(id) {
    const record = expenseRecords.find(function(item) {
        return item.id === id;
    });

    if (!record) return;

    document.getElementById("expenseName").value = record.expenseName;
    document.getElementById("expenseAmount").value = record.amount;
    document.getElementById("expenseDate").value = record.date;
    document.getElementById("paidBy").value = record.paidBy;
    document.getElementById("expenseCategory").value = record.category;
    document.getElementById("expensePayment").value = record.payment;

    expenseRecords = expenseRecords.filter(function(item) {
        return item.id !== id;
    });

    localStorage.setItem(
        "expenseRecords",
        JSON.stringify(expenseRecords)
    );

    displayExpenseRecords();
    updateExpenseSummary();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    alert("Edit the details and submit again.");
}


    expenseRecords.forEach(function (expense) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${expense.expenseName}</td>
            <td>₹${expense.amount}</td>
            <td>${expense.date}</td>
            <td>${expense.paidBy}</td>
            <td>${expense.category}</td>
            <td>${expense.payment}</td>
        `;

        table.appendChild(row);
    });
}


// ===============================
// UPDATE EXPENSE SUMMARY
// ===============================

function updateExpenseSummary() {

    const total =
        expenseRecords.reduce(
            (sum, expense) =>
                sum + expense.amount,
            0
        );

    const entries =
        expenseRecords.length;

    const average =
        entries > 0
            ? total / entries
            : 0;


    const totalElement =
        document.getElementById("totalExpenses");

    const entriesElement =
        document.getElementById("expenseEntries");

    const averageElement =
        document.getElementById("averageExpense");


    if (totalElement)
        totalElement.textContent = `₹${total}`;

    if (entriesElement)
        entriesElement.textContent = entries;

    if (averageElement)
        averageElement.textContent =
            `₹${Math.round(average)}`;
}
// ===============================
// DASHBOARD
// ===============================

function updateDashboard() {
    ```javascript
// Update financial chart

const varganiBar = document.getElementById("varganiBar");
const expenseBar = document.getElementById("expenseBar");

const varganiChartAmount =
    document.getElementById("varganiChartAmount");

const expenseChartAmount =
    document.getElementById("expenseChartAmount");

const maxAmount = Math.max(
    totalVargani,
    totalExpenses,
    1
);

if (varganiBar) {
    varganiBar.style.width =
        `${(totalVargani / maxAmount) * 100}%`;
}

if (expenseBar) {
    expenseBar.style.width =
        `${(totalExpenses / maxAmount) * 100}%`;
}

if (varganiChartAmount) {
    varganiChartAmount.textContent =
        `₹${totalVargani}`;
}

if (expenseChartAmount) {
    expenseChartAmount.textContent =
        `₹${totalExpenses}`;
}
```


    const vargani =
        JSON.parse(localStorage.getItem("varganiRecords")) || [];

    const expenses =
        JSON.parse(localStorage.getItem("expenseRecords")) || [];


    // Total Vargani

    const totalVargani =
        vargani.reduce(
            (sum, record) => sum + Number(record.amount),
            0
        );


    // Total Expenses

    const totalExpenses =
        expenses.reduce(
            (sum, expense) => sum + Number(expense.amount),
            0
        );


    // Current Balance

    const balance =
        totalVargani - totalExpenses;


    // Total Entries

    const totalEntries =
        vargani.length + expenses.length;


    // Update Dashboard Cards

    const varganiElement =
        document.getElementById("dashboardVargani");

    const expensesElement =
        document.getElementById("dashboardExpenses");

    const balanceElement =
        document.getElementById("dashboardBalance");

    const entriesElement =
        document.getElementById("dashboardEntries");


    if (varganiElement)
        varganiElement.textContent =
            `₹${totalVargani}`;

    if (expensesElement)
        expensesElement.textContent =
            `₹${totalExpenses}`;

    if (balanceElement)
        balanceElement.textContent =
            `₹${balance}`;

    if (entriesElement)
        entriesElement.textContent =
            totalEntries;


    updateCollectorTable(vargani);

    updateRecentVargani(vargani);
}


// ===============================
// COLLECTOR TABLE
// ===============================

function updateCollectorTable(records) {

    const table =
        document.getElementById("collectorTable");

    if (!table) return;


    const members = [
        "Harsh Gavhane",
        "Yash Devre",
        "Aryan Wagh"
    ];


    table.innerHTML = "";


    members.forEach(function(member) {

        const memberRecords =
            records.filter(
                record =>
                    record.collectedBy === member
            );


        const total =
            memberRecords.reduce(
                (sum, record) =>
                    sum + Number(record.amount),
                0
            );


        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td>${member}</td>
            <td>₹${total}</td>
            <td>${memberRecords.length}</td>
        `;


        table.appendChild(row);
    });
}
```javascript
// ================================
// COLLECTOR PERFORMANCE CHART
// ================================

function updateCollectorChart(records) {

    const chart = document.getElementById("collectorChart");

    if (!chart) return;

    const members = [
        "Harsh Gavhane",
        "Yash Devre",
        "Aryan Wagh"
    ];

    const totals = members.map(function(member) {

        return records
            .filter(record => record.collectedBy === member)
            .reduce(
                (sum, record) => sum + Number(record.amount),
                0
            );

    });

    const maxTotal = Math.max(...totals, 1);

    chart.innerHTML = "";

    members.forEach(function(member, index) {

        const total = totals[index];

        const percentage =
            (total / maxTotal) * 100;

        const item = document.createElement("div");

        item.className = "collector-bar-item";

        item.innerHTML = `
            <div class="collector-bar-header">
                <span>${member}</span>
                <strong>₹${total}</strong>
            </div>

            <div class="collector-bar-track">
                <div
                    class="collector-bar-fill"
                    style="width: ${percentage}%">
                </div>
            </div>
        `;

        chart.appendChild(item);
    });
}
```


// ===============================
// RECENT VARGANI
// ===============================

function updateRecentVargani(records) {

    const table =
        document.getElementById("recentVargani");

    if (!table) return;


    table.innerHTML = "";


    if (records.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    No records yet.
                </td>
            </tr>
        `;

        return;
    }


    const recent =
        [...records].reverse().slice(0, 5);


    recent.forEach(function(record) {

        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td>${record.donorName}</td>
            <td>₹${record.amount}</td>
            <td>${record.date}</td>
            <td>${record.collectedBy}</td>
        `;


        table.appendChild(row);
    });
}


// Run Dashboard

updateDashboard();
function printReceipt(id) {
    const records = JSON.parse(
        localStorage.getItem("varganiRecords")
    ) || [];

    const record = records.find(function(item) {
        return item.id === id;
    });

    if (!record) {
        alert("Receipt record not found.");
        return;
    }

    const receiptWindow = window.open(
        "",
        "_blank",
        "width=700,height=800"
    );

    receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${record.receiptNo} - Receipt</title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #f5f5f5;
                    padding: 30px;
                }

                .receipt {
                    max-width: 600px;
                    margin: auto;
                    background: white;
                    padding: 35px;
                    border: 2px solid #222;
                }

                .header {
                    text-align: center;
                    border-bottom: 2px solid #222;
                    padding-bottom: 20px;
                    margin-bottom: 25px;
                }

                .header h1 {
                    margin: 0;
                    font-size: 28px;
                }

                .header p {
                    margin: 8px 0 0;
                    color: #555;
                }

                .receipt-number {
                    text-align: right;
                    font-weight: bold;
                    margin-bottom: 20px;
                }

                .row {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid #ddd;
                }

                .label {
                    font-weight: bold;
                }

                .amount {
                    font-size: 24px;
                    font-weight: bold;
                    text-align: center;
                    margin: 25px 0;
                }

                .footer {
                    text-align: center;
                    margin-top: 30px;
                    color: #555;
                }

                .print-btn {
                    display: block;
                    margin: 25px auto 0;
                    padding: 12px 25px;
                    background: #222;
                    color: white;
                    border: none;
                    cursor: pointer;
                    font-size: 16px;
                }

                @media print {
                    body {
                        background: white;
                        padding: 0;
                    }

                    .receipt {
                        border: 2px solid #222;
                    }

                    .print-btn {
                        display: none;
                    }
                }
            </style>
        </head>

        <body>

            <div class="receipt">

                <div class="header">
                    <h1>Pawan Ganesh Mitra Mandal</h1>
                    <p>Vargani Collection Receipt</p>
                </div>

                <div class="receipt-number">
                    Receipt No: ${record.receiptNo}
                </div>

                <div class="row">
                    <span class="label">Name / Shop</span>
                    <span>${record.donorName}</span>
                </div>

                <div class="row">
                    <span class="label">Date</span>
                    <span>${record.date}</span>
                </div>

                <div class="row">
                    <span class="label">Collected By</span>
                    <span>${record.collectedBy}</span>
                </div>

                <div class="row">
                    <span class="label">Payment Method</span>
                    <span>${record.paymentMethod}</span>
                </div>

                <div class="amount">
                    Amount Received: ₹${record.amount}
                </div>

                <div class="footer">
                    <p>Thank you for your contribution 🙏</p>
                    <p>Ganpati Bappa Morya! 🐘</p>
                </div>

                <button
                    class="print-btn"
                    onclick="window.print()">
                    🖨️ Print Receipt
                </button>

            </div>

        </body>
        </html>
    `);

    receiptWindow.document.close();
}
function updateReports() {

    const vargani = JSON.parse(
        localStorage.getItem("varganiRecords")
    ) || [];

    const expenses = JSON.parse(
        localStorage.getItem("expenseRecords")
    ) || [];


    // TOTALS

    const totalVargani = vargani.reduce(
        (sum, record) => sum + Number(record.amount),
        0
    );

    const totalExpenses = expenses.reduce(
        (sum, record) => sum + Number(record.amount),
        0
    );

    const balance = totalVargani - totalExpenses;

    const totalTransactions =
        vargani.length + expenses.length;


    // SUMMARY CARDS

    const reportVargani =
        document.getElementById("reportVargani");

    const reportExpenses =
        document.getElementById("reportExpenses");

    const reportBalance =
        document.getElementById("reportBalance");

    const reportTransactions =
        document.getElementById("reportTransactions");


    if (reportVargani) {
        reportVargani.textContent = `₹${totalVargani}`;
    }

    if (reportExpenses) {
        reportExpenses.textContent = `₹${totalExpenses}`;
    }

    if (reportBalance) {
        reportBalance.textContent = `₹${balance}`;
    }

    if (reportTransactions) {
        reportTransactions.textContent =
            totalTransactions;
    }


    // COLLECTOR REPORT

    const collectorTable =
        document.getElementById("reportCollectorTable");

    if (collectorTable) {

        const members = [
            "Harsh Gavhane",
            "Yash Devre",
            "Aryan Wagh"
        ];

        collectorTable.innerHTML = "";

        members.forEach(function(member) {

            const records = vargani.filter(
                record => record.collectedBy === member
            );

            const total = records.reduce(
                (sum, record) =>
                    sum + Number(record.amount),
                0
            );

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${member}</td>
                <td>₹${total}</td>
                <td>${records.length}</td>
            `;

            collectorTable.appendChild(row);
        });
    }


    // CATEGORY-WISE EXPENSES

    const expenseTable =
        document.getElementById("reportExpenseTable");

    if (expenseTable) {

        const categories = [
            "Decoration",
            "Prasad/Food",
            "Sound System",
            "Lighting",
            "Ganpati Murti",
            "Other"
        ];

        expenseTable.innerHTML = "";

        categories.forEach(function(category) {

            const records = expenses.filter(
                expense => expense.category === category
            );

            const total = records.reduce(
                (sum, expense) =>
                    sum + Number(expense.amount),
                0
            );

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${category}</td>
                <td>₹${total}</td>
                <td>${records.length}</td>
            `;

            expenseTable.appendChild(row);
        });
    }
}


updateReports();
// ================================
// ADMIN LOGIN
// ================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const username =
            document.getElementById("loginUsername").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const message =
            document.getElementById("loginMessage");


        // DEMO ADMIN CREDENTIALS

        if (username === "admin" && password === "ganpati123") {

            localStorage.setItem("adminLoggedIn", "true");

            message.textContent = "Login successful! 🙏";

            setTimeout(function() {
                window.location.href = "index.html";
            }, 700);

        } else {

            message.textContent =
                "❌ Incorrect username or password.";

        }

    });

}
// ================================
// LOGOUT
// ================================

function logout() {

    localStorage.removeItem("adminLoggedIn");

    window.location.href = "login.html";
}