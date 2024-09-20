document.addEventListener("DOMContentLoaded", () => {
    const taxForm = document.getElementById("tax-form");
    const totalIncomeDisplay = document.getElementById("total-income");
    const taxRateDisplay = document.getElementById("tax-rate");
    const taxToPayDisplay = document.getElementById("tax-to-pay");
    const amountLeftDisplay = document.getElementById("amount-left");
    const expenseForm = document.getElementById("expense-form");
    const expenseList = document.getElementById("expense-list");
    const expenseChartCtx = document.getElementById("expense-chart").getContext("2d");
    const deleteAllButton = document.getElementById("delete-all");
    const modeToggleButton = document.getElementById("mode-toggle");
    const advisorForm = document.getElementById('advisor-form');
    const advisorRecommendationsDiv = document.getElementById('advisor-recommendations');

    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let expenseChart;

    // Function to calculate taxes
    function calculateTaxes(income) {
        let taxRate = 0;
        if (income > 1000000) {
            taxRate = 20;
        } else if (income > 700000) {
            taxRate = 15;
        } else if (income > 500000) {
            taxRate = 10;
        } else if (income > 300000) {
            taxRate = 5;
        }
        const taxToPay = (income * taxRate) / 100;
        return { taxRate, taxToPay };
    }

    // Function to update tax information
    function updateTaxInfo() {
        const incomeInput = document.getElementById("tax-income");
        const income = parseFloat(incomeInput.value) || 0;
        const taxDetails = calculateTaxes(income);
        totalIncomeDisplay.textContent = income.toFixed(2);
        taxRateDisplay.textContent = `${taxDetails.taxRate}%`;
        taxToPayDisplay.textContent = taxDetails.taxToPay.toFixed(2);
        amountLeftDisplay.textContent = (income - taxDetails.taxToPay).toFixed(2);
    }

    // Handle tax calculation form submission
    taxForm.addEventListener("submit", (event) => {
        event.preventDefault();
        updateTaxInfo();
    });

    // Handle expense form submission
    expenseForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const description = document.getElementById("description").value.trim();
        const amount = parseFloat(document.getElementById("amount").value);
        if (!description || isNaN(amount) || amount <= 0) {
            alert("Please enter valid expense details.");
            return;
        }
        const category = document.getElementById("category").value;
        const expense = { id: Date.now(), description, amount, category };
        expenses.push(expense);
        localStorage.setItem("expenses", JSON.stringify(expenses));
        updateExpenseList();
        updateExpenseChart();
        expenseForm.reset();
        updateTaxInfo(); // Update tax information whenever a new expense is added
    });

    // Handle expense list clicks
    expenseList.addEventListener("click", (event) => {
        const id = event.target.parentElement.dataset.id;
        if (event.target.classList.contains("delete-btn")) {
            expenses = expenses.filter(exp => exp.id !== parseInt(id));
            localStorage.setItem("expenses", JSON.stringify(expenses));
            updateExpenseList();
            updateExpenseChart();
            updateTaxInfo(); // Update tax information after deleting an expense
        } else if (event.target.classList.contains("edit-btn")) {
            const expense = expenses.find(exp => exp.id === parseInt(id));
            document.getElementById("description").value = expense.description;
            document.getElementById("amount").value = expense.amount;
            document.getElementById("category").value = expense.category;
            expenses = expenses.filter(exp => exp.id !== parseInt(id));
            localStorage.setItem("expenses", JSON.stringify(expenses));
            updateExpenseList();
            updateExpenseChart();
            updateTaxInfo(); // Update tax information after editing an expense
        }
    });

    // Handle delete all button click
    deleteAllButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all expenses?")) {
            expenses = [];
            localStorage.removeItem("expenses");
            updateExpenseList();
            updateExpenseChart();
            document.getElementById("tax-income").value = ''; // Clear income field
            updateTaxInfo(); // Reset tax info after deleting all expenses
            advisorRecommendationsDiv.innerHTML = ''; // Clear advisor recommendations
        }
    });

    // Handle mode toggle
    modeToggleButton.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    // Mock function for AI Financial Advisor
    function getFinancialAdvice(expenses) {
        if (expenses.length === 0) return "Your spending looks balanced. 😊";
        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const averageSpent = (totalSpent / expenses.length).toFixed(2);
        return averageSpent > 100 ? "Consider reducing your average spending. ☹️" : "Your spending looks balanced. 😊";
    }

    setInterval(() => {
        const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
        const advice = getFinancialAdvice(expenses);
        advisorRecommendationsDiv.textContent = advice;
    }, 5000);  // Update advice every 5 seconds

    // Update expense list and chart
    function updateExpenseList() {
        expenseList.innerHTML = "";
        expenses.forEach(expense => {
            const li = document.createElement("li");
            li.dataset.id = expense.id;
            li.innerHTML = `
                <span>${expense.description}: ₹${expense.amount} [${expense.category}]</span>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            `;
            expenseList.appendChild(li);
        });
    }

    function updateExpenseChart() {
        const categories = [...new Set(expenses.map(exp => exp.category))];
        const data = categories.map(category => {
            return expenses
                .filter(exp => exp.category === category)
                .reduce((total, exp) => total + exp.amount, 0);
        });

        if (expenseChart) {
            expenseChart.destroy();
        }

        expenseChart = new Chart(expenseChartCtx, {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    data: data,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    // Initialize updates
    updateExpenseList();
    updateExpenseChart();
    updateTaxInfo(); // Initialize tax info display

    // New AI Financial Advisor logic
    advisorForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get user input
        const income = parseFloat(document.getElementById('advisor-income').value);
        const expensesInput = document.getElementById('advisor-expenses').value;
        
        // Process expenses
        const expenses = expensesInput.split(',').map(expense => parseFloat(expense.trim()));
        
        if (isNaN(income) || expenses.some(isNaN)) {
            alert('Please enter valid numbers.');
            return;
        }
        
        // Calculate total expenses
        const totalExpenses = expenses.reduce((acc, curr) => acc + curr, 0);
        
        // Calculate savings
        const savings = income - totalExpenses;
        
        // Generate recommendations
        let recommendations = '';
        
        if (savings > 0) {
            recommendations = `<p>Your savings this month: ₹${savings.toFixed(2)}</p>`;
            recommendations += '<p>Consider investing or saving this amount for future goals.</p>';
        } else if (savings === 0) {
            recommendations = '<p>You are breaking even this month. Try to reduce some expenses to save more.</p>';
        } else {
            recommendations = `<p>You are overspending by ₹${Math.abs(savings).toFixed(2)}. Review your expenses and try to cut back.</p>`;
        }
        
        advisorRecommendationsDiv.innerHTML = recommendations;
    });
});




function logout() {
    sessionStorage.removeItem('loggedIn');
    window.location.href = '../index.html';
}

function checkLogin() {
    const loggedIn = sessionStorage.getItem('loggedIn');
    if (!loggedIn) {
        window.location.href = '../index.html';
    }
}
