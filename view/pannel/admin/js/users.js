(function (window, document) {
    "use strict";

    const A = window.TheWayAdmin;
    const api = window.TheWayAPI;
    const state = { page: 1, limit: 10, search: "", role: "", users: [], selected: null };

    function roleLabel(role) {
        return { admin: "Admin", recruiter: "Recruteur", user: "Utilisateur" }[role] || A.value(role);
    }

    function avatar(user) {
        if (user.photo) return `<img src="${A.escape(user.photo)}" alt="${A.escape(user.name)}">`;
        return `<div class="user-avatar">${A.escape(A.initials(user.name))}</div>`;
    }

    function row(user) {
        return `
            <tr data-id="${A.escape(user.id)}">
                <td><input type="checkbox" class="table-checkbox row-checkbox"></td>
                <td>
                    <div class="user-cell">${avatar(user)}
                        <div><div class="user-name">${A.escape(user.name)}</div><div class="user-email">${A.escape(user.email)}</div></div>
                    </div>
                </td>
                <td><span class="role-tag">${A.escape(roleLabel(user.role))}</span></td>
                <td>${A.escape(A.value(user.entreprise))}</td>
                <td><span class="status-badge pending">Non renseigne</span></td>
                <td>${A.escape(A.date(user.date_inscription))}</td>
                <td>
                    <button class="table-action" data-action="view" title="Voir"><i class="bx bx-show"></i></button>
                    <button class="table-action" data-action="edit" title="Modifier"><i class="bx bx-edit"></i></button>
                    <button class="table-action" data-action="delete" title="Supprimer"><i class="bx bx-trash"></i></button>
                </td>
            </tr>
        `;
    }

    async function loadDashboardCounters() {
        try {
            const result = A.data(await api.apiGet("/api/admin/dashboard"));
            A.setKpiByLabels(["utilisateurs"], A.number(result.totals && result.totals.users));
            A.setKpiByLabels(["admin"], A.number(state.users.filter(user => user.role === "admin").length));
            A.setKpiByLabels(["recruteur"], A.number(state.users.filter(user => user.role === "recruiter").length));
            A.setKpiByLabels(["entreprises"], A.number(result.totals && result.totals.enterprises));
        } catch (error) {}
    }

    async function load() {
        const tbody = document.getElementById("tableBody");
        A.loading(tbody);
        try {
            const result = A.data(await api.apiGet("/api/admin/users" + A.query({
                page: state.page,
                limit: state.limit,
                search: state.search,
                role: state.role
            })));
            state.users = result.users || [];
            if (!state.users.length) {
                A.empty(tbody);
            } else {
                tbody.innerHTML = state.users.map(row).join("");
            }
            A.updateFooter(result.pagination, "utilisateurs");
            A.renderPagination(document.getElementById("pagination") || document.querySelector(".pagination"), result.pagination, page => {
                state.page = page;
                load();
            });
            loadDashboardCounters();
        } catch (error) {
            A.error(tbody);
        }
    }

    function show(user) {
        state.selected = user;
        document.querySelectorAll("#tableBody tr").forEach(rowNode => rowNode.classList.toggle("selected", rowNode.dataset.id === user.id));
        const panelUserInfo = document.getElementById("panelUserInfo");
        if (panelUserInfo) {
            panelUserInfo.innerHTML = `
                ${avatar(user)}
                <div><div class="name">${A.escape(user.name)} <span class="role-tag">${A.escape(roleLabel(user.role))}</span></div><div class="email">${A.escape(user.email)}</div></div>
            `;
        }
        const personalInfo = document.getElementById("personalInfo");
        if (personalInfo) {
            personalInfo.innerHTML = `
                <div class="info-row"><span class="label">Nom complet</span><span class="value">${A.escape(user.name)}</span></div>
                <div class="info-row"><span class="label">Email</span><span class="value">${A.escape(user.email)}</span></div>
                <div class="info-row"><span class="label">Telephone</span><span class="value">${A.escape(A.value(user.telephone))}</span></div>
                <div class="info-row"><span class="label">Localisation</span><span class="value">${A.escape(A.value(user.localisation))}</span></div>
                <div class="info-row"><span class="label">Inscrit le</span><span class="value">${A.escape(A.date(user.date_inscription))}</span></div>
            `;
        }
        const roleInfo = document.getElementById("roleInfo");
        if (roleInfo) {
            roleInfo.innerHTML = `<div class="info-row"><span class="label">Role</span><span class="value">${A.escape(roleLabel(user.role))}</span></div>`;
        }
        const accountStatus = document.getElementById("accountStatus");
        if (accountStatus) {
            accountStatus.innerHTML = '<div class="info-row"><span class="label">Statut</span><span class="value">Non renseigne</span></div>';
        }
        A.openPanel("#userPanel");
    }

    function fields(includePassword) {
        const items = [
            { name: "prenom", label: "Prenom", required: true },
            { name: "nom", label: "Nom", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "telephone", label: "Telephone" },
            { name: "localisation", label: "Localisation" },
            { name: "photo", label: "URL photo" },
            { name: "role", label: "Role", type: "select", options: [
                { value: "user", label: "Utilisateur" },
                { value: "recruiter", label: "Recruteur" },
                { value: "admin", label: "Admin" }
            ] }
        ];
        if (includePassword) items.push({ name: "password", label: "Mot de passe", type: "password", required: true });
        return items;
    }

    async function createUser() {
        const payload = await A.formDialog("Ajouter un utilisateur", fields(true), { role: "user" });
        if (!payload) return;
        try {
            await api.apiPost("/api/admin/users", payload);
            A.toast("Utilisateur ajoute.");
            load();
        } catch (error) {
            A.toast(error.message, "error");
        }
    }

    async function editUser(user) {
        const payload = await A.formDialog("Modifier l'utilisateur", fields(false), user);
        if (!payload) return;
        try {
            await api.apiPut("/api/admin/users/" + encodeURIComponent(user.id), payload);
            A.toast("Utilisateur mis a jour.");
            load();
        } catch (error) {
            A.toast(error.message, "error");
        }
    }

    async function deleteUser(user) {
        if (!confirm("Supprimer cet utilisateur ?")) return;
        try {
            await api.apiDelete("/api/admin/users/" + encodeURIComponent(user.id));
            A.toast("Utilisateur supprime.");
            A.closePanels();
            load();
        } catch (error) {
            A.toast(error.message, "error");
        }
    }

    function bind() {
        A.disableUnsupported("#statusFilter,#companyFilter,.btn-filters", "Le schema utilisateur ne contient pas ce champ.");
        document.getElementById("searchInput")?.addEventListener("input", A.debounce(event => {
            state.search = event.target.value;
            state.page = 1;
            load();
        }, 250));
        document.getElementById("roleFilter")?.addEventListener("change", event => {
            state.role = event.target.value;
            state.page = 1;
            load();
        });
        document.getElementById("rowsPerPage")?.addEventListener("change", event => {
            state.limit = Number(event.target.value) || 10;
            state.page = 1;
            load();
        });
        document.querySelector(".btn-invite")?.addEventListener("click", createUser);
        document.querySelector("#tableBody")?.addEventListener("click", event => {
            const tr = event.target.closest("tr[data-id]");
            if (!tr) return;
            const user = state.users.find(item => item.id === tr.dataset.id);
            if (!user) return;
            const action = event.target.closest("[data-action]")?.dataset.action || "view";
            if (action === "edit") editUser(user);
            else if (action === "delete") deleteUser(user);
            else show(user);
        });
        document.querySelectorAll(".btn-modifier").forEach(button => {
            button.addEventListener("click", () => state.selected && editUser(state.selected));
        });
        document.querySelector(".btn-delete")?.addEventListener("click", () => state.selected && deleteUser(state.selected));
        document.getElementById("selectAll")?.addEventListener("change", event => {
            document.querySelectorAll(".row-checkbox").forEach(input => { input.checked = event.target.checked; });
        });
    }

    A.ready(() => {
        bind();
        load();
    });
})(window, document);
