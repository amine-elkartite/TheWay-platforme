(function (window, document) {
    "use strict";

    const DEFAULT_API_BASE = "http://localhost:3001";

    function getToken() {
        const keys = ["theway_token", "token", "authToken"];
        for (const key of keys) {
            try {
                const value = localStorage.getItem(key) || sessionStorage.getItem(key);
                if (value) return value;
            } catch (error) {}
        }
        return "";
    }

    function clearToken() {
        ["theway_token", "theway_token_time", "token", "authToken"].forEach(key => {
            try {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            } catch (error) {}
        });
    }

    function apiBase() {
        const configured = window.THEWAY_API_BASE || storageValue("theway_api_base");
        if (configured) return String(configured).replace(/\/$/, "");
        if (window.location.protocol === "file:") return DEFAULT_API_BASE;
        if (["3001", "3002", "3003", "3004"].includes(window.location.port)) return window.location.origin;
        if (window.location.port && window.location.port !== "3001") return DEFAULT_API_BASE;
        return "";
    }

    function storageValue(key) {
        try {
            return localStorage.getItem(key) || sessionStorage.getItem(key) || "";
        } catch (error) {
            return "";
        }
    }

    function endpointUrl(endpoint) {
        const value = String(endpoint || "").trim();
        if (!value) throw new Error("Route API invalide.");
        if (/^https?:\/\//i.test(value)) return value;
        return apiBase() + "/" + value.replace(/^\//, "");
    }

    function showAccessDenied() {
        const existing = document.getElementById("apiAccessDenied");
        if (existing) return;
        const banner = document.createElement("div");
        banner.id = "apiAccessDenied";
        banner.textContent = "Access denied";
        banner.style.cssText = "position:fixed;top:16px;right:16px;z-index:10000;background:#fee2e2;color:#991b1b;border:1px solid #fecaca;border-radius:8px;padding:10px 14px;font:600 13px Inter,Arial,sans-serif;box-shadow:0 12px 30px rgba(15,23,42,.12)";
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 3500);
    }

    function redirectLogin() {
        clearToken();
        const loginPath = "/view/authentification/login.html";
        if (!window.location.pathname.includes("/authentification/")) {
            window.location.assign(loginPath);
        }
    }

    async function parseResponse(response) {
        const text = await response.text();
        let payload = {};
        if (text) {
            try {
                payload = JSON.parse(text);
            } catch (error) {
                payload = { message: text };
            }
        }

        if (response.status === 401) {
            redirectLogin();
            throw new Error((payload && (payload.error || payload.message)) || "Session expiree.");
        }

        if (response.status === 403) {
            showAccessDenied();
            throw new Error((payload && (payload.error || payload.message)) || "Access denied");
        }

        if (!response.ok || payload.ok === false) {
            throw new Error((payload && (payload.error || payload.message)) || "Erreur API " + response.status);
        }

        return payload;
    }

    function headers(json) {
        const result = {};
        if (json) result["Content-Type"] = "application/json";
        const token = getToken();
        if (token) result.Authorization = "Bearer " + token;
        return result;
    }

    async function request(method, endpoint, data, isUpload) {
        const options = {
            method,
            headers: headers(!isUpload && data !== undefined)
        };
        if (data !== undefined) {
            options.body = isUpload ? data : JSON.stringify(data || {});
        }
        return fetch(endpointUrl(endpoint), options).then(parseResponse);
    }

    function apiGet(endpoint) {
        return request("GET", endpoint);
    }

    function apiPost(endpoint, data) {
        return request("POST", endpoint, data);
    }

    function apiPut(endpoint, data) {
        return request("PUT", endpoint, data);
    }

    function apiDelete(endpoint) {
        return request("DELETE", endpoint);
    }

    function apiUpload(endpoint, formData) {
        return request("POST", endpoint, formData, true);
    }

    window.getToken = getToken;
    window.apiGet = apiGet;
    window.apiPost = apiPost;
    window.apiPut = apiPut;
    window.apiDelete = apiDelete;
    window.apiUpload = apiUpload;
    window.TheWayAPI = { getToken, apiGet, apiPost, apiPut, apiDelete, apiUpload };
})(window, document);
