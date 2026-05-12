(function (window, document) {
    "use strict";

    const app = window.TheWay || (window.TheWay = {});
    const core = app.core;
    if (!core) return;

    function createDownload(name, content, type) {
        const blob = new Blob([content], { type: type || "text/plain;charset=utf-8" });
        const objectURL = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectURL;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectURL);
    }

    function downloadFor(button, options) {
        const downloadKind = button.dataset.twDownload || button.dataset.twTarget || "export";
        const fileName = downloadKind === "invoice"
            ? "theway-document.pdf"
            : downloadKind === "cv"
                ? "theway-cv.txt"
                : "theway-export.txt";
        createDownload(fileName, "Document genere depuis THEWAY\\nDate: " + new Date().toISOString() + "\\n", "text/plain;charset=utf-8");
        if (!options || !options.silent) core.showMessage("Telechargement prepare.");
    }

    function downloadBlob(blob, fileName) {
        const objectURL = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectURL;
        link.download = fileName || "theway-export.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectURL);
    }

    function uploadFor(button) {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = button.classList.contains("photo-upload-btn") || button.classList.contains("pp-btn") || button.classList.contains("edit-avatar-btn")
            ? "image/*"
            : ".pdf,.doc,.docx,.png,.jpg,.jpeg";
        input.addEventListener("change", function () {
            const file = input.files && input.files[0];
            if (!file) return;
            const payload = {
                page: location.pathname,
                kind: button.dataset.twUpload || button.dataset.twTarget || "file"
            };
            const saveLocalMeta = function (serverFile) {
                core.writeJSON(core.APP_PREFIX + ".lastUpload", {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    at: new Date().toISOString(),
                    serverFile: serverFile || null
                });
            };

            if (!app.api || typeof app.api.upload !== "function") {
                saveLocalMeta(null);
                core.showMessage(file.name + " selectionne.");
                return;
            }

            const task = function () {
                return app.api.upload("file.upload", file, payload).then(function (result) {
                    saveLocalMeta(result.file || null);
                });
            };

            if (app.actionFeedback && typeof app.actionFeedback.runAsyncAction === "function") {
                app.actionFeedback.runAsyncAction(button, {
                    loading: "Envoi...",
                    success: file.name + " televerse.",
                    error: "Upload impossible."
                }, task);
                return;
            }

            task()
                .then(function () { core.showMessage(file.name + " televerse."); })
                .catch(function (error) { core.showMessage("Upload impossible. " + (error.message || "")); });
        });
        input.click();
    }

    function copyWithFallback(value) {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "-1000px";
        textarea.style.left = "-1000px";
        document.body.appendChild(textarea);
        textarea.select();

        let copied = false;
        try {
            copied = document.execCommand("copy");
        } catch (error) {
            copied = false;
        }
        textarea.remove();
        return copied;
    }

    function showCopyFeedback(copied) {
        core.showMessage(copied ? "Copie effectuee." : "Copie impossible depuis ce navigateur.");
    }

    function copyPageValue() {
        const field = document.querySelector("input, textarea");
        const value = field ? field.value : location.href;
        if (!value) {
            showCopyFeedback(false);
            return;
        }

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(value)
                .then(function () { showCopyFeedback(true); })
                .catch(function () { showCopyFeedback(copyWithFallback(value)); });
            return;
        }

        showCopyFeedback(copyWithFallback(value));
    }

    app.actionFiles = {
        downloadFor: downloadFor,
        downloadBlob: downloadBlob,
        uploadFor: uploadFor,
        copyPageValue: copyPageValue
    };
})(window, document);
