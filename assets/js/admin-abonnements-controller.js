    const subscriptions = [
        {
            id: 1, name: 'ACME Corporation', logo: 'ACME', logoClass: 'acme',
            plan: 'Enterprise', planClass: 'enterprise', amount: '12,500 MAD',
            status: 'Actif', statusClass: 'active', renewal: '12 juin 2024',
            users: 42, maxUsers: 50, payment: 'Payé', paymentClass: 'paid',
            activity: 'Il y a 2 h', cycle: 'Mensuel', storage: '120 GB / Illimité',
            paymentMethod: 'Carte bancaire', invoice: 'INV-2024-0512', since: '12 janv. 2023'
        },
        {
            id: 2, name: 'DataCorp', logo: 'D', logoClass: 'data',
            plan: 'Pro', planClass: 'pro', amount: '6,500 MAD',
            status: 'Actif', statusClass: 'active', renewal: '8 juin 2024',
            users: 18, maxUsers: 25, payment: 'Payé', paymentClass: 'paid',
            activity: 'Il y a 4 h', cycle: 'Mensuel', storage: '50 GB / Illimité',
            paymentMethod: 'Virement', invoice: 'INV-2024-0489', since: '3 mars 2023'
        },
        {
            id: 3, name: 'CloudScale', logo: '☁', logoClass: 'cloud',
            plan: 'Enterprise', planClass: 'enterprise', amount: '15,000 MAD',
            status: 'En essai', statusClass: 'trial', renewal: '25 mai 2024',
            users: 30, maxUsers: 50, payment: 'En attente', paymentClass: 'pending',
            activity: 'Il y a 1 h', cycle: 'Mensuel', storage: '80 GB / Illimité',
            paymentMethod: 'Carte bancaire', invoice: 'INV-2024-0501', since: '25 avr. 2024'
        },
        {
            id: 4, name: 'NovaTech', logo: 'N', logoClass: 'nova',
            plan: 'Pro', planClass: 'pro', amount: '7,000 MAD',
            status: 'Suspendu', statusClass: 'suspended', renewal: '20 mai 2024',
            users: 10, maxUsers: 25, payment: 'En retard', paymentClass: 'overdue',
            activity: 'Il y a 1 j', cycle: 'Mensuel', storage: '30 GB / Illimité',
            paymentMethod: 'Carte bancaire', invoice: 'INV-2024-0478', since: '15 juin 2023'
        },
        {
            id: 5, name: 'TalentBridge', logo: '', logoClass: 'talent',
            plan: 'Basic', planClass: 'basic', amount: '2,500 MAD',
            status: 'Actif', statusClass: 'active', renewal: '5 juin 2024',
            users: 8, maxUsers: 10, payment: 'Payé', paymentClass: 'paid',
            activity: 'Il y a 3 h', cycle: 'Mensuel', storage: '10 GB / Illimité',
            paymentMethod: 'Carte bancaire', invoice: 'INV-2024-0495', since: '5 nov. 2023'
        },
        {
            id: 6, name: 'GreenSoft', logo: '🌿', logoClass: 'green',
            plan: 'Basic', planClass: 'basic', amount: '2,000 MAD',
            status: 'Expiré', statusClass: 'expired', renewal: '10 mai 2024',
            users: 5, maxUsers: 10, payment: 'En retard', paymentClass: 'overdue',
            activity: 'Il y a 2 j', cycle: 'Mensuel', storage: '5 GB / Illimité',
            paymentMethod: 'Carte bancaire', invoice: 'INV-2024-0467', since: '10 janv. 2024'
        }
    ];

    const {
        createElement,
        createTextCell,
        appendRowsInChunks,
        createInfoRow,
        createStatusInfoRow,
        createLinkInfoRow
    } = window.TheWayTable;

    function createSubscriptionRow(s, i) {
        const pct = Math.round((s.users / s.maxUsers) * 100);
        const barColor = pct > 80 ? 'var(--orange)' : 'var(--green)';
        const row = document.createElement('tr');
        row.dataset.id = s.id;
        row.addEventListener('click', () => selectSubscription(s.id));

        const radioCell = document.createElement('td');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'sub';
        radio.className = 'radio-btn';
        radio.value = s.id;
        radio.checked = i === 0;
        radio.addEventListener('click', event => event.stopPropagation());
        radioCell.appendChild(radio);

        const companyCell = document.createElement('td');
        const company = createElement('div', 'company-cell');
        company.appendChild(createElement('div', `company-logo ${s.logoClass}`, s.logo));
        company.appendChild(createElement('span', 'cname', s.name));
        companyCell.appendChild(company);

        const planCell = document.createElement('td');
        planCell.appendChild(createElement('span', `plan-badge ${s.planClass}`, s.plan));

        const statusCell = document.createElement('td');
        statusCell.appendChild(createElement('span', `status-badge ${s.statusClass}`, s.status));

        const usersCell = document.createElement('td');
        const usersBar = createElement('div', 'users-bar');
        usersBar.appendChild(createElement('span', 'users-bar-text', `${s.users} / ${s.maxUsers}`));
        const usersTrack = createElement('div', 'users-bar-track');
        const usersFill = createElement('div', 'users-bar-fill');
        usersFill.style.width = `${pct}%`;
        usersFill.style.background = barColor;
        usersTrack.appendChild(usersFill);
        usersBar.appendChild(usersTrack);
        usersCell.appendChild(usersBar);

        const paymentCell = document.createElement('td');
        paymentCell.appendChild(createElement('span', `payment-badge ${s.paymentClass}`, s.payment));

        const actionCell = document.createElement('td');
        const actionButton = createElement('button', 'table-action');
        actionButton.addEventListener('click', event => event.stopPropagation());
        const actionIcon = createElement('i', 'bx bx-dots-vertical-rounded');
        actionButton.appendChild(actionIcon);
        actionCell.appendChild(actionButton);

        row.append(
            radioCell,
            companyCell,
            planCell,
            createTextCell(s.amount, 'font-weight:600'),
            statusCell,
            createTextCell(s.renewal, 'color:var(--text-light)'),
            usersCell,
            paymentCell,
            createTextCell(s.activity, 'color:var(--text-light)'),
            actionCell
        );

        return row;
    }

    function renderTable(data) {
        appendRowsInChunks(data, createSubscriptionRow);
    }

    function selectSubscription(id) {
        const s = subscriptions.find(x => x.id === id);
        if (!s) return;

        document.getElementById('detailPanel').classList.remove('hidden');
        if (window.innerWidth <= 1024) document.getElementById('panelOverlay').classList.add('active');

        document.querySelectorAll('#tableBody tr').forEach(tr => tr.classList.toggle('selected', parseInt(tr.dataset.id) === id));
        const selectedRadio = document.querySelector(`input[name="sub"][value="${s.id}"]`);
        if (selectedRadio) selectedRadio.checked = true;

        const panelCompany = document.getElementById('panelCompany');
        panelCompany.textContent = '';
        panelCompany.appendChild(createElement('div', 'logo', s.logo));
        const panelInfo = createElement('div', 'info');
        const panelName = createElement('div', 'name', `${s.name} `);
        panelName.appendChild(createElement('span', 'plan-tag', s.plan));
        panelInfo.appendChild(panelName);
        panelInfo.appendChild(createElement('div', 'sub', `Abonné depuis le ${s.since}`));
        panelCompany.appendChild(panelInfo);

        const panelDetails = document.getElementById('panelDetails');
        panelDetails.textContent = '';
        [
            ['Plan', s.plan],
            ['Montant mensuel', s.amount],
            ['Cycle', s.cycle],
            ['Prochain renouvellement', s.renewal],
            ['Utilisateurs', `${s.users} / ${s.maxUsers}`],
            ['Stockage', s.storage],
            ['Mode de paiement', s.paymentMethod]
        ].forEach(([label, value]) => panelDetails.appendChild(createInfoRow(label, value)));
        panelDetails.appendChild(createStatusInfoRow('Statut', s.status, s.statusClass));
        panelDetails.appendChild(createLinkInfoRow('Facture récente', s.invoice));
    }

    document.getElementById('panelClose').addEventListener('click', () => {
        document.getElementById('detailPanel').classList.add('hidden');
        document.getElementById('panelOverlay').classList.remove('active');
        document.querySelectorAll('#tableBody tr').forEach(tr => tr.classList.remove('selected'));
    });

    document.getElementById('panelOverlay').addEventListener('click', () => {
        document.getElementById('detailPanel').classList.add('hidden');
        document.getElementById('panelOverlay').classList.remove('active');
    });

    document.querySelectorAll('.panel-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
        });
    });

    // Filters
    function applyFilters() {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const plan = document.getElementById('planFilter').value.toLowerCase();
        const status = document.getElementById('statusFilter').value.toLowerCase();
        let filtered = subscriptions.filter(s => {
            const matchSearch = !search || s.name.toLowerCase().includes(search);
            const matchPlan = !plan || s.plan.toLowerCase() === plan;
            const matchStatus = !status || s.status.toLowerCase() === status;
            return matchSearch && matchPlan && matchStatus;
        });
        renderTable(filtered);
    }
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('planFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);

    // Sidebar
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const menuToggle = document.getElementById('menuToggle');
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
    });
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('active');
            }
        });
    });

    // Revenue Chart
    new Chart(document.getElementById('revenueChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Déc. 2023', 'Janv. 2024', 'Fév. 2024', 'Mars 2024', 'Avr. 2024', 'Mai 2024'],
            datasets: [{
                label: 'Revenus récurrents (MAD)',
                data: [120000, 140000, 165000, 170000, 175000, 184500],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.08)',
                borderWidth: 2.5,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleFont: { size: 11, family: 'Inter' },
                    bodyFont: { size: 11, family: 'Inter' },
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: (ctx) => `${ctx.parsed.y.toLocaleString('fr-FR')} MAD`
                    }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 10, family: 'Inter' }, color: '#94a3b8' } },
                y: {
                    grid: { color: '#f1f5f9' },
                    ticks: {
                        font: { size: 10, family: 'Inter' },
                        color: '#94a3b8',
                        callback: (v) => v >= 1000 ? (v / 1000) + 'K' : v
                    },
                    beginAtZero: true
                }
            }
        }
    });

    // Donut Chart
    new Chart(document.getElementById('donutChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Enterprise', 'Pro', 'Basic'],
            datasets: [{
                data: [36, 39, 25],
                backgroundColor: ['#7c3aed', '#3b82f6', '#94a3b8'],
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '72%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleFont: { size: 11, family: 'Inter' },
                    bodyFont: { size: 11, family: 'Inter' },
                    padding: 10,
                    cornerRadius: 8
                }
            }
        }
    });

    // Init
    renderTable(subscriptions);
    setTimeout(() => selectSubscription(1), 300);

    // Animate health bars
    setTimeout(() => {
        document.querySelectorAll('.health-bar-fill').forEach(bar => {
            const w = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => { bar.style.width = w; }, 100);
        });
    }, 300);
