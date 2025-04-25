document.addEventListener('DOMContentLoaded', function () {
    // Month scroller functionality
    const scrollContainer = document.getElementById('monthScroller');
    const scrollLeftBtn = document.getElementById('scrollLeft');
    const scrollRightBtn = document.getElementById('scrollRight');
    const monthDetailView = document.getElementById('monthDetailView');
    const closeDetailView = document.getElementById('closeDetailView');

    function scrollToCurrentMonth() {
        const currentMonthCard = document.querySelector('.month-card.current');
        if (currentMonthCard) {
            const containerWidth = scrollContainer.offsetWidth;
            const cardLeft = currentMonthCard.offsetLeft;
            const cardWidth = currentMonthCard.offsetWidth;
            
            const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
            scrollContainer.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        }
    }

    // Initialize scroll buttons
    scrollLeftBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
    });

    scrollRightBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
    });

    // Handle "Edit Accounts" button clicks
    document.querySelectorAll('.edit-month-btn').forEach(function(button) {
        button.addEventListener('click', function() {
            const monthName = this.getAttribute('data-month-full');
            const monthContainer = document.querySelector(`.month-data-container[data-month="${monthName}"]`);

            if (monthContainer) {
                // Update title
                document.getElementById('detailViewTitle').textContent = monthName + ' Details';
                
                // Show the detail view
                monthDetailView.classList.remove('hidden');
                
                // Setup tabs
                setupTabs();
                
                // Scroll to the detail view
                monthDetailView.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Close detail view button
    closeDetailView.addEventListener('click', function () {
        monthDetailView.classList.add('hidden');
    });

    // Call scrollToCurrentMonth when page loads
    scrollToCurrentMonth();

    // Setup tabs functionality
    setupTabs();
});

function setupTabs() {
    const tabButtons = document.querySelectorAll('.account-tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetType = button.dataset.type;
            switchTab(targetType);
        });
    });

    // Initialize with first tab active
    switchTab('current');
}

function switchTab(targetType) {
    const tabButtons = document.querySelectorAll('.account-tab-btn');
    const contents = document.querySelectorAll('.account-tab-content');

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
    contents.forEach(content => {
        if (content.dataset.type === targetType) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });
} 