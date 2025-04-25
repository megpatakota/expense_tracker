// Enhanced chart.js implementation with simple pie chart
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, starting enhanced chart initialization");
    
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
    
    if (!dataContainer) {
        console.error("Could not find allMonthsContainer!");
    } else {
        const wasHidden = dataContainer.classList.contains('hidden');
        
        if (wasHidden) {
            console.log("Data container was hidden, making it temporarily visible");
            dataContainer.classList.remove('hidden');
        }
        
        // Now collect the data
        const monthSections = document.querySelectorAll('.month-data-container');
        console.log(`Found ${monthSections.length} month sections`);
        
        monthSections.forEach(function (monthSection) {
            const monthName = monthSection.getAttribute('data-month');
            
            // Capture all account type totals
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
            
            console.log(`Month: ${monthName}, Current: ${currentTotal}, Savings: ${savingsTotal}, Credit Cards: ${creditCardTotal}, Grand Total: ${grandTotal}`);
        });
        
        // Hide the container again if it was hidden before
        if (wasHidden) {
            dataContainer.classList.add('hidden');
        }
    }
    
    console.log("Complete chart data:", chartData);
    
    // Check if we have data
    if (chartData.months.length === 0) {
        console.log("No data found in DOM, using demo data instead");
        
        // Use demo data if no data is found
        chartData.months = ["January", "February", "March", "April", "May", "June"];
        chartData.currentTotals = [1000, 1200, 1100, 1300, 1250, 1400];
        chartData.savingsTotals = [5000, 5100, 5200, 5300, 5400, 5500];
        chartData.lendingTotals = [0, 0, 0, 0, 0, 0];
        chartData.depositsTotals = [10000, 10000, 10000, 10000, 10000, 10000];
        chartData.pensionsTotals = [20000, 20100, 20200, 20300, 20400, 20500];
        chartData.creditCardTotals = [-500, -600, -550, -500, -450, -400];
        chartData.grandTotals = [35500, 35800, 35950, 36400, 36600, 37000];
    }
    
    // Initialize line Chart with interactive legend
    const ctx = document.getElementById('financialSummaryChart');
    if (ctx) {
        console.log("Creating enhanced line chart");
        
        // Define datasets
        const lineChartDatasets = [
            {
                label: 'Current',
                data: chartData.currentTotals,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            },
            {
                label: 'Savings',
                data: chartData.savingsTotals,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            },
            {
                label: 'Lending',
                data: chartData.lendingTotals,
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            },
            {
                label: 'Deposits',
                data: chartData.depositsTotals,
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            },
            {
                label: 'Pensions',
                data: chartData.pensionsTotals,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            },
            {
                label: 'Credit Cards',
                data: chartData.creditCardTotals,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            }
        ];
        
        const financialChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: chartData.months,
                datasets: lineChartDatasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Amount (£)',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(200, 200, 200, 0.2)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(200, 200, 200, 0.2)'
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
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 11
                            }
                        },
                        // Enhanced legend behavior - click to toggle visibility
                        onClick: function(e, legendItem, legend) {
                            const index = legendItem.datasetIndex;
                            const ci = legend.chart;
                            const meta = ci.getDatasetMeta(index);
                            
                            // Toggle the hidden property
                            meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                            ci.update();
                        }
                    }
                }
            }
        });
    } else {
        console.error("Could not find line chart canvas element");
    }

    // ----- Pie Chart with Labels - Assets and Liabilities Only -----
    // Make sure to use the data from the latest month
    const latestMonth = 0; // Index 0 since we unshifted the data
    
    // Calculate total assets 
    const totalAssets = (
        (chartData.currentTotals[latestMonth] || 0) + 
        (chartData.savingsTotals[latestMonth] || 0) + 
        (chartData.depositsTotals[latestMonth] || 0) + 
        (chartData.pensionsTotals[latestMonth] || 0)
    );
    
    // Calculate total liabilities (use absolute value)
    const totalLiabilities = Math.abs(chartData.creditCardTotals[latestMonth] || 0);
    
    console.log("Pie chart data - Assets:", totalAssets, "Liabilities:", totalLiabilities);
    
    // Force minimum values to ensure pie chart is visible even with no data
    const minAssets = totalAssets > 0 ? totalAssets : 1000;
    const minLiabilities = totalLiabilities > 0 ? totalLiabilities : 100;
    
    // Simple assets/liabilities pie chart data
    const pieChartData = {
        labels: ['Total Assets', 'Total Liabilities'],
        datasets: [{
            data: [
                minAssets,
                minLiabilities
            ],
            backgroundColor: [
                'rgba(75, 192, 192, 0.7)', // Total Assets
                'rgba(255, 99, 132, 0.7)' // Total Liabilities
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)', // Total Assets
                'rgba(255, 99, 132, 1)' // Total Liabilities
            ],
            borderWidth: 1
        }]
    };
    
    // Custom plugin for labels inside pie chart
    const pieChartLabelsPlugin = {
        id: 'pieChartLabels',
        beforeDraw: function(chart) {
            const width = chart.width;
            const height = chart.height;
            const ctx = chart.ctx;
            ctx.restore();
            
            // Calculate percentages
            const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            
            // Font settings
            const fontSize = (height / 114).toFixed(2);
            ctx.font = fontSize + 'em sans-serif';
            ctx.textBaseline = 'middle';
            
            // Draw each slice's text
            const meta = chart.getDatasetMeta(0);
            meta.data.forEach(element => {
                const dataIndex = element.index;
                const value = chart.data.datasets[0].data[dataIndex];
                
                // Only draw text if slice is large enough (more than 5%)
                if (value / total > 0.05) {
                    // Calculate percentage
                    const percentage = ((value / total) * 100).toFixed(1) + '%';
                    
                    // Format monetary value
                    const monetary = '£' + value.toLocaleString();
                    
                    // Get position
                    const center = element.getCenterPoint();
                    
                    // Draw text
                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'center';
                    ctx.fillText(percentage, center.x, center.y - (fontSize * 8));
                    ctx.fillText(monetary, center.x, center.y + (fontSize * 8));
                }
            });
            
            ctx.save();
        }
    };
    
    const pieCtx = document.getElementById('assetsLiabilitiesPieChart');
    if (pieCtx) {
        console.log("Creating enhanced pie chart");
        
        // Use the simple assets/liabilities view
        const pieChart = new Chart(pieCtx.getContext('2d'), {
            type: 'pie',
            plugins: [pieChartLabelsPlugin],
            data: pieChartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        display: true,
                        labels: {
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: £${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true
                }
            }
        });
        
        console.log("Pie chart created successfully");
    } else {
        console.error("Could not find pie chart canvas element");
    }
});