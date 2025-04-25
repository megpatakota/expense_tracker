document.addEventListener('DOMContentLoaded', function () {
    // Toggle Add Account form
    document.getElementById('toggleAddForm').addEventListener('click', function () {
        const form = document.getElementById('addAccountForm');
        const isHidden = form.classList.contains('hidden');
        form.classList.toggle('hidden');
        this.textContent = isHidden ? 'Hide Form' : 'Show Form';
    });

    // Setup editable amounts
    setupEditableAmounts();
});

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

function saveAmount(id, newAmount, originalContent, element, accountType, monthName) {
    fetch(`/update-amount/${id}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        },
        body: JSON.stringify({
            amount: newAmount
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            handleSuccessfulUpdate(data, element);
        } else {
            handleFailedUpdate(originalContent, element, data.error);
        }
    })
    .catch(error => {
        handleFailedUpdate(originalContent, element, error);
    });
}

function handleSuccessfulUpdate(data, element) {
    const amount = parseFloat(data.amount);
    element.innerHTML = '£' + amount.toFixed(2);
    element.setAttribute('data-amount', amount);

    if (amount < 0) {
        element.classList.remove('text-green-600');
        element.classList.add('text-red-600');
    } else {
        element.classList.remove('text-red-600');
        element.classList.add('text-green-600');
    }

    // Update totals
    updateTotals(monthName, data.current_total, data.savings_total, data.lending_total, data.deposits_total, data.pensions_total, data.credit_cards_total, data.grand_total);
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

    // Update the chart if it exists
    if (window.financialChart) {
        updateChart(monthName, currentTotal, savingsTotal, lendingTotal, depositsTotal, pensionsTotal, creditCardsTotal, grandTotal);
    }
}

function handleFailedUpdate(originalContent, element, error) {
    element.innerHTML = originalContent;
    console.error('Error:', error);
} 