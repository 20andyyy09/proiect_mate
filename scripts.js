document.addEventListener('DOMContentLoaded', () => {
    const pieCanvas = document.getElementById('pieChart');
    const statElements = document.querySelectorAll('[data-target]');
    const progressIndicator = document.querySelector('.reading-progress span');
    const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
    const totalResponses = 150;
    const currentPage = getPageName(window.location.href);

    // Update this array to change the pie chart labels, values, and colors.
    const surveyResults = [
        { label: 'Deloc', value: 10, color: '#ff7a7a', hoursEstimate: 0 },
        { label: 'Sub o or\u0103', value: 15, color: '#ffca6a', hoursEstimate: 0.5 },
        { label: '1-3 ore', value: 25, color: '#48e6ff', hoursEstimate: 2 },
        { label: '3-5 ore', value: 15, color: '#76e4a0', hoursEstimate: 4 },
        { label: '5-7 ore', value: 20, color: '#5d81ff', hoursEstimate: 6 },
        { label: '7+ ore', value: 15, color: '#a877dd', hoursEstimate: 8 }
    ];

    function getChartData() {
        return surveyResults.map((result) => result.value);
    }

    function getTotalShare() {
        return getChartData().reduce((sum, value) => sum + value, 0);
    }

    function getSharePercent(result, total = getTotalShare()) {
        return total > 0 ? (result.value / total) * 100 : 0;
    }

    function getStudySummary() {
        const total = getTotalShare();
        const noStudy = surveyResults
            .filter((result) => result.hoursEstimate === 0)
            .reduce((sum, result) => sum + getSharePercent(result, total), 0);
        const activeStudy = surveyResults
            .filter((result) => result.hoursEstimate >= 1)
            .reduce((sum, result) => sum + getSharePercent(result, total), 0);
        const intensiveStudy = surveyResults
            .filter((result) => result.hoursEstimate >= 5)
            .reduce((sum, result) => sum + getSharePercent(result, total), 0);
        const averageHours = total > 0
            ? surveyResults.reduce((sum, result) => sum + result.value * result.hoursEstimate, 0) / total
            : 0;

        return {
            noStudy: Math.round(noStudy),
            activeStudy: Math.round(activeStudy),
            intensiveStudy: Math.round(intensiveStudy),
            averageHours: Math.round(averageHours * 10) / 10
        };
    }

    function formatNumber(value, suffix) {
        if (suffix === '%') {
            return `${Math.round(value)}%`;
        }
        if (suffix === 'h') {
            const roundedValue = Math.round(Number(value) * 10) / 10;
            return `${roundedValue}h`;
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
            const currentValue = suffix === 'h'
                ? Math.round(progress * target * 10) / 10
                : Math.floor(progress * target);
            element.textContent = formatNumber(currentValue, suffix);

            if (elapsed < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = formatNumber(target, suffix);
            }
        }

        requestAnimationFrame(step);
    }

    function updateSummaryMetrics() {
        const summary = getStudySummary();
        const metricMap = {
            'total-responses': { value: totalResponses, suffix: '' },
            'study-active': { value: summary.activeStudy, suffix: '%' },
            'average-hours': { value: summary.averageHours, suffix: 'h' }
        };
        const inlineMap = {
            'study-active': summary.activeStudy,
            'no-study': summary.noStudy,
            'intensive-study': summary.intensiveStudy
        };

        Object.entries(metricMap).forEach(([key, metric]) => {
            document.querySelectorAll(`[data-stat="${key}"]`).forEach((element) => {
                element.dataset.target = String(metric.value);
                element.dataset.suffix = metric.suffix;
                element.textContent = formatNumber(metric.value, metric.suffix);
            });
        });

        Object.entries(inlineMap).forEach(([key, value]) => {
            document.querySelectorAll(`[data-inline="${key}"]`).forEach((element) => {
                element.textContent = formatNumber(value, '%');
            });
            document.querySelectorAll(`[data-meter="${key}"]`).forEach((element) => {
                element.style.setProperty('--value', `${value}%`);
            });
        });

        const chartSummary = document.getElementById('chartSummary');
        if (chartSummary) {
            chartSummary.textContent = `Din ${totalResponses} răspunsuri, ${summary.activeStudy}% dintre elevi studiază cel puțin o oră pe săptămână, iar media estimată este ${formatNumber(summary.averageHours, 'h')}.`;
        }
    }

    function renderResultsTable() {
        const tableBody = document.getElementById('resultsTableBody');
        const total = getTotalShare();
        if (!tableBody || total <= 0) return;

        tableBody.replaceChildren();
        surveyResults.forEach((result) => {
            const percent = Math.round(getSharePercent(result, total));
            const estimatedStudents = Math.round((totalResponses * percent) / 100);
            const row = document.createElement('tr');
            const labelCell = document.createElement('td');
            const percentCell = document.createElement('td');
            const studentsCell = document.createElement('td');
            const dot = document.createElement('span');

            dot.className = 'legend-dot';
            dot.style.setProperty('--dot-color', result.color);
            labelCell.append(dot, document.createTextNode(result.label));
            percentCell.textContent = formatNumber(percent, '%');
            studentsCell.textContent = new Intl.NumberFormat().format(estimatedStudents);
            row.append(labelCell, percentCell, studentsCell);
            tableBody.append(row);
        });
    }

    updateSummaryMetrics();
    renderResultsTable();

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
        if (!pieCanvas) return;

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
        const radius = Math.min(width, height) * (isCompact ? 0.25 : 0.31);
        const centerX = isCompact ? width * 0.5 : width * 0.34;
        const centerY = isCompact ? height * 0.31 : height * 0.55;
        const chartData = getChartData();
        const total = chartData.reduce((sum, value) => sum + value, 0);

        ctx.clearRect(0, 0, width, height);

        if (total > 0) {
            let startAngle = -Math.PI / 2;

            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(7, 9, 20, 0.3)';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
            ctx.shadowBlur = 28;
            ctx.shadowOffsetY = 16;
            ctx.fill();
            ctx.restore();

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(244, 247, 255, 0.14)';
            ctx.stroke();

            surveyResults.forEach((result) => {
                const sliceAngle = (result.value / total) * 2 * Math.PI;
                const endAngle = startAngle + sliceAngle;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = result.color;
                ctx.shadowColor = result.color;
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.restore();

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'rgba(7, 9, 20, 0.72)';
                ctx.stroke();

                const percent = Math.round(getSharePercent(result, total));
                if (percent >= 10) {
                    const midAngle = startAngle + sliceAngle / 2;
                    const labelX = centerX + Math.cos(midAngle) * radius * 0.58;
                    const labelY = centerY + Math.sin(midAngle) * radius * 0.58;

                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = '700 0.9rem Inter, system-ui, sans-serif';
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
                    ctx.shadowBlur = 8;
                    ctx.fillText(`${percent}%`, labelX, labelY);
                    ctx.restore();
                }

                startAngle = endAngle;
            });
        }

        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
        ctx.font = '600 0.95rem Inter, system-ui, sans-serif';

        surveyResults.forEach((result, index) => {
            const percent = Math.round(getSharePercent(result, total));
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

    function getPageName(urlValue) {
        const url = new URL(urlValue, window.location.href);
        const pathname = decodeURIComponent(url.pathname || '');
        const segments = pathname.split('/').filter(Boolean);
        return segments.length ? segments[segments.length - 1] : 'index.html';
    }

    function getSectionForLink(link) {
        if (!link.hash || getPageName(link.href) !== currentPage) {
            return null;
        }

        try {
            return document.querySelector(link.hash);
        } catch (error) {
            return null;
        }
    }

    function updateProgressAndNavigation() {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

        if (progressIndicator) {
            progressIndicator.style.setProperty('--progress', Math.min(Math.max(progress, 0), 1));
        }

        const activeLink = navLinks
            .map((link) => ({ link, section: getSectionForLink(link) }))
            .filter((item) => item.section)
            .reverse()
            .find((item) => item.section.getBoundingClientRect().top <= 130);

        navLinks.forEach((link) => {
            const isCurrentPageLink = !link.hash && getPageName(link.href) === currentPage;
            const isActive = Boolean(activeLink && activeLink.link === link) || (!activeLink && isCurrentPageLink);
            link.classList.toggle('is-active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    let scrollTicking = false;
    function scheduleScrollUpdate() {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
            updateProgressAndNavigation();
            scrollTicking = false;
        });
    }

    drawPieChart();
    updateProgressAndNavigation();
    window.addEventListener('resize', debounce(drawPieChart));
    window.addEventListener('resize', debounce(updateProgressAndNavigation));
    window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
});
