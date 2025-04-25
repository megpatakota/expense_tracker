// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Make sure the container is visible temporarily while we collect data
    const dataContainer = document.getElementById('allMonthsContainer');
    const wasHidden = dataContainer?.classList.contains('hidden');
    
    if (dataContainer && wasHidden) {
        dataContainer.classList.remove('hidden');
    }
    
    // Now collect the data
    const monthSections = document.querySelectorAll('.month-data-container');
    
    if (monthSections.length > 0) {
        monthSections.forEach(function (monthSection) {
            const monthName = monthSection.getAttribute('data-month');
            const currentTotal = parseFloat(monthSection.querySelector('.current-total')?.textContent?.replace('£', '')?.trim() || 0);
            const savingsTotal = parseFloat(monthSection.querySelector('.savings-total')?.textContent?.replace('£', '')?.trim() || 0);
            const lendingTotal = parseFloat(monthSection.querySelector('.lending-total')?.textContent?.replace('£', '')?.trim() || 0);
            const depositsTotal = parseFloat(monthSection.querySelector('.deposits-total')?.textContent?.replace('£', '')?.trim() || 0);
            const pensionsTotal = parseFloat(monthSection.querySelector('.pensions-total')?.textContent?.replace('£', '')?.trim() || 0);
            const creditCardTotal = parseFloat(monthSection.querySelector('.credit-cards-total')?.textContent?.replace('£', '')?.trim() || 0);
            const grandTotal = parseFloat(monthSection.querySelector('.grand-total')?.textContent?.replace('£', '')?.trim() || 0);

            chartData.months.unshift(monthName);
            chartData.currentTotals.unshift(currentTotal);
            chartData.savingsTotals.unshift(savingsTotal);
            chartData.lendingTotals.unshift(lendingTotal);
            chartData.depositsTotals.unshift(depositsTotal);
            chartData.pensionsTotals.unshift(pensionsTotal);
            chartData.creditCardTotals.unshift(creditCardTotal);
            chartData.grandTotals.unshift(grandTotal);
        });
    } 
    
    // Hide the container again if it was hidden before
    if (dataContainer && wasHidden) {
        dataContainer.classList.add('hidden');
    }
    
    // If no data found, use demo data
    if (chartData.months.length === 0) {
        // Demo data
        chartData.months = ["January", "February", "March", "April", "May", "June"];
        chartData.currentTotals = [1000, 1200, 1100, 1300, 1250, 1400];
        chartData.savingsTotals = [5000, 5100, 5200, 5300, 5400, 5500];
        chartData.lendingTotals = [0, 0, 0, 0, 0, 0];
        chartData.depositsTotals = [10000, 10000, 10000, 10000, 10000, 10000];
        chartData.pensionsTotals = [20000, 20100, 20200, 20300, 20400, 20500];
        chartData.creditCardTotals = [-500, -600, -550, -500, -450, -400];
        chartData.grandTotals = [35500, 35800, 35950, 36400, 36600, 37000];
    }
    
    // ----- Pie Chart -----
    // Calculate total assets
    const totalAssets = (
        (chartData.currentTotals[0] || 0) + 
        (chartData.savingsTotals[0] || 0) + 
        (chartData.depositsTotals[0] || 0) + 
        (chartData.pensionsTotals[0] || 0)
    );
    
    // Calculate total liabilities
    const totalLiabilities = Math.abs(
        (chartData.creditCardTotals[0] || 0) + 
        (chartData.lendingTotals[0] || 0)
    );
    
    // Ensure minimum values for visualization
    const minAssets = Math.max(totalAssets, 1000);
    const minLiabilities = Math.max(totalLiabilities, 100);
    
    const pieChartData = {
        labels: ['Total Assets', 'Total Liabilities'],
        datasets: [{
            data: [
                minAssets,
                minLiabilities
            ],
            backgroundColor: [
                'rgba(75, 192, 192, 0.2)', // Total Assets
                'rgba(255, 99, 132, 0.2)' // Total Liabilities
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)', // Total Assets
                'rgba(255, 99, 132, 1)' // Total Liabilities
            ],
            borderWidth: 1
        }]
    };
    
    const pieCtx = document.getElementById('assetsLiabilitiesPieChart');
    if (pieCtx) {
        const pieChart = new Chart(pieCtx.getContext('2d'), {
            type: 'pie',
            data: pieChartData,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                layout: {
                    padding: {
                        bottom: 10
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'center',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 11
                            },
                            padding: 8
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const percentage = Math.round((value / (minAssets + minLiabilities)) * 100);
                                return `${label}: £${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    },
                    // Display values on the pie chart segments
                    datalabels: {
                        formatter: (value, ctx) => {
                            const sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / sum) * 100) + '%';
                            return percentage;
                        },
                        color: '#000',
                        font: {
                            weight: 'bold',
                            size: 12
                        }
                    }
                }
            }
        });
    }
    
    // Initialize line Chart
    const ctx = document.getElementById('financialSummaryChart');
    if (ctx) {
        const financialChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: chartData.months,
                datasets: [
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
                maintainAspectRatio: true,
                scales: {
                    x: {
                        ticks: {
                            font: {
                                size: 10
                            },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Amount (£)',
                            font: {
                                size: 11
                            }
                        },
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'center',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 11
                            },
                            padding: 8
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + ': £' + context.raw.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
});