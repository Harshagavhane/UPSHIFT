// ======================================================
// PAWAN GANESH MITRA MANDAL
// MAIN JAVASCRIPT
// ======================================================


// ======================================================
// PAGE / LOGIN PROTECTION
// ======================================================

const currentPage = window.location.pathname.split("/").pop();

const protectedPages = [
    "",
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


// ======================================================
// DATA
// ======================================================

let varganiRecords = JSON.parse(
    localStorage.getItem("varganiRecords") || "[]"
);

let expenseRecords = JSON.parse(
    localStorage.getItem("expenseRecords") || "[]"
);


// ======================================================
// SAVE DATA
// ======================================================

function saveVarganiRecords() {
    localStorage.setItem(
        "varganiRecords",
        JSON.stringify(varganiRecords)
    );
}

function saveExpenseRecords() {
    localStorage.setItem(
        "expenseRecords",
        JSON.stringify(expenseRecords)
    );
}


// ======================================================
// HELPER
// ======================================================

function formatMoney(amount) {
    return "₹" + Number(amount || 0).toFixed(2);
}


// ======================================================
// VARGANI RECEIPT NUMBER
// ======================================================

function generateReceiptNumber() {

    let highestNumber = 0;

    varganiRecords.forEach(function(record) {

        if (record.receiptNo) {

            const match = String(record.receiptNo).match(/(\d+)$/);

            if (match) {

                const number = parseInt(match[1]);

                if (number > highestNumber) {
                    highestNumber = number;
                }
            }
        }
    });

    return "PGMM-" +
        String(highestNumber + 1).padStart(3, "0");
}


// ======================================================
// VARGANI FORM
// ======================================================

const varganiForm = document.getElementById("varganiForm");

if (varganiForm) {

    const receiptInput =
        document.getElementById("receiptNo");

    if (receiptInput && !receiptInput.value) {
        receiptInput.value = generateReceiptNumber();
    }

    varganiForm.addEventListener("submit", function(event) {

        event.preventDefault();

        // Supports latest IDs
        const donorElement =
            document.getElementById("personName") ||
            document.getElementById("donorName");

        const dateElement =
            document.getElementById("varganiDate") ||
            document.getElementById("date");

        const donorName =
            donorElement ? donorElement.value.trim() : "";

        const amount =
            parseFloat(
                document.getElementById("amount")?.value
            );

        const date =
            dateElement ? dateElement.value : "";

        const collectedBy =
            document.getElementById("collectedBy")?.value || "";

        const paymentMethod =
            document.getElementById("paymentMethod")?.value || "";

        const receiptNo =
            receiptInput ? receiptInput.value.trim() : "";

        if (
            !donorName ||
            isNaN(amount) ||
            amount <= 0 ||
            !date ||
            !collectedBy
        ) {
            alert("Please fill all required fields correctly.");
            return;
        }

        const newRecord = {

            id: Date.now(),

            donorName: donorName,

            amount: amount,

            date: date,

            collectedBy: collectedBy,

            paymentMethod: paymentMethod,

            receiptNo:
                receiptNo || generateReceiptNumber()
        };

        varganiRecords.push(newRecord);

        saveVarganiRecords();

        alert("Vargani record added successfully! 🙏");

        varganiForm.reset();

        if (receiptInput) {
            receiptInput.value = generateReceiptNumber();
        }

        displayVarganiRecords();
        updateVarganiSummary();
        updateDashboard();
        updateReports();
    });

    displayVarganiRecords();
    updateVarganiSummary();
}


// ======================================================
// DISPLAY VARGANI RECORDS
// ======================================================

function displayVarganiRecords() {

    const table =
        document.getElementById("varganiTable");

    if (!table) {
        return;
    }

    table.innerHTML = "";

    if (varganiRecords.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    No vargani records found.
                </td>
            </tr>
        `;

        return;
    }

    varganiRecords
        .slice()
        .reverse()
        .forEach(function(record) {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>${record.receiptNo || "-"}</td>

                <td>${record.donorName || "-"}</td>

                <td>${formatMoney(record.amount)}</td>

                <td>${record.date || "-"}</td>

                <td>${record.collectedBy || "-"}</td>

                <td>${record.paymentMethod || "-"}</td>

                <td>
                    <button
                        class="action-btn"
                        onclick="editVargani(${record.id})">
                        ✏️
                    </button>

                    <button
                        class="action-btn"
                        onclick="deleteVargani(${record.id})">
                        🗑️
                    </button>

                    <button
                        class="action-btn"
                        onclick="printReceipt(${record.id})">
                        🧾
                    </button>
                </td>
            `;

            table.appendChild(row);
        });
}


// ======================================================
// VARGANI SUMMARY
// ======================================================

function updateVarganiSummary() {

    const totalVargani =
        varganiRecords.reduce(function(total, record) {

            return total +
                Number(record.amount || 0);

        }, 0);

    const entries =
        varganiRecords.length;

    const average =
        entries > 0
            ? totalVargani / entries
            : 0;


    const totalElement =
        document.getElementById("totalVargani");

    const entriesElement =
        document.getElementById("totalVarganiEntries") ||
        document.getElementById("varganiEntries");

    const averageElement =
        document.getElementById("averageVargani");


    if (totalElement) {
        totalElement.textContent =
            formatMoney(totalVargani);
    }

    if (entriesElement) {
        entriesElement.textContent =
            entries;
    }

    if (averageElement) {
        averageElement.textContent =
            formatMoney(average);
    }
}


// ======================================================
// DELETE VARGANI
// ======================================================

function deleteVargani(id) {

    if (!confirm(
        "Are you sure you want to delete this vargani record?"
    )) {
        return;
    }

    varganiRecords =
        varganiRecords.filter(function(record) {
            return record.id !== id;
        });

    saveVarganiRecords();

    displayVarganiRecords();
    updateVarganiSummary();
    updateDashboard();
    updateReports();

    alert("Vargani record deleted.");
}


// ======================================================
// EDIT VARGANI
// ======================================================

function editVargani(id) {

    const record =
        varganiRecords.find(function(item) {
            return item.id === id;
        });

    if (!record) {
        return;
    }


    const donorName =
        prompt(
            "Person / Shop Name:",
            record.donorName
        );

    if (donorName === null) {
        return;
    }


    const amount =
        prompt(
            "Amount:",
            record.amount
        );

    if (amount === null) {
        return;
    }


    const numericAmount =
        parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }


    const date =
        prompt(
            "Date:",
            record.date
        );

    if (date === null) {
        return;
    }


    record.donorName =
        donorName.trim();

    record.amount =
        numericAmount;

    record.date =
        date;


    saveVarganiRecords();

    displayVarganiRecords();
    updateVarganiSummary();
    updateDashboard();
    updateReports();

    alert("Vargani record updated successfully.");
}


// ======================================================
// PRINT RECEIPT
// ======================================================

function printReceipt(id) {

    const record =
        varganiRecords.find(function(item) {
            return item.id === id;
        });

    if (!record) {
        return;
    }


    const receiptWindow =
        window.open("", "_blank");

    if (!receiptWindow) {
        alert("Please allow pop-ups to print the receipt.");
        return;
    }


    receiptWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Vargani Receipt - ${record.receiptNo}
            </title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    text-align: center;
                }

                .receipt {
                    max-width: 600px;
                    margin: auto;
                    border: 2px solid #222;
                    padding: 30px;
                }

                h1 {
                    margin-bottom: 5px;
                }

                h2 {
                    margin-top: 5px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 25px;
                }

                td {
                    border: 1px solid #ccc;
                    padding: 12px;
                    text-align: left;
                }

                .amount {
                    font-size: 24px;
                    font-weight: bold;
                }

                .footer {
                    margin-top: 30px;
                }

            </style>

        </head>

        <body>

            <div class="receipt">

                <h1>
                    🙏 Pawan Ganesh Mitra Mandal
                </h1>

                <h2>
                    Vargani Receipt
                </h2>

                <p>
                    Receipt No:
                    <strong>${record.receiptNo}</strong>
                </p>

                <table>

                    <tr>
                        <td>Person / Shop Name</td>
                        <td>${record.donorName}</td>
                    </tr>

                    <tr>
                        <td>Date</td>
                        <td>${record.date}</td>
                    </tr>

                    <tr>
                        <td>Collected By</td>
                        <td>${record.collectedBy}</td>
                    </tr>

                    <tr>
                        <td>Payment Method</td>
                        <td>${record.paymentMethod || "-"}</td>
                    </tr>

                    <tr>
                        <td>Amount</td>

                        <td class="amount">
                            ${formatMoney(record.amount)}
                        </td>
                    </tr>

                </table>

                <div class="footer">
                    Thank you for your contribution! 🙏
                </div>

            </div>

            <script>

                window.onload = function() {
                    window.print();
                };

            <\/script>

        </body>

        </html>
    `);

    receiptWindow.document.close();
}


// ======================================================
// EXPENSE FORM
// ======================================================

const expenseForm =
    document.getElementById("expenseForm");

if (expenseForm) {

    expenseForm.addEventListener("submit", function(event) {

        event.preventDefault();


        const expenseNameElement =
            document.getElementById("expenseName");

        const expenseAmountElement =
            document.getElementById("expenseAmount");

        const expenseDateElement =
            document.getElementById("expenseDate");

        const paidByElement =
            document.getElementById("paidBy");

        const categoryElement =
            document.getElementById("expenseCategory") ||
            document.getElementById("category");

        const paymentElement =
            document.getElementById("expensePayment");


        const expenseName =
            expenseNameElement
                ? expenseNameElement.value.trim()
                : "";


        const expenseAmount =
            expenseAmountElement
                ? parseFloat(expenseAmountElement.value)
                : NaN;


        const expenseDate =
            expenseDateElement
                ? expenseDateElement.value
                : "";


        const paidBy =
            paidByElement
                ? paidByElement.value
                : "";


        const category =
            categoryElement
                ? categoryElement.value
                : "";


        const expensePayment =
            paymentElement
                ? paymentElement.value
                : "";


        if (
            !expenseName ||
            isNaN(expenseAmount) ||
            expenseAmount <= 0 ||
            !expenseDate ||
            !paidBy
        ) {

            alert(
                "Please fill all required fields correctly."
            );

            return;
        }


        const newExpense = {

            id: Date.now(),

            expenseName: expenseName,

            amount: expenseAmount,

            date: expenseDate,

            paidBy: paidBy,

            category: category,

            paymentMethod: expensePayment
        };


        expenseRecords.push(newExpense);

        saveExpenseRecords();


        alert("Expense added successfully! 💰");


        expenseForm.reset();


        displayExpenseRecords();
        updateExpenseSummary();
        updateDashboard();
        updateReports();
    });


    displayExpenseRecords();
    updateExpenseSummary();
}


// ======================================================
// DISPLAY EXPENSE RECORDS
// ======================================================

function displayExpenseRecords() {

    const table =
        document.getElementById("expenseTable");

    if (!table) {
        return;
    }


    table.innerHTML = "";


    if (expenseRecords.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    No expense records found.
                </td>
            </tr>
        `;

        return;
    }


    expenseRecords
        .slice()
        .reverse()
        .forEach(function(expense) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${expense.expenseName || "-"}
                </td>

                <td>
                    ${formatMoney(expense.amount)}
                </td>

                <td>
                    ${expense.date || "-"}
                </td>

                <td>
                    ${expense.paidBy || "-"}
                </td>

                <td>
                    ${expense.category || "-"}
                </td>

                <td>
                    ${expense.paymentMethod || "-"}
                </td>

                <td>

                    <button
                        class="action-btn"
                        onclick="editExpense(${expense.id})">
                        ✏️
                    </button>

                    <button
                        class="action-btn"
                        onclick="deleteExpense(${expense.id})">
                        🗑️
                    </button>

                </td>
            `;


            table.appendChild(row);
        });
}


// ======================================================
// EXPENSE SUMMARY
// ======================================================

function updateExpenseSummary() {

    const totalExpenses =
        expenseRecords.reduce(function(total, expense) {

            return total +
                Number(expense.amount || 0);

        }, 0);


    const entries =
        expenseRecords.length;


    const average =
        entries > 0
            ? totalExpenses / entries
            : 0;


    const totalElement =
        document.getElementById("totalExpenses");


    const entriesElement =
        document.getElementById("totalExpenseEntries") ||
        document.getElementById("expenseEntries");


    const averageElement =
        document.getElementById("averageExpense");


    if (totalElement) {

        totalElement.textContent =
            formatMoney(totalExpenses);
    }


    if (entriesElement) {

        entriesElement.textContent =
            entries;
    }


    if (averageElement) {

        averageElement.textContent =
            formatMoney(average);
    }
}


// ======================================================
// DELETE EXPENSE
// ======================================================

function deleteExpense(id) {

    if (!confirm(
        "Are you sure you want to delete this expense?"
    )) {
        return;
    }


    expenseRecords =
        expenseRecords.filter(function(expense) {

            return expense.id !== id;

        });


    saveExpenseRecords();


    displayExpenseRecords();
    updateExpenseSummary();
    updateDashboard();
    updateReports();


    alert("Expense deleted.");
}


// ======================================================
// EDIT EXPENSE
// ======================================================

function editExpense(id) {

    const expense =
        expenseRecords.find(function(item) {

            return item.id === id;

        });


    if (!expense) {
        return;
    }


    const name =
        prompt(
            "Expense Name:",
            expense.expenseName
        );


    if (name === null) {
        return;
    }


    const amount =
        prompt(
            "Amount:",
            expense.amount
        );


    if (amount === null) {
        return;
    }


    const numericAmount =
        parseFloat(amount);


    if (
        isNaN(numericAmount) ||
        numericAmount <= 0
    ) {

        alert("Please enter a valid amount.");

        return;
    }


    const date =
        prompt(
            "Date:",
            expense.date
        );


    if (date === null) {
        return;
    }


    expense.expenseName =
        name.trim();

    expense.amount =
        numericAmount;

    expense.date =
        date;


    saveExpenseRecords();


    displayExpenseRecords();
    updateExpenseSummary();
    updateDashboard();
    updateReports();


    alert("Expense updated successfully.");
}


// ======================================================
// DASHBOARD
// ======================================================

function updateDashboard() {

    const totalVargani =
        varganiRecords.reduce(function(total, record) {

            return total +
                Number(record.amount || 0);

        }, 0);


    const totalExpenses =
        expenseRecords.reduce(function(total, expense) {

            return total +
                Number(expense.amount || 0);

        }, 0);


    const balance =
        totalVargani - totalExpenses;


    const entries =
        varganiRecords.length +
        expenseRecords.length;


    // ------------------------------
    // DASHBOARD CARDS
    // ------------------------------

    const varganiElement =
        document.getElementById("dashboardVargani");

    const expenseElement =
        document.getElementById("dashboardExpenses");

    const balanceElement =
        document.getElementById("dashboardBalance");

    const entriesElement =
        document.getElementById("dashboardEntries");


    if (varganiElement) {

        varganiElement.textContent =
            formatMoney(totalVargani);
    }


    if (expenseElement) {

        expenseElement.textContent =
            formatMoney(totalExpenses);
    }


    if (balanceElement) {

        balanceElement.textContent =
            formatMoney(balance);
    }


    if (entriesElement) {

        entriesElement.textContent =
            entries;
    }


    // ------------------------------
    // TABLES
    // ------------------------------

    updateCollectorTable();

    updateRecentVargani();


    // ------------------------------
    // CHARTS
    // ------------------------------

    updateFinancialChart();

    updateCollectorChart(varganiRecords);
}


// ======================================================
// COLLECTOR TABLE
// ======================================================

function updateCollectorTable() {

    const table =
        document.getElementById("collectorTable");

    if (!table) {
        return;
    }


    table.innerHTML = "";


    const collectors = {};


    varganiRecords.forEach(function(record) {

        const collector =
            record.collectedBy || "Unknown";


        if (!collectors[collector]) {

            collectors[collector] = {
                amount: 0,
                entries: 0
            };
        }


        collectors[collector].amount +=
            Number(record.amount || 0);


        collectors[collector].entries++;
    });


    const names =
        Object.keys(collectors);


    if (names.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="3" style="text-align:center;">
                    No collector data available.
                </td>
            </tr>
        `;

        return;
    }


    names
        .sort(function(a, b) {

            return collectors[b].amount -
                collectors[a].amount;

        })
        .forEach(function(name) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${name}
                </td>

                <td>
                    ${collectors[name].entries}
                </td>

                <td>
                    ${formatMoney(
                        collectors[name].amount
                    )}
                </td>
            `;


            table.appendChild(row);
        });
}


// ======================================================
// RECENT VARGANI
// ======================================================

function updateRecentVargani() {

    const table =
        document.getElementById("recentVargani");

    if (!table) {
        return;
    }


    table.innerHTML = "";


    const recent =
        varganiRecords
            .slice()
            .sort(function(a, b) {
                return Number(b.id) - Number(a.id);
            })
            .slice(0, 5);


    if (recent.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No recent vargani records.
                </td>
            </tr>
        `;

        return;
    }


    recent.forEach(function(record) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${record.receiptNo || "-"}
            </td>

            <td>
                ${record.donorName || "-"}
            </td>

            <td>
                ${formatMoney(record.amount)}
            </td>

            <td>
                ${record.date || "-"}
            </td>

            <td>
                ${record.collectedBy || "-"}
            </td>
        `;


        table.appendChild(row);
    });
}


// ======================================================
// FINANCIAL CHART
// ======================================================

function updateFinancialChart() {

    const varganiBar =
        document.getElementById("varganiBar");

    const expenseBar =
        document.getElementById("expenseBar");

    const varganiValue =
        document.getElementById("varganiChartValue");

    const expenseValue =
        document.getElementById("expenseChartValue");


    const totalVargani =
        varganiRecords.reduce(function(total, record) {

            return total +
                Number(record.amount || 0);

        }, 0);


    const totalExpenses =
        expenseRecords.reduce(function(total, expense) {

            return total +
                Number(expense.amount || 0);

        }, 0);


    const maximum =
        Math.max(
            totalVargani,
            totalExpenses,
            1
        );


    const varganiHeight =
        (totalVargani / maximum) * 100;


    const expenseHeight =
        (totalExpenses / maximum) * 100;


    if (varganiBar) {

        varganiBar.style.height =
            varganiHeight + "%";
    }


    if (expenseBar) {

        expenseBar.style.height =
            expenseHeight + "%";
    }


    if (varganiValue) {

        varganiValue.textContent =
            formatMoney(totalVargani);
    }


    if (expenseValue) {

        expenseValue.textContent =
            formatMoney(totalExpenses);
    }
}


// ======================================================
// COLLECTOR PERFORMANCE CHART
// ======================================================

function updateCollectorChart(records) {

    const chart =
        document.getElementById("collectorChart");

    if (!chart) {
        return;
    }


    chart.innerHTML = "";


    const collectors = {};


    records.forEach(function(record) {

        const name =
            record.collectedBy || "Unknown";


        if (!collectors[name]) {
            collectors[name] = 0;
        }


        collectors[name] +=
            Number(record.amount || 0);
    });


    const names =
        Object.keys(collectors);


    if (names.length === 0) {

        chart.innerHTML = `
            <p style="text-align:center;">
                No collector data available.
            </p>
        `;

        return;
    }


    names.sort(function(a, b) {

        return collectors[b] -
            collectors[a];

    });


    const maxAmount =
        Math.max(
            ...names.map(function(name) {
                return collectors[name];
            }),
            1
        );


    names.forEach(function(name) {

        const percentage =
            (collectors[name] / maxAmount) * 100;


        const item =
            document.createElement("div");


        item.className =
            "collector-chart-item";


        item.innerHTML = `

            <div style="
                display:flex;
                justify-content:space-between;
                margin-bottom:6px;
            ">

                <strong>
                    ${name}
                </strong>

                <span>
                    ${formatMoney(collectors[name])}
                </span>

            </div>


            <div style="
                width:100%;
                height:12px;
                background:#eee;
                border-radius:10px;
                overflow:hidden;
                margin-bottom:15px;
            ">

                <div style="
                    width:${percentage}%;
                    height:100%;
                    background:linear-gradient(
                        90deg,
                        #ff7a00,
                        #ffb347
                    );
                    border-radius:10px;
                "></div>

            </div>
        `;


        chart.appendChild(item);
    });
}


// ======================================================
// REPORTS
// ======================================================

function updateReports() {

    const totalVargani =
        varganiRecords.reduce(function(total, record) {

            return total +
                Number(record.amount || 0);

        }, 0);


    const totalExpenses =
        expenseRecords.reduce(function(total, expense) {

            return total +
                Number(expense.amount || 0);

        }, 0);


    const balance =
        totalVargani - totalExpenses;


    const totalEntries =
        varganiRecords.length +
        expenseRecords.length;


    // ----------------------------------
    // REPORT SUMMARY CARDS
    // ----------------------------------

    const reportVargani =
        document.getElementById("reportVargani");

    const reportExpenses =
        document.getElementById("reportExpenses");

    const reportBalance =
        document.getElementById("reportBalance");

    const reportEntries =
        document.getElementById("reportEntries");


    if (reportVargani) {

        reportVargani.textContent =
            formatMoney(totalVargani);
    }


    if (reportExpenses) {

        reportExpenses.textContent =
            formatMoney(totalExpenses);
    }


    if (reportBalance) {

        reportBalance.textContent =
            formatMoney(balance);
    }


    if (reportEntries) {

        reportEntries.textContent =
            totalEntries;
    }


    // ----------------------------------
    // FINANCIAL SUMMARY
    // ----------------------------------

    const summaryVargani =
        document.getElementById("summaryVargani");

    const summaryExpenses =
        document.getElementById("summaryExpenses");

    const summaryBalance =
        document.getElementById("summaryBalance");


    if (summaryVargani) {

        summaryVargani.textContent =
            formatMoney(totalVargani);
    }


    if (summaryExpenses) {

        summaryExpenses.textContent =
            formatMoney(totalExpenses);
    }


    if (summaryBalance) {

        summaryBalance.textContent =
            formatMoney(balance);
    }


    // ----------------------------------
    // COLLECTOR REPORT
    // ----------------------------------

    const collectorTable =
        document.getElementById("reportCollectorTable");


    if (collectorTable) {

        collectorTable.innerHTML = "";


        const collectors = {};


        varganiRecords.forEach(function(record) {

            const name =
                record.collectedBy || "Unknown";


            if (!collectors[name]) {

                collectors[name] = {
                    entries: 0,
                    amount: 0
                };
            }


            collectors[name].entries++;

            collectors[name].amount +=
                Number(record.amount || 0);
        });


        const names =
            Object.keys(collectors);


        if (names.length === 0) {

            collectorTable.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align:center;">
                        No collector data available.
                    </td>
                </tr>
            `;

        } else {

            names
                .sort(function(a, b) {

                    return collectors[b].amount -
                        collectors[a].amount;

                })
                .forEach(function(name) {

                    const row =
                        document.createElement("tr");


                    row.innerHTML = `

                        <td>
                            ${name}
                        </td>

                        <td>
                            ${collectors[name].entries}
                        </td>

                        <td>
                            ${formatMoney(
                                collectors[name].amount
                            )}
                        </td>
                    `;


                    collectorTable.appendChild(row);
                });
        }
    }


    // ----------------------------------
    // EXPENSE REPORT
    // ----------------------------------

    const expenseTable =
        document.getElementById("reportExpenseTable");


    if (expenseTable) {

        expenseTable.innerHTML = "";


        if (expenseRecords.length === 0) {

            expenseTable.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        No expense data available.
                    </td>
                </tr>
            `;

        } else {

            expenseRecords
                .slice()
                .sort(function(a, b) {
                    return Number(b.id) - Number(a.id);
                })
                .forEach(function(expense) {

                    const row =
                        document.createElement("tr");


                    row.innerHTML = `

                        <td>
                            ${expense.expenseName || "-"}
                        </td>

                        <td>
                            ${formatMoney(expense.amount)}
                        </td>

                        <td>
                            ${expense.date || "-"}
                        </td>

                        <td>
                            ${expense.paidBy || "-"}
                        </td>

                        <td>
                            ${expense.category || "-"}
                        </td>

                        <td>
                            ${expense.paymentMethod || "-"}
                        </td>
                    `;


                    expenseTable.appendChild(row);
                });
        }
    }
}


// ======================================================
// ADMIN LOGIN
// ======================================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const username =
                document
                    .getElementById("loginUsername")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            const message =
                document.getElementById("loginMessage");


            if (
                username === "Pawan09" &&
                password === "Harsha02"
            ) {

                localStorage.setItem(
                    "adminLoggedIn",
                    "true"
                );


                if (message) {

                    message.textContent =
                        "Login successful! 🙏";

                    message.style.color =
                        "green";
                }


                setTimeout(function() {

                    window.location.href =
                        "index.html";

                }, 500);


            } else {

                if (message) {

                    message.textContent =
                        "❌ Incorrect username or password.";

                    message.style.color =
                        "red";
                }
            }
        }
    );
}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

    localStorage.removeItem(
        "adminLoggedIn"
    );

    window.location.href =
        "login.html";
}


// ======================================================
// INITIAL LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateDashboard();

        updateVarganiSummary();

        updateExpenseSummary();

        updateReports();

        displayVarganiRecords();

        displayExpenseRecords();
    }
);