// account-management.js
// Handles account editing, updating, and deletion functionality

console.log('Account Management script loaded');

document.addEventListener('DOMContentLoaded', function () {
    // Setup edit buttons for account details
    setupAccountEditButtons();

    // Setup delete account buttons
    setupDeleteAccountButtons();
});

function setupAccountEditButtons() {
    // Use event delegation since elements might be dynamically loaded
    document.addEventListener('click', function(e) {
        // Check if the clicked element or its parent has the edit-account-btn class
        const editButton = e.target.closest('.edit-account-btn');
        
        if (editButton) {
            const accountRow = editButton.closest('.account-row');
            const accountId = accountRow.getAttribute('data-id');
            const bankNameElement = accountRow.querySelector('.bank-name');
            const accountNameElement = accountRow.querySelector('.account-name');
            
            // Get the text content (trim to remove any extra whitespace)
            const bankName = bankNameElement.textContent.trim();
            const accountName = accountNameElement.textContent.trim();
            
            console.log('Editing account:', accountId, bankName, accountName);
            
            // Show the edit modal
            const modal = document.getElementById('editAccountModal');
            const bankNameInput = document.getElementById('editBankName');
            const accountNameInput = document.getElementById('editAccountName');
            const accountIdInput = document.getElementById('editAccountId');
            
            // Set current values
            bankNameInput.value = bankName;
            accountNameInput.value = accountName;
            accountIdInput.value = accountId;
            
            // Show modal
            modal.classList.remove('hidden');
        }
    });

    // Setup modal close button
    document.getElementById('closeEditModal').addEventListener('click', function () {
        document.getElementById('editAccountModal').classList.add('hidden');
    });

    // Setup form submission
    document.getElementById('editAccountForm').addEventListener('submit', function (e) {
        e.preventDefault();
        
        const accountId = document.getElementById('editAccountId').value;
        const bankName = document.getElementById('editBankName').value;
        const accountName = document.getElementById('editAccountName').value;
        
        console.log('Submitting account update:', accountId, bankName, accountName);
        
        // Send update request
        updateAccountDetails(accountId, bankName, accountName);
    });
}

function setupDeleteAccountButtons() {
    // Use event delegation for delete buttons as well
    document.addEventListener('click', function(e) {
        const deleteButton = e.target.closest('.delete-account-btn');
        
        if (deleteButton) {
            const accountRow = deleteButton.closest('.account-row');
            const accountId = accountRow.getAttribute('data-id');
            const bankName = accountRow.querySelector('.bank-name').textContent.trim();
            const accountName = accountRow.querySelector('.account-name').textContent.trim();
            const fullAccountName = bankName + ' - ' + accountName;
            
            console.log('Deleting account:', accountId, fullAccountName);
            
            // Show confirmation modal
            const modal = document.getElementById('deleteAccountModal');
            document.getElementById('accountToDelete').textContent = fullAccountName;
            document.getElementById('deleteAccountId').value = accountId;
            
            // Show modal
            modal.classList.remove('hidden');
        }
    });

    // Setup all close buttons (there might be multiple)
    document.querySelectorAll('#closeDeleteModal').forEach(function(button) {
        button.addEventListener('click', function () {
            document.getElementById('deleteAccountModal').classList.add('hidden');
        });
    });

    // Setup delete confirmation button
    document.getElementById('confirmDeleteAccount').addEventListener('click', function () {
        const accountId = document.getElementById('deleteAccountId').value;
        console.log('Confirming deletion of account:', accountId);
        deleteAccount(accountId);
    });
}

function updateAccountDetails(accountId, bankName, accountName) {
    console.log('Sending update request for account:', accountId);
    
    // Make AJAX request to update account details
    fetch(`/update-account/${accountId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({
            bank_name: bankName,
            account_name: accountName,
            update_all_months: true
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Update response:', data);
        
        if (data.success) {
            // Hide the modal
            document.getElementById('editAccountModal').classList.add('hidden');
            
            // Update all instances of this account in the DOM
            updateAccountInDOM(accountId, bankName, accountName);
            
            // Show success message
            showNotification('Account details updated successfully', 'success');
        } else {
            // Show error message
            showNotification(`Error: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while updating the account', 'error');
    });
}

function deleteAccount(accountId) {
    console.log('Sending delete request for account:', accountId);
    
    // Make AJAX request to delete account
    fetch(`/delete-account/${accountId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Delete response:', data);
        
        if (data.success) {
            // Hide the modal
            document.getElementById('deleteAccountModal').classList.add('hidden');
            
            // Remove all instances of this account from the DOM
            removeAccountFromDOM(accountId);
            
            // Reload the page after a short delay to refresh all data
            setTimeout(function() {
                location.reload();
            }, 1000);
            
            // Show success message
            showNotification('Account deleted successfully', 'success');
        } else {
            // Show error message
            showNotification(`Error: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while deleting the account', 'error');
    });
}

function updateAccountInDOM(accountId, bankName, accountName) {
    console.log('Updating DOM for account:', accountId, bankName, accountName);
    
    // Update all instances of this account in the DOM
    document.querySelectorAll(`.account-row[data-id="${accountId}"]`).forEach(row => {
        const bankNameElement = row.querySelector('.bank-name');
        const accountNameElement = row.querySelector('.account-name');
        
        if (bankNameElement) bankNameElement.textContent = bankName;
        if (accountNameElement) accountNameElement.textContent = accountName;
    });
}

function removeAccountFromDOM(accountId) {
    console.log('Removing account from DOM:', accountId);
    
    // Remove all instances of this account from the DOM
    document.querySelectorAll(`.account-row[data-id="${accountId}"]`).forEach(row => {
        row.remove();
    });
}

function showNotification(message, type) {
    console.log('Showing notification:', type, message);
    
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
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