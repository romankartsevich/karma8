const CHART_CONFIG = {
    labels: [
        '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM',
        '9 PM', '10 PM', '11 PM', '12 AM', '1 AM', '2 AM', '3 AM', '4 AM'
    ],
    scales: {
        x: { min: 0, max: 900 },
        y: { min: 0, max: 250000 }
    },
    borderColor: '#2c7cd8',
    borderColor2: '#2c2fd8',
    backgroundColor: (context) => {
        const { ctx, chartArea } = context.chart;

        if (!chartArea) return null;

        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

        gradient.addColorStop(0, 'rgba(33, 82, 255, 0)');
        gradient.addColorStop(1, 'rgba(33, 82, 255, 0.2)');

        return gradient;
    },
    backgroundColor2: (context) => {
        const { ctx, chartArea } = context.chart;

        if (!chartArea) return null;

        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

        gradient.addColorStop(0, 'rgba(74,33,255,0)');
        gradient.addColorStop(1, 'rgba(55,33,255,0.2)');

        return gradient;
    }
}

function getChartWidgetConfig (values) {
    return {
        type: 'line',
        data: {
            labels: CHART_CONFIG.labels,
            datasets: [{
                data: values,
                borderColor: CHART_CONFIG.borderColor,
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                backgroundColor: CHART_CONFIG.backgroundColor,
                tension: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            },
            scales: {
                x: {
                    ...CHART_CONFIG.scales.x,
                    type: 'linear',
                    display: false,
                },
                y: {
                    ...CHART_CONFIG.scales.y,
                    display: false,
                    min: 0,
                    max: 250000
                }
            },
            layout: {
                padding: 0
            },
            elements: {
                line: {
                    capBezierPoints: true
                }
            }
        }
    }
}

function getChartConfig (values1, label1 = "label 1", values2, label2 = "label 2") {
    return {
        type: 'line',
        data: {
            labels: CHART_CONFIG.labels,
            datasets: [
                {
                    label: label1,
                    data: values1,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    borderColor: CHART_CONFIG.borderColor,
                    backgroundColor: CHART_CONFIG.backgroundColor,
                    tension: 1,
                    fill: true
                },
                {
                    label: label2,
                    data: values2,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    borderColor: CHART_CONFIG.borderColor2,
                    backgroundColor: CHART_CONFIG.backgroundColor2,
                    tension: 1,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            aspectRatio: 1,
            scales: {
                x: {
                    ...CHART_CONFIG.scales.x,
                    type: 'linear',
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        stepSize: 60,
                        callback: value => CHART_CONFIG.labels[value / 60]
                    }
                },
                y: {
                    ...CHART_CONFIG.scales.y,
                    ticks: {
                        callback: value => value >= 1000 ? value / 1000 + 'k' : value
                    }
                },
            },
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        generateLabels: function (chart) {
                            const originalLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);

                            return [{
                                text: `Total: 4.21M`,
                                fillStyle: 'transparent',
                                strokeStyle: 'transparent',
                                lineWidth: 0,
                                hidden: false,
                                index: originalLabels.length
                            }, ...originalLabels];
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        title: (context) => {
                            const mins = context[0].parsed.x;
                            const hr = Math.floor(mins / 60);
                            const m = mins % 60;

                            return `Time: ${hr + 1}:` + (m < 10 ? '0' + m : m);
                        }
                    }
                }
            }
        }
    }
}

function createChart (id = 'myChart', isWidget = false, label = "label") {
    const ctx = document.getElementById(id);
    const minuteData1 = randomiseChartData();
    const minuteData2 = randomiseChartData();

    if (!window.charts) {
        window.charts = {};
    }

    window.charts[id]?.destroy();
    window.charts[id] = new Chart(ctx, isWidget ? getChartWidgetConfig(minuteData1) : getChartConfig(minuteData1, label + ' one', minuteData2, label + ' two', ));
}