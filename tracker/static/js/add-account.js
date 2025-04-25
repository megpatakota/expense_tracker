// add-account.js

// 1) Fetch and inject the month-detail HTML in-place
function fetchUpdatedAccountData() {
    const title = document.getElementById('detailViewTitle');
    if (!title) return;
  
    const [month, year] = title.textContent.replace(' Details', '').split(' ');
    if (!month || !year) return;
  
    fetch(`/get-month-data/?month=${month}&year=${year}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'X-Requested-With': 'XMLHttpRequest'
      },
    })
    .then(r => {
      if (!r.ok) throw new Error('Bad response');
      return r.text();
    })
    .then(html => {
      const detail = document.getElementById('monthDetailView');
      if (detail) {
        detail.innerHTML = html;
        addPlusButtonToTabNav();
      }
    })
    .catch(err => {
      console.error('auto-refresh failed', err);
      showNotification('Could not refresh accounts. Please refresh manually.', 'error');
    });
  }
  
  
  // 2) Set up your “+” button, modal and form-handling
  document.addEventListener('DOMContentLoaded', () => {
  
    function addPlusButtonToTabNav() {
      const nav = document.querySelector('nav[aria-label="Account Types"]');
      if (!nav || document.getElementById('addAccountButton')) return;
  
      const btn = document.createElement('button');
      btn.id = 'addAccountButton';
      btn.className = 'px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent';
      btn.innerHTML = '<span class="text-xl font-bold">+</span>';
      btn.title = 'Add New Account';
      btn.onclick = showAddAccountModal;
      nav.appendChild(btn);
    }
  
    function showAddAccountModal() {
      if (!document.getElementById('addAccountModal')) createAddAccountModal();
      document.getElementById('addAccountModal').classList.remove('hidden');
    }
  
    function createAddAccountModal() {
      const modal = document.createElement('div');
      modal.id = 'addAccountModal';
      modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50';
      modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
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
  
      modal.querySelector('#closeAddModal')
           .addEventListener('click', () => modal.classList.add('hidden'));
      modal.querySelector('#cancelAddAccount')
           .addEventListener('click', () => modal.classList.add('hidden'));
  
      modal.querySelector('#addAccountForm')
           .addEventListener('submit', function(e) {
        e.preventDefault();
        const data = new FormData(this);
        const token = getCsrfToken();
  
        fetch(this.action, {
          method: 'POST',
          headers: { 'X-CSRFToken': token },
          body: data
        })
        .then(r => {
          if (!r.ok) throw new Error('Add failed');
          modal.classList.add('hidden');
          this.reset();
          fetchUpdatedAccountData();                // ← instant update!
          showNotification('Account added successfully!', 'success');
        })
        .catch(err => {
          console.error(err);
          showNotification('Error adding account', 'error');
        });
      });
    }
  
    function getCsrfToken() {
      const c = document.cookie.split('; ').find(r => r.startsWith('csrftoken='));
      if (c) return c.split('=')[1];
      const m = document.querySelector('meta[name="csrf-token"]');
      return m ? m.content : '';
    }
  
    function showNotification(msg, type) {
      const n = document.getElementById('notification');
      const m = document.getElementById('notificationMessage');
      if (!n||!m) return;
      m.textContent = msg;
      n.className = type==='success'
        ? 'bg-green-100 border-green-500 text-green-700'
        : 'bg-red-100 border-red-500 text-red-700';
      n.classList.remove('hidden');
      setTimeout(() => n.classList.add('hidden'), 3000);
    }
  
    // Watch for the details-view opening and inject the "+" button
    const obs = new MutationObserver(ms => {
      ms.forEach(m => {
        if (m.target.id==='monthDetailView' && !m.target.classList.contains('hidden')) {
          addPlusButtonToTabNav();
        }
      });
    });
    const detail = document.getElementById('monthDetailView');
    if (detail) {
      obs.observe(detail, { attributes: true, attributeFilter: ['class'] });
      if (!detail.classList.contains('hidden')) addPlusButtonToTabNav();
    }
  });
  