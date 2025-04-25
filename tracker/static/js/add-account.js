console.log('Add Account script loaded');

document.addEventListener('DOMContentLoaded', function() {
    // The main function to add the + button to the tab navigation bar
    function addPlusButtonToTabNav() {
        // Find the tab navigation container
        const tabNav = document.querySelector('nav[aria-label="Account Types"]');
        
        if (!tabNav) return; // If tab nav doesn't exist, exit
        
        // Check if the button already exists to prevent duplicates
        if (document.getElementById('addAccountButton')) return;
        
        // Create the + button with the same styling as the other tab buttons
        const addButton = document.createElement('button');
        addButton.id = 'addAccountButton';
        addButton.classList.add('px-4', 'py-2', 'text-sm', 'font-medium', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300', 'border-b-2', 'border-transparent');
        addButton.innerHTML = '<span class="text-xl font-bold">+</span>';
        addButton.title = 'Add New Account';
        
        // Add the button to the tab navigation
        tabNav.appendChild(addButton);
        
        // Add click event listener
        addButton.addEventListener('click', showAddAccountModal);
    }
    
    // The function to show the add account modal
    function showAddAccountModal() {
        // Get the current month name from the detail view title
        const monthTitle = document.getElementById('detailViewTitle');
        const monthName = monthTitle ? monthTitle.textContent.replace(' Details', '') : '';
        
        // Create the modal if it doesn't exist yet
        if (!document.getElementById('addAccountModal')) {
            createAddAccountModal();
        }
        
        // Show the modal
        document.getElementById('addAccountModal').classList.remove('hidden');
    }
    
    // Create the add account modal
    function createAddAccountModal() {
        const modal = document.createElement('div');
        modal.id = 'addAccountModal';
        modal.classList.add('fixed', 'inset-0', 'bg-gray-600', 'bg-opacity-50', 'overflow-y-auto', 'h-full', 'w-full', 'hidden', 'z-50');
        
        // Build the modal content
        modal.innerHTML = `
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex justify-between items-center pb-3 border-b">
                        <h3 class="text-lg font-medium text-gray-900">Add New Account</h3>
                        <button id="closeAddModal" class="text-gray-400 hover:text-gray-500">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <form id="addAccountForm" class="mt-4" method="post" action="/add-account/">
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="bank_name">
                                Bank Name
                            </label>
                            <input id="bank_name" name="bank_name" type="text" 
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required>
                        </div>

                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="account_name">
                                Account Name
                            </label>
                            <input id="account_name" name="account_name" type="text"
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required>
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="account_type">
                                Account Type
                            </label>
                            <select id="account_type" name="account_type"
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required>
                                <option value="Current">Current</option>
                                <option value="Savings">Savings</option>
                                <option value="Lending">Lending</option>
                                <option value="Deposits">Deposits</option>
                                <option value="Pensions">Pensions</option>
                                <option value="Credit Cards">Credit Cards</option>
                            </select>
                        </div>

                        <div class="flex items-center justify-end mt-4 space-x-3">
                            <button type="button" id="cancelAddAccount"
                                class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                Cancel
                            </button>
                            <button type="submit"
                                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                Add Account
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Add the modal to the document body
        document.body.appendChild(modal);
        
        // Set up event listeners for the modal
        document.getElementById('closeAddModal').addEventListener('click', function() {
            document.getElementById('addAccountModal').classList.add('hidden');
        });
        
        document.getElementById('cancelAddAccount').addEventListener('click', function() {
            document.getElementById('addAccountModal').classList.add('hidden');
        });
        
        // Set up form submission
        document.getElementById('addAccountForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const bankName = document.getElementById('bank_name').value;
            const accountName = document.getElementById('account_name').value;
            const accountType = document.getElementById('account_type').value;
            
            // Create the form data
            const formData = new FormData();
            formData.append('bank_name', bankName);
            formData.append('account_name', accountName);
            formData.append('account_type', accountType);
            
            // Get the CSRF token
            const csrfToken = getCsrfToken();
            
            // Send the AJAX request
            fetch('/add-account/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken
                },
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    // Hide the modal
                    document.getElementById('addAccountModal').classList.add('hidden');
                    
                    // Show success notification
                    showNotification('Account added successfully', 'success');
                    
                    // Reload the page after a short delay to show the new account
                    setTimeout(function() {
                        location.reload();
                    }, 1000);
                } else {
                    throw new Error('Failed to add account');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('An error occurred while adding the account', 'error');
            });
        });
    }
    
    // Helper function to get CSRF token
    function getCsrfToken() {
        // Try to get the token from a cookie
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
    
    // Helper function to show notifications
    function showNotification(message, type) {
        console.log('Showing notification:', type, message);
        
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notificationMessage');
        
        if (!notification || !notificationMessage) {
            console.error('Notification elements not found');
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

    // Monitor for changes in the DOM to detect when the month detail view appears
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id === 'monthDetailView' && 
                !mutation.target.classList.contains('hidden')) {
                // Month detail view is now visible, add the + button
                addPlusButtonToTabNav();
            }
        });
    });

    // Start observing the month detail view for visibility changes
    const monthDetailView = document.getElementById('monthDetailView');
    if (monthDetailView) {
        observer.observe(monthDetailView, { 
            attributes: true, 
            attributeFilter: ['class'] 
        });
    }

    // Check if the month detail view is already open when the page loads
    if (monthDetailView && !monthDetailView.classList.contains('hidden')) {
        addPlusButtonToTabNav();
    }
});