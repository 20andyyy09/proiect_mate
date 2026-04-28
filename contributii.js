// Editeaza aici contributiile echipei.
// Completeaza campurile `role` si `contribution` pentru fiecare membru.
// Daca vrei mai multe paragrafe intr-o contributie, scrie textul pe linii separate.
const teamContributions = [
    {
        index: '01',
        name: 'Dogaru Luca',
        role: '',
        contribution: ''
    },
    {
        index: '02',
        name: 'Pastin Cristian',
        role: '',
        contribution: ''
    },
    {
        index: '03',
        name: 'Voicu Denisa',
        role: '',
        contribution: ''
    },
    {
        index: '04',
        name: 'Dumitrescu Maria',
        role: '',
        contribution: ''
    },
    {
        index: '05',
        name: 'Marculescu Alissia',
        role: '',
        contribution: ''
    },
    {
        index: '06',
        name: 'Tanase Radu',
        role: '',
        contribution: ''
    },
    {
        index: '07',
        name: 'Tufan Matei',
        role: '',
        contribution: ''
    },
    {
        index: '08',
        name: 'Petre Daria',
        role: '',
        contribution: ''
    },
    {
        index: '09',
        name: 'Grigore Gabriel',
        role: '',
        contribution: ''
    },
    {
        index: '10',
        name: 'Bolovaneanu Andi',
        role: '',
        contribution: ''
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const membersGrid = document.getElementById('membersGrid');
    const completedMembers = document.getElementById('completedMembers');

    function hasContribution(member) {
        return Boolean(member.role.trim() || member.contribution.trim());
    }

    function escapeHtml(value) {
        return value
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    function formatParagraphs(value, fallback) {
        const content = value.trim();
        if (!content) {
            return `<p class="member-text member-text-muted">${fallback}</p>`;
        }

        return content
            .split(/\n+/)
            .map((paragraph) => `<p class="member-text">${escapeHtml(paragraph.trim())}</p>`)
            .join('');
    }

    function renderMembers() {
        if (!membersGrid) return;

        const completed = teamContributions.filter(hasContribution).length;

        membersGrid.innerHTML = teamContributions.map((member) => `
            <article class="member-card${hasContribution(member) ? ' is-complete' : ''}">
                <div class="member-header">
                    <span class="member-index">${member.index}</span>
                    <div class="member-heading">
                        <h3 class="member-name">${escapeHtml(member.name)}</h3>
                        <p class="member-role">${escapeHtml(member.role.trim() || 'Rol nespecificat')}</p>
                    </div>
                </div>
                <div class="member-block">
                    <span class="member-label">Contributie</span>
                    ${formatParagraphs(member.contribution, 'Contributia nu este afisata momentan.')}
                </div>
            </article>
        `).join('');

        if (completedMembers) {
            completedMembers.textContent = `${completed}/${teamContributions.length}`;
        }
    }

    renderMembers();
});
