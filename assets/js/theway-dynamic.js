(function (window, document) {
    "use strict";

    const currentScript = document.currentScript;
    const basePath = currentScript && currentScript.src
        ? currentScript.src.replace(/[^/]+$/, "")
        : "";
    const moduleFiles = [
        "theway-core.js",
        "theway-routing.js",
        "theway-state.js",
        "theway-ui.js"
    ];

    function loadScript(fileName) {
        return new Promise(function (resolve, reject) {
            const script = document.createElement("script");
            script.src = basePath + fileName;
            script.defer = true;
            script.onload = resolve;
            script.onerror = function () {
                reject(new Error("Unable to load " + fileName));
            };
            document.head.appendChild(script);
        });
    }

    function start() {
        const app = window.TheWay || {};
        if (!app.core) return;

        app.core.ready(function () {
            if (app.routing) app.routing.init();
            if (app.state) app.state.init();
            if (app.ui) app.ui.init();
        });
    }

    moduleFiles
        .reduce(function (chain, fileName) {
            return chain.then(function () { return loadScript(fileName); });
        }, Promise.resolve())
        .then(start)
        .catch(function (error) {
            console.error("[THEWAY] Dynamic layer failed:", error);
        });
})(window, document);
