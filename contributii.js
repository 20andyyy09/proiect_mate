// Editeaza aici contributiile echipei.
// Completeaza campurile `contribution.badge` si `contribution.text` pentru fiecare membru.
// Badge-uri disponibile: Documentare, Design, Prezentare, Calcule, Dezvoltarea site-ului.
// Daca vrei mai multe paragrafe intr-o contributie, scrie textul pe linii separate.
const teamContributions = [
    {
        index: '01',
        name: 'Dogaru Luca',
        contribution: {
            badge: 'prezentare',
            text: ''
        }
    },
    {
        index: '02',
        name: 'Pastin Cristian',
        contribution: {
            badge: 'prezentare',
            text: ''
        }
    },
    {
        index: '03',
        name: 'Voicu Denisa',
        contribution: {
            badge: 'calcule',
            text: ''
        }
    },
    {
        index: '04',
        name: 'Dumitrescu Maria',
        contribution: {
            badge: 'documentare',
            text: ''
        }
    },
    {
        index: '05',
        name: 'Marculescu Alissia',
        contribution: {
            badge: 'documentare',
            text: ''
        }
    },
    {
        index: '06',
        name: 'Tanase Radu',
        contribution: {
            badge: 'documentare',
            text: ''
        }
    },
    {
        index: '07',
        name: 'Tufan Matei',
        contribution: {
            badge: 'prezentare',
            text: ''
        }
    },
    {
        index: '08',
        name: 'Petre Daria',
        contribution: {
            badge: 'documentare',
            text: ''
        }
    },
    {
        index: '09',
        name: 'Grigore Gabriel',
        contribution: {
            badge: 'design',
            text: ''
        }
    },
    {
        index: '10',
        name: 'Bolovaneanu Andi',
        contribution: {
            badge: 'dezvoltare',
            text: ''
        }
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const membersGrid = document.getElementById('membersGrid');

    function escapeHtml(value) {
        return value
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    function getContribution(member) {
        if (typeof member.contribution === 'string') {
            return {
                badge: '',
                text: member.contribution.trim()
            };
        }

        const contribution = member.contribution || {};
        return {
            badge: String(contribution.badge || '').trim(),
            text: String(contribution.text || '').trim()
        };
    }

    function hasContribution(member) {
        const contribution = getContribution(member);
        return Boolean(contribution.badge || contribution.text);
    }

    function getBadgeClass(badge) {
        const normalizedBadge = badge
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replaceAll(' ', '-');

        const badgeClassMap = {
            documentare: 'role-badge-documentare',
            design: 'role-badge-design',
            prezentare: 'role-badge-prezentare',
            calcule: 'role-badge-calcule',
            dezvoltare: 'role-badge-site',
            'dezvoltarea-site-ului': 'role-badge-site'
        };

        return badgeClassMap[normalizedBadge] || '';
    }

    function formatBadge(badge) {
        if (!badge) return '';

        const badgeClass = getBadgeClass(badge);
        const label = badge.toLocaleLowerCase('ro-RO');
        const formattedBadge = `${label.charAt(0).toLocaleUpperCase('ro-RO')}${label.slice(1)}`;
        return `<span class="role-badge${badgeClass ? ` ${badgeClass}` : ''}">${escapeHtml(formattedBadge)}</span>`;
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

    function formatContribution(member) {
        const contribution = getContribution(member);

        return `
            <div class="member-block">
                <div class="member-contribution-head">
                    <span class="member-label">Contributie</span>
                    ${formatBadge(contribution.badge)}
                </div>
                ${formatParagraphs(contribution.text, 'Contributia nu este afisata momentan.')}
            </div>
        `;
    }

    function getMemberCardClass(member) {
        const contribution = getContribution(member);
        const badgeClass = getBadgeClass(contribution.badge);
        return badgeClass ? ` ${badgeClass}` : '';
    }

    function renderMembers() {
        if (!membersGrid) return;

        membersGrid.innerHTML = teamContributions.map((member) => `
            <article class="member-card${hasContribution(member) ? ' is-complete' : ''}${getMemberCardClass(member)}">
                <div class="member-header">
                    <span class="member-index">${member.index}</span>
                    <div class="member-heading">
                        <h3 class="member-name">${escapeHtml(member.name)}</h3>
                    </div>
                </div>
                ${formatContribution(member)}
            </article>
        `).join('');
    }

    renderMembers();
});
