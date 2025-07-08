# E-Hentai 漫畫追蹤器 (E-Hentai Tracker)

> 追蹤你喜愛的 **E-Hentai / ExHentai** 漫畫更新，並在第一時間以桌面通知、側邊欄顯示給你。完全基於 Chrome Manifest V3，零依賴、載入即用。

---

## 🚀 功能特色

- **🔔 即時桌面通知** ─ 有新作品自動提醒
- **🏷️ 標籤追蹤系統** ─ 支援 *Artist / Group / Parody / Character / Language / Female / Male / Category / Misc* 等多種分類
- **⛔ 黑名單機制** ─ 免受不想看的標籤干擾
- **📅 自訂更新頻率** ─ 20 分鐘 ~ 24 小時任你選
- **🌐 多語系介面** ─ 繁體中文、English、日本語、한국어、Español
- **⚡ 零 Build Step** ─ 純原生 JavaScript + CSS，立即開發、立即重載

## 📂 專案結構
```text
comic_tracker_web/
├─ background.js   # 排程、RSS/GData 解析、通知
├─ content.js      # 注入側邊欄 UI 與頁內互動
├─ options.html    # 設定頁面（含 options.js / .css）
├─ offscreen.js    # 於 Offscreen Document 中以 DOMParser 解析 RSS
├─ manifest.json   # Chrome MV3 設定檔
├─ _locales/       # i18n 字串（繁中 / 英 / 日 / 韓 / 西）
└─ icons/          # 擴充套件圖示
```

## 🛠️ 安裝

1. 下載或 `git clone` 本庫：
   ```bash
   git clone https://github.com/<your-name>/comic_tracker_web.git
   ```
2. 在 Chrome 地址列輸入 `chrome://extensions/`，開啟「開發人員模式」。
3. 點擊「載入已解壓縮的擴充功能」，選取 `comic_tracker_web` 根目錄。

> Edge / Brave / Vivaldi 等 Chromium 系瀏覽器亦可使用相同步驟安裝。

## ✨ 使用說明

1. 進入 E-Hentai / ExHentai 任意頁面，點擊工具列上的「E-Hentai Tracker」圖示（或按 `Alt+E`）開啟側邊欄。
2. 在側邊欄點擊「後臺管理」可開啟完整設定頁，新增要追蹤的標籤、調整更新頻率、語言及黑名單。
3. 擴充套件會依設定週期自動檢查 RSS，並以官方 `/api.php` 取得詳細資訊；如有新作品將顯示通知並同步於側邊欄列出。

## 🧑‍💻 本地開發

本專案 **無任何打包工具或 Node 依賴**。修改完檔案後，回到 `chrome://extensions/` 點擊「重新載入」即可測試。

建立新分支開發：
```bash
git checkout -b feat/your-feature
```

## 🛡️ License

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

本專案以 **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** 授權：

- 允許自由複製、散布、修改程式碼
- **禁止任何形式之商業用途**（包含但不限於付費服務、廣告營利、企業內部專有部署）
- 使用時請保留原作者署名並附上本授權條款

若需商業授權，請另行聯絡作者。

---

*本專案與 𝙀-𝙃𝙚𝙣𝙩𝙖𝙞 / 𝙀𝙭𝙃𝙚𝙣𝙩𝙖𝙞 官方無任何關聯。所有商標與版權歸原權利人所有。* 