// Complete fixed script.js file
console.log('Script.js loaded');

// ----- load styles.css -----
const link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = '/static/css/styles.css';

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM Content Loaded');
    window.scrollTo(0, 0);

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

    // Close detail view button
    document.getElementById('closeDetailView').addEventListener('click', function () {
        monthDetailView.classList.add('hidden');
    });

    // Initial setup of editable amounts
    setupEditableAmounts();
    
    // Attach edit account button handlers
    attachEditAccountsButtonHandlers();
});

// Make sure important functions are available globally
window.setupTabs = setupTabs;
window.setupEditableAmounts = setupEditableAmounts;
window.attachEditAccountsButtonHandlers = attachEditAccountsButtonHandlers;

/**
 * Sets up tab functionality for the account detail view
 */
function setupTabs() {
    console.log('Setting up tabs');
    const tabButtons = document.querySelectorAll('.account-tab-btn');
    const monthDetailContent = document.getElementById('monthDetailContent');

    if (!tabButtons.length || !monthDetailContent) {
        console.error('Tab elements not found');
        return;
    }

    // Remove existing event listeners by cloning and replacing
    tabButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });

    // Get the refreshed list of buttons
    const newTabButtons = document.querySelectorAll('.account-tab-btn');

    function switchTab(targetType) {
        console.log('Switching to tab:', targetType);
        // Update tab buttons
        newTabButtons.forEach(btn => {
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
    newTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetType = button.dataset.type;
            switchTab(targetType);
        });
    });

    // Initialize with first tab active
    switchTab('current');
}

/**
 * Attaches event handlers to Edit Accounts buttons
 */
function attachEditAccountsButtonHandlers() {
    console.log('Attaching handlers to Edit Accounts buttons');
    document.querySelectorAll('.edit-month-btn').forEach(function(button) {
        // Remove existing event listeners by cloning
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add new event listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Edit Accounts button clicked for', this.getAttribute('data-month-full'));
            
            const monthName = this.getAttribute('data-month-full');
            const monthDetailView = document.getElementById('monthDetailView');
            const monthDetailContent = document.getElementById('monthDetailContent');
            const monthContainer = document.querySelector(`.month-data-container[data-month="${monthName}"]`);

            if (monthContainer) {
                console.log('Found month container for', monthName);
                
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
            } else {
                console.error('Month container not found for', monthName);
            }
        });
    });
    
    console.log('Edit Account button handlers attached');
}

/**
 * Sets up the editable amount functionality 
 */
function setupEditableAmounts() {
    console.log('Setting up editable amounts');
    
    // First, remove any existing click handlers by using event delegation
    document.removeEventListener('click', handleEditableAmountClick);
    
    // Add a single event listener using event delegation
    document.addEventListener('click', handleEditableAmountClick);
    
    console.log('Editable amount handlers attached');
}

// Separate handler function for editable amount clicks
function handleEditableAmountClick(e) {
    // Find if the clicked element or its parent is an editable amount
    const editableElement = e.target.closest('.editable-amount');
    
    // If not an editable amount, do nothing
    if (!editableElement) return;
    
    // If it's already being edited (contains an input), do nothing
    if (editableElement.querySelector('input')) return;
    
    const id = editableElement.getAttribute('data-id');
    const currentAmount = editableElement.getAttribute('data-amount');
    const accountType = editableElement.getAttribute('data-type');
    const monthName = editableElement.getAttribute('data-month');

    console.log('Clicked editable amount:', id, currentAmount, accountType, monthName);

    // Create input field
    const input = document.createElement('input');
    input.type = 'number';
    input.step = '0.01';
    input.value = currentAmount;
    input.classList.add('border', 'p-1', 'rounded', 'amount-input');

    // Replace the span with input
    const originalContent = editableElement.innerHTML;
    editableElement.innerHTML = '';
    editableElement.appendChild(input);
    input.focus();

    // Handle input blur (save)
    input.addEventListener('blur', function() {
        saveAmount(id, this.value, originalContent, editableElement, accountType, monthName);
    });

    // Handle Enter key
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            this.blur();
        }
    });
}

/**
 * Saves an updated account amount
 */
function saveAmount(id, newAmount, originalContent, element, accountType, monthName) {
    // Show saving indicator
    const originalElement = element.cloneNode(true);
    element.innerHTML = '<div class="loading-spinner inline-block mr-1" style="width: 12px; height: 12px;"></div> Saving...';
    
    console.log('Saving amount:', id, newAmount, accountType, monthName);
    
    // Make AJAX request to update amount
    fetch(`/update-amount/${id}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
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

            console.log('Successfully saved amount. Updating UI with new totals:', data);

            // Update totals
            updateTotals(monthName, data.current_total, data.savings_total, data.lending_total, data.deposits_total, data.pensions_total, data.credit_cards_total, data.grand_total);

            // Update the month cards in the scroller
            updateMonthCard(monthName, data.current_total, data.savings_total, data.lending_total, data.deposits_total, data.pensions_total, data.credit_cards_total, data.grand_total);

            // Update the chart
            updateChart(monthName, data.current_total, data.savings_total, data.lending_total, data.deposits_total, data.pensions_total, data.credit_cards_total, data.grand_total);
            
            // Show success notification
            showNotification(`Amount updated to £${amount.toFixed(2)}`, 'success');
        } else {
            // Revert to original content on error
            element.innerHTML = originalContent;
            console.error('Error updating amount:', data.error);
            showNotification('Error updating amount: ' + data.error, 'error');
        }
    })
    .catch(error => {
        element.innerHTML = originalContent;
        console.error('Error:', error);
        showNotification('Error updating amount. Please try again.', 'error');
    });
}

/**
 * Safely updates totals for a month
 * @param {string} monthName - Name of the month
 * @param {number} currentTotal - Total for current accounts
 * @param {number} savingsTotal - Total for savings accounts
 * @param {number} lendingTotal - Total for lending accounts
 * @param {number} depositsTotal - Total for deposits
 * @param {number} pensionsTotal - Total for pensions
 * @param {number} creditCardsTotal - Total for credit cards
 * @param {number} grandTotal - Grand total across all accounts
 */
function updateTotals(monthName, currentTotal, savingsTotal, lendingTotal, depositsTotal, pensionsTotal, creditCardsTotal, grandTotal) {
    try {
        console.log('Updating all totals for', monthName);
        
        // Update all instances of the totals (both in detail view and hidden containers)
        document.querySelectorAll(`.current-total[data-month="${monthName}"]`).forEach(el => {
            if (el) el.textContent = '£' + currentTotal.toFixed(2);
        });

        document.querySelectorAll(`.savings-total[data-month="${monthName}"]`).forEach(el => {
            if (el) el.textContent = '£' + savingsTotal.toFixed(2);
        });

        document.querySelectorAll(`.lending-total[data-month="${monthName}"]`).forEach(el => {
            if (el) el.textContent = '£' + lendingTotal.toFixed(2);
        });

        document.querySelectorAll(`.deposits-total[data-month="${monthName}"]`).forEach(el => {
            if (el) el.textContent = '£' + depositsTotal.toFixed(2);
        });

        document.querySelectorAll(`.pensions-total[data-month="${monthName}"]`).forEach(el => {
            if (el) el.textContent = '£' + pensionsTotal.toFixed(2);
        });

        document.querySelectorAll(`.credit-cards-total[data-month="${monthName}"]`).forEach(el => {
            if (el) el.textContent = '£' + creditCardsTotal.toFixed(2);
        });

        document.querySelectorAll(`.grand-total[data-month="${monthName}"]`).forEach(el => {
            if (el) el.textContent = '£' + grandTotal.toFixed(2);
        });

        console.log('Successfully updated totals for', monthName);
    } catch (error) {
        console.error('Error updating totals:', error);
    }
}

/**
 * Safely updates the month card with new totals
 * @param {string} monthName - Name of the month
 * @param {number} currentTotal - Total for current accounts
 * @param {number} savingsTotal - Total for savings accounts
 * @param {number} lendingTotal - Total for lending accounts
 * @param {number} depositsTotal - Total for deposits
 * @param {number} pensionsTotal - Total for pensions
 * @param {number} creditCardsTotal - Total for credit cards
 * @param {number} grandTotal - Grand total across all accounts
 */
function updateMonthCard(monthName, currentTotal, savingsTotal, lendingTotal, depositsTotal, pensionsTotal, creditCardsTotal, grandTotal) {
    try {
        console.log('Updating month card for', monthName);
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
            
            // Highlight the updated card
            highlightUpdatedCard(monthName);
            
            console.log('Successfully updated month card for', monthName);
        } else {
            console.log('Month card not found for', monthName);
        }
    } catch (error) {
        console.error('Error updating month card:', error);
    }
}

/**
 * Improved function to update the chart with new totals and refresh pie chart
 * @param {string} monthName - Name of the month
 * @param {number} currentTotal - Total for current accounts
 * @param {number} savingsTotal - Total for savings accounts
 * @param {number} lendingTotal - Total for lending accounts
 * @param {number} depositsTotal - Total for deposits
 * @param {number} pensionsTotal - Total for pensions
 * @param {number} creditCardsTotal - Total for credit cards
 * @param {number} grandTotal - Grand total across all accounts
 */
function updateChart(monthName, currentTotal, savingsTotal, lendingTotal, depositsTotal, pensionsTotal, creditCardsTotal, grandTotal) {
    try {
        console.log('Updating charts for', monthName);
        
        // Try to find the financial chart
        let chart;
        try {
            // First check if it's a global variable
            if (typeof window.financialChart !== 'undefined') {
                chart = window.financialChart;
            } else if (typeof financialChart !== 'undefined') {
                chart = financialChart;
                // Make it globally available for future use
                window.financialChart = chart;
            } else {
                // Try to get it via Chart.js
                chart = Chart.getChart('financialSummaryChart');
                // Make it globally available for future use
                if (chart) window.financialChart = chart;
            }
            
            if (chart) {
                // Update the chart data
                const monthIndex = chart.data.labels.indexOf(monthName);
                if (monthIndex !== -1) {
                    // Map datasets to their values
                    const datasets = chart.data.datasets;
                    
                    // Update each dataset - look for dataset by label or index
                    datasets.forEach(dataset => {
                        if (dataset.label === 'Current') dataset.data[monthIndex] = currentTotal;
                        else if (dataset.label === 'Savings') dataset.data[monthIndex] = savingsTotal;
                        else if (dataset.label === 'Lending') dataset.data[monthIndex] = lendingTotal;
                        else if (dataset.label === 'Deposits') dataset.data[monthIndex] = depositsTotal;
                        else if (dataset.label === 'Pensions') dataset.data[monthIndex] = pensionsTotal;
                        else if (dataset.label === 'Credit Cards') dataset.data[monthIndex] = creditCardsTotal;
                        else if (dataset.label === 'Total') dataset.data[monthIndex] = grandTotal;
                    });
                    
                    // Update chart
                    chart.update();
                    console.log('Successfully updated financial chart');
                } else {
                    console.warn('Month not found in chart labels:', monthName);
                }
            } else {
                console.warn('Financial chart not found');
            }
        } catch (e) {
            console.error('Failed to update financial chart:', e);
        }
        
        // Try to update the pie chart
        try {
            const pieChart = Chart.getChart('assetsLiabilitiesPieChart');
            if (pieChart) {
                // Calculate total assets
                const totalAssets = (
                    (currentTotal || 0) + 
                    (savingsTotal || 0) + 
                    (depositsTotal || 0) + 
                    (pensionsTotal || 0) +
                    (lendingTotal || 0)
                );
                
                // Calculate total liabilities (use absolute value)
                const totalLiabilities = Math.abs(creditCardsTotal || 0);
                
                // Ensure positive values for pie chart display
                const minAssets = totalAssets > 0 ? totalAssets : 1000;
                const minLiabilities = totalLiabilities > 0 ? totalLiabilities : 100;
                
                // Update pie chart data
                pieChart.data.datasets[0].data = [minAssets, minLiabilities];
                
                // Update the chart
                pieChart.update();
                console.log('Successfully updated pie chart');
            } else {
                console.warn('Pie chart not found');
            }
        } catch (e) {
            console.error('Failed to update pie chart:', e);
        }
        
        // Also update any internal chartData reference if it exists
        if (typeof window.chartData !== 'undefined') {
            const dataIndex = window.chartData.months.indexOf(monthName);
            if (dataIndex !== -1) {
                window.chartData.currentTotals[dataIndex] = currentTotal;
                window.chartData.savingsTotals[dataIndex] = savingsTotal;
                window.chartData.lendingTotals[dataIndex] = lendingTotal;
                window.chartData.depositsTotals[dataIndex] = depositsTotal;
                window.chartData.pensionsTotals[dataIndex] = pensionsTotal;
                window.chartData.creditCardTotals[dataIndex] = creditCardsTotal;
                window.chartData.grandTotals[dataIndex] = grandTotal;
            }
        } else if (typeof chartData !== 'undefined') {
            const dataIndex = chartData.months.indexOf(monthName);
            if (dataIndex !== -1) {
                chartData.currentTotals[dataIndex] = currentTotal;
                chartData.savingsTotals[dataIndex] = savingsTotal;
                chartData.lendingTotals[dataIndex] = lendingTotal;
                chartData.depositsTotals[dataIndex] = depositsTotal;
                chartData.pensionsTotals[dataIndex] = pensionsTotal;
                chartData.creditCardTotals[dataIndex] = creditCardsTotal;
                chartData.grandTotals[dataIndex] = grandTotal;
                // Make it globally available for future use
                window.chartData = chartData;
            }
        }
    } catch (error) {
        console.error('Error in updateChart:', error);
    }
}

/**
 * Helper function to highlight updated month card
 */
function highlightUpdatedCard(monthName) {
    const monthCards = document.querySelectorAll('.month-card');
    monthCards.forEach(card => {
        const cardMonth = card.getAttribute('data-month');
        if (cardMonth && cardMonth.includes(monthName)) {
            // Add a highlight effect
            card.style.transition = 'box-shadow 0.3s ease, transform 0.3s ease';
            card.style.boxShadow = '0 0 15px rgba(245, 198, 222, 0.8)';
            card.style.transform = 'translateY(-4px)';
            
            // Reset after animation
            setTimeout(() => {
                card.style.boxShadow = '';
                card.style.transform = '';
            }, 1500);
        }
    });
}

/**
 * Get CSRF token for form submissions
 */
function getCsrfToken() {
    // Try to get token from cookie
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    
    if (cookieValue) return cookieValue;
    
    // As a fallback, try to get from a meta tag
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) return metaTag.getAttribute('content');
    
    // If we can't find it, return an empty string
    console.warn('CSRF token not found. Form submissions may fail.');
    return '';
}

/**
 * Show notification message
 */
function showNotification(message, type) {
    console.log('Showing notification:', type, message);
    
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    if (!notification || !notificationMessage) {
        // Fallback to alert if notification elements don't exist
        alert(message);
        return;
    }
    
    // Set message and styling
    notificationMessage.textContent = message;
    
    if (type === 'success') {
        notification.classList.remove('bg-red-100', 'border-red-500', 'text-red-700');
        notification.classList.add('bg-green-100', 'border-green-500', 'text-green-700');
    } else {
        notification.classList.remove('bg-green-100', 'border-green-500', 'text-green-700');
        notification.classList.add('bg-red-100', 'border-red-500', 'text-red-700');
    }
    
    // Show notification
    notification.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Expose key functions to the global scope for cross-file access
window.updateTotals = updateTotals;
window.updateMonthCard = updateMonthCard;
window.updateChart = updateChart;
window.getCsrfToken = getCsrfToken;
window.showNotification = showNotification;

// Make sure charts are globally available
document.addEventListener('DOMContentLoaded', function() {
  // If financialChart is defined in chart.js but not globally accessible
  setTimeout(() => {
    if (typeof window.financialChart === 'undefined') {
      try {
        window.financialChart = Chart.getChart('financialSummaryChart');
        console.log('Made financial chart globally available');
      } catch (e) {
        console.warn('Could not make financial chart globally available:', e);
      }
    }
    
    if (typeof window.chartData === 'undefined' && window.financialChart) {
      try {
        // Create chartData from the chart
        window.chartData = {
          months: window.financialChart.data.labels,
          currentTotals: window.financialChart.data.datasets.find(d => d.label === 'Current')?.data || [],
          savingsTotals: window.financialChart.data.datasets.find(d => d.label === 'Savings')?.data || [],
          lendingTotals: window.financialChart.data.datasets.find(d => d.label === 'Lending')?.data || [],
          depositsTotals: window.financialChart.data.datasets.find(d => d.label === 'Deposits')?.data || [],
          pensionsTotals: window.financialChart.data.datasets.find(d => d.label === 'Pensions')?.data || [],
          creditCardTotals: window.financialChart.data.datasets.find(d => d.label === 'Credit Cards')?.data || [],
          grandTotals: []
        };
        console.log('Created chartData from financial chart');
      } catch (e) {
        console.warn('Could not create chartData from financial chart:', e);
      }
    }
  }, 1000);
});