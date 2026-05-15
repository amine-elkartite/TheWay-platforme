(function (window, document) {
    "use strict";

    const Admin = window.TheWayAdmin || (window.TheWayAdmin = {});
    const routeMap = [
        ["tableau de bord", "/view/pannel/admin/admin-dashboard.html"],
        ["utilisateurs", "/view/pannel/admin/users.html"],
        ["entreprises", "/view/pannel/admin/entreprises.html"],
        ["offres", "/view/pannel/admin/offres.html"],
        ["matching ia", "/view/pannel/admin/matching.html"],
        ["competences", "/view/pannel/admin/competences.html"],
        ["analyses", "/view/pannel/admin/analyse.html"],
        ["abonnements", "/view/pannel/admin/abonnements.html"],
        ["support", "/view/pannel/admin/support.html"],
        ["parametres", "/view/pannel/admin/settings/generale.html"]
    ];

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }

    function escape(value) {
        return String(value === undefined || value === null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function value(input, fallback) {
        const text = String(input === undefined || input === null ? "" : input).trim();
        return text || fallback || "Non renseigne";
    }

    function number(input) {
        return Number(input || 0).toLocaleString("fr-FR");
    }

    function money(input) {
        return Number(input || 0).toLocaleString("fr-FR", { style: "currency", currency: "MAD" });
    }

    function date(input) {
        if (!input) return "Non renseigne";
        const parsed = new Date(input);
        if (Number.isNaN(parsed.getTime())) return value(input);
        return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(parsed);
    }

    function dateTime(input) {
        if (!input) return "Non renseigne";
        const parsed = new Date(input);
        if (Number.isNaN(parsed.getTime())) return value(input);
        return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
    }

    function initials(input) {
        const parts = String(input || "TW").trim().split(/\s+/).filter(Boolean);
        return (parts[0] || "T").charAt(0).toUpperCase() + (parts[1] || parts[0] || "W").charAt(0).toUpperCase();
    }

    function badgeClass(status) {
        const key = normalize(status);
        if (["active", "actif", "enabled", "open", "ouvert", "haute", "high"].includes(key)) return "active";
        if (["pending", "en attente", "normal", "medium"].includes(key)) return "pending";
        if (["closed", "ferme", "inactive", "inactif", "disabled", "suspended"].includes(key)) return "inactive";
        return "pending";
    }

    function tableColspan(tbody) {
        const table = tbody && tbody.closest("table");
        return table ? Math.max(1, table.querySelectorAll("thead th").length) : 6;
    }

    function setRows(tbody, html) {
        if (!tbody) return;
        tbody.innerHTML = html;
    }

    function loading(tbody, message) {
        setRows(tbody, `<tr><td colspan="${tableColspan(tbody)}" style="text-align:center;color:var(--text-secondary);padding:28px">${escape(message || "Chargement des donnees...")}</td></tr>`);
    }

    function empty(tbody, message) {
        setRows(tbody, `<tr><td colspan="${tableColspan(tbody)}" style="text-align:center;color:var(--text-light);padding:30px">${escape(message || "Aucune donnee trouvee.")}</td></tr>`);
    }

    function error(tbody, message) {
        setRows(tbody, `<tr><td colspan="${tableColspan(tbody)}" style="text-align:center;color:#ef4444;padding:30px">${escape(message || "Impossible de charger les donnees. Verifiez le serveur API.")}</td></tr>`);
    }

    function data(payload) {
        return payload && payload.data ? payload.data : payload;
    }

    function query(params) {
        const url = new URLSearchParams();
        Object.keys(params || {}).forEach(key => {
            const val = params[key];
            if (val !== undefined && val !== null && String(val).trim() !== "") url.set(key, val);
        });
        const text = url.toString();
        return text ? "?" + text : "";
    }

    function updateFooter(pagination, noun) {
        const total = Number(pagination && pagination.total) || 0;
        const limit = Number(pagination && pagination.limit) || 10;
        const page = Number(pagination && pagination.page) || 1;
        const start = total ? (page - 1) * limit + 1 : 0;
        const end = Math.min(total, page * limit);
        document.querySelectorAll(".table-footer-info").forEach(footer => {
            footer.innerHTML = `Affichage de <strong>${number(start)} a ${number(end)}</strong> sur <strong>${number(total)}</strong> ${escape(noun || "elements")}`;
        });
    }

    function renderPagination(container, pagination, onPage) {
        if (!container) return;
        const total = Number(pagination && pagination.total) || 0;
        const limit = Number(pagination && pagination.limit) || 10;
        const page = Number(pagination && pagination.page) || 1;
        const pages = Math.max(1, Math.ceil(total / limit));
        container.innerHTML = "";

        function button(label, target, active, disabled) {
            const btn = document.createElement("button");
            btn.className = "page-btn" + (active ? " active" : "");
            btn.innerHTML = label;
            btn.disabled = Boolean(disabled);
            btn.addEventListener("click", () => {
                if (!disabled && target !== page) onPage(target);
            });
            container.appendChild(btn);
        }

        button('<i class="bx bx-chevron-left"></i>', Math.max(1, page - 1), false, page <= 1);
        const shown = new Set([1, pages, page, page - 1, page + 1]);
        let previous = 0;
        Array.from(shown).filter(item => item >= 1 && item <= pages).sort((a, b) => a - b).forEach(item => {
            if (previous && item - previous > 1) {
                const dots = document.createElement("button");
                dots.className = "page-btn dots";
                dots.textContent = "...";
                dots.disabled = true;
                container.appendChild(dots);
            }
            button(String(item), item, item === page, false);
            previous = item;
        });
        button('<i class="bx bx-chevron-right"></i>', Math.min(pages, page + 1), false, page >= pages);
    }

    function debounce(callback, wait) {
        let timer = null;
        return function () {
            clearTimeout(timer);
            const args = arguments;
            timer = setTimeout(() => callback.apply(this, args), wait || 250);
        };
    }

    function toast(message, type) {
        const toastNode = document.createElement("div");
        toastNode.textContent = message;
        toastNode.style.cssText = "position:fixed;bottom:18px;right:18px;z-index:10000;border-radius:8px;padding:11px 14px;font:600 13px Inter,Arial,sans-serif;box-shadow:0 18px 40px rgba(15,23,42,.18);background:" + (type === "error" ? "#fee2e2;color:#991b1b;border:1px solid #fecaca" : "#ecfdf5;color:#166534;border:1px solid #bbf7d0");
        document.body.appendChild(toastNode);
        setTimeout(() => toastNode.remove(), 2800);
    }

    function closePanels() {
        document.querySelectorAll("#detailPanel,#userPanel").forEach(panel => panel.classList.add("hidden"));
        document.querySelectorAll("#panelOverlay,.panel-overlay,.user-panel-overlay").forEach(overlay => overlay.classList.remove("active"));
        document.querySelectorAll("tbody tr.selected").forEach(row => row.classList.remove("selected"));
    }

    function openPanel(selector) {
        const panel = document.querySelector(selector || "#detailPanel") || document.getElementById("userPanel");
        if (panel) panel.classList.remove("hidden");
        if (window.innerWidth <= 1024) {
            const overlay = document.getElementById("panelOverlay") || document.querySelector(".panel-overlay,.user-panel-overlay");
            if (overlay) overlay.classList.add("active");
        }
    }

    function setKpiByLabels(labels, val) {
        const normalized = labels.map(normalize);
        document.querySelectorAll(".kpi-card,.stat-card,.metric-card,.bottom-stat-card,.perf-card").forEach(card => {
            const text = normalize(card.textContent);
            if (!normalized.some(label => text.includes(label))) return;
            const target = card.querySelector(".kpi-value,.stat-info h3,.value,.pvalue");
            if (!target) return;
            const change = target.querySelector(".kpi-change");
            target.textContent = val;
            if (change) target.appendChild(change);
        });
    }

    function setStaticSelect(select, options, firstLabel) {
        if (!select) return;
        const current = select.value;
        select.innerHTML = `<option value="">${escape(firstLabel)}</option>` + options.map(option => `<option value="${escape(option.value)}">${escape(option.label)}</option>`).join("");
        if (Array.from(select.options).some(option => option.value === current)) select.value = current;
    }

    function disableUnsupported(selector, reason) {
        document.querySelectorAll(selector).forEach(node => {
            node.disabled = true;
            node.title = reason || "Fonction indisponible avec le schema actuel.";
            node.style.cursor = "not-allowed";
        });
    }

    function formDialog(title, fields, initial) {
        ensureModalStyles();
        return new Promise(resolve => {
            const backdrop = document.createElement("div");
            backdrop.className = "admin-modal-backdrop";
            const body = fields.map(field => {
                const val = initial && initial[field.name] !== undefined ? initial[field.name] : (field.value || "");
                if (field.type === "select") {
                    return `<label>${escape(field.label)}<select name="${escape(field.name)}" ${field.required ? "required" : ""}>${(field.options || []).map(option => `<option value="${escape(option.value)}" ${String(option.value) === String(val) ? "selected" : ""}>${escape(option.label)}</option>`).join("")}</select></label>`;
                }
                if (field.type === "textarea") {
                    return `<label>${escape(field.label)}<textarea name="${escape(field.name)}" ${field.required ? "required" : ""}>${escape(val)}</textarea></label>`;
                }
                return `<label>${escape(field.label)}<input type="${escape(field.type || "text")}" name="${escape(field.name)}" value="${escape(val)}" ${field.required ? "required" : ""}></label>`;
            }).join("");
            backdrop.innerHTML = `
                <form class="admin-modal">
                    <div class="admin-modal-header">
                        <h3>${escape(title)}</h3>
                        <button type="button" class="admin-modal-close"><i class="bx bx-x"></i></button>
                    </div>
                    <div class="admin-modal-body">${body}</div>
                    <div class="admin-modal-actions">
                        <button type="button" class="admin-modal-cancel">Annuler</button>
                        <button type="submit">Enregistrer</button>
                    </div>
                </form>
            `;
            document.body.appendChild(backdrop);
            const close = result => {
                backdrop.remove();
                resolve(result);
            };
            backdrop.querySelector(".admin-modal-close").addEventListener("click", () => close(null));
            backdrop.querySelector(".admin-modal-cancel").addEventListener("click", () => close(null));
            backdrop.addEventListener("click", event => {
                if (event.target === backdrop) close(null);
            });
            backdrop.querySelector("form").addEventListener("submit", event => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const result = {};
                fields.forEach(field => {
                    result[field.name] = formData.get(field.name);
                });
                close(result);
            });
        });
    }

    function ensureModalStyles() {
        if (document.getElementById("adminDynamicModalStyles")) return;
        const style = document.createElement("style");
        style.id = "adminDynamicModalStyles";
        style.textContent = `
            .admin-modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.35);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px}
            .admin-modal{width:min(520px,100%);background:#fff;border-radius:8px;box-shadow:0 24px 70px rgba(15,23,42,.28);overflow:hidden}
            .admin-modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--border,#e5e7eb)}
            .admin-modal-header h3{margin:0;font-size:16px;color:var(--text-primary,#0f172a)}
            .admin-modal-close{border:0;background:transparent;font-size:22px;cursor:pointer;color:var(--text-secondary,#64748b)}
            .admin-modal-body{display:grid;gap:12px;padding:18px}
            .admin-modal-body label{display:grid;gap:6px;font-size:12px;font-weight:700;color:var(--text-secondary,#64748b)}
            .admin-modal-body input,.admin-modal-body select,.admin-modal-body textarea{border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:10px 11px;font:500 13px Inter,Arial,sans-serif;color:var(--text-primary,#0f172a)}
            .admin-modal-body textarea{min-height:90px;resize:vertical}
            .admin-modal-actions{display:flex;justify-content:flex-end;gap:10px;padding:14px 18px;border-top:1px solid var(--border,#e5e7eb);background:#f8fafc}
            .admin-modal-actions button{border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:9px 13px;font-weight:700;cursor:pointer;background:#fff;color:var(--text-primary,#0f172a)}
            .admin-modal-actions button[type=submit]{background:var(--accent,#f59e0b);border-color:var(--accent,#f59e0b);color:#111827}
        `;
        document.head.appendChild(style);
    }

    function ensureBaseStyles() {
        if (document.getElementById("adminDynamicBaseStyles")) return;
        const style = document.createElement("style");
        style.id = "adminDynamicBaseStyles";
        style.textContent = `
            .user-avatar,.company-cell .logo,.validation-logo{flex:0 0 auto;width:36px;height:36px;border-radius:8px;background:#0a1628;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;letter-spacing:0}
            .user-cell,.company-cell{display:flex;align-items:center;gap:10px;min-width:0}
            .user-cell img{flex:0 0 auto;width:36px;height:36px;border-radius:50%;object-fit:cover}
            .user-name,.company-name,.name{font-weight:700;color:var(--text-primary,#1e293b);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:240px}
            .user-email,.company-email,.email{font-size:12px;color:var(--text-light,#94a3b8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px}
            .data-table td:last-child{white-space:nowrap}
            .table-action{width:30px;height:30px;border:0;border-radius:8px;background:transparent;color:var(--text-light,#94a3b8);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;vertical-align:middle}
            .table-action:hover{background:#f1f5f9;color:var(--text-primary,#1e293b)}
            .table-action:disabled{opacity:.45;cursor:not-allowed}
            .score-badge,.skill-tag{display:inline-flex;align-items:center;border-radius:999px;padding:4px 9px;font-size:12px;font-weight:700;background:var(--blue-bg,#eff6ff);color:var(--blue,#3b82f6);margin:2px}
            .page-btn:disabled{opacity:.45;cursor:not-allowed}
            .admin-empty-state{color:var(--text-light,#94a3b8);font-size:13px;padding:18px;text-align:center}
        `;
        document.head.appendChild(style);
    }

    function downloadCsv(filename, rows) {
        const csv = rows.map(row => row.map(cell => `"${String(cell === undefined || cell === null ? "" : cell).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    async function updateNotificationBadge() {
        const api = window.TheWayAPI;
        if (!api || !api.apiGet || !api.getToken()) return;
        try {
            const result = data(await api.apiGet("/api/admin/notifications?limit=1"));
            const count = Number(result.unread) || 0;
            document.querySelectorAll(".badge,.notification-badge").forEach(badge => {
                badge.textContent = number(count);
                badge.style.display = count ? "" : "none";
            });
        } catch (error) {}
    }

    async function showNotifications() {
        const api = window.TheWayAPI;
        if (!api || !api.apiGet) return;
        try {
            const result = data(await api.apiGet("/api/admin/notifications?limit=8"));
            const list = result.notifications || [];
            ensureModalStyles();
            const backdrop = document.createElement("div");
            backdrop.className = "admin-modal-backdrop";
            backdrop.innerHTML = `
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <h3>Notifications</h3>
                        <div style="display:flex;align-items:center;gap:8px">
                            <button type="button" class="admin-notification-create" style="border:1px solid var(--border,#e5e7eb);border-radius:8px;background:var(--accent,#f59e0b);padding:8px 10px;font-weight:700;cursor:pointer">Nouvelle</button>
                            <button type="button" class="admin-modal-close"><i class="bx bx-x"></i></button>
                        </div>
                    </div>
                    <div class="admin-modal-body">
                        ${list.length ? list.map(item => `
                            <div data-notification-id="${escape(item.id_notification)}" style="border-bottom:1px solid var(--border,#e5e7eb);padding-bottom:10px">
                                <strong>${escape(value(item.type, "info"))}</strong>
                                <div style="color:var(--text-secondary);font-size:13px;margin-top:4px">${escape(value(item.message))}</div>
                                <div style="color:var(--text-light);font-size:12px;margin-top:4px">${escape(dateTime(item.date_notification || item.created_at))}</div>
                                <div style="display:flex;gap:8px;margin-top:8px">
                                    <button type="button" data-notification-action="read" ${item.lu ? "disabled" : ""} style="border:1px solid var(--border,#e5e7eb);border-radius:8px;background:#fff;padding:6px 9px;font-weight:700;cursor:pointer">Lu</button>
                                    <button type="button" data-notification-action="delete" style="border:1px solid #fecaca;border-radius:8px;background:#fee2e2;color:#991b1b;padding:6px 9px;font-weight:700;cursor:pointer">Supprimer</button>
                                </div>
                            </div>
                        `).join("") : '<div style="color:var(--text-light);padding:12px">Aucune donnee trouvee.</div>'}
                    </div>
                </div>
            `;
            document.body.appendChild(backdrop);
            backdrop.querySelector(".admin-modal-close").addEventListener("click", () => backdrop.remove());
            backdrop.querySelector(".admin-notification-create").addEventListener("click", async () => {
                backdrop.remove();
                const payload = await formDialog("Nouvelle notification", [
                    { name: "type", label: "Type", value: "info" },
                    { name: "message", label: "Message", type: "textarea", required: true }
                ], { type: "info" });
                if (!payload) return;
                try {
                    await api.apiPost("/api/admin/notifications", payload);
                    toast("Notification creee.");
                    updateNotificationBadge();
                    showNotifications();
                } catch (error) {
                    toast(error.message, "error");
                }
            });
            backdrop.addEventListener("click", async event => {
                const action = event.target.closest("[data-notification-action]");
                if (!action) return;
                const item = action.closest("[data-notification-id]");
                const id = item && item.dataset.notificationId;
                if (!id) return;
                try {
                    if (action.dataset.notificationAction === "read") {
                        await api.apiPut("/api/admin/notifications/" + encodeURIComponent(id), { lu: true });
                        toast("Notification marquee comme lue.");
                    } else {
                        await api.apiDelete("/api/admin/notifications/" + encodeURIComponent(id));
                        toast("Notification supprimee.");
                    }
                    backdrop.remove();
                    updateNotificationBadge();
                    showNotifications();
                } catch (error) {
                    toast(error.message, "error");
                }
            });
            backdrop.addEventListener("click", event => {
                if (event.target === backdrop) backdrop.remove();
            });
        } catch (error) {
            toast("Impossible de charger les donnees. Verifiez le serveur API.", "error");
        }
    }

    function initShell() {
        ensureBaseStyles();
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("sidebarOverlay") || document.getElementById("panelOverlay");
        const toggle = document.getElementById("menuToggle");
        if (toggle && sidebar && overlay) {
            toggle.addEventListener("click", () => {
                sidebar.classList.toggle("open");
                overlay.classList.toggle("active");
            });
            overlay.addEventListener("click", () => {
                sidebar.classList.remove("open");
                overlay.classList.remove("active");
                closePanels();
            });
        }

        document.querySelectorAll(".nav-item").forEach(item => {
            const label = normalize(item.textContent);
            const route = routeMap.find(entry => label.includes(entry[0]));
            if (route) item.setAttribute("href", route[1]);
            if (label.includes("deconnexion")) {
                item.addEventListener("click", event => {
                    event.preventDefault();
                    ["theway_token", "theway_token_time"].forEach(key => {
                        try {
                            localStorage.removeItem(key);
                            sessionStorage.removeItem(key);
                        } catch (error) {}
                    });
                    location.assign("/view/authentification/login.html");
                });
            }
        });

        document.querySelectorAll("#panelClose,.panel-close").forEach(button => {
            button.addEventListener("click", closePanels);
        });

        document.querySelectorAll(".panel-tab,.tab-item").forEach(tab => {
            tab.addEventListener("click", () => {
                const group = tab.classList.contains("tab-item") ? ".tab-item" : ".panel-tab";
                document.querySelectorAll(group).forEach(item => item.classList.remove("active"));
                tab.classList.add("active");
                const key = tab.dataset.tab;
                const candidates = [key, key === "compte" ? "general" : key, key === "securite" ? "security" : key, key === "confidentialite" ? "privacy" : key];
                const content = candidates.map(candidate => document.getElementById("tab-" + candidate)).find(Boolean);
                if (content) {
                    document.querySelectorAll(".tab-content").forEach(item => {
                        item.classList.remove("active");
                        item.style.display = "none";
                    });
                    content.classList.add("active");
                    content.style.display = "";
                }
            });
        });

        document.querySelectorAll(".btn-plan").forEach(button => {
            button.addEventListener("click", () => location.assign("/view/pannel/admin/abonnements.html"));
        });
        document.querySelectorAll(".header-btn").forEach(button => {
            button.addEventListener("click", showNotifications);
        });
        updateNotificationBadge();
    }

    Admin.ready = ready;
    Admin.normalize = normalize;
    Admin.escape = escape;
    Admin.value = value;
    Admin.number = number;
    Admin.money = money;
    Admin.date = date;
    Admin.dateTime = dateTime;
    Admin.initials = initials;
    Admin.badgeClass = badgeClass;
    Admin.loading = loading;
    Admin.empty = empty;
    Admin.error = error;
    Admin.data = data;
    Admin.query = query;
    Admin.updateFooter = updateFooter;
    Admin.renderPagination = renderPagination;
    Admin.debounce = debounce;
    Admin.toast = toast;
    Admin.closePanels = closePanels;
    Admin.openPanel = openPanel;
    Admin.setKpiByLabels = setKpiByLabels;
    Admin.setStaticSelect = setStaticSelect;
    Admin.disableUnsupported = disableUnsupported;
    Admin.formDialog = formDialog;
    Admin.downloadCsv = downloadCsv;
    Admin.updateNotificationBadge = updateNotificationBadge;
    Admin.initShell = initShell;

    ready(initShell);
})(window, document);
