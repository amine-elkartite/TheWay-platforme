(function (window, document) {
    "use strict";

    const app = window.TheWay || (window.TheWay = {});
    const APP_PREFIX = "theway";
    const storage = window.sessionStorage;

    const context = {
        isAdminArea: location.pathname.includes("/admin/"),
        isAdminSettings: location.pathname.includes("/admin/settings/"),
        isUserSettings: location.pathname.includes("/pannel/settings/"),
        isPanel: location.pathname.includes("/pannel/"),
        isAuth: location.pathname.includes("/authentification/"),
        isPublic: location.pathname.includes("/public/")
    };

    const defaultUser = {
        fullName: "Amine ELKARTITE",
        email: "aminezth022@gmail.com",
        phone: "+212 712 345 678",
        location: "Taza, Maroc",
        jobTitle: "Developpeur Full Stack",
        role: "Candidat"
    };

    const adminUser = {
        fullName: "Admin TheWay",
        email: "admin@theway.local",
        role: "Administrateur"
    };

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

    function readJSON(key, fallback) {
        try {
            const raw = storage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            console.warn("Storage read failed:", key, error);
            return fallback;
        }
    }

    function writeJSON(key, value) {
        try {
            storage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn("Storage write failed:", key, error);
        }
    }

    function resolveURL(relativePath) {
        return new URL(relativePath, location.href).href;
    }

    function goTo(relativePath) {
        if (!relativePath) return;
        const target = resolveURL(relativePath);
        if (target !== location.href) {
            location.assign(target);
        }
    }

    function authPath(fileName) {
        if (context.isAuth) return fileName;
        if (context.isPublic) return "../authentification/" + fileName;
        if (context.isAdminSettings) return "../../../authentification/" + fileName;
        if (context.isAdminArea) return "../../authentification/" + fileName;
        if (context.isUserSettings) return "../../authentification/" + fileName;
        if (context.isPanel) return "../authentification/" + fileName;
        return "view/authentification/" + fileName;
    }

    function userPanelPath(fileName) {
        if (context.isUserSettings) return "../" + fileName;
        if (context.isPanel && !context.isAdminArea) return fileName;
        if (context.isAuth || context.isPublic) return "../pannel/" + fileName;
        return "../" + fileName;
    }

    function userSettingsPath(fileName) {
        if (context.isUserSettings) return fileName;
        if (context.isPanel && !context.isAdminArea) return "settings/" + fileName;
        if (context.isAuth || context.isPublic) return "../pannel/settings/" + fileName;
        return "settings/" + fileName;
    }

    function adminPath(fileName) {
        if (context.isAdminSettings) return "../" + fileName;
        if (context.isAdminArea) return fileName;
        if (context.isPanel) return "admin/" + fileName;
        return "../pannel/admin/" + fileName;
    }

    function adminSettingsPath(fileName) {
        if (context.isAdminSettings) return fileName;
        if (context.isAdminArea) return "settings/" + fileName;
        if (context.isPanel) return "admin/settings/" + fileName;
        return "../pannel/admin/settings/" + fileName;
    }

    function getCurrentUser() {
        const current = readJSON(APP_PREFIX + ".currentUser", null);
        if (current) return current;
        return context.isAdminArea ? adminUser : defaultUser;
    }

    function rememberSessionUser(user) {
        writeJSON(APP_PREFIX + ".currentUser", user);
    }

    function showMessage(message) {
        if (typeof window.showToast === "function") {
            try {
                window.showToast(message);
                return;
            } catch (error) {
                console.warn("Toast failed:", error);
            }
        }

        const toast = document.getElementById("toast") || document.querySelector(".toast");
        const toastMessage = document.getElementById("toastMessage");
        if (toast) {
            if (toastMessage) {
                toastMessage.textContent = message;
            } else {
                toast.textContent = message;
            }
            toast.classList.add("show", "is-visible");
            setTimeout(function () {
                toast.classList.remove("show", "is-visible");
            }, 2600);
            return;
        }

        console.info("[THEWAY]", message);
    }

    app.core = {
        APP_PREFIX: APP_PREFIX,
        CURRENT_USER_KEY: APP_PREFIX + ".currentUser",
        SAVED_LINKS_KEY: APP_PREFIX + ".savedOpportunities",
        context: context,
        defaultUser: defaultUser,
        adminUser: adminUser,
        ready: ready,
        normalize: normalize,
        readJSON: readJSON,
        writeJSON: writeJSON,
        resolveURL: resolveURL,
        goTo: goTo,
        authPath: authPath,
        userPanelPath: userPanelPath,
        userSettingsPath: userSettingsPath,
        adminPath: adminPath,
        adminSettingsPath: adminSettingsPath,
        getCurrentUser: getCurrentUser,
        rememberSessionUser: rememberSessionUser,
        showMessage: showMessage
    };
})(window, document);
