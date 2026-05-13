(function (window, document) {
    "use strict";

    const app = window.TheWay || (window.TheWay = {});
    const core = app.core;
    const api = app.api;
    if (!core || !api) return;
    if (!core.context.isPanel) {
        app.panelData = {
            init: function () {},
            refresh: function () {},
            state: {}
        };
        return;
    }

    const state = {
        summary: null,
        opportunities: [],
        skills: [],
        users: [],
        profile: null,
        loading: false
    };

    function pathIncludes(value) {
        return location.pathname.includes(value);
    }

    function escapeHTML(value) {
        return String(value === undefined || value === null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function formatNumber(value) {
        return Number(value || 0).toLocaleString("fr-FR");
    }

    function normalizeList(value) {
        if (Array.isArray(value)) return value;
        if (!value) return [];
        return String(value).split(",").map(function (item) {
            return item.trim();
        }).filter(Boolean);
    }

    function firstLetter(value) {
        const text = String(value || "T").trim();
        return text ? text.charAt(0).toUpperCase() : "T";
    }

    function cleanText(value, fallback) {
        const text = String(value || "").replace(/\s+/g, " ").trim();
        return text || fallback || "";
    }

    function skillLabel(skill) {
        return cleanText(skill.name || skill.nom, "Skill");
    }

    function skillCategory(skill) {
        return cleanText(skill.category || skill.categorie, "General");
    }

    function setValueNode(node, value) {
        if (!node) return;
        const small = node.querySelector("small");
        const change = node.querySelector(".kpi-change, .up, .down");
        if (!small && !change && node.children.length === 0) {
            node.textContent = value;
            return;
        }
        const textNode = Array.from(node.childNodes).find(function (child) {
            return child.nodeType === Node.TEXT_NODE && child.textContent.trim();
        });
        if (textNode) {
            textNode.textContent = value + " ";
            return;
        }
        node.insertBefore(document.createTextNode(value + " "), node.firstChild);
    }

    function setCardsByLabel(labels, value) {
        const normalizedLabels = labels.map(core.normalize);
        document.querySelectorAll(".stat-card, .kpi-card, .metric-card, .bottom-stat-card, .perf-card").forEach(function (card) {
            const text = core.normalize(card.textContent);
            if (!normalizedLabels.some(function (label) { return text.includes(label); })) return;
            const target = card.querySelector(".stat-info h3, .kpi-value, .value, .pvalue");
            setValueNode(target, value);
        });
    }

    function updateFooterCount(count, label) {
        document.querySelectorAll(".table-footer-info").forEach(function (footer) {
            footer.innerHTML = "Affichage de <strong>1 a " + Math.min(count, 50) + "</strong> sur <strong>" + formatNumber(count) + "</strong> " + label;
        });
    }

    function hydrateCounters() {
        if (!state.summary) return;
        const summary = state.summary.summary || state.summary;
        const opportunities = Number(summary.opportunities) || state.opportunities.length;
        const skills = state.skills.length || Number(summary.skills) || 0;
        const users = state.users.length || Number(summary.users) || 0;
        const companies = Number(summary.companies) || uniqueCompanies(state.opportunities).length;

        setCardsByLabel(["opportunite", "opportunites", "offres"], formatNumber(opportunities));
        setCardsByLabel(["competence", "competences", "skills"], formatNumber(skills));
        setCardsByLabel(["utilisateur", "utilisateurs"], formatNumber(users));
        setCardsByLabel(["entreprise", "entreprises"], formatNumber(companies));

        if (pathIncludes("/admin/admin-dashboard.html")) {
            setValueNode(document.querySelector(".donut-center .value"), formatNumber(users));
        }
        if (pathIncludes("/admin/offres.html")) {
            setValueNode(document.querySelector(".donut-center-text .val"), formatNumber(opportunities));
            updateFooterCount(opportunities, "offres");
        }
        if (pathIncludes("/admin/entreprises.html")) {
            setValueNode(document.querySelector(".donut-center-text .val"), formatNumber(companies));
            updateFooterCount(companies, "entreprises");
        }
        if (pathIncludes("/admin/competences.html")) {
            setValueNode(document.querySelector(".donut-center .value"), formatNumber(skills));
            updateFooterCount(skills, "competences");
        }
        if (pathIncludes("/admin/users.html")) {
            const totalCount = document.getElementById("totalCount");
            if (totalCount) totalCount.textContent = formatNumber(users);
        }
    }

    function uniqueCompanies(opportunities) {
        const map = new Map();
        opportunities.forEach(function (opportunity) {
            const name = cleanText(opportunity.company, "");
            if (!name || map.has(core.normalize(name))) return;
            map.set(core.normalize(name), {
                id: map.size + 1,
                name: name,
                email: "contact@" + core.normalize(name).replace(/[^a-z0-9]+/g, "").slice(0, 22) + ".local",
                sector: categoryFromText(opportunity.title + " " + opportunity.description),
                location: opportunity.location || "Maroc",
                activeOffers: 0,
                source: opportunity.source || "Database"
            });
        });
        opportunities.forEach(function (opportunity) {
            const company = map.get(core.normalize(opportunity.company));
            if (company) company.activeOffers += 1;
        });
        return Array.from(map.values());
    }

    function categoryFromText(text) {
        const value = core.normalize(text);
        if (/(react|node|java|python|develop|devops|cloud|data|it|informatique)/.test(value)) return "Tech";
        if (/(rh|recrut|formation|paie)/.test(value)) return "RH";
        if (/(finance|audit|banque|compt)/.test(value)) return "Finance";
        if (/(marketing|commercial|vente|crm)/.test(value)) return "Business";
        return "General";
    }

    function statusClass(value) {
        const key = core.normalize(value);
        if (key.includes("attente") || key.includes("pending")) return "pending";
        if (key.includes("inactif") || key.includes("expire") || key.includes("suspend")) return "inactive";
        return "active";
    }

    function priorityFor(index) {
        if (index < 8) return ["Tres eleve", "priority-high"];
        if (index < 18) return ["Eleve", "priority-high"];
        return ["Moyen", "priority-medium"];
    }

    function scoreFor(index) {
        return Math.max(64, 94 - (index % 12) * 3);
    }

    function cardProgressOffset(score) {
        return (125.66 - (125.66 * score / 100)).toFixed(2);
    }

    function createOpportunityCard(opportunity, index) {
        const score = scoreFor(index);
        const priority = priorityFor(index);
        const skills = normalizeList(opportunity.skills).slice(0, 4);
        const card = document.createElement("div");
        card.className = "opportunity-card animate-in";
        card.dataset.twLive = "database";
        card.dataset.id = opportunity.id || opportunity.uid || index;
        card.innerHTML = [
            '<div class="opp-logo" style="background:#1a1a2e;">' + escapeHTML(firstLetter(opportunity.company || opportunity.title)) + '</div>',
            '<div class="opp-details">',
            '<div class="opp-header"><h4>' + escapeHTML(opportunity.title) + '</h4><span class="company-name">' + escapeHTML(opportunity.company || opportunity.source || "Entreprise") + '</span></div>',
            '<div class="opp-meta"><span>' + escapeHTML(opportunity.location || "Maroc") + '</span><span>•</span><span>' + escapeHTML(opportunity.source || "Database") + '</span><span>•</span><span>CDI</span></div>',
            '<div class="opp-tags">' + skills.map(function (skill) { return '<span class="opp-tag">' + escapeHTML(skill) + '</span>'; }).join("") + '</div>',
            '</div>',
            '<div class="opp-match"><div class="match-circle"><svg viewBox="0 0 48 48"><circle class="circle-bg" cx="24" cy="24" r="20"/><circle class="circle-progress" cx="24" cy="24" r="20" stroke="#22c55e" stroke-dasharray="125.66" stroke-dashoffset="' + cardProgressOffset(score) + '"/></svg><span class="match-percent">' + score + '%</span></div><span class="match-label">Match</span></div>',
            '<span class="opp-priority ' + priority[1] + '">' + priority[0] + '</span>',
            '<button class="opp-bookmark" type="button" data-tw-action="bookmark" aria-label="Enregistrer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>'
        ].join("");
        card.addEventListener("click", function (event) {
            if (event.target.closest(".opp-bookmark")) return;
            core.writeJSON(core.APP_PREFIX + ".selectedOpportunity", opportunity);
            core.goTo(core.userPanelPath("opportunity-details.html"));
        });
        return card;
    }

    function hydrateOpportunityCards() {
        if (!pathIncludes("/opportunity.html") || pathIncludes("/opportunity-details.html") || !state.opportunities.length) return;
        const section = document.querySelector(".opportunities-section");
        if (!section) return;
        Array.from(section.children).forEach(function (child) {
            if (child.classList.contains("opportunity-card")) child.remove();
        });
        const anchor = section.querySelector(".section-title");
        const fragment = document.createDocumentFragment();
        state.opportunities.slice(0, 30).forEach(function (opportunity, index) {
            fragment.appendChild(createOpportunityCard(opportunity, index));
        });
        if (anchor && anchor.nextSibling) {
            section.insertBefore(fragment, anchor.nextSibling);
        } else {
            section.appendChild(fragment);
        }
    }

    function hydrateOpportunityDetails() {
        if (!pathIncludes("/opportunity-details.html")) return;
        const selected = core.readJSON(core.APP_PREFIX + ".selectedOpportunity", null) || state.opportunities[0];
        if (!selected) return;
        if (!document.body) return;
        document.title = cleanText(selected.title, "TheWay - Offre");
        document.body.innerHTML = [
            '<main class="tw-detail-page">',
            '<style>.tw-detail-page{min-height:100vh;padding:32px;background:#f6f8fb;color:#141821;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}.tw-detail-shell{max-width:980px;margin:0 auto;background:#fff;border:1px solid #e2e7ee;border-radius:8px;padding:28px;box-shadow:0 18px 45px rgba(18,25,38,.08)}.tw-detail-top{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:22px}.tw-detail-logo{width:54px;height:54px;border-radius:8px;background:#111827;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800}.tw-detail-title{display:flex;gap:14px}.tw-detail-title h1{font-size:26px;line-height:1.15;margin:0 0 8px}.tw-detail-meta{color:#687180;font-size:14px}.tw-detail-actions{display:flex;gap:10px;flex-wrap:wrap}.tw-detail-actions a,.tw-detail-actions button{border:1px solid #d7dee8;background:#fff;border-radius:8px;padding:10px 14px;color:#141821;text-decoration:none;font-weight:700;cursor:pointer}.tw-detail-actions a.primary{background:#141821;color:#fff;border-color:#141821}.tw-detail-grid{display:grid;grid-template-columns:1fr 280px;gap:24px}.tw-detail-section{border-top:1px solid #edf1f6;padding-top:18px;margin-top:18px}.tw-detail-section h2{font-size:16px;margin:0 0 10px}.tw-detail-section p{color:#3d4654;line-height:1.6}.tw-tag-list{display:flex;gap:8px;flex-wrap:wrap}.tw-tag{background:#eef2ff;color:#3730a3;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:700}.tw-side{background:#f8fafc;border:1px solid #e2e7ee;border-radius:8px;padding:16px;height:max-content}.tw-info-row{display:flex;justify-content:space-between;gap:14px;padding:10px 0;border-bottom:1px solid #e8edf4;font-size:13px}.tw-info-row:last-child{border-bottom:0}@media(max-width:760px){.tw-detail-page{padding:16px}.tw-detail-top,.tw-detail-grid{display:block}.tw-detail-actions{margin-top:18px}.tw-side{margin-top:18px}}</style>',
            '<div class="tw-detail-shell">',
            '<div class="tw-detail-top"><div class="tw-detail-title"><div class="tw-detail-logo">' + escapeHTML(firstLetter(selected.company || selected.title)) + '</div><div><h1>' + escapeHTML(selected.title) + '</h1><div class="tw-detail-meta">' + escapeHTML(selected.company || "Entreprise") + ' · ' + escapeHTML(selected.location || "Maroc") + ' · ' + escapeHTML(selected.source || "Database") + '</div></div></div><div class="tw-detail-actions"><button type="button" onclick="history.back()">Retour</button><a class="primary" href="' + escapeHTML(selected.source_url || "#") + '" target="_blank" rel="noopener">Voir la source</a></div></div>',
            '<div class="tw-detail-grid"><div><div class="tw-detail-section"><h2>Description</h2><p>' + escapeHTML(cleanText(selected.description, "Aucune description disponible.")) + '</p></div><div class="tw-detail-section"><h2>Competences</h2><div class="tw-tag-list">' + normalizeList(selected.skills).map(function (skill) { return '<span class="tw-tag">' + escapeHTML(skill) + '</span>'; }).join("") + '</div></div></div>',
            '<aside class="tw-side"><div class="tw-info-row"><span>Source</span><strong>' + escapeHTML(selected.source || "Database") + '</strong></div><div class="tw-info-row"><span>Localisation</span><strong>' + escapeHTML(selected.location || "Maroc") + '</strong></div><div class="tw-info-row"><span>Entreprise</span><strong>' + escapeHTML(selected.company || "N/A") + '</strong></div><div class="tw-info-row"><span>UID</span><strong>' + escapeHTML(String(selected.uid || selected.id || "N/A").slice(0, 12)) + '</strong></div></aside></div>',
            '</div></main>'
        ].join("");
    }

    function skillRow(skill, index) {
        const percent = Math.max(58, 94 - (index % 8) * 5);
        const label = skillLabel(skill);
        const category = skillCategory(skill);
        return [
            '<div class="skill-row" data-tw-live="database">',
            '<div class="skill-icon" style="background:#eef2ff;color:#3730a3;">' + escapeHTML(label.slice(0, 2).toUpperCase()) + '</div>',
            '<span class="skill-name">' + escapeHTML(label) + '</span>',
            '<span class="skill-level">' + escapeHTML(category) + '</span>',
            '<div class="skill-bar"><div class="skill-bar-fill" style="width:' + percent + '%" data-width="' + percent + '%"></div></div>',
            '<span class="skill-percent">' + percent + '%</span>',
            '</div>'
        ].join("");
    }

    function hydrateUserSkillBlocks() {
        if (pathIncludes("/admin/") || !state.skills.length) return;
        document.querySelectorAll(".content-card").forEach(function (card) {
            if (!card.querySelector(".skill-row")) return;
            card.querySelectorAll(".skill-row").forEach(function (row) { row.remove(); });
            const target = card.querySelector(".view-plan-btn, button");
            const html = state.skills.slice(0, 6).map(skillRow).join("");
            if (target) {
                target.insertAdjacentHTML("beforebegin", html);
            } else {
                card.insertAdjacentHTML("beforeend", html);
            }
        });

        const mini = document.querySelector(".mini-skills");
        if (mini) {
            mini.querySelectorAll(".mini-skill").forEach(function (row) { row.remove(); });
            const addButton = mini.querySelector(".add-skill");
            state.skills.slice(0, 3).forEach(function (skill) {
                const item = document.createElement("div");
                item.className = "mini-skill";
                item.innerHTML = '<div class="mini-skill-logo" style="background:#1a1a2e;">' + escapeHTML(skillLabel(skill).slice(0, 1).toUpperCase()) + '</div><div><span>' + escapeHTML(skillLabel(skill)) + '</span><div class="status">' + escapeHTML(skillCategory(skill)) + '</div></div>';
                mini.insertBefore(item, addButton || null);
            });
        }
    }

    function hydrateDashboardMatches() {
        if (!pathIncludes("/dashboard.html") || !state.opportunities.length) return;
        const cards = Array.from(document.querySelectorAll(".content-card"));
        const card = cards.find(function (item) {
            return core.normalize(item.textContent).includes("opportunites qui matchent");
        });
        if (!card) return;
        card.querySelectorAll(".match-item").forEach(function (item) { item.remove(); });
        state.opportunities.slice(0, 3).forEach(function (opportunity, index) {
            const item = document.createElement("div");
            item.className = "match-item";
            item.innerHTML = '<div class="match-logo" style="background:#1a1a2e;">' + escapeHTML(firstLetter(opportunity.company || opportunity.title)) + '</div><div class="match-info"><div class="match-title">' + escapeHTML(opportunity.title) + '</div><div class="match-company">' + escapeHTML((opportunity.company || "Entreprise") + " · " + (opportunity.location || "Maroc")) + '</div></div><span class="match-score">' + scoreFor(index) + '% Match</span>';
            item.addEventListener("click", function () {
                core.writeJSON(core.APP_PREFIX + ".selectedOpportunity", opportunity);
                core.goTo(core.userPanelPath("opportunity-details.html"));
            });
            card.appendChild(item);
        });
    }

    function offerRow(opportunity, index) {
        const row = document.createElement("tr");
        row.dataset.id = opportunity.id || opportunity.uid || index;
        row.innerHTML = [
            '<td><input type="radio" name="offer" class="radio-btn" ' + (index === 0 ? "checked" : "") + '></td>',
            '<td><div class="offer-cell"><div class="offer-icon" style="background:#1a1a2e;color:#fff">' + escapeHTML(firstLetter(opportunity.title)) + '</div><div><div class="oname">' + escapeHTML(opportunity.title) + '</div><div class="oref">Ref. ' + escapeHTML(String(opportunity.uid || opportunity.id || index).slice(0, 10)) + '</div></div></div></td>',
            '<td><div class="company-cell"><div class="company-mini-logo acme">' + escapeHTML(firstLetter(opportunity.company)) + '</div><span class="cname">' + escapeHTML(opportunity.company || "Entreprise") + '</span></div></td>',
            '<td><span class="location-badge"><i class="bx bx-map-pin"></i> ' + escapeHTML(opportunity.location || "Maroc") + '</span></td>',
            '<td><span class="contract-badge cdi">CDI</span></td>',
            '<td><span class="status-badge active">Actif</span></td>',
            '<td style="font-weight:600">' + (18 + index * 3) + '</td>',
            '<td style="color:var(--text-light)">Database</td>',
            '<td><button class="table-action"><i class="bx bx-dots-vertical-rounded"></i></button></td>'
        ].join("");
        row.addEventListener("click", function () { selectLiveOffer(opportunity, row); });
        row.querySelectorAll("button, input").forEach(function (control) {
            control.addEventListener("click", function (event) { event.stopPropagation(); });
        });
        return row;
    }

    function selectLiveOffer(opportunity, row) {
        document.querySelectorAll("#tableBody tr").forEach(function (tr) { tr.classList.remove("selected"); });
        row.classList.add("selected");
        const panel = document.getElementById("detailPanel");
        if (panel) panel.classList.remove("hidden");
        const overlay = document.getElementById("panelOverlay");
        if (overlay && window.innerWidth <= 1024) overlay.classList.add("active");
        const desc = document.querySelector("#tab-infos .desc-text");
        if (desc) desc.textContent = cleanText(opportunity.description, "Aucune description disponible.");
        setInfoRows({
            Entreprise: opportunity.company || "N/A",
            Localisation: opportunity.location || "Maroc",
            Contrat: "CDI",
            "Mode de travail": opportunity.source || "Database",
            "Date de publication": "Database"
        });
    }

    function setInfoRows(values) {
        document.querySelectorAll("#tab-infos .info-row").forEach(function (row) {
            const label = cleanText(row.querySelector(".label") && row.querySelector(".label").textContent, "");
            Object.keys(values).forEach(function (key) {
                if (core.normalize(label) === core.normalize(key)) {
                    const value = row.querySelector(".value");
                    if (value) value.textContent = values[key];
                }
            });
        });
    }

    function hydrateAdminOffers() {
        if (!pathIncludes("/admin/offres.html") || !state.opportunities.length) return;
        const tbody = document.getElementById("tableBody");
        if (!tbody) return;
        tbody.textContent = "";
        const fragment = document.createDocumentFragment();
        state.opportunities.slice(0, 50).forEach(function (opportunity, index) {
            fragment.appendChild(offerRow(opportunity, index));
        });
        tbody.appendChild(fragment);
    }

    function hydrateAdminCompanies() {
        if (!pathIncludes("/admin/entreprises.html") || !state.opportunities.length) return;
        const companies = uniqueCompanies(state.opportunities).slice(0, 50);
        const tbody = document.getElementById("tableBody");
        if (!tbody) return;
        tbody.innerHTML = companies.map(function (company, index) {
            return '<tr data-id="' + company.id + '"><td><input type="radio" name="company" class="radio-btn" ' + (index === 0 ? "checked" : "") + '></td><td><div class="company-cell"><div class="company-logo acme">' + escapeHTML(firstLetter(company.name)) + '</div><div><div class="cname">' + escapeHTML(company.name) + '</div><div class="cemail">' + escapeHTML(company.email) + '</div></div></div></td><td><span class="sector-badge"><i class="bx bx-laptop"></i> ' + escapeHTML(company.sector) + '</span></td><td style="color:var(--text-secondary)">Database</td><td><span class="plan-badge pro">Pro</span></td><td><span class="status-badge active">Actif</span></td><td><span class="location-badge"><i class="bx bx-map-pin"></i> ' + escapeHTML(company.location) + '</span></td><td style="color:var(--text-light)">' + company.activeOffers + ' offres</td><td><button class="table-action"><i class="bx bx-dots-vertical-rounded"></i></button></td></tr>';
        }).join("");
    }

    function roleLabel(role) {
        const key = core.normalize(role);
        if (key === "admin") return "Admin";
        if (key === "recruiter") return "Recruteur";
        return "Utilisateur";
    }

    function hydrateAdminUsers() {
        if (!pathIncludes("/admin/users.html") || !state.users.length) return;
        const tbody = document.getElementById("tableBody");
        if (!tbody) return;
        tbody.textContent = "";
        state.users.forEach(function (user, index) {
            const row = document.createElement("tr");
            row.dataset.id = user.id || user.id_user;
            row.innerHTML = '<td><input type="checkbox" class="table-checkbox row-checkbox"></td><td><div class="user-cell"><div class="user-avatar">' + escapeHTML(initials(user.name)) + '</div><div><div class="name">' + escapeHTML(user.name) + '</div><div class="email">' + escapeHTML(user.email) + '</div></div></div></td><td><span class="role-badge ' + escapeHTML(user.role || "user") + '">' + escapeHTML(roleLabel(user.role)) + '</span></td><td style="font-size:13px;color:var(--text-secondary)">TheWay DB</td><td><span class="status-badge active">Actif</span></td><td style="font-size:12.5px;color:var(--text-light)">Database</td><td><button class="table-action"><i class="bx bx-dots-vertical-rounded"></i></button></td>';
            row.addEventListener("click", function () { selectLiveUser(user, row); });
            row.querySelectorAll("button, input").forEach(function (control) {
                control.addEventListener("click", function (event) { event.stopPropagation(); });
            });
            tbody.appendChild(row);
        });
    }

    function initials(name) {
        return String(name || "TW").split(/\s+/).filter(Boolean).slice(0, 2).map(function (part) {
            return part.charAt(0).toUpperCase();
        }).join("");
    }

    function selectLiveUser(user, row) {
        document.querySelectorAll("#tableBody tr").forEach(function (tr) { tr.classList.remove("selected"); });
        row.classList.add("selected");
        const panel = document.getElementById("userPanel");
        if (panel) panel.classList.remove("hidden");
        const overlay = document.getElementById("panelOverlay");
        if (overlay && window.innerWidth <= 1024) overlay.classList.add("active");
        const panelUserInfo = document.getElementById("panelUserInfo");
        if (panelUserInfo) {
            panelUserInfo.innerHTML = '<div class="user-avatar">' + escapeHTML(initials(user.name)) + '</div><div><div class="name">' + escapeHTML(user.name) + ' <span class="role-tag">' + escapeHTML(roleLabel(user.role)) + '</span></div><div class="email">' + escapeHTML(user.email) + '</div><div class="status-dot">Actif</div></div>';
        }
        const personalInfo = document.getElementById("personalInfo");
        if (personalInfo) {
            personalInfo.innerHTML = infoRow("Nom complet", user.name) + infoRow("Email", user.email) + infoRow("Telephone", user.telephone || "N/A") + infoRow("Localisation", user.localisation || "N/A");
        }
        const roleInfo = document.getElementById("roleInfo");
        if (roleInfo) roleInfo.innerHTML = infoRow("Role", roleLabel(user.role)) + infoRow("Entreprise", "TheWay DB");
        const accountStatus = document.getElementById("accountStatus");
        if (accountStatus) accountStatus.innerHTML = infoRow("Statut", "Actif") + infoRow("Inscription", formatDate(user.date_inscription));
    }

    function infoRow(label, value) {
        return '<div class="info-row"><span class="label">' + escapeHTML(label) + '</span><span class="value">' + escapeHTML(value) + '</span></div>';
    }

    function formatDate(value) {
        if (!value) return "N/A";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleDateString("fr-FR");
    }

    function hydrateAdminSkills() {
        if (!pathIncludes("/admin/competences.html") || !state.skills.length) return;
        const tbody = document.getElementById("tableBody");
        if (!tbody) return;
        tbody.textContent = "";
        state.skills.slice(0, 80).forEach(function (skill, index) {
            const trend = Number(skill.trend || 10);
            const demand = Number(skill.demand || 0);
            const row = document.createElement("tr");
            row.dataset.id = skill.id || skill.id_skill || index;
            row.innerHTML = '<td><input type="radio" name="skill" class="radio-btn" ' + (index === 0 ? "checked" : "") + '></td><td><div class="skill-cell"><div class="skill-icon" style="background:#eef2ff;color:#3730a3">' + escapeHTML(skillLabel(skill).slice(0, 2).toUpperCase()) + '</div><span class="sname">' + escapeHTML(skillLabel(skill)) + '</span></div></td><td><span class="cat-badge dev">' + escapeHTML(skillCategory(skill)) + '</span></td><td><div class="trend-cell"><span class="trend-value">+ ' + trend + '%</span></div></td><td style="font-weight:600">' + formatNumber(skill.users || demand) + '</td><td style="color:var(--text-secondary)">' + formatNumber(demand) + '</td><td><span class="priority-badge high">' + escapeHTML(skill.priority || "Moyenne") + '</span></td><td><span class="status-badge active">' + escapeHTML(skill.status || "Active") + '</span></td><td><button class="table-action"><i class="bx bx-dots-vertical-rounded"></i></button></td>';
            row.addEventListener("click", function () { selectLiveSkill(skill, row); });
            row.querySelectorAll("button, input").forEach(function (control) {
                control.addEventListener("click", function (event) { event.stopPropagation(); });
            });
            tbody.appendChild(row);
        });
    }

    function selectLiveSkill(skill, row) {
        document.querySelectorAll("#tableBody tr").forEach(function (tr) { tr.classList.remove("selected"); });
        row.classList.add("selected");
        const panel = document.getElementById("detailPanel");
        if (panel) panel.classList.remove("hidden");
        const panelSkill = document.getElementById("panelSkill");
        if (panelSkill) {
            panelSkill.innerHTML = '<div class="icon">' + escapeHTML(skillLabel(skill).slice(0, 2).toUpperCase()) + '</div><div class="info"><div class="name">' + escapeHTML(skillLabel(skill)) + ' <span class="status-tag">' + escapeHTML(skill.status || "Active") + '</span></div><div class="sub">' + escapeHTML(skillCategory(skill)) + ' · Database</div></div>';
        }
        const details = document.getElementById("panelDetails");
        if (details) {
            details.innerHTML = infoRow("Categorie", skillCategory(skill)) + infoRow("Demandes entreprises", formatNumber(skill.demand || 0)) + infoRow("Utilisateurs concernes", formatNumber(skill.users || 0));
        }
    }

    function hydrateProfile() {
        const profile = state.profile && state.profile.profile;
        if (!profile) return;
        const user = {
            id: profile.id_user,
            id_user: profile.id_user,
            fullName: [profile.prenom, profile.nom].filter(Boolean).join(" "),
            email: profile.email,
            phone: profile.telephone || "",
            location: profile.localisation || "",
            role: profile.role || "user"
        };
        core.rememberSessionUser(user);
        if (app.state && typeof app.state.syncProfileFields === "function") {
            app.state.syncProfileFields();
        }
    }

    function hydrateAll() {
        hydrateProfile();
        hydrateCounters();
        hydrateOpportunityCards();
        hydrateOpportunityDetails();
        hydrateUserSkillBlocks();
        hydrateDashboardMatches();
        hydrateAdminOffers();
        hydrateAdminCompanies();
        hydrateAdminUsers();
        hydrateAdminSkills();
        document.dispatchEvent(new CustomEvent("theway:panel-data", { detail: state }));
    }

    function optionalGet(path) {
        return api.get(path).catch(function (error) {
            console.warn("[THEWAY] Dynamic panel data skipped:", path, error.message || error);
            return null;
        });
    }

    function loadPanelData() {
        if (state.loading) return;
        state.loading = true;
        const hasToken = Boolean(core.storageValue("theway_token"));
        Promise.all([
            optionalGet("api/panel/summary"),
            optionalGet("api/opportunities"),
            optionalGet("api/panel/skills"),
            hasToken ? optionalGet("api/panel/users") : Promise.resolve(null),
            hasToken ? optionalGet("api/profile") : Promise.resolve(null)
        ]).then(function (results) {
            state.summary = results[0];
            state.opportunities = results[1] && Array.isArray(results[1].opportunities) ? results[1].opportunities : [];
            state.skills = results[2] && Array.isArray(results[2].skills) ? results[2].skills : [];
            state.users = results[3] && Array.isArray(results[3].users) ? results[3].users : [];
            state.profile = results[4];
            hydrateAll();
        }).finally(function () {
            state.loading = false;
        });
    }

    app.panelData = {
        init: loadPanelData,
        refresh: loadPanelData,
        state: state
    };
})(window, document);
