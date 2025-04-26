// add-account.js - With live UI update after adding account

document.addEventListener('DOMContentLoaded', () => {
  console.log('Add Account script loaded');

  // Make setupTabs function available globally if it's not already
  if (typeof window.setupTabs !== 'function') {
    window.setupTabs = function() {
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
    };
  }
  
  // Make setupEditableAmounts available globally if it's not already
  if (typeof window.setupEditableAmounts !== 'function') {
    window.setupEditableAmounts = function() {
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
            if (typeof window.saveAmount === 'function') {
              window.saveAmount(id, this.value, originalContent, element, accountType, monthName);
            } else {
              // Fallback if saveAmount is not defined
              element.innerHTML = originalContent;
              console.error('saveAmount function not found');
            }
          });

          // Handle Enter key
          input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
              this.blur();
            }
          });
        });
      });
    };
  }
  
  // Set up button, modal and form-handling for adding accounts
  setupAddAccountButton();
  
  // Watch for the details-view opening and inject the "+" button
  setupDetailViewObserver();
  
  // Global click handler as backup
  document.body.addEventListener('click', function(e) {
    const addButton = e.target.closest('#addAccountButton');
    if (addButton) {
      e.preventDefault();
      showAddAccountModal();
    }
  });
});

function setupAddAccountButton() {
  // Create the modal if it doesn't exist
  if (!document.getElementById('addAccountModal')) {
    createAddAccountModal();
  }
  
  // Add direct click handler for any existing buttons
  const existingButton = document.getElementById('addAccountButton');
  if (existingButton) {
    existingButton.addEventListener('click', function(e) {
      e.preventDefault();
      showAddAccountModal();
    });
  }
}

function setupDetailViewObserver() {
  // Watch for the details-view opening and inject the "+" button
  const obs = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.target.id === 'monthDetailView' && !mutation.target.classList.contains('hidden')) {
        addPlusButtonToTabNav();
      }
    });
  });
  
  const detail = document.getElementById('monthDetailView');
  if (detail) {
    obs.observe(detail, { attributes: true, attributeFilter: ['class'] });
    if (!detail.classList.contains('hidden')) {
      addPlusButtonToTabNav();
    }
  }
}

function addPlusButtonToTabNav() {
  const nav = document.querySelector('nav[aria-label="Account Types"]');
  if (!nav) {
    // Try alternative selector if aria-label doesn't work
    const tabButtons = document.querySelectorAll('.account-tab-btn');
    if (tabButtons.length > 0) {
      nav = tabButtons[0].parentElement;
    }
  }
  
  if (!nav || document.getElementById('addAccountButton')) return;

  // Create "+" button for adding new accounts
  const btn = document.createElement('button');
  btn.id = 'addAccountButton';
  btn.className = 'px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent';
  btn.innerHTML = '<span class="text-xl font-bold">+</span>';
  btn.title = 'Add New Account';
  
  // Append to navigation
  nav.appendChild(btn);
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    showAddAccountModal();
  });
}

// Make showAddAccountModal globally available
window.showAddAccountModal = function() {
  // First check if modal exists, create if needed
  let modal = document.getElementById('addAccountModal');
  if (!modal) {
    createAddAccountModal();
    modal = document.getElementById('addAccountModal');
  }
  
  if (!modal) {
    alert('Could not open the Add Account form. Please try refreshing the page.');
    return;
  }
  
  // Get the active tab to pre-select the account type
  const activeTab = document.querySelector('.account-tab-btn.active');
  let accountType = 'Current';
  
  if (activeTab) {
    // Extract the account type from the active tab
    const tabType = activeTab.dataset.type;
    
    if (tabType) {
      // Convert tab type (e.g., "credit-cards") to proper format (e.g., "Credit Cards")
      if (tabType === 'credit-cards') {
        accountType = 'Credit Cards';
      } else {
        accountType = tabType.split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
  }
  
  // Pre-select the account type based on active tab
  const accountTypeSelect = document.getElementById('account_type');
  if (accountTypeSelect) {
    // Find and select the matching option
    for (let i = 0; i < accountTypeSelect.options.length; i++) {
      if (accountTypeSelect.options[i].value === accountType) {
        accountTypeSelect.selectedIndex = i;
        break;
      }
    }
  }
  
  // Show the modal
  modal.classList.remove('hidden');
  modal.style.display = 'block';
}

function createAddAccountModal() {
  // Remove any existing modal to avoid duplicates
  const existingModal = document.getElementById('addAccountModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'addAccountModal';
  modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50 account-modal';
  modal.innerHTML = `
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white modal-content">
      <div class="flex justify-between items-center pb-3 border-b">
        <h3 class="text-lg font-medium text-gray-900">Add New Account</h3>
        <button id="closeAddModal" class="text-gray-400 hover:text-gray-500">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <form id="addAccountForm" class="mt-4" method="post" action="/add-account/">
        <div class="mb-4">
          <label for="bank_name" class="block text-gray-700 text-sm font-bold mb-2">Bank Name</label>
          <input id="bank_name" name="bank_name" type="text"
            class="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
            required>
        </div>
        <div class="mb-4">
          <label for="account_name" class="block text-gray-700 text-sm font-bold mb-2">Account Name</label>
          <input id="account_name" name="account_name" type="text"
            class="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
            required>
        </div>
        <div class="mb-4">
          <label for="account_type" class="block text-gray-700 text-sm font-bold mb-2">Account Type</label>
          <select id="account_type" name="account_type"
            class="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline">
            <option>Current</option>
            <option>Savings</option>
            <option>Lending</option>
            <option>Deposits</option>
            <option>Pensions</option>
            <option>Credit Cards</option>
          </select>
        </div>
        <div class="flex justify-end space-x-3">
          <button type="button" id="cancelAddAccount"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Add Account
          </button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(modal);

  // Setup close button handlers
  const closeBtn = modal.querySelector('#closeAddModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    });
  }
  
  const cancelBtn = modal.querySelector('#cancelAddAccount');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    });
  }

  // Setup form submission
  const form = modal.querySelector('#addAccountForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <div class="loading-spinner inline-block mr-2"></div>
        Adding...
      `;
      
      const data = new FormData(this);
      const token = getCsrfToken();
      
      // Store form values for UI update
      const bankName = document.getElementById('bank_name').value;
      const accountName = document.getElementById('account_name').value;
      const accountType = document.getElementById('account_type').value;
      
      // Save the current month name from the detail view title
      const monthDetailTitle = document.getElementById('detailViewTitle');
      const monthName = monthDetailTitle ? monthDetailTitle.textContent.replace(' Details', '') : '';

      // Send the form data to the server
      fetch('/add-account/', {
        method: 'POST',
        headers: { 'X-CSRFToken': token },
        body: data
      })
      .then(response => {
        if (!response.ok) throw new Error('Add failed: ' + response.statusText);
        return response;
      })
      .then(() => {
        // Hide modal and reset form
        modal.classList.add('hidden');
        modal.style.display = 'none';
        form.reset();
        
        // Show success notification
        showNotification(`${accountType} account added successfully!`, 'success');
        
        // Refresh the detail view to show the new account
        refreshDetailView(monthName, accountType);
      })
      .catch(err => {
        console.error('Error adding account:', err);
        showNotification('Error adding account: ' + err.message, 'error');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      });
    });
  }
  
  return modal;
}

// Function to refresh the detail view and show the newly added account
function refreshDetailView(monthName, selectedAccountType) {
  const monthDetailView = document.getElementById('monthDetailView');
  const monthDetailContent = document.getElementById('monthDetailContent');
  
  if (!monthDetailView || !monthDetailContent) {
    console.error('Detail view elements not found');
    return;
  }
  
  // Show a loading indicator
  monthDetailContent.innerHTML = `
    <div class="flex items-center justify-center p-8">
      <div class="loading-spinner mr-3"></div>
      <span>Refreshing accounts...</span>
    </div>
  `;
  
  // Keep the details view open
  monthDetailView.classList.remove('hidden');
  
  // Find the month data container for this month
  const monthContainer = document.querySelector(`.month-data-container[data-month="${monthName}"]`);
  if (!monthContainer) {
    console.error('Month container not found for', monthName);
    // If we can't find the month container, just reload the page
    location.reload();
    return;
  }
  
  // Get all tab contents from the source (which has the freshly added account)
  const tabContents = monthContainer.querySelectorAll('.account-tab-content');
  
  // Clear existing content
  monthDetailContent.innerHTML = '';
  
  // Clone each tab content into the detail view
  tabContents.forEach(content => {
    const clone = content.cloneNode(true);
    monthDetailContent.appendChild(clone);
  });
  
  // Set up tabs again
  if (typeof window.setupTabs === 'function') {
    window.setupTabs();
  }
  
  // Set up editable amounts
  if (typeof window.setupEditableAmounts === 'function') {
    window.setupEditableAmounts();
  }
  
  // Re-attach account management handlers if they exist
  if (typeof window.setupAccountEditButtons === 'function') {
    window.setupAccountEditButtons();
  }
  
  if (typeof window.setupDeleteAccountButtons === 'function') {
    window.setupDeleteAccountButtons();
  }
  
  // Switch to the tab for the type of account that was just added
  const accountTypeKey = selectedAccountType.toLowerCase().replace(/\s+/g, '-');
  const tabBtn = document.querySelector(`.account-tab-btn[data-type="${accountTypeKey}"]`);
  if (tabBtn) {
    tabBtn.click();
  }
  
  // Ensure the detail view is visible
  monthDetailView.classList.remove('hidden');
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

function showNotification(message, type) {
  // Use the global function if it exists
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
    return;
  }
  
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