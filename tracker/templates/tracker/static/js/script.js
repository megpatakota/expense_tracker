document.addEventListener('DOMContentLoaded', function () {
    // ----- Chart Data -----
    const chartData = {
        months: [],
        currentTotals: [],
        savingsTotals: [],
        lendingTotals: [],
        depositsTotals: [],
        pensionsTotals: [],
        creditCardTotals: [],
        grandTotals: []
    };

    // Collect data for chart
    document.querySelectorAll('.month-data-container').forEach(function (monthSection) {
        const monthName = monthSection.getAttribute('data-month');
        const currentTotal = parseFloat(monthSection.querySelector('.current-total')?.textContent.replace('£', '') || 0);
        const savingsTotal = parseFloat(monthSection.querySelector('.savings-total')?.textContent.replace('£', '') || 0);
        const lendingTotal = parseFloat(monthSection.querySelector('.lending-total')?.textContent.replace('£', '') || 0);
        const grandTotal = parseFloat(monthSection.querySelector('.grand-total')?.textContent.replace('£', '') || 0);

        chartData.months.unshift(monthName);
        chartData.currentTotals.unshift(currentTotal);
        chartData.savingsTotals.unshift(savingsTotal);
        chartData.lendingTotals.unshift(lendingTotal);
        chartData.grandTotals.unshift(grandTotal);
    });

    // Initialize Chart
    const ctx = document.getElementById('financialSummaryChart').getContext('2d');
    const financialChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.months,
            datasets: [
                {
                    label: 'Total Assets',
                    data: chartData.grandTotals,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Current Accounts',
                    data: chartData.currentTotals,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Savings Accounts',
                    data: chartData.savingsTotals,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Lending Accounts',
                    data: chartData.lendingTotals,
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Deposits',
                    data: chartData.depositsTotals,
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Pensions',
                    data: chartData.pensionsTotals,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Credit Cards',
                    data: chartData.creditCardTotals,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Amount (£)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': £' + context.raw.toFixed(2);
                        }
                    }
                }
            }
        }
    });

    // ----- Toggle Add Account form -----
    document.getElementById('toggleAddForm').addEventListener('click', function () {
        const form = document.getElementById('addAccountForm');
        const isHidden = form.classList.contains('hidden');
        form.classList.toggle('hidden');
        this.textContent = isHidden ? 'Hide Form' : 'Show Form';
    });


    // ----- Horizontal Scroll Buttons -----
    const scrollContainer = document.getElementById('monthScroller');
    const scrollLeftBtn = document.getElementById('scrollLeft');
    const scrollRightBtn = document.getElementById('scrollRight');

    // Add this new function to scroll to current month
    function scrollToCurrentMonth() {
        const currentMonthCard = document.querySelector('.month-card.current');
        if (currentMonthCard) {
            const containerWidth = scrollContainer.offsetWidth;
            const cardLeft = currentMonthCard.offsetLeft;
            const cardWidth = currentMonthCard.offsetWidth;
            
            // Calculate scroll position to center the current month
            const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
            scrollContainer.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        }
    }

    // Call the function when page loads
    scrollToCurrentMonth();

    scrollLeftBtn.addEventListener('click', function () {
        scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
    });

    scrollRightBtn.addEventListener('click', function () {
        scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
    });

    // ----- Month Detail View -----
    const monthDetailView = document.getElementById('monthDetailView');
    const monthDetailContent = document.getElementById('monthDetailContent');
    const detailViewTitle = document.getElementById('detailViewTitle');

    function setupTabs(monthData) {
        const tabButtons = document.querySelectorAll('.account-tab-btn');
        const monthDetailContent = document.getElementById('monthDetailContent');

        function switchTab(targetType) {
            // Update tab buttons
            tabButtons.forEach(btn => {
                if (btn.dataset.type === targetType) {
                    btn.classList.add('active', 'border-blue-500', 'text-blue-600');
                    btn.classList.remove('text-gray-500');
                } else {
                    btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
                    btn.classList.add('text-gray-500');
                }
            });

            // Show the content for the selected tab
            const allContents = monthDetailContent.querySelectorAll('.account-tab-content');
            allContents.forEach(content => {
                if (content.dataset.type === targetType) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });
        }

        // Add click handlers to tab buttons
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetType = button.dataset.type;
                switchTab(targetType);
            });
        });

        // Initialize with first tab active
        switchTab('current');
    }

    // Handle "Edit Accounts" button clicks
    document.querySelectorAll('.edit-month-btn').forEach(function(button) {
        button.addEventListener('click', function() {
            const monthName = this.getAttribute('data-month-full');
            const monthDetailView = document.getElementById('monthDetailView');
            const monthDetailContent = document.getElementById('monthDetailContent');
            const monthContainer = document.querySelector(`.month-data-container[data-month="${monthName}"]`);

            if (monthContainer) {
                // Update title
                document.getElementById('detailViewTitle').textContent = monthName + ' Details';

                // Get all tab contents from the source
                const tabContents = monthContainer.querySelectorAll('.account-tab-content');
                
                // Clear existing content
                monthDetailContent.innerHTML = '';
                
                // Clone each tab content
                tabContents.forEach(content => {
                    const clone = content.cloneNode(true);
                    monthDetailContent.appendChild(clone);
                });

                // Show the detail view
                monthDetailView.classList.remove('hidden');

                // Setup tabs
                setupTabs();

                // Setup editable amounts
                setupEditableAmounts();

                // Scroll to the detail view
                monthDetailView.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Close detail view button
    document.getElementById('closeDetailView').addEventListener('click', function () {
        monthDetailView.classList.add('hidden');
    });

    // ----- Handle editable amounts -----
    function setupEditableAmounts() {
        document.querySelectorAll('.editable-amount').forEach(function (element) {
            element.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const currentAmount = this.getAttribute('data-amount');
                const accountType = this.getAttribute('data-type');
                const monthName = this.getAttribute('data-month');

                // Create input field
                const input = document.createElement('input');
                input.type = 'number';
                input.step = '0.01';
                input.value = currentAmount;
                input.classList.add('border', 'p-1', 'rounded', 'amount-input');

                // Replace the span with input
                const originalContent = this.innerHTML;
                this.innerHTML = '';
                this.appendChild(input);
                input.focus();

                // Handle input blur (save)
                input.addEventListener('blur', function () {
                    saveAmount(id, this.value, originalContent, element, accountType, monthName);
                });

                // Handle Enter key
                input.addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') {
                        this.blur();
                    }
                });
            });
        });
    }

    // Initial setup of editable amounts
    setupEditableAmounts();

    function saveAmount(id, newAmount, originalContent, element, accountType, monthName) {
        // Make AJAX request to update amount
        fetch(`/update-amount/${id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: newAmount
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the element with new amount
                    const amount = parseFloat(data.amount);
                    element.innerHTML = '£' + amount.toFixed(2);
                    element.setAttribute('data-amount', amount);

                    // Set color based on amount
                    if (amount < 0) {
                        element.classList.remove('text-green-600');
                        element.classList.add('text-red-600');
                    } else {
                        element.classList.remove('text-red-600');
                        element.classList.add('text-green-600');
                    }

                    // Update totals
                    updateTotals(monthName, data.current_total, data.savings_total, data.lending_total, data.deposits_total, data.pensions_total, data.credit_cards_total, data.grand_total);

                    // Update the month cards in the scroller
                    updateMonthCard(monthName, data.current_total, data.savings_total, data.lending_total, data.deposits_total, data.pensions_total, data.credit_cards_total, data.grand_total);

                    // Update the chart
                    updateChart(monthName, data.current_total, data.savings_total, data.lending_total, data.deposits_total, data.pensions_total, data.credit_cards_total, data.grand_total);
                } else {
                    // Revert to original content on error
                    element.innerHTML = originalContent;
                    console.error('Error updating amount:', data.error);
                }
            })
            .catch(error => {
                element.innerHTML = originalContent;
                console.error('Error:', error);
            });
    }

    function updateTotals(monthName, currentTotal, savingsTotal, lendingTotal, depositsTotal, pensionsTotal, creditCardsTotal, grandTotal) {
        // Update all instances of the totals (both in detail view and hidden containers)
        document.querySelectorAll(`.current-total[data-month="${monthName}"]`).forEach(el => {
            el.textContent = '£' + currentTotal.toFixed(2);
        });

        document.querySelectorAll(`.savings-total[data-month="${monthName}"]`).forEach(el => {
            el.textContent = '£' + savingsTotal.toFixed(2);
        });

        document.querySelectorAll(`.lending-total[data-month="${monthName}"]`).forEach(el => {
            el.textContent = '£' + lendingTotal.toFixed(2);
        });

        document.querySelectorAll(`.deposits-total[data-month="${monthName}"]`).forEach(el => {
            el.textContent = '£' + depositsTotal.toFixed(2);
        });

        document.querySelectorAll(`.pensions-total[data-month="${monthName}"]`).forEach(el => {
            el.textContent = '£' + pensionsTotal.toFixed(2);
        });

        document.querySelectorAll(`.credit-cards-total[data-month="${monthName}"]`).forEach(el => {
            el.textContent = '£' + creditCardsTotal.toFixed(2);
        });

        document.querySelectorAll(`.grand-total[data-month="${monthName}"]`).forEach(el => {
            el.textContent = '£' + grandTotal.toFixed(2);
        });
    }

    function updateMonthCard(monthName, currentTotal, savingsTotal, lendingTotal, depositsTotal, pensionsTotal, creditCardsTotal, grandTotal) {
        const monthCard = document.querySelector(`.month-card[data-month="${monthName}"]`);
        if (monthCard) {
            const currentElement = monthCard.querySelector('div:nth-child(2) span:last-child');
            const savingsElement = monthCard.querySelector('div:nth-child(3) span:last-child');
            const lendingElement = monthCard.querySelector('div:nth-child(4) span:last-child');
            const depositsElement = monthCard.querySelector('div:nth-child(5) span:last-child');
            const pensionsElement = monthCard.querySelector('div:nth-child(6) span:last-child');
            const creditCardsElement = monthCard.querySelector('div:nth-child(7) span:last-child');
            const totalElement = monthCard.querySelector('div:nth-child(8) span:last-child');

            if (currentElement) currentElement.textContent = '£' + currentTotal.toFixed(2);
            if (savingsElement) savingsElement.textContent = '£' + savingsTotal.toFixed(2);
            if (lendingElement) lendingElement.textContent = '£' + lendingTotal.toFixed(2);
            if (depositsElement) depositsElement.textContent = '£' + depositsTotal.toFixed(2);
            if (pensionsElement) pensionsElement.textContent = '£' + pensionsTotal.toFixed(2);
            if (creditCardsElement) creditCardsElement.textContent = '£' + creditCardsTotal.toFixed(2);
            if (totalElement) totalElement.textContent = '£' + grandTotal.toFixed(2);
        }
    }

    function updateChart(monthName, currentTotal, savingsTotal, lendingTotal, depositsTotal, pensionsTotal, creditCardsTotal, grandTotal) {
        const monthIndex = chartData.months.indexOf(monthName);
        if (monthIndex !== -1) {
            financialChart.data.datasets[0].data[monthIndex] = grandTotal;
            financialChart.data.datasets[1].data[monthIndex] = currentTotal;
            financialChart.data.datasets[2].data[monthIndex] = savingsTotal;
            financialChart.data.datasets[3].data[monthIndex] = lendingTotal;
            financialChart.data.datasets[4].data[monthIndex] = depositsTotal;
            financialChart.data.datasets[5].data[monthIndex] = pensionsTotal;
            financialChart.data.datasets[6].data[monthIndex] = creditCardsTotal;
            financialChart.data.datasets[7].data[monthIndex] = currentTotal + savingsTotal + lendingTotal + depositsTotal + pensionsTotal - creditCardsTotal;
            financialChart.update();
        }
    }

    // Automatically open current month on page load
    const currentMonthBtn = document.querySelector('.month-card.current .edit-month-btn');
    if (currentMonthBtn) {
        currentMonthBtn.click();
    }
});