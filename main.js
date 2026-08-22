const consoleTerminal = document.getElementById('consoleTerminal');

function appendConsole(message, isError = false) {
    if (!consoleTerminal) return;
    const time = new Date().toLocaleTimeString();
    if (consoleTerminal.innerText.includes("Waiting for build initialization...")) {
        consoleTerminal.innerText = "";
    }
    consoleTerminal.innerText += `[${time}] ${message}\n`;
    consoleTerminal.scrollTop = consoleTerminal.scrollHeight;
}

const originalLog = console.log;
const originalError = console.error;

console.log = function(...args) {
    originalLog.apply(console, args);
    appendConsole(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '), false);
};

console.error = function(...args) {
    originalError.apply(console, args);
    appendConsole(args.map(a => typeof a === 'object' ? (a.stack || JSON.stringify(a)) : a).join(' '), true);
};

function clearConsoleLog() {
    if (consoleTerminal) consoleTerminal.innerText = "Console cleared.\n";
}

function toggleTheme() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('themeIconSvg');
    const isDark = html.classList.toggle('dark');
    if (themeIcon) {
        themeIcon.innerHTML = isDark 
            ? '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>' 
            : '<path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
    }
}

let mode = 'file';
let cachedTemplateBuffer = null;
let cachedIconBuffer = null;
let cachedPayloadBuffer = null;
let cachedPayloadName = "";
let cachedPayloadText = "";
let currentPreviewObjectUrl = null;

function openFilePicker(elementId) {
    const input = document.getElementById(elementId);
    if (input) {
        input.value = '';
        input.click();
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('./ShunyaBaseShell.apk', { cache: 'no-cache' });
        if (response.ok) {
            cachedTemplateBuffer = await response.arrayBuffer();
            console.log("ShunyaBaseShell.apk loaded automatically.");
        }
    } catch (err) {
        console.log("Base shell auto-fetch skipped.");
    }
});

function loadManualBaseShell(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        cachedTemplateBuffer = event.target.result;
        updateStatus("✓ Base Shell Loaded Successfully!", "emerald");
    };
    reader.onerror = () => console.error("Failed to read Base Shell APK file.");
    reader.readAsArrayBuffer(file);
}

function setMode(selectedMode) {
    mode = selectedMode;
    const isUrl = mode === 'url';

    const btnUrl = document.getElementById('btnUrl');
    const btnFile = document.getElementById('btnFile');

    const activeClass = 'flex-1 py-3 rounded-xl font-bold bg-white text-emerald-600 shadow-sm border border-slate-200 transition cursor-pointer';
    const inactiveClass = 'flex-1 py-3 rounded-xl font-bold text-slate-600 hover:text-emerald-600 hover:bg-white/80 transition cursor-pointer';

    if (btnUrl) btnUrl.className = isUrl ? activeClass : inactiveClass;
    if (btnFile) btnFile.className = !isUrl ? activeClass : inactiveClass;

    const urlInput = document.getElementById('urlInput');
    const fileInput = document.getElementById('fileInput');

    if (urlInput) urlInput.classList.toggle('hidden', !isUrl);
    if (fileInput) fileInput.classList.toggle('hidden', isUrl);
}

async function renderShinyIcon(imageBuffer) {
    return new Promise((resolve, reject) => {
        const blob = new Blob([imageBuffer]);
        const url = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
            try {
                const size = 512;
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d', { alpha: true });

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, size, size);

                const aspect = img.width / img.height;
                let dx = 0, dy = 0, dWidth = size, dHeight = size;

                if (aspect > 1) {
                    dWidth = size * aspect;
                    dx = (size - dWidth) / 2;
                } else if (aspect < 1) {
                    dHeight = size / aspect;
                    dy = (size - dHeight) / 2;
                }

                ctx.drawImage(img, dx, dy, dWidth, dHeight);

                canvas.toBlob(async (blobResult) => {
                    URL.revokeObjectURL(url);
                    if (blobResult) {
                        resolve(await blobResult.arrayBuffer());
                    } else {
                        reject(new Error("Canvas export failed"));
                    }
                }, 'image/png');
            } catch (err) {
                URL.revokeObjectURL(url);
                reject(err);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Image decode failed"));
        };

        img.src = url;
    });
}

async function previewIcon(e) {
    const file = e.target?.files?.[0] || e;
    if (!file || !(file instanceof Blob)) return;

    const origSizeKB = (file.size / 1024).toFixed(1);
    console.log(`Processing image: ${file.name || 'icon'} (${origSizeKB} KB)`);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            cachedIconBuffer = await renderShinyIcon(event.target.result);
            const newSizeKB = (cachedIconBuffer.byteLength / 1024).toFixed(1);
            const previewBlob = new Blob([cachedIconBuffer], { type: 'image/png' });

            if (currentPreviewObjectUrl) URL.revokeObjectURL(currentPreviewObjectUrl);
            currentPreviewObjectUrl = URL.createObjectURL(previewBlob);
            
            const iconPreview = document.getElementById('iconPreview');
            const iconContainer = document.getElementById('iconContainer');
            const iconPlaceholder = document.getElementById('iconPlaceholder');
            const sizeInfo = document.getElementById('iconSizeInfo');

            if (iconPreview) iconPreview.src = currentPreviewObjectUrl;
            if (iconContainer) iconContainer.classList.remove('hidden');
            if (iconPlaceholder) iconPlaceholder.classList.add('hidden');
            if (sizeInfo) {
                sizeInfo.innerText = `Original: ${origSizeKB} KB ➔ Optimized: ${newSizeKB} KB (512x512)`;
                sizeInfo.classList.remove('hidden');
            }

            console.log(`Standard icon generated: ${newSizeKB} KB`);
        } catch (err) {
            console.error("Icon processing error: " + err.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function loadPayloadFile(e) {
    const file = e.target?.files?.[0] || e;
    if (!file || !(file instanceof Blob)) return;

    cachedPayloadName = file.name || "payload.zip";
    cachedPayloadText = "";
    cachedPayloadBuffer = null;

    const lowerName = cachedPayloadName.toLowerCase();
    console.log(`Loaded payload package: ${cachedPayloadName}`);
    
    const payloadPlaceholder = document.getElementById('payloadPlaceholder');
    const payloadLoadedContainer = document.getElementById('payloadLoadedContainer');
    const payloadFileNameDisplay = document.getElementById('payloadFileNameDisplay');
    const payloadLabel = document.getElementById('payloadLabel');

    if (payloadPlaceholder) payloadPlaceholder.classList.add('hidden');
    if (payloadLoadedContainer) payloadLoadedContainer.classList.remove('hidden');
    if (payloadFileNameDisplay) payloadFileNameDisplay.innerText = cachedPayloadName;
    if (payloadLabel) payloadLabel.innerText = cachedPayloadName;

    const reader = new FileReader();
    if (lowerName.endsWith('.html')) {
        reader.onload = (event) => { cachedPayloadText = event.target.result; };
        reader.readAsText(file);
    } else if (lowerName.endsWith('.zip')) {
        reader.onload = (event) => { cachedPayloadBuffer = event.target.result; };
        reader.readAsArrayBuffer(file);
    }
}

function updateStatus(text, type = "blue") {
    const statusBox = document.getElementById('statusBox');
    if (!statusBox) return;
    
    const colorMap = {
        blue: "bg-blue-50 border-blue-200 text-blue-600 animate-pulse",
        emerald: "bg-emerald-50 border-emerald-200 text-emerald-600",
        amber: "bg-amber-50 border-amber-200 text-amber-700",
        rose: "bg-rose-50 border-rose-200 text-rose-600"
    };
    
    statusBox.className = `p-4 border rounded-2xl text-center text-xs sm:text-sm font-bold shadow-sm ${colorMap[type] || colorMap.blue}`;
    statusBox.innerText = text;
}

function replaceBinaryString(buffer, oldStr, newStr) {
    let u8 = new Uint8Array(buffer);
    
    const encodeUTF16 = (str) => {
        let arr = [];
        for (let i = 0; i < str.length; i++) {
            let code = str.charCodeAt(i);
            arr.push(code & 0xff, (code >> 8) & 0xff);
        }
        return new Uint8Array(arr);
    };

    const encodeUTF8 = (str) => new TextEncoder().encode(str);

    const matchAndReplace = (bytes, oldTarget, newTarget) => {
        let modified = false;
        const oldLen = oldTarget.length;
        const newLen = newTarget.length;
        const searchLimit = bytes.length - oldLen;

        for (let i = 0; i <= searchLimit; i++) {
            let found = true;
            for (let j = 0; j < oldLen; j++) {
                if (bytes[i + j] !== oldTarget[j]) {
                    found = false;
                    break;
                }
            }
            if (found && newLen <= oldLen) {
                bytes.set(newTarget, i);
                bytes.fill(0, i + newLen, i + oldLen);
                modified = true;
                i += oldLen - 1;
            }
        }
        return modified;
    };

    matchAndReplace(u8, encodeUTF16(oldStr), encodeUTF16(newStr));
    matchAndReplace(u8, encodeUTF8(oldStr), encodeUTF8(newStr));

    return u8.buffer;
}

// Modal View Component
window.showBuildSuccessModal = function() {
    const rawAppName = document.getElementById('appName')?.value.trim() || "AppShell";
    const iconPreviewSrc = document.getElementById('iconPreview')?.src || currentPreviewObjectUrl || '';
    
    const activePerms = [];
    if (document.getElementById('permCamera')?.checked) activePerms.push("Camera");
    if (document.getElementById('permAudio')?.checked) activePerms.push("Microphone");
    if (document.getElementById('permLocation')?.checked) activePerms.push("Location");
    if (document.getElementById('permStorage')?.checked) activePerms.push("Storage");
    if (document.getElementById('permVibrate')?.checked) activePerms.push("Haptic Vibration");

    let inputSourceType = "";
    let inputSourceName = "";

    if (mode === 'url') {
        inputSourceType = "Remote URL";
        inputSourceName = document.getElementById('targetUrl')?.value.trim() || document.getElementById('targetUrlInput')?.value.trim() || "N/A";
    } else {
        const lowerName = cachedPayloadName.toLowerCase();
        if (lowerName.endsWith('.zip')) {
            inputSourceType = "ZIP Package";
        } else if (lowerName.endsWith('.html')) {
            inputSourceType = "HTML File";
        } else {
            inputSourceType = "Uploaded Web Package";
        }
        inputSourceName = cachedPayloadName || "Uploaded Package File";
    }

    const modalContent = `
        <div class="space-y-4 text-left">
            <div class="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2 text-amber-900 text-xs font-bold">
                <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <span>⚠️ Warning: Binary Signing karna zaroori hai! Unsigned APK direct install nahi hoga.</span>
            </div>

            <div class="flex items-center gap-3.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                ${iconPreviewSrc ? `<img src="${iconPreviewSrc}" class="w-14 h-14 rounded-2xl object-cover shadow-md border border-slate-200 shrink-0" alt="App Icon">` : `<div class="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0">APK</div>`}
                <div class="overflow-hidden">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 block">App Title</span>
                    <h4 class="text-lg font-black text-slate-900 truncate">${rawAppName}</h4>
                </div>
            </div>

            <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span class="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">Enabled Permissions</span>
                <div class="flex flex-wrap gap-1.5">
                    ${activePerms.length > 0 ? activePerms.map(p => `<span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">${p}</span>`).join('') : `<span class="text-xs text-slate-400 italic">No permissions selected</span>`}
                </div>
            </div>

            <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span class="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">Payload Type (${inputSourceType})</span>
                <p class="text-xs font-bold text-slate-800 break-all bg-white p-2 rounded-xl border border-slate-200">${inputSourceName}</p>
            </div>
        </div>
    `;

    const modalMsg = document.getElementById('modalMessage');
    if (modalMsg) modalMsg.innerHTML = modalContent;

    const modal = document.getElementById('customModal');
    if (modal) modal.classList.remove('hidden');
};

// Fixed Navigation to index.html#signing-guide
window.closeCustomModal = function() {
    const modal = document.getElementById('customModal');
    if (modal) modal.classList.add('hidden');

    const targetSection = document.getElementById('signing-guide');

    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        window.location.href = 'index.html#signing-guide';
    }
};

async function processData() {
    const targetUrlInput = document.getElementById('targetUrl') || document.getElementById('targetUrlInput');
    
    if (mode === 'file' && !cachedPayloadText && !cachedPayloadBuffer) {
        alert("Please select a local .HTML or .ZIP file first!");
        return;
    }

    if (mode === 'url' && (!targetUrlInput || !targetUrlInput.value.trim())) {
        alert("Please enter a valid target URL!");
        return;
    }

    if (!cachedTemplateBuffer) {
        updateStatus("Please select 'ShunyaBaseShell.apk' file...", "amber");
        openFilePicker('manualApkInput');
        return;
    }

    executeBuildProcess();
}

async function executeBuildProcess() {
    try {
        const appNameEl = document.getElementById('appName');
        const targetUrlEl = document.getElementById('targetUrl') || document.getElementById('targetUrlInput');
        
        const rawAppName = (appNameEl && appNameEl.value.trim()) ? appNameEl.value.trim() : "AppShell";
        const sanitizedFileName = rawAppName.replace(/[^a-zA-Z0-9_\-]/g, '_');

        const getPerm = (id) => {
            const el = document.getElementById(id);
            return el ? el.checked : false;
        };

        const permissionsObj = {
            camera: getPerm('permCamera'),
            record_audio: getPerm('permAudio'),
            fine_location: getPerm('permLocation'),
            coarse_location: getPerm('permLocation'),
            read_external_storage: getPerm('permStorage'),
            write_external_storage: getPerm('permStorage'),
            vibrate: getPerm('permVibrate')
        };

        let targetEntryPoint = "index.html";

        const shunyaConfigObj = {
            app_name: rawAppName,
            app_mode: mode,
            target_url: (mode === 'url' && targetUrlEl) ? targetUrlEl.value.trim() : "",
            local_entry: targetEntryPoint,
            enable_wasm_godot: true,
            permissions: permissionsObj
        };

        updateStatus("Building Strict Optimized Assets...", "blue");

        if (typeof JSZip === "undefined") {
            throw new Error("JSZip library missing.");
        }

        const zip = await JSZip.loadAsync(cachedTemplateBuffer.slice(0));
        zip.remove("META-INF");

        const zipFilesKeys = Object.keys(zip.files);

        updateStatus("Patching Homescreen App Title...", "blue");

        const targetBinaryFiles = ["AndroidManifest.xml", "resources.arsc", "res/values/strings.xml"];
        const defaultAppNamesToPatch = ["ShunyaBaseShell", "AppShell", "BaseShell"];

        for (const fileName of targetBinaryFiles) {
            if (zip.files[fileName]) {
                let fileBuffer = await zip.files[fileName].async("arraybuffer");
                for (const oldName of defaultAppNamesToPatch) {
                    fileBuffer = replaceBinaryString(fileBuffer, oldName, rawAppName);
                }
                zip.file(fileName, fileBuffer, { compression: "STORE" });
                console.log(`Homescreen binary patched: ${fileName}`);
            }
        }

        if (cachedIconBuffer) {
            updateStatus("Injecting App Icons...", "blue");
            const iconKeys = zipFilesKeys.filter(path => {
                const lower = path.toLowerCase();
                return lower.includes("ic_launcher") || 
                       lower.includes("app_icon") || 
                       (lower.endsWith(".png") && lower.startsWith("res/"));
            });

            for (const zPath of iconKeys) {
                zip.file(zPath, cachedIconBuffer.slice(0), { compression: "STORE" });
            }
        }

        const permissionAndDebugScript = `
        <style>
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: 100% !important;
                overflow-x: hidden !important;
                -webkit-text-size-adjust: 100%;
                box-sizing: border-box !important;
            }
            *, *:before, *:after {
                box-sizing: inherit !important;
            }
        </style>
        <script>
            document.title = "${rawAppName.replace(/"/g, '\\"')}";
            
            function enforceFullscreenImmersion() {
                let meta = document.querySelector('meta[name="viewport"]');
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.name = "viewport";
                    document.head.appendChild(meta);
                }
                meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
            }

            if (document.readyState === 'loading') {
                window.addEventListener('DOMContentLoaded', enforceFullscreenImmersion);
            } else {
                enforceFullscreenImmersion();
            }

            window.closeApp = function() {
                if (window.ShunyaBridge && window.ShunyaBridge.closeApp) {
                    window.ShunyaBridge.closeApp();
                } else {
                    window.close();
                }
            };

            document.addEventListener('click', function(e) {
                if (e.target && (e.target.id === 'closeApp' || e.target.classList.contains('close-btn') || e.target.id === 'exitBtn')) {
                    window.closeApp();
                }
            });

            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                var origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
                navigator.mediaDevices.getUserMedia = function(constraints) {
                    return origGetUserMedia(constraints).catch(function(err) {
                        console.error("Camera/Audio Access Failed: " + err.message);
                        throw err;
                    });
                };
            }

            window.onerror = function(msg, url, line) {
                var div = document.createElement('div');
                div.style.position = 'fixed'; div.style.top = '0'; div.style.left = '0';
                div.style.width = '100%'; div.style.height = '100%'; div.style.backgroundColor = '#111';
                div.style.color = '#ff5555'; div.style.padding = '20px'; div.style.zIndex = '999999';
                div.style.fontSize = '14px'; div.style.fontFamily = 'monospace'; div.style.overflow = 'auto';
                div.innerHTML = '<h2>⚠️ WEB SHELL EXCEPTION</h2><hr/><p><b>Message:</b> '+msg+'</p><p><b>Source:</b> '+url+'</p><p><b>Line:</b> '+line+'</p>';
                document.body.appendChild(div);
            };
        </script>
        `;

        if (mode === 'file') {
            updateStatus("Injecting Local HTML Package...", "blue");
            if (cachedPayloadName.toLowerCase().endsWith('.html')) {
                let htmlContent = cachedPayloadText;
                if (htmlContent.includes("<head>")) {
                    htmlContent = htmlContent.replace("<head>", "<head>" + permissionAndDebugScript);
                } else {
                    htmlContent = permissionAndDebugScript + htmlContent; 
                }
                zip.file("assets/www/index.html", htmlContent, { compression: "STORE" });
                shunyaConfigObj.local_entry = "index.html";
            } else if (cachedPayloadName.toLowerCase().endsWith('.zip')) {
                const userZip = await JSZip.loadAsync(cachedPayloadBuffer.slice(0));
                const validFileKeys = Object.keys(userZip.files).filter(k => !userZip.files[k].dir);
                let rootPrefix = "";

                if (validFileKeys.length > 0) {
                    const firstParts = validFileKeys[0].split('/');
                    if (firstParts.length > 1) {
                        const candidate = firstParts[0] + '/';
                        if (validFileKeys.every(k => k.startsWith(candidate))) {
                            rootPrefix = candidate;
                        }
                    }
                }

                let htmlFound = false;

                for (const filename of Object.keys(userZip.files)) {
                    if (!userZip.files[filename].dir) {
                        let fileData = await userZip.files[filename].async("uint8array");
                        let targetPath = rootPrefix && filename.startsWith(rootPrefix) 
                            ? filename.substring(rootPrefix.length) 
                            : filename;

                        if (targetPath.toLowerCase().endsWith(".html")) {
                            if (!htmlFound || targetPath.toLowerCase() === "index.html") {
                                targetEntryPoint = targetPath;
                                htmlFound = true;
                            }
                        }
                        zip.file("assets/www/" + targetPath, fileData, { compression: "STORE" });
                    }
                }
                shunyaConfigObj.local_entry = targetEntryPoint;
            }
        }

        zip.file("assets/www/shunya_config.json", JSON.stringify(shunyaConfigObj, null, 2), { compression: "STORE" });

        zipFilesKeys.forEach(relativePath => {
            const entry = zip.files[relativePath];
            if (!entry || entry.dir) return;
            
            const lower = relativePath.toLowerCase();
            if (lower.endsWith(".arsc") || lower.startsWith("assets/") || lower.endsWith(".png") || lower.endsWith(".wasm")) {
                entry.options.compression = "STORE";
            }
        });

        updateStatus("Generating Strict Unsigned APK...", "blue");
        const unsignedBuffer = await zip.generateAsync({
            type: "arraybuffer",
            mimeType: "application/vnd.android.package-archive",
            compression: "STORE"
        });

        const finalBlob = new Blob([unsignedBuffer], { type: "application/vnd.android.package-archive" });
        const downloadUrl = URL.createObjectURL(finalBlob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = `${sanitizedFileName}_unsigned.apk`;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        updateStatus("✓ APK Package Ready! (Sign using APKSigner)", "emerald");
        console.log(`APK compiled strictly under name: ${rawAppName}`);

        if (finalBlob && finalBlob.size > 0) {
            window.showBuildSuccessModal();
        } else {
            throw new Error("Download verification failed: Blob is empty.");
        }

    } catch (err) {
        console.error(err);
        updateStatus("Build Error: " + err.message, "rose");
    }
}
