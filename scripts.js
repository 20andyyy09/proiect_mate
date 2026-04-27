document.addEventListener('DOMContentLoaded', () => {
    const pieCanvas = document.getElementById('pieChart');
    const statElements = document.querySelectorAll('[data-target]');

    // Update this array to change the pie chart labels, values, and colors.
    const surveyResults = [
        { label: 'Deloc', value: 30, color: '#5d81ff' },
        { label: 'Sub o or\u0103', value: 15, color: '#48e6ff' },
        { label: '1-3 ore', value: 25, color: '#8c97ff' },
        { label: '3-5 ore', value: 5, color: '#ff7a7a' },
        { label: '5-7 ore', value: 20, color: '#ffb347' },
        { label: '7+ ore', value: 5, color: '#a877dd' }
    ];

    function getChartData() {
        return surveyResults.map((result) => result.value);
    }

    function formatNumber(value, suffix) {
        if (suffix === '%') {
            return `${Math.round(value)}%`;
        }
        if (suffix === 'h') {
            return `${value}h`;
        }

        const wideOptions = { useGrouping: true };
        const compactOptions = { notation: 'compact', maximumFractionDigits: 1 };
        const options = window.innerWidth < 640 ? compactOptions : wideOptions;
        return new Intl.NumberFormat(undefined, options).format(Math.round(value));
    }

    function animateNumber(element) {
        const target = Number(element.dataset.target) || 0;
        const suffix = element.dataset.suffix || '';
        const duration = 1400;
        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = Math.min((currentTime - startTime) / duration, 1);
            const progress = 1 - Math.pow(1 - elapsed, 3);
            const currentValue = Math.floor(progress * target);
            element.textContent = formatNumber(currentValue, suffix);

            if (elapsed < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = formatNumber(target, suffix);
            }
        }

        requestAnimationFrame(step);
    }

    const statObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statElements.forEach((element) => statObserver.observe(element));

    function resizeCanvas() {
        const parent = pieCanvas.parentElement;
        const rect = parent.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        pieCanvas.width = rect.width * ratio;
        pieCanvas.height = rect.width * 0.75 * ratio;
        pieCanvas.style.height = `${rect.width * 0.75}px`;
        const ctx = pieCanvas.getContext('2d');
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function drawPieChart() {
        if (!pieCanvas) return;

        resizeCanvas();
        const ctx = pieCanvas.getContext('2d');
        const width = pieCanvas.clientWidth;
        const height = pieCanvas.clientHeight;
        const radius = Math.min(width, height) * 0.28;
        const centerX = width * 0.35;
        const centerY = height * 0.52;
        const chartData = getChartData();
        const total = chartData.reduce((sum, value) => sum + value, 0);

        ctx.clearRect(0, 0, width, height);

        if (total > 0) {
            let startAngle = -Math.PI / 2;

            surveyResults.forEach((result) => {
                const sliceAngle = (result.value / total) * 2 * Math.PI;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                ctx.closePath();
                ctx.fillStyle = result.color;
                ctx.fill();
                startAngle += sliceAngle;
            });
        }

        ctx.font = '600 1rem Inter, system-ui, sans-serif';
        ctx.fillStyle = '#f4f7ff';

        surveyResults.forEach((result, index) => {
            const percent = Math.round(result.value);
            const labelX = width * 0.62;
            const labelY = height * 0.24 + index * 30;

            ctx.fillStyle = result.color;
            ctx.fillRect(labelX, labelY - 10, 18, 18);

            ctx.fillStyle = '#f4f7ff';
            ctx.fillText(`${result.label} \u2022 ${percent}%`, labelX + 26, labelY + 4);
        });

        ctx.font = '700 1.25rem Inter, system-ui, sans-serif';
        ctx.fillStyle = '#f4f7ff';
        ctx.fillText('Distribu\u021bia r\u0103spunsurilor', width * 0.35 - 80, height * 0.12);
    }

    const debounce = (fn, wait = 120) => {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(fn, wait);
        };
    };

    drawPieChart();
    window.addEventListener('resize', debounce(drawPieChart));
});
