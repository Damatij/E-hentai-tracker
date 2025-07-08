// E-Hentai Tracker - Content Script

console.log("E-Hentai Tracker content script loaded.");

let currentContentLanguage = 'zh-TW'; // Default, will be updated
const uiStringsContent = {
  'en': {
    sidebarTitle: 'E-Hentai Tracker',
    refreshButton: 'Refresh Now',
    refreshingButton: 'Refreshing...',
    optionsButton: 'Options',
    loadingWorks: 'Loading works...',
    noTrackedTags: 'Please add tags to track first.',
    worksFound: (count) => `${count} works found.`,
    noWorksFound: 'No new works found.',
    errorLoadingWorks: 'Error loading works.',
    tagLabel: 'Tag',
    postedLabel: 'Posted',
    textSizeLabel: 'Text:',
    imageSizeLabel: 'Image:'
  },
  'zh-TW': {
    sidebarTitle: 'E-Hentai 漫畫追蹤器',
    refreshButton: '立即更新',
    refreshingButton: '更新中...',
    optionsButton: '後臺管理',
    loadingWorks: '正在載入作品...',
    noTrackedTags: '請先新增追蹤標籤。',
    worksFound: (count) => `找到 ${count} 本作品。`,
    noWorksFound: '未找到新作品。',
    errorLoadingWorks: '載入作品時發生錯誤。',
    tagLabel: '標籤',
    postedLabel: '發布於',
    textSizeLabel: '文字:',
    imageSizeLabel: '圖片大小:'
  },
  'ja': {
    sidebarTitle: 'E-Hentaiトラッカー',
    refreshButton: '今すぐ更新',
    refreshingButton: '更新中...',
    optionsButton: 'オプション',
    loadingWorks: '作品を読み込み中...',
    noTrackedTags: '最初に追跡するタグを追加してください。',
    worksFound: (count) => `${count}件の作品が見つかりました。`,
    noWorksFound: '新しい作品は見つかりませんでした。',
    errorLoadingWorks: '作品の読み込み中にエラーが発生しました。',
    tagLabel: 'タグ',
    postedLabel: '投稿日',
    textSizeLabel: '文字:',
    imageSizeLabel: '画像サイズ:'
  },
  'ko': {
    sidebarTitle: 'E-Hentai 트래커',
    refreshButton: '지금 새로고침',
    refreshingButton: '새로고침 중...',
    optionsButton: '옵션',
    loadingWorks: '작품 로딩 중...',
    noTrackedTags: '먼저 추적할 태그를 추가하십시오.',
    worksFound: (count) => `${count}개의 작품을 찾았습니다.`,
    noWorksFound: '새 작품을 찾을 수 없습니다.',
    errorLoadingWorks: '작품을 로드하는 중 오류가 발생했습니다.',
    tagLabel: '태그',
    postedLabel: '게시됨',
    textSizeLabel: '문자:',
    imageSizeLabel: '이미지 크기:'
  },
  'es': {
    sidebarTitle: 'E-Hentai Tracker',
    refreshButton: 'Actualizar Ahora',
    refreshingButton: 'Actualizando...',
    optionsButton: 'Opciones',
    loadingWorks: 'Cargando obras...',
    noTrackedTags: 'Por favor, añada etiquetas para rastrear primero.',
    worksFound: (count) => `${count} obras encontradas.`,
    noWorksFound: 'No se encontraron obras nuevas.',
    errorLoadingWorks: 'Error al cargar las obras.',
    tagLabel: 'Etiqueta',
    postedLabel: 'Publicado',
    textSizeLabel: 'Texto:',
    imageSizeLabel: 'Tamaño de la imagen:'
  }
};

function getTranslatedString(key, ...args) {
  const langStrings = uiStringsContent[currentContentLanguage] || uiStringsContent['en'];
  const stringTemplate = langStrings[key] || (uiStringsContent['en'] ? uiStringsContent['en'][key] : key);
  if (typeof stringTemplate === 'function') {
    return stringTemplate(...args);
  }
  return stringTemplate || key; // Fallback to key if string not found
}

async function loadContentLanguagePreference() {
  try {
    const data = await chrome.storage.sync.get('language');
    currentContentLanguage = data.language || 'zh-TW'; // Default to zh-TW if not set
    console.log("Content.js: Language loaded:", currentContentLanguage);
  } catch (error) {
    console.error("Content.js: Error loading language preference:", error);
    currentContentLanguage = 'zh-TW'; // Fallback
  }
}


// Helper function to ensure sidebar is created
async function ensureSidebar() {
    await loadContentLanguagePreference(); // Load language before creating sidebar
    let sidebar = document.getElementById('eh-tracker-sidebar');
    if (!sidebar) {
        sidebar = await createSidebar(); // createSidebar is now async
        document.body.appendChild(sidebar);
    }
    return sidebar;
}

async function createSidebar() {
    if (document.getElementById('eh-tracker-sidebar')) {
        return document.getElementById('eh-tracker-sidebar');
    }
    // Ensure language is loaded if createSidebar is called directly or before ensureSidebar completes its first load.
    if (!uiStringsContent[currentContentLanguage]) { // Simple check if language was loaded
        await loadContentLanguagePreference();
    }

    const sidebar = document.createElement('div');
    sidebar.id = 'eh-tracker-sidebar';
    sidebar.style.cssText = `
        position: fixed;
        top: 0;
        right: -450px; /* Start off-screen, adjusted for new width */
        width: 450px;  /* Increased sidebar width */
        height: 100%;
        background-color: #f0f0f0; 
        border-left: 1px solid #ccc; 
        box-shadow: -2px 0 5px rgba(0,0,0,0.1); 
        z-index: 2147483647;
        transition: right 0.3s ease-in-out;
        display: flex;
        flex-direction: column;
        font-family: Arial, sans-serif; 
    `;

    const header = document.createElement('div');
    header.className = 'sidebar-header';
    header.style.cssText = `
        padding: 10px 15px;
        background-color: #333;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;

    const title = document.createElement('h2');
    title.textContent = getTranslatedString('sidebarTitle');
    title.style.margin = '0';
    title.style.fontSize = '1.1em';

    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.className = 'sidebar-close-button';
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5em;
        cursor: pointer;
        padding: 0 5px;
    `;
    closeButton.onclick = () => {
        const sb = document.getElementById('eh-tracker-sidebar');
        if (sb) {
            sb.style.right = '-450px'; // Adjusted for new width
        }
    };

    header.appendChild(title);
    header.appendChild(closeButton);

    // --- Display Controls Container (Now only for Text Size) ---\
    const displayControlsOuterContainer = document.createElement('div');
    displayControlsOuterContainer.id = 'sidebar-display-controls-container';
    displayControlsOuterContainer.style.cssText = `
        padding: 5px 15px; 
        background-color: #444; 
        color: white;
        display: flex;
        justify-content: center; /* Center the remaining Text controls */
        align-items: center;
        gap: 10px; 
        border-bottom: 1px solid #555;
    `;

    const sizeControlsContainer = document.createElement('div');
    sizeControlsContainer.style.cssText = `
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 10px;
    `;

    // Helper to create button groups (slightly simplified as it's now only for text)
    const createSizeControlButtonGroup = (idPrefix, groupLabelTextKey, sizes, storageKey, prefKey, defaultSize) => {
        const groupContainer = document.createElement('div');
        groupContainer.style.cssText = 'display: flex; align-items: center; gap: 5px;';

        const label = document.createElement('span');
        label.textContent = getTranslatedString(groupLabelTextKey);
        label.style.fontSize = "0.8em";
        label.style.marginRight = "3px";
        groupContainer.appendChild(label);

        sizes.forEach(size => {
            const btn = document.createElement('button');
            btn.textContent = size.label;
            btn.id = `${idPrefix}-${size.value}`;
            btn.dataset.value = size.value;
            btn.className = 'sidebar-display-control-button';
            btn.style.cssText = `
                padding: 2px 5px; 
                font-size: 0.7em; 
                background-color: #666; 
                color: white;
                border: 1px solid #888;
                border-radius: 3px;
                cursor: pointer;
                min-width: 20px; 
                text-align: center;
            `;
            btn.onclick = async () => {
                let prefs = (await chrome.storage.local.get(storageKey))[storageKey] || {};
                prefs[prefKey] = size.value;
                await chrome.storage.local.set({ [storageKey]: prefs });
                updateDisplayControlButtonsActiveState(idPrefix, size.value, sizes);
                if (document.getElementById('eh-tracker-sidebar').style.right === '0px') {
                    loadAndDisplayWorks();
                }
            };
            groupContainer.appendChild(btn);
        });
        return groupContainer;
    };
    
    // Text Size Controls
    sizeControlsContainer.appendChild(createSizeControlButtonGroup(
        'text-size', 'textSizeLabel', // Use key for label
        [{label: 'S', value: 'small'}, {label: 'M', value: 'medium'}, {label: 'L', value: 'large'}],
        'sidebarDisplayPrefs', 'textSize', 'medium'
    ));

    // Image Size Controls
    sizeControlsContainer.appendChild(createSizeControlButtonGroup(
        'image-size', 'imageSizeLabel',
        [{label: 'S', value: 'small'}, {label: 'M', value: 'medium'}, {label: 'L', 'value': 'large'}],
        'sidebarDisplayPrefs', 'imageSize', 'medium'
    ));

    displayControlsOuterContainer.appendChild(sizeControlsContainer);

    window.updateDisplayControlButtonsActiveState = (idPrefix, activeValue, sizes) => {
        sizes.forEach(size => {
            const btn = document.getElementById(`${idPrefix}-${size.value}`);
            if (btn) {
                if (size.value === activeValue) {
                    btn.style.backgroundColor = '#007bff'; 
                    btn.style.borderColor = '#0056b3';
                } else {
                    btn.style.backgroundColor = '#666'; 
                    btn.style.borderColor = '#888';
                }
            }
        });
    };
    
    // Load preferences and update button states upon creation
    chrome.storage.local.get('sidebarDisplayPrefs').then(result => {
        const prefs = result.sidebarDisplayPrefs || { textSize: 'medium', imageSize: 'medium' };
        if (window.updateDisplayControlButtonsActiveState) { 
            updateDisplayControlButtonsActiveState('text-size', prefs.textSize, [{label: 'S', value: 'small'}, {label: 'M', value: 'medium'}, {label: 'L', value: 'large'}]);
            updateDisplayControlButtonsActiveState('image-size', prefs.imageSize, [{label: 'S', value: 'small'}, {label: 'M', value: 'medium'}, {label: 'L', value: 'large'}]);
        }
    });

    sidebar.appendChild(header);
    sidebar.appendChild(displayControlsOuterContainer); 

    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'sidebar-controls'; // For CSS styling
    controlsContainer.style.cssText = `
        padding: 10px;
        background-color: #e0e0e0;
        display: flex;
        gap: 10px;
    `;

    const refreshButton = document.createElement('button');
    refreshButton.id = 'eh-tracker-refresh-now-button';
    refreshButton.textContent = getTranslatedString('refreshButton');
    refreshButton.className = 'sidebar-button'; // For CSS styling
    refreshButton.style.cssText = `
        padding: 8px 12px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9em;
    `;
    refreshButton.onclick = () => {
        refreshButton.textContent = getTranslatedString('refreshingButton');
        refreshButton.disabled = true;
        chrome.runtime.sendMessage({ action: 'FORCE_CHECK_NEW_WORKS' }, (response) => {
            console.log("Response from forcing check:", response);
            // Re-enable button and set text AFTER response, consider language
            loadContentLanguagePreference().then(() => { // Ensure language is fresh
                 refreshButton.textContent = getTranslatedString('refreshButton');
                 refreshButton.disabled = false;
                 // Now that the background check is confirmed complete, refresh the sidebar display.
                 loadAndDisplayWorks();
            });
            // The original comment below is now handled by this explicit callback.
            // loadAndDisplayWorks will be called by NEW_WORKS_FOUND message
        });
    };

    const openOptionsButton = document.createElement('button');
    openOptionsButton.id = 'eh-tracker-open-options-button';
    openOptionsButton.textContent = getTranslatedString('optionsButton');
    openOptionsButton.className = 'sidebar-button'; // For CSS styling
    openOptionsButton.style.cssText = `
        padding: 8px 12px;
        background-color: #007BFF;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9em;
    `;
    openOptionsButton.onclick = () => {
        chrome.runtime.sendMessage({ action: 'OPEN_OPTIONS_PAGE' });
    };

    controlsContainer.appendChild(refreshButton);
    controlsContainer.appendChild(openOptionsButton);

    const worksContainer = document.createElement('div');
    worksContainer.id = 'eh-tracked-works-container';
    worksContainer.className = 'sidebar-works-container'; // For CSS styling
    worksContainer.style.cssText = `
        overflow-y: auto;
        padding: 10px;
        flex-grow: 1;
    `;

    sidebar.appendChild(controlsContainer);
    sidebar.appendChild(worksContainer);
    
    console.log("Sidebar DOM created with language:", currentContentLanguage);
    return sidebar;
}

async function loadAndDisplayWorks() {
    // Ensure language is loaded before displaying works
    // ensureSidebar itself now calls loadContentLanguagePreference
    const sidebar = await ensureSidebar(); 
    const worksContainer = document.getElementById('eh-tracked-works-container');
    if (!worksContainer) {
        console.error('Works container not found, cannot load works.');
        return;
    }
    worksContainer.innerHTML = `<p style="padding:10px; text-align:center;">${getTranslatedString('loadingWorks')}</p>`;

    try {
        // Language preference should be loaded by ensureSidebar or reloaded if necessary.
        // If createSidebar was called, it also attempts to load language pref.
        // To be absolutely sure for this async function context:
        if (!uiStringsContent[currentContentLanguage]) {
             await loadContentLanguagePreference();
        }

        const storedData = await chrome.storage.local.get(['trackedTags', 'trackedWorks', 'sidebarDisplayPrefs']);
        const trackedTags = storedData.trackedTags || [];
        const trackedWorks = storedData.trackedWorks || {};
        const displayPrefs = storedData.sidebarDisplayPrefs || { textSize: 'medium', imageSize: 'medium' }; 
        
        worksContainer.className = 'sidebar-works-container'; // Reset classes
        worksContainer.classList.add(`text-size-${displayPrefs.textSize}`);
        worksContainer.classList.add(`image-size-${displayPrefs.imageSize}`);

        if (window.updateDisplayControlButtonsActiveState) {
            updateDisplayControlButtonsActiveState('text-size', displayPrefs.textSize, [{label: 'S', value: 'small'}, {label: 'M', value: 'medium'}, {label: 'L', value: 'large'}]);
            updateDisplayControlButtonsActiveState('image-size', displayPrefs.imageSize, [{label: 'S', value: 'small'}, {label: 'M', value: 'medium'}, {label: 'L', value: 'large'}]);
        }

        worksContainer.innerHTML = '';
        let worksFoundCount = 0;
        const allWorksFlattened = [];
        const worksByUrl = new Map();

        if (trackedTags.length > 0 && trackedWorks && typeof trackedWorks === 'object') {
            trackedTags.forEach(tag => {
                if (trackedWorks[tag] && Array.isArray(trackedWorks[tag]) && trackedWorks[tag].length > 0) {
                    trackedWorks[tag].forEach(work => {
                        if (worksByUrl.has(work.url)) {
                            // If work already exists, just add the new tag to its list.
                            const existingWork = worksByUrl.get(work.url);
                            if (!existingWork.matchedTags.includes(tag)) {
                                existingWork.matchedTags.push(tag);
                            }
                        } else {
                            // First time seeing this work, add it to the map with its first matched tag.
                            worksByUrl.set(work.url, { ...work, matchedTags: [tag] });
                        }
                    });
                }
            });
        }
        
        const deDupedWorks = Array.from(worksByUrl.values());
        worksFoundCount = deDupedWorks.length;

        const overallStatusMessageDiv = document.createElement('div');
        overallStatusMessageDiv.id = 'eh-tracker-overall-status';
        overallStatusMessageDiv.style.cssText = `
            padding: 5px 8px; 
            margin-bottom: 8px; 
            text-align: center;
            font-weight: normal; 
            font-size: 0.9em;   
            background-color: #eef2f7; 
            border-radius: 3px;
            color: #333; 
        `;

        if (trackedTags.length === 0) {
            overallStatusMessageDiv.textContent = getTranslatedString('noTrackedTags'); 
        } else if (worksFoundCount > 0) {
            overallStatusMessageDiv.textContent = getTranslatedString('worksFound', worksFoundCount); 
        } else {
            overallStatusMessageDiv.textContent = getTranslatedString('noWorksFound'); 
        }
        worksContainer.insertBefore(overallStatusMessageDiv, worksContainer.firstChild);


        if (worksFoundCount > 0) {
            deDupedWorks.sort((a, b) => b.posted - a.posted); 

            deDupedWorks.forEach((work, index) => {
                const workDiv = document.createElement('div');
                workDiv.className = 'work-item';

                const img = document.createElement('img');
                img.src = work.thumb;
                img.alt = work.title;
                img.className = 'work-thumbnail';

                const infoDiv = document.createElement('div');
                infoDiv.className = 'work-info';

                const titleLink = document.createElement('a');
                titleLink.href = work.url;
                titleLink.textContent = work.title;
                titleLink.target = '_blank';
                titleLink.className = 'work-title';
                
                const tagDisplay = document.createElement('div');
                const displayableTags = work.matchedTags.join(', ');
                tagDisplay.textContent = `${getTranslatedString('tagLabel')}: ${displayableTags}`;
                tagDisplay.className = 'work-tag';

                const postedDate = new Date(work.posted);
                const dateDiv = document.createElement('div');
                dateDiv.textContent = `${getTranslatedString('postedLabel')}: ${postedDate.toLocaleDateString()} ${postedDate.toLocaleTimeString()}`;
                dateDiv.className = 'work-posted-date';

                infoDiv.appendChild(titleLink);
                infoDiv.appendChild(tagDisplay);
                infoDiv.appendChild(dateDiv);
                workDiv.appendChild(img);
                workDiv.appendChild(infoDiv);
                worksContainer.appendChild(workDiv);

                // Inject ad only at position 4 (index 3)
                if (index === 3) {
                    const adItem = document.createElement('div');
                    adItem.className = 'sidebar-ad-item';
                    adItem.innerHTML = `<p style='padding:0;margin: 2px 0;color:#ff0000;'><a href='https://ibanana.biz/3NSsQ' target='_blank' style='display:inline-block;float:none;padding:0;margin:2px 0;color:#ff0000;text-decoration: none;'><img style='display:inline;border:0;max-width:100%;width:300px;height:250px;' src='https://img.oeya.com/images/202405/1714979168883049121.png'/></a></p><img src="https://adcenter.conn.tw/track/oeya_url_image.php?key=8f486d046bbccfe15795f3b62b85a014" style="height:1px;width:1px;border:0" />`;
                    worksContainer.appendChild(adItem);
                }
            });
        }
    } catch (error) {
        console.error('Error loading and displaying works:', error);
        if (worksContainer) { 
            worksContainer.innerHTML = `<p style="padding:10px; text-align:center;">${getTranslatedString('errorLoadingWorks')}</p>`;
        }
    }
}

async function toggleSidebar() {
    // ensureSidebar will load language preference
    const sidebar = await ensureSidebar();
    const currentRight = sidebar.style.right;
    if (currentRight === '0px') {
        sidebar.style.right = '-450px'; 
    } else {
        sidebar.style.right = '0px';
        // loadAndDisplayWorks also loads language preference, but ensureSidebar did it too.
        // Calling it here ensures content is fresh when sidebar opens.
        await loadAndDisplayWorks(); 
    }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Content.js received message:", request);
    if (request.action === 'TOGGLE_SIDEBAR') {
        (async () => { // Wrap in async IIFE to use await
            await toggleSidebar();
            sendResponse({ status: "Sidebar toggle action received" });
        })();
        return true; // Indicate async response
    } else if (request.action === 'NEW_WORKS_FOUND' || request.action === 'TRACKED_TAGS_UPDATED' || request.action === 'LAST_UPLOAD_DATES_UPDATED') {
        console.log(`Sidebar update triggered by: ${request.action}`);
        (async () => { // Wrap in async IIFE
            // Ensure language preferences are up-to-date before redrawing.
            // loadAndDisplayWorks will handle its own language loading if needed.
            await loadAndDisplayWorks(); 
            sendResponse({ status: `${request.action} processed` });
        })();
        return true; // Indicate async response
    } else if (request.action === 'LANGUAGE_CHANGED') { // Listen for language changes from options
        console.log("Content.js: Received LANGUAGE_CHANGED, reloading UI elements.");
        (async () => {
            await loadContentLanguagePreference(); // Reload language
            
            // Re-render sidebar if it exists and is visible, or just update texts if simpler
            const sidebar = document.getElementById('eh-tracker-sidebar');
            if (sidebar) {
                // Update title
                const titleElement = sidebar.querySelector('.sidebar-header h2');
                if (titleElement) titleElement.textContent = getTranslatedString('sidebarTitle');

                // Update button texts in controlsContainer
                const refreshButton = document.getElementById('eh-tracker-refresh-now-button');
                if (refreshButton && !refreshButton.disabled) refreshButton.textContent = getTranslatedString('refreshButton');
                
                const openOptionsButton = document.getElementById('eh-tracker-open-options-button');
                if (openOptionsButton) openOptionsButton.textContent = getTranslatedString('optionsButton');

                // Update text size label
                const textSizeControlContainer = document.getElementById('sidebar-display-controls-container');
                if(textSizeControlContainer) {
                    const textLabel = textSizeControlContainer.querySelector('span'); // Assumes it's the first span
                    if(textLabel) textLabel.textContent = getTranslatedString('textSizeLabel');
                }

                // If sidebar is open, reload works to update all dynamic text inside
                if (sidebar.style.right === '0px') {
                    await loadAndDisplayWorks();
                }
            }
            sendResponse({status: "Content script UI updated for language change."});
        })();
        return true;
    }
    // return true; // Keep the message channel open for asynchronous sendResponse if needed (already true for handled cases)
    return false; // For messages not handled here explicitly.
});

// Inject stylesheet
function injectStylesheet() {
    const existingLink = document.getElementById('eh-tracker-sidebar-styles');
    if (existingLink) return;

    const link = document.createElement('link');
    link.id = 'eh-tracker-sidebar-styles';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL('sidebar.css');
    document.head.appendChild(link);
    console.log("Sidebar stylesheet injected.");
}

// Initialize
async function initializeContentScript() {
    await loadContentLanguagePreference(); // Load language first
    injectStylesheet();
    // The sidebar is created on demand by toggleSidebar or when a message requests it.
    // No need to call ensureSidebar here unless you want it always present in DOM.
    console.log("E-Hentai Tracker content script initialized with language:", currentContentLanguage);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
    initializeContentScript();
}

// TODO:添加一個觸發器來顯示/隱藏側邊欄，例如監聽 browser action click
// (Already handled by background script sending TOGGLE_SIDEBAR message)

// 可選：如果頁面是 SPA (Single Page Application)，可能需要在導航變化時重新檢查是否需要注入
// 但對於普通的網頁，content script 在每次頁面加載時都會執行

// TODO: 添加一個觸發器來顯示/隱藏側邊欄，例如監聽 browser action click
// chrome.action.onClicked.addListener((tab) => { 
//   // 這個監聽器應該在 background script 中，然後發送消息給 content script
// }); 