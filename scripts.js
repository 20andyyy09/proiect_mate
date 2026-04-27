document.addEventListener('DOMContentLoaded', () => {
    const pieCanvas = document.getElementById('pieChart');
    const statElements = document.querySelectorAll('[data-target]');

    // Update this array to change the pie chart labels, values, and colors.
    const surveyResults = [
        { label: 'Deloc', value: 10, color: '#ff7a7a' },
        { label: 'Sub o or\u0103', value: 15, color: '#ffca6a' },
        { label: '1-3 ore', value: 25, color: '#48e6ff' },
        { label: '3-5 ore', value: 15, color: '#76e4a0' },
        { label: '5-7 ore', value: 20, color: '#5d81ff' },
        { label: '7+ ore', value: 15, color: '#a877dd' }
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

    function drawRoundedRect(ctx, x, y, width, height, radius) {
        const cornerRadius = Math.min(radius, width / 2, height / 2);

        ctx.beginPath();
        ctx.moveTo(x + cornerRadius, y);
        ctx.lineTo(x + width - cornerRadius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
        ctx.lineTo(x + width, y + height - cornerRadius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
        ctx.lineTo(x + cornerRadius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
        ctx.lineTo(x, y + cornerRadius);
        ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
        ctx.closePath();
    }

    function resizeCanvas() {
        const parent = pieCanvas.parentElement;
        const rect = parent.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        const isCompact = rect.width < 620;
        const canvasHeight = isCompact
            ? Math.min(520, Math.max(360, rect.width * 0.95))
            : Math.min(430, Math.max(320, rect.width * 0.58));

        pieCanvas.width = rect.width * ratio;
        pieCanvas.height = canvasHeight * ratio;
        pieCanvas.style.height = `${canvasHeight}px`;
        const ctx = pieCanvas.getContext('2d');
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function drawPieChart() {
        if (!pieCanvas) return;

        resizeCanvas();
        const ctx = pieCanvas.getContext('2d');
        const width = pieCanvas.clientWidth;
        const height = pieCanvas.clientHeight;
        const isCompact = width < 620;
        const radius = Math.min(width, height) * (isCompact ? 0.22 : 0.28);
        const ringWidth = Math.max(28, radius * 0.42);
        const centerX = isCompact ? width * 0.5 : width * 0.34;
        const centerY = isCompact ? height * 0.31 : height * 0.55;
        const chartData = getChartData();
        const total = chartData.reduce((sum, value) => sum + value, 0);

        ctx.clearRect(0, 0, width, height);

        if (total > 0) {
            let startAngle = -Math.PI / 2;
            const gap = 0.025;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.lineWidth = ringWidth;
            ctx.strokeStyle = 'rgba(244, 247, 255, 0.08)';
            ctx.stroke();

            surveyResults.forEach((result) => {
                const sliceAngle = (result.value / total) * 2 * Math.PI;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, startAngle + gap, startAngle + sliceAngle - gap);
                ctx.lineWidth = ringWidth;
                ctx.lineCap = 'round';
                ctx.strokeStyle = result.color;
                ctx.shadowColor = result.color;
                ctx.shadowBlur = 16;
                ctx.stroke();
                startAngle += sliceAngle;
            });
        }

        ctx.shadowBlur = 0;
        const innerRadius = radius - ringWidth * 0.48;
        const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius * 1.4);
        centerGradient.addColorStop(0, 'rgba(244, 247, 255, 0.18)');
        centerGradient.addColorStop(1, 'rgba(7, 9, 20, 0.9)');

        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius * 0.92, 0, Math.PI * 2);
        ctx.fillStyle = centerGradient;
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.font = '700 1.55rem Inter, system-ui, sans-serif';
        ctx.fillStyle = '#f4f7ff';
        ctx.fillText('100%', centerX, centerY - 2);
        ctx.font = '600 0.72rem Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(244, 247, 255, 0.62)';
        ctx.fillText('total', centerX, centerY + 20);

        ctx.textAlign = 'left';
        ctx.font = '600 0.95rem Inter, system-ui, sans-serif';

        surveyResults.forEach((result, index) => {
            const percent = Math.round(result.value);
            const labelX = isCompact ? width * 0.12 : width * 0.62;
            const labelY = (isCompact ? height * 0.58 : height * 0.24) + index * 31;
            const labelWidth = isCompact ? width * 0.76 : width * 0.3;
            const labelHeight = 24;

            ctx.fillStyle = 'rgba(7, 9, 20, 0.34)';
            drawRoundedRect(ctx, labelX - 10, labelY - 17, labelWidth, labelHeight, 12);
            ctx.fill();

            ctx.fillStyle = result.color;
            drawRoundedRect(ctx, labelX, labelY - 11, 18, 18, 6);
            ctx.fill();

            ctx.fillStyle = '#f4f7ff';
            ctx.fillText(`${result.label} \u2022 ${percent}%`, labelX + 28, labelY + 3);
        });
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
