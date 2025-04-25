// document.addEventListener('DOMContentLoaded', function () {
//     // Chart Data structure
//     const chartData = {
//         months: [],
//         currentTotals: [],
//         savingsTotals: [],
//         lendingTotals: [],
//         depositsTotals: [],
//         pensionsTotals: [],
//         creditCardTotals: [],
//         grandTotals: []
//     };

//     // Collect data for chart
//     document.querySelectorAll('.month-data-container').forEach(function (monthSection) {
//         const monthName = monthSection.getAttribute('data-month');
//         const currentTotal = parseFloat(monthSection.querySelector('.current-total')?.textContent.replace('£', '') || 0);
//         const savingsTotal = parseFloat(monthSection.querySelector('.savings-total')?.textContent.replace('£', '') || 0);
//         const lendingTotal = parseFloat(monthSection.querySelector('.lending-total')?.textContent.replace('£', '') || 0);
//         const grandTotal = parseFloat(monthSection.querySelector('.grand-total')?.textContent.replace('£', '') || 0);

//         chartData.months.unshift(monthName);
//         chartData.currentTotals.unshift(currentTotal);
//         chartData.savingsTotals.unshift(savingsTotal);
//         chartData.lendingTotals.unshift(lendingTotal);
//         chartData.grandTotals.unshift(grandTotal);
//     });

//     // Initialize Chart
//     const ctx = document.getElementById('financialSummaryChart').getContext('2d');
//     window.financialChart = new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: chartData.months,
//             datasets: [
//                 {
//                     label: 'Total Assets',
//                     data: chartData.grandTotals,
//                     backgroundColor: 'rgba(75, 192, 192, 0.2)',
//                     borderColor: 'rgba(75, 192, 192, 1)',
//                     borderWidth: 2,
//                     fill: false,
//                     tension: 0.1
//                 },
//                 {
//                     label: 'Current Accounts',
//                     data: chartData.currentTotals,
//                     backgroundColor: 'rgba(54, 162, 235, 0.2)',
//                     borderColor: 'rgba(54, 162, 235, 1)',
//                     borderWidth: 1,
//                     fill: false,
//                     tension: 0.1
//                 },
//                 {
//                     label: 'Savings',
//                     data: chartData.savingsTotals,
//                     backgroundColor: 'rgba(153, 102, 255, 0.2)',
//                     borderColor: 'rgba(153, 102, 255, 1)',
//                     borderWidth: 1,
//                     fill: false,
//                     tension: 0.1
//                 },
//                 {
//                     label: 'Lending',
//                     data: chartData.lendingTotals,
//                     backgroundColor: 'rgba(255, 159, 64, 0.2)',
//                     borderColor: 'rgba(255, 159, 64, 1)',
//                     borderWidth: 1,
//                     fill: false,
//                     tension: 0.1
//                 }
//             ]
//         },
//         options: {
//             responsive: true,
//             scales: {
//                 y: {
//                     beginAtZero: false,
//                     title: {
//                         display: true,
//                         text: 'Amount (£)'
//                     }
//                 }
//             },
//             plugins: {
//                 tooltip: {
//                     callbacks: {
//                         label: function (context) {
//                             return context.dataset.label + ': £' + context.raw.toFixed(2);
//                         }
//                     }
//                 }
//             }
//         }
//     });
// }); 