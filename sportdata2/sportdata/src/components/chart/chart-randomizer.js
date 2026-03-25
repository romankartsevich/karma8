function randomiseChartData () {
    const minuteData = [];
    const hoursInMinutes = 15 * 60;
    const randomFromTo = (min, max) => Math.random() * (max - min) + min;

    const chartRanges = [
        { minInterval: [0, 60], limits: [30000, 90000] },
        { minInterval: [60, 1.1 * 60], limits: [90000, 120000] },
        { minInterval: [1.2 * 60, 5 * 60], limits: [120000, 240000] },
        { minInterval: [5 * 60, 5.3 * 60], limits: [240000, 75000] },
        { minInterval: [5.3 * 60, 16 * 60], limits: [75000, 60000] },
    ];

    shuffleArray(chartRanges);

    let currentChartRangeIndex = 0;

    for (let i = 0; i <= hoursInMinutes; i++) {
        if (currentChartRangeIndex < chartRanges.length - 1 && i > chartRanges[currentChartRangeIndex].minInterval[1]) {
            currentChartRangeIndex++;
        }

        const currentChartRange = chartRanges[currentChartRangeIndex];
        const [min, max] = currentChartRange.limits[0] > currentChartRange.limits[1]
            ? currentChartRange.limits.reverse()
            : currentChartRange.limits;
        const prevY = minuteData[i - 1]?.y || 0;
        const y = Math.max(min, Math.min(max, randomFromTo(prevY - 2000, prevY + 2000)))

        minuteData.push({ x: i, y });
    }

    return minuteData;
}

function shuffleArray (array) {
    let currentIndex = array.length;

    while (currentIndex !== 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);

        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}