// E-Hentai Tracker - Background Script

const EH_API_URL = "https://api.e-hentai.org/api.php";
const EH_RSS_URL = "https://e-hentai.org/rss/ehg.xml";
const CHECK_ALARM_NAME = "ehentai_check_alarm";
const DEFAULT_CHECK_INTERVAL_MINUTES = 60; // Default check interval: 1 hour
const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';
const NOTIFICATION_ID_NEW_WORKS = 'ehtracker_new_works_notification';

// // 追蹤的漫畫家標籤 (示例，之後應從 chrome.storage 讀取)
// const trackedArtistTags = ["artist:gentsuki", "artist:aiue oka"];

// Initialization: Setup alarm on startup and install/update
chrome.runtime.onStartup.addListener(async () => {
  console.log("E-Hentai Tracker startup");
  await ensureAlarmIsSet(); // Ensure this is awaited if it becomes async or has async parts
  await injectContentScriptsIntoExistingTabs(); // Inject into existing tabs on startup
  createContextMenus(); // Create context menus on startup
});

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("E-Hentai Tracker installed/updated:", details);
  await ensureAlarmIsSet(); // Ensure this is awaited
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    const defaultTags = [
      "artist:kemuri haku",
      "artist:tamagoro",
      "artist:tottotonero tarou",
      "artist:raiha",
      "group:mannen dokodoko dondodoko"
    ].map(tag => tag.toLowerCase());
    chrome.storage.local.set({ 
        trackedTags: defaultTags, 
        discoveredGalleries: {}, 
        trackedWorks: {},
        blacklistedTags: [] // Initialize blacklistedTags
    }, () => {
      console.log("Initialized trackedTags, discoveredGalleries, trackedWorks, and blacklistedTags.");
    });
    chrome.storage.sync.set({
        showDesktopNotifications: true, // Default to true
        updateFrequencyInMinutes: DEFAULT_CHECK_INTERVAL_MINUTES
    }, () => {
        console.log("Initialized showDesktopNotifications and updateFrequencyInMinutes.");
    });
  } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    // Handle storage migration if necessary, e.g., renaming trackedArtistTags to trackedTags
    chrome.storage.local.get(["trackedArtistTags", "trackedTags"], (result) => {
      if (result.trackedArtistTags && !result.trackedTags) {
        console.log("Migrating trackedArtistTags to trackedTags.");
        chrome.storage.local.set({ trackedTags: result.trackedArtistTags }, () => {
          chrome.storage.local.remove("trackedArtistTags", () => {
            console.log("Migration complete: trackedArtistTags removed.");
          });
        });
      }
      // Migrate artistTag in trackedWorks to matchedTag
      chrome.storage.local.get("trackedWorks", (data) => {
        if (data.trackedWorks) {
          const updatedTrackedWorks = {};
          let migrationNeeded = false;
          for (const tag in data.trackedWorks) {
            updatedTrackedWorks[tag] = data.trackedWorks[tag].map(work => {
              if (work.hasOwnProperty('artistTag') && !work.hasOwnProperty('matchedTag')) {
                migrationNeeded = true;
                const { artistTag, ...rest } = work;
                return { ...rest, matchedTag: artistTag };
              }
              return work;
            });
          }
          if (migrationNeeded) {
            chrome.storage.local.set({ trackedWorks: updatedTrackedWorks }, () => {
              console.log("Migrated artistTag to matchedTag in trackedWorks.");
            });
          }
        }
      });
    });
    // Ensure new settings have defaults if not present after an update
    chrome.storage.sync.get(['showDesktopNotifications', 'updateFrequencyInMinutes'], (syncResult) => {
        const syncUpdate = {};
        if (syncResult.showDesktopNotifications === undefined) {
            syncUpdate.showDesktopNotifications = true;
        }
        if (syncResult.updateFrequencyInMinutes === undefined) {
            syncUpdate.updateFrequencyInMinutes = DEFAULT_CHECK_INTERVAL_MINUTES;
        }
        if (Object.keys(syncUpdate).length > 0) {
            chrome.storage.sync.set(syncUpdate);
        }
    });
    chrome.storage.local.get('blacklistedTags', (localResult) => {
        if (localResult.blacklistedTags === undefined) {
            chrome.storage.local.set({ blacklistedTags: [] });
        }
    });
  }
  await injectContentScriptsIntoExistingTabs(); // Inject into existing tabs on install/update
  createContextMenus(); // Create context menus on install/update
});

// Function to create context menu items
function createContextMenus() {
  // Ensure old menus are removed first to avoid duplicates on update, if any existed with same IDs.
  // This is more robust if you reload the extension during development.
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "EHT_saveTagParent",
      title: "儲存標籤到 E-Hentai Tracker",
      contexts: ["selection"],
      documentUrlPatterns: ["*://e-hentai.org/*", "*://exhentai.org/*"]
    });

    const tagCategories = {
      "artist": "作者 (artist)",
      "group": "社團 (group)",
      "parody": "原作 (parody)",
      "character": "角色 (character)",
      "female": "女性標籤 (female)",
      "male": "男性標籤 (male)",
      "category": "分類 (category)",
      "misc": "一般標籤 (misc)"
    };

    for (const [key, title] of Object.entries(tagCategories)) {
      chrome.contextMenus.create({
        id: `EHT_saveAs_${key}`,
        parentId: "EHT_saveTagParent",
        title: `儲存為 ${title}`,
        contexts: ["selection"],
        documentUrlPatterns: ["*://e-hentai.org/*", "*://exhentai.org/*"]
      });
    }
    console.log("Context menus created.");
  });
}

// Function to inject content scripts into existing relevant tabs
async function injectContentScriptsIntoExistingTabs() {
  const relevantTabUrls = ["*://e-hentai.org/*", "*://exhentai.org/*"];
  try {
    const tabs = await chrome.tabs.query({ url: relevantTabUrls });
    for (const tab of tabs) {
      // Check if the tab is complete and not a chrome:// URL or other restricted page
      if (tab.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['sidebar.css']
          });
          console.log(`Successfully injected scripts into tab: ${tab.id} (${tab.url})`);
        } catch (err) {
          // Log errors, but don't let one failed injection stop others.
          // This might happen if the content script is already injected,
          // or if the page is a special page where injection is not allowed.
          console.warn(`Could not inject script into tab ${tab.id} (${tab.url}): ${err.message}`);
        }
      } else {
        console.log(`Skipping injection for tab ${tab.id} due to status '${tab.status}' or restricted URL '${tab.url}'`);
      }
    }
  } catch (queryError) {
    console.error("Error querying tabs for script injection:", queryError);
  }
}

// Function to get the desired alarm frequency from storage or use default
async function getAlarmFrequency() {
  try {
    const data = await chrome.storage.sync.get("updateFrequencyInMinutes");
    if (data.updateFrequencyInMinutes && typeof data.updateFrequencyInMinutes === 'number') {
      return data.updateFrequencyInMinutes;
    }
  } catch (error) {
    console.error("Error getting updateFrequencyInMinutes from sync storage:", error);
  }
  return DEFAULT_CHECK_INTERVAL_MINUTES; // Fallback to default
}

// Creates or updates the alarm with the specified (or fetched) frequency
async function createOrUpdateAlarm() {
  const periodInMinutes = await getAlarmFrequency();
  chrome.alarms.get(CHECK_ALARM_NAME, (existingAlarm) => {
    // If alarm exists and its period is already correct, do nothing.
    // Note: existingAlarm.periodInMinutes might not be perfectly accurate due to floating point issues with very old alarms, but generally fine.
    if (existingAlarm && existingAlarm.periodInMinutes === periodInMinutes) {
        // console.log(`Alarm '${CHECK_ALARM_NAME}' already exists with the correct period of ${periodInMinutes} minutes.`);
        // return;
    } 
    // If we always want to recreate to ensure scheduledTime is updated or to handle minor discrepancies:
    chrome.alarms.create(CHECK_ALARM_NAME, {
        delayInMinutes: 1, // Delay first execution slightly after browser start or update
        periodInMinutes: periodInMinutes,
    });
    console.log(`Alarm '${CHECK_ALARM_NAME}' created/updated to run every ${periodInMinutes} minutes.`);
  });
}

// Ensures alarm is set, typically on startup or install.
async function ensureAlarmIsSet() {
    // Check if alarm exists. If not, create it.
    // This is slightly different from createOrUpdateAlarm as it's more about ensuring *an* alarm exists.
    const alarm = await chrome.alarms.get(CHECK_ALARM_NAME);
    if (!alarm) {
        console.log("Alarm not found, creating new one.");
        await createOrUpdateAlarm();
    } else {
        // Optional: if an alarm exists, one might still call createOrUpdateAlarm()
        // to ensure its period matches the latest setting from storage.
        // For now, if it exists, assume it's based on a previous correct setting or will be updated by options page.
        // console.log("Alarm already exists. Period will be updated if changed in options.");
        // Or, to be more robust and ensure it always matches storage setting:
        await createOrUpdateAlarm(); 
    }
}

// Listen for alarm triggers
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === CHECK_ALARM_NAME) {
    console.log("Alarm triggered: Checking for new galleries...");
    await checkForNewGalleries();
  }
});

// Listen for messages from other parts of the extension (e.g., options page)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "UPDATE_ALARM_FREQUENCY") {
    console.log("Received message to update alarm frequency to:", message.frequency);
    // Clear the existing alarm first, then create a new one with the updated frequency.
    // The new frequency is already saved to storage by options.js, so createOrUpdateAlarm will pick it up.
    chrome.alarms.clear(CHECK_ALARM_NAME, (wasCleared) => {
        if (wasCleared) {
            console.log(`Alarm '${CHECK_ALARM_NAME}' cleared successfully.`);
        }
        createOrUpdateAlarm(); 
    });
    return true; // Indicates that we will send a response asynchronously (or not at all)
  } else if (message.action === "TRACKED_TAGS_UPDATED") {
    console.log("Tracked tags updated, an immediate check might be good or wait for alarm.");
    // checkForNewGalleries(); // Optional: immediate check. Be mindful of API rate limits.
  } else if (message.action === "FORCE_CHECK_NEW_WORKS") {
    console.log("Background: Received FORCE_CHECK_NEW_WORKS from content script.");
    (async () => {
      try {
      await checkForNewGalleries();
        sendResponse({ status: "Check for new works completed." });
      } catch (error) {
        console.error("Error during forced check for new works:", error);
        sendResponse({ status: "error", message: error.message });
      }
    })();
    return true; // Indicates that the response is sent asynchronously.
  } else if (message.action === "OPEN_OPTIONS_PAGE") {
    chrome.runtime.openOptionsPage();
    return false; // No async response needed
  } else if (message.type === "REQUEST_IMMEDIATE_CHECK") { // New message handler
    console.log("Background: Received REQUEST_IMMEDIATE_CHECK from options page.");
    (async () => {
      try {
        await checkForNewGalleries();
        sendResponse({ status: "Immediate check initiated successfully." });
      } catch (error) {
        console.error("Error during immediate check:", error);
        sendResponse({ status: "Immediate check failed.", error: error.message });
      }
    })();
    return true; // Indicates that we will send a response asynchronously
  }
  // Handle other messages if any
  return false; // For synchronous response or no response needed for other types
});

async function getTrackedTags() {
  try {
    const data = await chrome.storage.local.get("trackedTags");
    if (data.trackedTags && Array.isArray(data.trackedTags)) {
      return data.trackedTags;
    }
  } catch (error) {
    console.error("Error getting trackedTags from storage:", error);
  }
  return []; // 如果未設置或出錯，返回空陣列
}

async function getBlacklistedTags() {
  try {
    const data = await chrome.storage.local.get("blacklistedTags");
    return (data.blacklistedTags && Array.isArray(data.blacklistedTags)) ? data.blacklistedTags.map(t => t.toLowerCase()) : [];
  } catch (error) {
    console.error("Error getting blacklistedTags from storage:", error);
    return [];
  }
}

async function getDesktopNotificationSetting() {
    try {
        const data = await chrome.storage.sync.get("showDesktopNotifications");
        // Default to true if undefined (e.g., first time or if setting was somehow cleared)
        return data.showDesktopNotifications !== undefined ? data.showDesktopNotifications : true;
    } catch (error) {
        console.error("Error getting showDesktopNotifications setting:", error);
        return true; // Default to true on error to be safe
    }
}

async function hasOffscreenDocument(path) {
  // Check all windows controlled by the service worker to see if one 
  // of them is the offscreen document with the given path
  const offscreenUrl = chrome.runtime.getURL(path);
  const matchedClients = await clients.matchAll();
  for (const client of matchedClients) {
    if (client.url === offscreenUrl) {
      return true;
    }
  }
  return false;
}

// Function to send a message to the offscreen document and get a response
async function sendMessageToOffscreenDocument(type, data) {
  if (!(await hasOffscreenDocument(OFFSCREEN_DOCUMENT_PATH))) {
    console.log("Attempting to create offscreen document as it does not exist or was closed.");
    try {
        await chrome.offscreen.createDocument({
            url: OFFSCREEN_DOCUMENT_PATH,
            reasons: [chrome.offscreen.Reason.DOM_PARSER],
            justification: 'Parse RSS XML',
        });
        console.log("Offscreen document created (or was already being created).");
    } catch (error) {
        console.error("Failed to create offscreen document:", error.message);
        // 如果創建失敗，可以根據情況決定是否拋出錯誤或返回特定值
        // 檢查是否是因為文檔已存在 (雖然 hasOffscreenDocument 應該處理這種情況)
        if (error.message.includes("Only one offscreen document may be active at a time")) {
            console.warn("Offscreen document likely already exists or is in the process of being created.");
        } else {
            return { success: false, error: `Failed to create offscreen document: ${error.message}` };
        }
    }
  }
  
  console.log(`Sending message to runtime (intended for offscreen): ${type}`, data);
  try {
      // 直接發送消息，offscreen.js 中的監聽器會根據 type 過濾
      const response = await chrome.runtime.sendMessage({ type: type, ...data });
      console.log("Received response via runtime.sendMessage (from offscreen):", response);
      // 通常 offscreen 文檔在完成任務後會關閉自己，但如果沒有，我們可以在這裡嘗試關閉它
      // closeOffscreenDocument(); // 可選：如果確定任務已完成
      return response;
  } catch (error) {
      console.error("Error sending message to or receiving from offscreen document:", error.message);
      return { success: false, error: error.message || "Failed to communicate with offscreen document" };
  }
}

// Optional: Function to close the offscreen document if it exists
async function closeOffscreenDocument() {
    if (await hasOffscreenDocument(OFFSCREEN_DOCUMENT_PATH)) {
        console.log("Closing offscreen document.");
        await chrome.offscreen.closeDocument().catch(err => console.error("Error closing offscreen document:", err));
    }
}

async function parseRssUsingOffscreen(rssText) {
  const response = await sendMessageToOffscreenDocument('parse-rss-in-offscreen', { rssText });
  if (response && response.success) {
    return response.galleryInfos;
  } else {
    console.error("Failed to parse RSS via offscreen document:", response ? response.error : "No response");
    return []; // 返回空數組表示失敗
  }
}

async function checkForNewGalleries() {
  const userTrackedTags = await getTrackedTags();
  if (!userTrackedTags || userTrackedTags.length === 0) {
    console.log("No tracked tags configured. Skipping check.");
    return;
  }
  console.log("Checking for tags:", userTrackedTags);

  // Fetch settings for notifications and blacklist before processing
  const blacklistedTags = await getBlacklistedTags();
  const showNotifications = await getDesktopNotificationSetting();
  console.log("Blacklisted tags:", blacklistedTags);
  console.log("Show desktop notifications setting:", showNotifications);

  try {
    const rssText = await fetchRssFeed();
    if (!rssText) {
        console.log("No RSS text fetched, skipping parsing.");
        return;
    }

    // 使用 Offscreen Document 進行解析
    const galleryInfos = await parseRssUsingOffscreen(rssText);
    console.log("Gallery infos received from offscreen processing:", galleryInfos); // 新日誌

    if (!galleryInfos || galleryInfos.length === 0) {
      console.log("No gallery info extracted from RSS (via offscreen).");
      return;
    }

    // 3. 分批處理 galleryInfos (每批最多25個)
    const batchSize = 25;
    for (let i = 0; i < galleryInfos.length; i += batchSize) {
      const batch = galleryInfos.slice(i, i + batchSize);
      const gidList = batch.map(info => [info.gid, info.token]);

      // Create a map of gid to RSS info for category extraction
      const rssInfoMap = {};
      batch.forEach(info => {
        rssInfoMap[info.gid] = {
          title: info.title || "",
          category: info.category || ""
        };
      });

      // 4. 獲取 gdata API 的元數據
      const gdataPayload = {
        method: "gdata",
        gidlist: gidList,
        namespace: 1,
      };
      console.log("Calling fetchGdata with payload:", JSON.stringify(gdataPayload, null, 2)); // 日誌
      const metadataResponse = await fetchGdata(gdataPayload);
      console.log("Received gdata response:", JSON.stringify(metadataResponse, null, 2)); // 日誌
      if (!metadataResponse || !metadataResponse.gmetadata) {
        console.warn("Failed to get gdata or no metadata found in batch.");
        continue; // 繼續處理下一批
      }

      // 5. 處理元數據，檢查新作品
      await processGdataResponse(metadataResponse.gmetadata, userTrackedTags, blacklistedTags, showNotifications, rssInfoMap);
    }

  } catch (error) {
    console.error("Error in checkForNewGalleries:", error);
  } finally {
    await closeOffscreenDocument();
  }
}

async function fetchRssFeed() {
  try {
    const response = await fetch(EH_RSS_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Failed to fetch RSS feed:", error);
    return null;
  }
}

async function fetchGdata(payload) {
  try {
    const response = await fetch(EH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch gdata:", error);
    return null;
  }
}

async function processGdataResponse(gmetadata, userTrackedTags, blacklistedTags, showNotifications, rssInfoMap = {}) {
  // 從 chrome.storage.local 獲取已發現的作品
  const { discoveredGalleries = {}, trackedWorks = {} } = await chrome.storage.local.get(["discoveredGalleries", "trackedWorks"]);
  const newWorksFoundDetails = []; // Store details of new works for notification and other uses

  for (const gallery of gmetadata) {
    if (gallery.error) {
      console.warn(`Error for gid ${gallery.gid}: ${gallery.error}`);
      continue;
    }

    console.log("Processing gallery in processGdataResponse:", gallery.gid, "Title:", gallery.title);
    // console.log("Gallery tags (raw from API):", gallery.tags); // Potentially verbose
    // console.log("Comparing with userTrackedTags (should be lowercase):", userTrackedTags);

    // Get RSS info for this gallery
    const rssInfo = rssInfoMap[gallery.gid] || {};
    const galleryCategory = rssInfo.category || "";

    // Create combined tags list: API tags + category from RSS
    const apiGalleryTagsLower = gallery.tags.map(t => t.toLowerCase());
    const allGalleryTags = [...apiGalleryTagsLower];
    
    // Add category as a tag if it exists
    if (galleryCategory) {
      const categoryTag = `category:${galleryCategory}`;
      allGalleryTags.push(categoryTag);
      console.log(`Gallery GID ${gallery.gid} has category: ${galleryCategory}, added tag: ${categoryTag}`);
    }

    // Check against blacklist first
    const isBlacklisted = allGalleryTags.some(galleryTag => blacklistedTags.includes(galleryTag));
    if (isBlacklisted) {
      console.log(`Gallery GID ${gallery.gid} (${gallery.title}) is blacklisted. Skipping.`);
      continue;
    }

    // 匹配邏輯: 檢查 gallery 的任何一個 tag (包括category) 是否存在於 userTrackedTags 中
    const matchedUserTag = userTrackedTags.find(userTag => allGalleryTags.includes(userTag));
    
    if (matchedUserTag) {
      console.log(`Matched gallery GID ${gallery.gid} for user tracked tag: ${matchedUserTag}`);
      
      const discoveredForThisTag = discoveredGalleries[matchedUserTag] || [];
      // console.log(`Discovered GIDs for ${matchedUserTag}:`, discoveredForThisTag);

      if (!discoveredForThisTag.includes(gallery.gid)) {
        console.log(`New work! GID ${gallery.gid} not in discovered list for ${matchedUserTag}.`);
        const work = {
          gid: gallery.gid,
          token: gallery.token, // Make sure token is included for URL generation
          title: gallery.title,
          thumb: gallery.thumb,
          posted: parseInt(gallery.posted) * 1000, // API 的 posted 是秒，轉成毫秒
          url: `https://e-hentai.org/g/${gallery.gid}/${gallery.token}/`,
          matchedTag: matchedUserTag, // Use matchedUserTag (which is already lowercase)
        };
        newWorksFoundDetails.push(work);

        // 更新 discoveredGalleries
        discoveredGalleries[matchedUserTag] = [...discoveredForThisTag, gallery.gid];

        // 更新 trackedWorks
        let worksForTag = trackedWorks[matchedUserTag] || [];
        worksForTag = [work, ...worksForTag]; // 添加到最前面
        if (worksForTag.length > 50) { // 最多保留 50 個
          worksForTag = worksForTag.slice(0, 50);
        }
        trackedWorks[matchedUserTag] = worksForTag;
        
        console.log(`Added GID ${gallery.gid} to discovered and tracked lists for ${matchedUserTag}.`);
      } else {
        // console.log(`GID ${gallery.gid} already discovered for ${matchedUserTag}.`);
      }
    }
  }

  if (newWorksFoundDetails.length > 0) {
    console.log("New works found overall:", newWorksFoundDetails.map(w => `${w.matchedTag}: ${w.title}`).join('; '));
    await chrome.storage.local.set({ discoveredGalleries, trackedWorks });
    // 通知 content script 有新作品
    chrome.tabs.query({ url: ["*://e-hentai.org/*", "*://exhentai.org/*"] }, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { action: "NEW_WORKS_FOUND" })
            .catch(err => console.log("Error sending NEW_WORKS_FOUND to tab:", tab.id, err.message));
        }
      });
    });
    // 可選：顯示一個 badge 提示有新作品
    chrome.action.setBadgeText({ text: "NEW" });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });

    // Desktop Notification
    if (showNotifications) {
      let notificationMessage = `發現 ${newWorksFoundDetails.length} 個新作品！`;
      if (newWorksFoundDetails.length === 1) {
        notificationMessage = `新作品: ${newWorksFoundDetails[0].title}`;
      }
      // Provide more details for multiple works if feasible, or keep it simple.
      // For example, list the first few titles.
      if (newWorksFoundDetails.length > 1) {
        const titles = newWorksFoundDetails.slice(0, 3).map(w => w.title).join(", ");
        notificationMessage += `\n如: ${titles}${newWorksFoundDetails.length > 3 ? ' 等等' : ''}`;
      }

      chrome.notifications.create(NOTIFICATION_ID_NEW_WORKS, {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'E-Hentai Tracker 有新發現',
        message: notificationMessage,
        priority: 0 // Between -2 and 2. 0 is default.
      });
      console.log("Desktop notification shown for new works.");
    }

  } else {
    console.log("No new (unblacklisted) works found in this batch.");
  }
}

// 首次運行時手動觸發一次檢查，方便測試
// setTimeout(checkForNewGalleries, 2000); // 2秒後執行一次

// 監聽擴充功能圖示點擊事件
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_SIDEBAR" }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("Could not send TOGGLE_SIDEBAR message to content script. It might not be injected or ready.", chrome.runtime.lastError.message);
      } else {
        console.log("TOGGLE_SIDEBAR message sent to content script, response:", response);
      }
    });
  }
});

// Context menu click listener
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId.startsWith("EHT_saveAs_")) {
    const category = info.menuItemId.substring("EHT_saveAs_".length);
    let selectedText = info.selectionText.trim();

    // Remove existing known prefixes from selected text if present, to avoid duplication
    const knownPrefixes = ["artist:", "group:", "parody:", "character:", "female:", "male:", "category:", "misc:"];
    for (const prefix of knownPrefixes) {
        if (selectedText.toLowerCase().startsWith(prefix)) {
            selectedText = selectedText.substring(prefix.length).trim();
            break;
        }
    }

    const newTag = `${category}:${selectedText.toLowerCase()}`;

    console.log(`Context menu clicked: Add tag '${newTag}'`);

    try {
      const { trackedTags = [] } = await chrome.storage.local.get("trackedTags");
      if (!trackedTags.includes(newTag)) {
        const updatedTags = [...trackedTags, newTag];
        await chrome.storage.local.set({ trackedTags: updatedTags });
        console.log(`Tag '${newTag}' added to trackedTags.`);
        // Notify other parts of the extension about the update
        chrome.runtime.sendMessage({ action: "TRACKED_TAGS_UPDATED", newTags: updatedTags });
        // Optionally trigger a check or update for last uploaded dates
        // await fetchLastUploadedDates(updatedTags);
        // await checkForNewGalleries(); // Or a full check if desired
      } else {
        console.log(`Tag '${newTag}' already exists in trackedTags.`);
        // Optionally notify user that tag already exists, though console log is fine for now.
      }
    } catch (error) {
      console.error("Error saving tag from context menu:", error);
    }
  }
}); 