function getChartMenuElement () {
    return document.querySelector('.chart-nav');
}

function chartMenuItemHandler(button) {
    Array.from(getChartMenuElement().children).forEach((child) => child.classList.remove('active'));
    button.classList.add('active');
    createChart('myChart', false, button.textContent);
}

document.addEventListener('DOMContentLoaded', () => {
    getChartMenuElement().addEventListener('click', (e) => {
        if (e.target.tagName === 'SPAN') {
            chartMenuItemHandler(e.target);
        }
    });

    chartMenuItemHandler(getChartMenuElement().children[0]);
    createChart('myChartWidget1', true);
    createChart('myChartWidget2', true);
});