(function (window) {
    "use strict";

    const app = window.TheWay || (window.TheWay = {});
    const core = app.core;
    if (!core) return;

    const actionEndpoints = {
        "auth.passwordRecovery": "auth-password-recovery",
        "auth.social": "auth-social",
        "draft.create": "draft-create",
        "entity.update": "entity-update",
        "entity.delete": "entity-delete",
        "file.upload": "file-upload",
        "file.export": "file-export",
        "integration.connect": "integration-connect",
        "integration.disconnect": "integration-disconnect",
        "integration.update": "integration-update",
        "opportunity.bookmark": "opportunity-bookmark",
        "process.run": "process-run"
    };

    function endpointFor(action) {
        return actionEndpoints[String(action || "")] || "";
    }

    function resolveBaseURL() {
        return core.apiBase();
    }

    function authToken() {
        return core.storageValue("theway_token");
    }

    function clearAuthToken() {
        try {
            localStorage.removeItem("theway_token");
            localStorage.removeItem("theway_token_time");
        } catch (error) {}
        try {
            sessionStorage.removeItem("theway_token");
        } catch (error) {}
    }

    function authHeaders(json) {
        const headers = {};
        if (json) headers["Content-Type"] = "application/json";
        const token = authToken();
        if (token) headers.Authorization = "Bearer " + token;
        return headers;
    }

    function responseError(response, data) {
        if (response.status === 401) {
            clearAuthToken();
            return new Error("Session expiree. Veuillez vous reconnecter.");
        }
        return new Error((data && (data.error || data.message)) || "Erreur API " + response.status);
    }

    function parseJSON(response) {
        return response.json().catch(function () {
            return {};
        }).then(function (data) {
            if (!response.ok || data.ok === false) throw responseError(response, data);
            return data;
        });
    }

    function parseBlob(response) {
        if (response.ok) {
            return response.blob().then(function (blob) {
                const disposition = response.headers.get("content-disposition") || "";
                const match = disposition.match(/filename="?([^"]+)"?/i);
                return {
                    ok: true,
                    blob: blob,
                    filename: match ? match[1] : "theway-export.csv"
                };
            });
        }
        return response.text().then(function (text) {
            let data = {};
            try {
                data = JSON.parse(text);
            } catch (error) {
                data = { error: text };
            }
            throw responseError(response, data);
        });
    }

    function request(action, payload) {
        const endpoint = endpointFor(action);
        if (!endpoint) {
            return Promise.reject(new Error("Action API invalide."));
        }

        return fetch(resolveBaseURL() + "/" + endpoint, {
            method: "POST",
            headers: authHeaders(true),
            body: JSON.stringify(payload || {})
        }).then(parseJSON);
    }

    function get(path) {
        const cleanPath = String(path || "").replace(/^\//, "");
        if (!cleanPath) {
            return Promise.reject(new Error("Route API invalide."));
        }
        return fetch(resolveBaseURL() + "/" + cleanPath, {
            method: "GET",
            headers: authHeaders(false)
        }).then(parseJSON);
    }

    function upload(action, file, payload) {
        const endpoint = endpointFor(action);
        if (!endpoint || !file) {
            return Promise.reject(new Error("Upload API invalide."));
        }

        const body = new FormData();
        body.append("file", file);
        Object.keys(payload || {}).forEach(function (key) {
            body.append(key, payload[key]);
        });

        return fetch(resolveBaseURL() + "/" + endpoint, {
            method: "POST",
            headers: authHeaders(false),
            body: body
        }).then(parseJSON);
    }

    function download(action, payload) {
        const endpoint = endpointFor(action);
        if (!endpoint) {
            return Promise.reject(new Error("Export API invalide."));
        }

        return fetch(resolveBaseURL() + "/" + endpoint, {
            method: "POST",
            headers: authHeaders(true),
            body: JSON.stringify(payload || {})
        }).then(parseBlob);
    }

    app.api = {
        baseURL: resolveBaseURL,
        request: request,
        get: get,
        upload: upload,
        download: download
    };
})(window);
