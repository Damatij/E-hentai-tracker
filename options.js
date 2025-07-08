document.addEventListener("DOMContentLoaded", () => {
  const artistInput = document.getElementById("artist-input");
  const addArtistButton = document.getElementById("add-artist-button");
  const trackedArtistsListUI = document.getElementById("tracked-artists-list");
  const predefinedArtistsContainer = document.getElementById("predefined-artists-container");

  const groupInput = document.getElementById("group-input");
  const addGroupButton = document.getElementById("add-group-button");
  const trackedGroupsListUI = document.getElementById("tracked-groups-list");
  const predefinedGroupsContainer = document.getElementById("predefined-groups-container");

  const languageInput = document.getElementById("language-input");
  const addLanguageButton = document.getElementById("add-language-button");
  const trackedLanguagesList = document.getElementById("tracked-languages-list");
  const predefinedLanguagesContainer = document.getElementById("predefined-languages-container");

  const parodyInput = document.getElementById("parody-input");
  const addParodyButton = document.getElementById("add-parody-button");
  const trackedParodiesList = document.getElementById("tracked-parodies-list");
  const predefinedParodiesContainer = document.getElementById("predefined-parodies-container");

  const characterInput = document.getElementById("character-input");
  const addCharacterButton = document.getElementById("add-character-button");
  const trackedCharactersList = document.getElementById("tracked-characters-list");
  const predefinedCharactersContainer = document.getElementById("predefined-characters-container");

  const femaleInput = document.getElementById("female-input");
  const addFemaleButton = document.getElementById("add-female-button");
  const trackedFemalesList = document.getElementById("tracked-females-list");
  const predefinedFemalesContainer = document.getElementById("predefined-females-container");

  const categoryInput = document.getElementById("category-input");
  const addCategoryButton = document.getElementById("add-category-button");
  const trackedCategoriesList = document.getElementById("tracked-categories-list");
  const predefinedCategoriesContainer = document.getElementById("predefined-categories-container");

  const statusDiv = document.getElementById("status");
  const updateFrequencySelect = document.getElementById("update-frequency-select");
  const updateNowButton = document.getElementById("update-now-button");
  const navLinks = document.querySelectorAll('.sidebar .nav-link');
  const contentSections = document.querySelectorAll('.main-content .content-section');
  const languageSelect = document.getElementById('language-select');
  const desktopNotificationsToggle = document.getElementById('desktop-notifications-toggle');
  const blacklistInput = document.getElementById('blacklist-input');
  const addBlacklistTagButton = document.getElementById('add-blacklist-tag-button');
  const blacklistedTagsContainer = document.getElementById('blacklisted-tags-container');
  // Import/Export elements
  const exportSettingsButton = document.getElementById('export-settings-button');
  const importSettingsButton = document.getElementById('import-settings-button');
  const importFileInput = document.getElementById('import-file-input');

  let currentTrackedTags = [];
  let currentBlacklistedTags = [];
  const DEFAULT_UPDATE_FREQUENCY_MINUTES = 60;
  let currentLanguage = 'zh-TW'; // Default language

  // --- UI STRINGS FOR TRANSLATION ---
  const uiStrings = {
    'zh-TW': {
      // Titles
      optionsTitle: 'E-Hentai Tracker 選項',
      manageTagsTitle: '標籤管理',
      updateFrequencyTitle: '更新頻率設定',
      generalSettingsTitle: '一般設定',
      importExportTitle: '匯入/匯出設定',
      aboutTitle: '關於',
      // currentlyTrackedTagsLabel: '目前追蹤的標籤',
      // Labels & Subtitles
      manageTagsDescription: '在此處新增或移除您想追蹤的標籤。點擊下方的快速新增按鈕，或手動輸入後新增。',
      artistTagsLabel: 'Artist 標籤',
      groupTagsLabel: 'Group 標籤',
      languageTagsLabel: 'Language 標籤',
      parodyTagsLabel: 'Parody 標籤',
      characterTagsLabel: 'Character 標籤',
      femaleTagsLabel: 'Female 標籤 (內容導向)',
      categoryTagsLabel: 'Category 標籤',
      quickAddLabelPrefix: '快速新增 ',
      quickAddArtistLabel: '快速新增 Artist 標籤:',
      quickAddGroupLabel: '快速新增 Group 標籤:',
      quickAddLanguageLabel: '快速新增 Language 標籤:',
      quickAddParodyLabel: '快速新增 Parody 標籤:',
      quickAddCharacterLabel: '快速新增 Character 標籤:',
      quickAddFemaleLabel: '快速新增 Female 標籤:',
      quickAddCategoryLabel: '快速新增 Category 標籤:',
      checkFrequencyLabel: '檢查新作品頻率:',
      selectLanguageLabel: '選擇顯示語言:',
      desktopNotificationsSectionTitle: '桌面通知',
      desktopNotificationsLabel: '在新作品發現時顯示桌面通知',
      blacklistTagsSectionTitle: '黑名單標籤管理',
      blacklistTagsDescription: '加入黑名單的標籤將不會被追蹤，即使它們符合您追蹤的 Artist 或 Group。',
      addBlacklistButton: '新增至黑名單',
      currentBlacklistLabel: '目前黑名單中的標籤:',
      blacklistInputPlaceholder: '輸入標籤 (例如: yaoi)',
      // Buttons
      addArtistButton: '新增 Artist',
      addGroupButton: '新增 Group',
      addLanguageButton: '新增 Language',
      addParodyButton: '新增 Parody',
      addCharacterButton: '新增 Character',
      addFemaleButton: '新增 Female 標籤',
      addCategoryButton: '新增 Category',
      updateNowButton: '立即更新',
      // Placeholders
      artistInputPlaceholder: '例如: aiue oka',
      groupInputPlaceholder: '例如: neko works',
      languageInputPlaceholder: '例如: chinese (中文)',
      parodyInputPlaceholder: '例如: fate grand order (天命/冠位指定)',
      characterInputPlaceholder: '例如: hatsune miku (初音未來)',
      femaleInputPlaceholder: '例如: lolicon (蘿莉控)',
      categoryInputPlaceholder: '例如: doujinshi',
      // Select Options (Update Frequency)
      freq20min: '20 分鐘',
      freq40min: '40 分鐘',
      freq1hrDefault: '1 小時 (預設)',
      freq2hr: '2 小時',
      freq6hr: '6 小時',
      freq24hr: '24 小時',
      // Status Messages
      statusEnterTagName: (type) => `請輸入 ${type} 名稱。`,
      statusTagAdded: (tag) => `已新增追蹤: ${tag}`,
      statusTagExists: (tag) => `${tag} 已在追蹤列表中。`,
      statusTagRemoved: (tag) => `已移除追蹤: ${tag}`,
      statusFreqSet: (freq) => `更新頻率已設為 ${freq} 分鐘。`,
      statusLangSet: (lang) => {
        let langName = 'English';
        if (lang === 'zh-TW') langName = '繁體中文';
        else if (lang === 'ja') langName = '日本語';
        else if (lang === 'ko') langName = '한국어';
        else if (lang === 'es') langName = 'Español';
        return `語言已設定為 ${langName}。`;
      },
      statusDesktopNotificationEnabled: '桌面通知已啟用。',
      statusDesktopNotificationDisabled: '桌面通知已停用。',
      statusBlacklistTagAdded: (tag) => `已將 '${tag}' 加入黑名單。`,
      statusBlacklistTagExists: (tag) => `'${tag}' 已在黑名單中。`,
      statusBlacklistTagRemoved: (tag) => `已從黑名單移除 '${tag}'。`,
      statusInvalidBlacklistTag: '請輸入有效的黑名單標籤名稱。',
      statusUpdateInitiated: '已開始檢查更新...',
      aboutSectionPara1: 'E-Hentai Tracker v0.3.0',
      aboutSectionPara2: '協助您追蹤喜愛的 E-Hentai 內容。',
      featureNotAvailable: '此功能區尚未開放.',
      removeButtonText: '移除',
      noTagsInCategory: '此分類目前沒有追蹤的標籤。',
      noBlacklistTagsYet: '目前沒有黑名單標籤。',
      // Import/Export specific
      exportSettingsButton: '匯出設定',
      importSettingsButton: '匯入設定',
      exportDescription: '將您目前的追蹤列表、黑名單和一般設定儲存到檔案中。',
      importDescription: '從先前儲存的檔案載入追蹤列表、黑名單和一般設定。這將會覆寫目前的設定。',
      statusSettingsExported: '設定已成功匯出!',
      statusSettingsImported: '設定已成功匯入! 頁面將重新載入。',
      statusImportParseError: '匯入失敗: 無法解析檔案內容，請確認檔案格式正確。',
      statusImportReadError: '匯入失敗: 無法讀取檔案。',
      statusImportInvalidData: '匯入失敗: 檔案內容無效或缺少必要欄位。',
      quickAddBlacklistLabel: '快速新增黑名單標籤:' // New string
    },
    'en': {
      // Titles
      optionsTitle: 'E-Hentai Tracker Options',
      manageTagsTitle: 'Manage Tags',
      updateFrequencyTitle: 'Update Frequency Settings',
      generalSettingsTitle: 'General Settings',
      importExportTitle: 'Import/Export Settings',
      aboutTitle: 'About',
      // currentlyTrackedTagsLabel: 'Currently Tracked Tags',
      // Labels & Subtitles
      manageTagsDescription: 'Add or remove tags you want to track. Click quick add buttons below, or enter manually.',
      artistTagsLabel: 'Artist Tags',
      groupTagsLabel: 'Group Tags',
      languageTagsLabel: 'Language Tags',
      parodyTagsLabel: 'Parody Tags',
      characterTagsLabel: 'Character Tags',
      femaleTagsLabel: 'Female Tags (Content Oriented)',
      categoryTagsLabel: 'Category Tags',
      quickAddLabelPrefix: 'Quick Add ',
      quickAddArtistLabel: 'Quick Add Artist Tags:',
      quickAddGroupLabel: 'Quick Add Group Tags:',
      quickAddLanguageLabel: 'Quick Add Language Tags:',
      quickAddParodyLabel: 'Quick Add Parody Tags:',
      quickAddCharacterLabel: 'Quick Add Character Tags:',
      quickAddFemaleLabel: 'Quick Add Female Tags:',
      quickAddCategoryLabel: 'Quick Add Category Tags:',
      checkFrequencyLabel: 'Check for new works every:',
      selectLanguageLabel: 'Select Display Language:',
      desktopNotificationsSectionTitle: 'Desktop Notifications',
      desktopNotificationsLabel: 'Show desktop notifications for new works',
      blacklistTagsSectionTitle: 'Blacklist Tags Management',
      blacklistTagsDescription: 'Blacklisted tags will not be tracked, even if they match your tracked Artists or Groups.',
      addBlacklistButton: 'Add to Blacklist',
      currentBlacklistLabel: 'Currently Blacklisted Tags:',
      blacklistInputPlaceholder: 'Enter tag (e.g., yaoi)',
      // Buttons
      addArtistButton: 'Add Artist',
      addGroupButton: 'Add Group',
      addLanguageButton: 'Add Language',
      addParodyButton: 'Add Parody',
      addCharacterButton: 'Add Character',
      addFemaleButton: 'Add Female Tag',
      addCategoryButton: 'Add Category',
      updateNowButton: 'Update Now',
      // Placeholders
      artistInputPlaceholder: 'e.g., aiue oka',
      groupInputPlaceholder: 'e.g., neko works',
      languageInputPlaceholder: 'e.g., chinese',
      parodyInputPlaceholder: 'e.g., fate grand order',
      characterInputPlaceholder: 'e.g., hatsune miku',
      femaleInputPlaceholder: 'e.g., lolicon',
      categoryInputPlaceholder: 'e.g., doujinshi',
      // Select Options (Update Frequency)
      freq20min: '20 minutes',
      freq40min: '40 minutes',
      freq1hrDefault: '1 hour (default)',
      freq2hr: '2 hours',
      freq6hr: '6 hours',
      freq24hr: '24 hours',
      // Status Messages
      statusEnterTagName: (type) => `Please enter ${type} name.`,
      statusTagAdded: (tag) => `Added to tracking: ${tag}`,
      statusTagExists: (tag) => `${tag} is already in tracking list.`,
      statusTagRemoved: (tag) => `Removed from tracking: ${tag}`,
      statusFreqSet: (freq) => `Update frequency set to ${freq} minutes.`,
      statusLangSet: (lang) => {
        let langName = 'English';
        if (lang === 'zh-TW') langName = 'Traditional Chinese';
        else if (lang === 'ja') langName = 'Japanese';
        else if (lang === 'ko') langName = 'Korean';
        else if (lang === 'es') langName = 'Spanish';
        return `Language set to ${langName}.`;
      },
      statusDesktopNotificationEnabled: 'Desktop notifications enabled.',
      statusDesktopNotificationDisabled: 'Desktop notifications disabled.',
      statusBlacklistTagAdded: (tag) => `Added '${tag}' to blacklist.`,
      statusBlacklistTagExists: (tag) => `'${tag}' is already in blacklist.`,
      statusBlacklistTagRemoved: (tag) => `Removed '${tag}' from blacklist.`,
      statusInvalidBlacklistTag: 'Please enter a valid blacklist tag name.',
      statusUpdateInitiated: 'Update check initiated...',
      aboutSectionPara1: 'E-Hentai Tracker v0.3.0',
      aboutSectionPara2: 'Helps you track your favorite E-Hentai content.',
      featureNotAvailable: 'This feature is not yet available.',
      removeButtonText: 'Remove',
      noTagsInCategory: 'No tags are currently tracked in this category.',
      noBlacklistTagsYet: 'No tags are currently blacklisted.',
      // Import/Export specific
      exportSettingsButton: 'Export Settings',
      importSettingsButton: 'Import Settings',
      exportDescription: 'Save your current tracked tags, blacklist, and general settings to a file.',
      importDescription: 'Load tracked tags, blacklist, and general settings from a previously saved file. This will overwrite current settings.',
      statusSettingsExported: 'Settings exported successfully!',
      statusSettingsImported: 'Settings imported successfully! The page will reload.',
      statusImportParseError: 'Import failed: Could not parse file content. Ensure the file is a valid JSON.',
      statusImportReadError: 'Import failed: Could not read the file.',
      statusImportInvalidData: 'Import failed: Invalid data structure or missing required fields in the file.',
      quickAddBlacklistLabel: 'Quick Add Blacklist Tags:' // New string
    },
    'ja': {
      optionsTitle: 'E-Hentaiトラッカーオプション',
      manageTagsTitle: 'タグ管理',
      updateFrequencyTitle: '更新頻度設定',
      generalSettingsTitle: '一般設定',
      importExportTitle: 'インポート/エクスポート設定',
      aboutTitle: '概要',
      manageTagsDescription: '追跡したいタグを追加または削除します。下のクイック追加ボタンをクリックするか、手動で入力して追加します。',
      artistTagsLabel: 'アーティストタグ',
      groupTagsLabel: 'グループタグ',
      languageTagsLabel: '言語タグ',
      parodyTagsLabel: 'パロディタグ',
      characterTagsLabel: 'キャラクタータグ',
      femaleTagsLabel: '女性向けタグ（コンテンツ指向）',
      quickAddLabelPrefix: 'クイック追加 ',
      quickAddArtistLabel: 'クイック追加 アーティストタグ:',
      quickAddGroupLabel: 'クイック追加 グループタグ:',
      quickAddLanguageLabel: 'クイック追加 言語タグ:',
      quickAddParodyLabel: 'クイック追加 パロディタグ:',
      quickAddCharacterLabel: 'クイック追加 キャラクタータグ:',
      quickAddFemaleLabel: 'クイック追加 女性向けタグ:',
      checkFrequencyLabel: '新しい作品の確認頻度:',
      selectLanguageLabel: '表示言語を選択:',
      desktopNotificationsSectionTitle: 'デスクトップ通知',
      desktopNotificationsLabel: '新しい作品が見つかったときにデスクトップ通知を表示する',
      blacklistTagsSectionTitle: 'ブラックリストタグ管理',
      blacklistTagsDescription: 'ブラックリストに追加されたタグは、追跡対象のアーティストやグループに一致する場合でも追跡されません。',
      addBlacklistButton: 'ブラックリストに追加',
      currentBlacklistLabel: '現在のブラックリストタグ:',
      blacklistInputPlaceholder: 'タグを入力（例: yaoi）',
      addArtistButton: 'アーティスト追加',
      addGroupButton: 'グループ追加',
      addLanguageButton: '言語追加',
      addParodyButton: 'パロディ追加',
      addCharacterButton: 'キャラクター追加',
      addFemaleButton: '女性向けタグ追加',
      updateNowButton: '今すぐ更新',
      artistInputPlaceholder: '例: aiue oka',
      groupInputPlaceholder: '例: neko works',
      languageInputPlaceholder: '例: japanese (日本語)',
      parodyInputPlaceholder: '例: fate grand order',
      characterInputPlaceholder: '例: hatsune miku',
      femaleInputPlaceholder: '例: lolicon',
      freq20min: '20分',
      freq40min: '40分',
      freq1hrDefault: '1時間（デフォルト）',
      freq2hr: '2時間',
      freq6hr: '6時間',
      freq24hr: '24時間',
      statusEnterTagName: (type) => `${type}名を入力してください。`,
      statusTagAdded: (tag) => `追跡に追加しました: ${tag}`,
      statusTagExists: (tag) => `${tag} は既に追跡リストにあります。`,
      statusTagRemoved: (tag) => `追跡から削除しました: ${tag}`,
      statusFreqSet: (freq) => `更新頻度を ${freq} 分に設定しました。`,
      statusLangSet: (lang) => {
        let langName = 'English';
        if (lang === 'zh-TW') langName = '繁體中文';
        else if (lang === 'ja') langName = '日本語';
        else if (lang === 'ko') langName = '한국어';
        else if (lang === 'es') langName = 'Español';
        return `言語を${langName}に設定しました。`;
      },
      statusDesktopNotificationEnabled: 'デスクトップ通知が有効になりました。',
      statusDesktopNotificationDisabled: 'デスクトップ通知が無効になりました。',
      statusBlacklistTagAdded: (tag) => `\'${tag}\' をブラックリストに追加しました。`,
      statusBlacklistTagExists: (tag) => `\'${tag}\' は既にブラックリストにあります。`,
      statusBlacklistTagRemoved: (tag) => `\'${tag}\' をブラックリストから削除しました。`,
      statusInvalidBlacklistTag: '有効なブラックリストタグ名を入力してください。',
      statusUpdateInitiated: '更新チェックを開始しました...',
      aboutSectionPara1: 'E-Hentaiトラッカー v0.3.0',
      aboutSectionPara2: 'お気に入りのE-Hentaiコンテンツの追跡を支援します。',
      featureNotAvailable: 'この機能はまだ利用できません。',
      removeButtonText: '削除',
      noTagsInCategory: 'このカテゴリでは現在タグは追跡されていません。',
      noBlacklistTagsYet: '現在ブラックリストに登録されているタグはありません。',
      // Import/Export specific - Corrected to Japanese
      exportSettingsButton: '設定をエクスポート',
      importSettingsButton: '設定をインポート',
      exportDescription: '現在の追跡タグ、ブラックリスト、一般設定をファイルに保存します。',
      importDescription: '以前に保存したファイルから追跡タグ、ブラックリスト、一般設定を読み込みます。これにより現在の設定が上書きされます。',
      statusSettingsExported: '設定が正常にエクスポートされました！',
      statusSettingsImported: '設定が正常にインポートされました！ページが再読み込みされます。',
      statusImportParseError: 'インポート失敗：ファイル内容を解析できませんでした。ファイルが有効なJSONであることを確認してください。',
      statusImportReadError: 'インポート失敗：ファイルを読み取れませんでした。',
      statusImportInvalidData: 'インポート失敗：無効なデータ構造またはファイルに必要なフィールドがありません。',
      quickAddBlacklistLabel: 'クイック追加 ブラックリストタグ:' // New string
    },
    'ko': {
      optionsTitle: 'E-Hentai 트래커 옵션',
      manageTagsTitle: '태그 관리',
      updateFrequencyTitle: '업데이트 빈도 설정',
      generalSettingsTitle: '일반 설정',
      importExportTitle: '가져오기/내보내기 설정',
      aboutTitle: '정보',
      manageTagsDescription: '추적할 태그를 추가하거나 제거합니다. 아래 빠른 추가 버튼을 클릭하거나 수동으로 입력하여 추가하십시오.',
      artistTagsLabel: '아티스트 태그',
      groupTagsLabel: '그룹 태그',
      languageTagsLabel: '언어 태그',
      parodyTagsLabel: '패러디 태그',
      characterTagsLabel: '캐릭터 태그',
      femaleTagsLabel: '여성 태그 (콘텐츠 지향)',
      quickAddLabelPrefix: '빠른 추가 ',
      quickAddArtistLabel: '빠른 추가 아티스트 태그:',
      quickAddGroupLabel: '빠른 추가 그룹 태그:',
      quickAddLanguageLabel: '빠른 추가 언어 태그:',
      quickAddParodyLabel: '빠른 추가 패러디 태그:',
      quickAddCharacterLabel: '빠른 추가 캐릭터 태그:',
      quickAddFemaleLabel: '빠른 추가 여성 태그:',
      checkFrequencyLabel: '새 작품 확인 빈도:',
      selectLanguageLabel: '표시 언어 선택:',
      desktopNotificationsSectionTitle: '데스크톱 알림',
      desktopNotificationsLabel: '새 작품 발견 시 데스크톱 알림 표시',
      blacklistTagsSectionTitle: '블랙리스트 태그 관리',
      blacklistTagsDescription: '블랙리스트에 추가된 태그는 추적된 아티스트 또는 그룹과 일치하더라도 추적되지 않습니다.',
      addBlacklistButton: '블랙리스트에 추가',
      currentBlacklistLabel: '현재 블랙리스트된 태그:',
      blacklistInputPlaceholder: '태그 입력 (예: yaoi)',
      addArtistButton: '아티스트 추가',
      addGroupButton: '그룹 추가',
      addLanguageButton: '언어 추가',
      addParodyButton: '패러디 추가',
      addCharacterButton: '캐릭터 추가',
      addFemaleButton: '여성 태그 추가',
      updateNowButton: '지금 업데이트',
      artistInputPlaceholder: '예: aiue oka',
      groupInputPlaceholder: '예: neko works',
      languageInputPlaceholder: '예: korean (한국어)',
      parodyInputPlaceholder: '예: fate grand order',
      characterInputPlaceholder: '예: hatsune miku',
      femaleInputPlaceholder: '예: lolicon',
      freq20min: '20분',
      freq40min: '40분',
      freq1hrDefault: '1시간 (기본값)',
      freq2hr: '2시간',
      freq6hr: '6시간',
      freq24hr: '24시간',
      statusEnterTagName: (type) => `${type} 이름을 입력하십시오.`,
      statusTagAdded: (tag) => `추적에 추가됨: ${tag}`,
      statusTagExists: (tag) => `${tag} 은(는) 이미 추적 목록에 있습니다.`,
      statusTagRemoved: (tag) => `추적에서 제거됨: ${tag}`,
      statusFreqSet: (freq) => `업데이트 빈도가 ${freq} 분으로 설정되었습니다.`,
      statusLangSet: (lang) => {
        let langName = 'English';
        if (lang === 'zh-TW') langName = '繁體中文';
        else if (lang === 'ja') langName = '日本語';
        else if (lang === 'ko') langName = '한국어';
        else if (lang === 'es') langName = 'Español';
        return `언어가 ${langName}(으)로 설정되었습니다.`;
      },
      statusDesktopNotificationEnabled: '데스크톱 알림이 활성화되었습니다.',
      statusDesktopNotificationDisabled: '데스크톱 알림이 비활성화되었습니다.',
      statusBlacklistTagAdded: (tag) => `'${tag}'을(를) 블랙리스트에 추가했습니다.`,
      statusBlacklistTagExists: (tag) => `'${tag}'은(는) 이미 블랙리스트에 있습니다.`,
      statusBlacklistTagRemoved: (tag) => `'${tag}'을(를) 블랙리스트에서 제거했습니다.`,
      statusInvalidBlacklistTag: '유효한 블랙리스트 태그 이름을 입력하십시오.',
      statusUpdateInitiated: '업데이트 확인 시작됨...',
      aboutSectionPara1: 'E-Hentai 트래커 v0.3.0',
      aboutSectionPara2: '좋아하는 E-Hentai 콘텐츠를 추적하는 데 도움이 됩니다.',
      featureNotAvailable: '이 기능은 아직 사용할 수 없습니다.',
      removeButtonText: '제거',
      noTagsInCategory: '이 카테고리에는 현재 추적된 태그가 없습니다.',
      noBlacklistTagsYet: '현재 블랙리스트에 등록된 태그가 없습니다.',
      exportSettingsButton: '설정 내보내기',
      importSettingsButton: '설정 가져오기',
      exportDescription: '현재 추적된 태그, 블랙리스트 및 일반 설정을 파일에 저장합니다.',
      importDescription: '이전에 저장된 파일에서 추적된 태그, 블랙리스트 및 일반 설정을 로드합니다. 이렇게 하면 현재 설정이 덮어쓰여집니다.',
      statusSettingsExported: '설정을 성공적으로 내보냈습니다!',
      statusSettingsImported: '설정을 성공적으로 가져왔습니다! 페이지가 다시 로드됩니다.',
      statusImportParseError: '가져오기 실패: 파일 내용을 구문 분석할 수 없습니다. 파일이 유효한 JSON인지 확인하십시오.',
      statusImportReadError: '가져오기 실패: 파일을 읽을 수 없습니다.',
      statusImportInvalidData: '가져오기 실패: 파일 내용이 유효하지 않거나 필수 필드가 누락되었습니다.',
      quickAddBlacklistLabel: '빠른 추가 블랙리스트 태그:' // New string
    },
    'es': {
      optionsTitle: 'Opciones de E-Hentai Tracker',
      manageTagsTitle: 'Gestionar Etiquetas',
      updateFrequencyTitle: 'Configuración de Frecuencia de Actualización',
      generalSettingsTitle: 'Configuración General',
      importExportTitle: 'Importar/Exportar Configuración',
      aboutTitle: 'Acerca de',
      manageTagsDescription: 'Añada o elimine las etiquetas que desea rastrear. Haga clic en los botones de adición rápida de abajo o ingrese manualmente y luego añada.',
      artistTagsLabel: 'Etiquetas de Artista',
      groupTagsLabel: 'Etiquetas de Grupo',
      languageTagsLabel: 'Etiquetas de Idioma',
      parodyTagsLabel: 'Etiquetas de Parodia',
      characterTagsLabel: 'Etiquetas de Personaje',
      femaleTagsLabel: 'Etiquetas Femeninas (Orientadas al Contenido)',
      quickAddLabelPrefix: 'Adición Rápida ',
      quickAddArtistLabel: 'Adición Rápida Etiquetas de Artista:',
      quickAddGroupLabel: 'Adición Rápida Etiquetas de Grupo:',
      quickAddLanguageLabel: 'Adición Rápida Etiquetas de Idioma:',
      quickAddParodyLabel: 'Adición Rápida Etiquetas de Parodia:',
      quickAddCharacterLabel: 'Adición Rápida Etiquetas de Personaje:',
      quickAddFemaleLabel: 'Adición Rápida Etiquetas Femeninas:',
      checkFrequencyLabel: 'Frecuencia de revisión de nuevas obras:',
      selectLanguageLabel: 'Seleccionar Idioma de Visualización:',
      desktopNotificationsSectionTitle: 'Notificaciones de Escritorio',
      desktopNotificationsLabel: 'Mostrar notificaciones de escritorio cuando se encuentren nuevas obras',
      blacklistTagsSectionTitle: 'Gestión de Etiquetas de Lista Negra',
      blacklistTagsDescription: 'Las etiquetas añadidas a la lista negra no serán rastreadas, incluso si coinciden con sus Artistas o Grupos rastreados.',
      addBlacklistButton: 'Añadir a Lista Negra',
      currentBlacklistLabel: 'Etiquetas Actualmente en Lista Negra:',
      blacklistInputPlaceholder: 'Ingrese etiqueta (ej: yaoi)',
      addArtistButton: 'Añadir Artista',
      addGroupButton: 'Añadir Grupo',
      addLanguageButton: 'Añadir Idioma',
      addParodyButton: 'Añadir Parodia',
      addCharacterButton: 'Añadir Personaje',
      addFemaleButton: 'Añadir Etiqueta Femenina',
      updateNowButton: 'Actualizar Ahora',
      artistInputPlaceholder: 'ej: aiue oka',
      groupInputPlaceholder: 'ej: neko works',
      languageInputPlaceholder: 'ej: spanish (español)',
      parodyInputPlaceholder: 'ej: fate grand order',
      characterInputPlaceholder: 'ej: hatsune miku',
      femaleInputPlaceholder: 'ej: lolicon',
      freq20min: '20 minutos',
      freq40min: '40 minutos',
      freq1hrDefault: '1 hora (predeterminado)',
      freq2hr: '2 horas',
      freq6hr: '6 horas',
      freq24hr: '24 horas',
      statusEnterTagName: (type) => `Por favor ingrese el nombre de ${type}.`,
      statusTagAdded: (tag) => `Añadido al rastreo: ${tag}`,
      statusTagExists: (tag) => `${tag} ya está en la lista de rastreo.`,
      statusTagRemoved: (tag) => `Eliminado del rastreo: ${tag}`,
      statusFreqSet: (freq) => `Frecuencia de actualización establecida en ${freq} minutos.`,
      statusLangSet: (lang) => {
        let langName = 'English';
        if (lang === 'zh-TW') langName = '繁體中文';
        else if (lang === 'ja') langName = '日本語';
        else if (lang === 'ko') langName = '한국어';
        else if (lang === 'es') langName = 'Español';
        return `Idioma establecido a ${langName}.`;
      },
      statusDesktopNotificationEnabled: 'Notificaciones de escritorio habilitadas.',
      statusDesktopNotificationDisabled: 'Notificaciones de escritorio deshabilitadas.',
      statusBlacklistTagAdded: (tag) => `Se ha añadido '${tag}' a la lista negra.`,
      statusBlacklistTagExists: (tag) => `'${tag}' ya está en la lista negra.`,
      statusBlacklistTagRemoved: (tag) => `Se ha eliminado '${tag}' de la lista negra.`,
      statusInvalidBlacklistTag: 'Por favor ingrese un nombre de etiqueta de lista negra válido.',
      statusUpdateInitiated: 'Comprobación de actualizaciones iniciada...',
      aboutSectionPara1: 'E-Hentai Tracker v0.3.0',
      aboutSectionPara2: 'Le ayuda a rastrear su contenido favorito de E-Hentai.',
      featureNotAvailable: 'Esta función aún no está disponible.',
      removeButtonText: 'Eliminar',
      noTagsInCategory: 'Actualmente no hay etiquetas rastreadas en esta categoría.',
      noBlacklistTagsYet: 'Actualmente no hay etiquetas en la lista negra.',
      exportSettingsButton: 'Exportar Configuración',
      importSettingsButton: 'Importar Configuración',
      exportDescription: 'Guarde sus etiquetas rastreadas actuales, lista negra y configuraciones generales en un archivo.',
      importDescription: 'Cargue etiquetas rastreadas, lista negra y configuraciones generales desde un archivo guardado previamente. Esto sobrescribirá la configuración actual.',
      statusSettingsExported: '¡Configuración exportada exitosamente!',
      statusSettingsImported: '¡Configuración importada exitosamente! La página se recargará.',
      statusImportParseError: 'Error de importación: No se pudo analizar el contenido del archivo. Asegúrese de que el archivo sea un JSON válido.',
      statusImportReadError: 'Error de importación: No se pudo leer el archivo.',
      statusImportInvalidData: 'Error de importación: Contenido de archivo inválido o faltan campos obligatorios.',
      quickAddBlacklistLabel: 'Adición Rápida Etiquetas de Lista Negra:' // New string
    }
  };

  function applyTranslations(lang) {
    const s = uiStrings[lang] || uiStrings['en']; // Fallback to English
    document.title = s.optionsTitle;
    
    // Main title
    document.querySelector('.main-content > h1').textContent = s.optionsTitle;

    // Sidebar Nav Links
    document.querySelector('.sidebar a[href="#tags-management"]').textContent = s.manageTagsTitle;
    document.querySelector('.sidebar a[href="#update-frequency"]').textContent = s.updateFrequencyTitle;
    document.querySelector('.sidebar a[href="#general-settings"]').textContent = s.generalSettingsTitle;
    document.querySelector('.sidebar a[href="#import-export"]').textContent = s.importExportTitle;
    document.querySelector('.sidebar a[href="#about"]').textContent = s.aboutTitle;

    // Content Section Titles and Paragraphs
    const tagsManagementSection = document.getElementById('tags-management');
    tagsManagementSection.querySelector('h2').textContent = s.manageTagsTitle;
    tagsManagementSection.querySelector('p').textContent = s.manageTagsDescription;
    
    // Translate the new "Currently Tracked Tags" label
    // const currentlyTrackedSection = tagsManagementSection.querySelector('#currently-tracked-tags-container').parentElement;
    // if (currentlyTrackedSection && currentlyTrackedSection.querySelector('h3')) {
    //     currentlyTrackedSection.querySelector('h3').textContent = s.currentlyTrackedTagsLabel;
    // }
    
    tagsManagementSection.querySelector('.tag-category-section:nth-child(1) h3').textContent = s.categoryTagsLabel;
    tagsManagementSection.querySelector('.tag-category-section:nth-child(1) h4').textContent = s.quickAddCategoryLabel;
    categoryInput.placeholder = s.categoryInputPlaceholder;
    addCategoryButton.textContent = s.addCategoryButton;
    
    tagsManagementSection.querySelector('.tag-category-section:nth-child(2) h3').textContent = s.artistTagsLabel;
    tagsManagementSection.querySelector('.tag-category-section:nth-child(2) h4').textContent = s.quickAddArtistLabel;
    artistInput.placeholder = s.artistInputPlaceholder;
    addArtistButton.textContent = s.addArtistButton;
    
    tagsManagementSection.querySelector('.tag-category-section:nth-child(3) h3').textContent = s.groupTagsLabel;
    tagsManagementSection.querySelector('.tag-category-section:nth-child(3) h4').textContent = s.quickAddGroupLabel;
    groupInput.placeholder = s.groupInputPlaceholder;
    addGroupButton.textContent = s.addGroupButton;

    tagsManagementSection.querySelector('.tag-category-section:nth-child(4) h3').textContent = s.languageTagsLabel;
    tagsManagementSection.querySelector('.tag-category-section:nth-child(4) h4').textContent = s.quickAddLanguageLabel;
    languageInput.placeholder = s.languageInputPlaceholder;
    addLanguageButton.textContent = s.addLanguageButton;

    tagsManagementSection.querySelector('.tag-category-section:nth-child(5) h3').textContent = s.parodyTagsLabel;
    tagsManagementSection.querySelector('.tag-category-section:nth-child(5) h4').textContent = s.quickAddParodyLabel;
    parodyInput.placeholder = s.parodyInputPlaceholder;
    addParodyButton.textContent = s.addParodyButton;
    
    tagsManagementSection.querySelector('.tag-category-section:nth-child(6) h3').textContent = s.characterTagsLabel;
    tagsManagementSection.querySelector('.tag-category-section:nth-child(6) h4').textContent = s.quickAddCharacterLabel;
    characterInput.placeholder = s.characterInputPlaceholder;
    addCharacterButton.textContent = s.addCharacterButton;

    tagsManagementSection.querySelector('.tag-category-section:nth-child(7) h3').textContent = s.femaleTagsLabel;
    tagsManagementSection.querySelector('.tag-category-section:nth-child(7) h4').textContent = s.quickAddFemaleLabel;
    femaleInput.placeholder = s.femaleInputPlaceholder;
    addFemaleButton.textContent = s.addFemaleButton;

    const updateFreqSection = document.getElementById('update-frequency');
    if (updateFreqSection) {
        updateFreqSection.querySelector('h2').textContent = s.updateFrequencyTitle;
        updateFreqSection.querySelector('label[for="update-frequency-select"]').textContent = s.checkFrequencyLabel;
        updateFrequencySelect.options[0].textContent = s.freq20min;
        updateFrequencySelect.options[1].textContent = s.freq40min;
        updateFrequencySelect.options[2].textContent = s.freq1hrDefault;
        updateFrequencySelect.options[3].textContent = s.freq2hr;
        updateFrequencySelect.options[4].textContent = s.freq6hr;
        updateFrequencySelect.options[5].textContent = s.freq24hr;
        // Translate new button
        const updateNowBtn = document.getElementById('update-now-button');
        if (updateNowBtn) {
            updateNowBtn.textContent = s.updateNowButton;
        }
    }
    
    const generalSettingsSection = document.getElementById('general-settings');
    generalSettingsSection.querySelector('h2').textContent = s.generalSettingsTitle;
    generalSettingsSection.querySelector('label[for="language-select"]').textContent = s.selectLanguageLabel;
    
    const importExportSection = document.getElementById('import-export');
    importExportSection.querySelector('h2').textContent = s.importExportTitle;
    // importExportSection.querySelector('p').textContent = s.featureNotAvailable; // Commented out or remove if buttons are there
    const exportBtn = document.getElementById('export-settings-button');
    if (exportBtn) exportBtn.textContent = s.exportSettingsButton;
    const importBtn = document.getElementById('import-settings-button');
    if (importBtn) importBtn.textContent = s.importSettingsButton;
    
    const exportDesc = importExportSection.querySelector('p[data-translate-key="exportDescription"]');
    if (exportDesc) exportDesc.textContent = s.exportDescription;
    const importDesc = importExportSection.querySelector('p[data-translate-key="importDescription"]');
    if (importDesc) importDesc.textContent = s.importDescription;
    
    const aboutSection = document.getElementById('about');
    aboutSection.querySelector('h2').textContent = s.aboutTitle;
    aboutSection.querySelector('p:nth-child(2)').textContent = s.aboutSectionPara1; // Assumes this is the v1.0.0 p
    aboutSection.querySelector('p:nth-child(3)').textContent = s.aboutSectionPara2; // Assumes this is the description p

    // Desktop Notifications
    const dnSection = document.getElementById('desktop-notifications-section');
    if (dnSection) {
      dnSection.querySelector('h3').textContent = s.desktopNotificationsSectionTitle;
      dnSection.querySelector('#desktop-notifications-label-text').textContent = s.desktopNotificationsLabel;
    }

    // Blacklist Tags
    const blSection = document.getElementById('blacklist-tags-section');
    if (blSection) {
      blSection.querySelector('h3').textContent = s.blacklistTagsSectionTitle;
      blSection.querySelector('p').textContent = s.blacklistTagsDescription;
      // Ensure the H4 for quick add is translated if it exists
      const quickAddBlLabel = blSection.querySelector('h4[data-translate-key="quickAddBlacklistLabel"]');
      if (quickAddBlLabel) quickAddBlLabel.textContent = s.quickAddBlacklistLabel;
      
      blSection.querySelector('button:not(.remove-btn):not(.blacklisted-tag-item-btn)').textContent = s.addBlacklistButton; // More specific selector
      blSection.querySelector('h4:not([data-translate-key="quickAddBlacklistLabel"])').textContent = s.currentBlacklistLabel; // More specific selector
      blacklistInput.placeholder = s.blacklistInputPlaceholder;
    }

    // Update predefined tag display names (buttons)
    populateAllPredefinedTags(lang); // Pass current language
    populatePredefinedBlacklistTags(lang); // Add this call
    renderBlacklistedTags(); // Re-render with current language for remove buttons etc.
  }

  // Predefined tags with translations
  // Note: 'id' is the actual tag value used in EH, 'name' is for display and can be a function of language.
  // 'displayNameKey' will point to a key in uiStrings for dynamic name generation if needed, or use a direct map.
  // For simplicity, pre-translated names are directly in predefinedTagsData for now for the buttons.
  // But this means the buttons for predefined tags will need their text updated when language changes.
  const predefinedTagsData = {
    artist: [
      { id: "aiue oka", name_zhTW: "aiue oka (あいうえお课)", name_en: "aiue oka" },
      { id: "chiba tetsutarou", name_zhTW: "chiba tetsutarou (千葉サドル)", name_en: "chiba tetsutarou" },
      { id: "dokuneko noil", name_zhTW: "dokuneko noil (毒猫ノイル)", name_en: "dokuneko noil" },
      { id: "itou eight", name_zhTW: "itou eight (伊藤エイト)", name_en: "itou eight" },
      { id: "civet", name_zhTW: "civet (ジャコウネコ)", name_en: "civet" },
      { id: "oida hina", name_zhTW: "oida hina (老田ヒナ)", name_en: "oida hina" },
      { id: "nanao", name_zhTW: "nanao (ななお)", name_en: "nanao" },
      { id: "shimanto shisakugata", name_zhTW: "shimanto shisakugata (しまんと試作型)", name_en: "shimanto shisakugata" },
      { id: "teterun", name_zhTW: "teterun (ててるん)", name_en: "teterun" },
      { id: "pirason", name_zhTW: "pirason (ぴらそん)", name_en: "pirason" },
      { id: "michiking", name_zhTW: "michiking (ミチキング)", name_en: "michiking" },
      { id: "ouno you", name_zhTW: "ouno you (苑生よう)", name_en: "ouno you" },
      { id: "kakao", name_zhTW: "kakao (カカオ)", name_en: "kakao" },
      { id: "asahina hikage", name_zhTW: "asahina hikage (アサヒナヒカゲ)", name_en: "asahina hikage" },
      { id: "sanba sou", name_zhTW: "sanba sou (さんば挿)", name_en: "sanba sou" },
      { id: "kemuri haku", name_zhTW: "kemuri haku (煙ハク)", name_en: "kemuri haku" },
      { id: "tamagoro", name_zhTW: "tamagoro (たまごろー)", name_en: "tamagoro" },
      { id: "tottotonero tarou", name_zhTW: "tottotonero tarou (とっととねろ太郎)", name_en: "tottotonero tarou" },
      { id: "raiha", name_zhTW: "raiha (らいは)", name_en: "raiha" },
      // New artists from user request
      { id: "rindou", name_zhTW: "rindou (竜胆)", name_en: "rindou" },
      { id: "sakamata nerimono", name_zhTW: "sakamata nerimono (逆又練物)", name_en: "sakamata nerimono" },
      { id: "tachibana omina", name_zhTW: "tachibana omina (橘惡味那)", name_en: "tachibana omina" },
      // tamagoro and tottotonero tarou are already present, urakan and zero no mono need name_zhTW if available, otherwise keep as is
      { id: "urakan", name_zhTW: "urakan (裏寒)", name_en: "urakan" }, 
      { id: "zero no mono", name_zhTW: "zero no mono (ゼロの者)", name_en: "zero no mono" }
    ],
    group: [
      { id: "akatsuki katsuie", name_zhTW: "akatsuki katsuie (暁カツいえ)", name_en: "akatsuki katsuie" },
      { id: "fatalpulse", name_zhTW: "fatalpulse (フェイタルパルス)", name_en: "fatalpulse" },
      { id: "nekonokankara", name_zhTW: "nekonokankara (ねこのかんから)", name_en: "nekonokankara" },
      { id: "area-s", name_zhTW: "Area-S", name_en: "Area-S" },
      { id: "hellabunna", name_zhTW: "hellabunna (ヘラブナ)", name_en: "hellabunna" },
      { id: "shironegiya", name_zhTW: "shironegiya (白ネギ屋)", name_en: "shironegiya" },
      { id: "studio n.ball", name_zhTW: "Studio N.BALL (スタジオN.BALL)", name_en: "Studio N.BALL" },
      { id: "cyclone", name_zhTW: "cyclone (サイクロン)", name_en: "cyclone" },
      { id: "maruarai", name_zhTW: "maruarai (まるあら)", name_en: "maruarai" },
      { id: "forest village", name_zhTW: "Forest Village", name_en: "Forest Village" },
      { id: "monogusa", name_zhTW: "Monogusa (ものぐさ)", name_en: "Monogusa" },
      { id: "manaita", name_zhTW: "Manaita (まないた)", name_en: "Manaita" },
      { id: "akikaze biidoro", name_zhTW: "Akikaze Biidoro (秋風緋色)", name_en: "Akikaze Biidoro" },
      { id: "ame nochi yuki", name_zhTW: "Ame nochi Yuki (あめ のち ゆき)", name_en: "Ame nochi Yuki" },
      { id: "kinokonomi", name_zhTW: "Kinokonomi (きのこのみ)", name_en: "Kinokonomi" },
      { id: "mannen dokodoko dondodoko", name_zhTW: "mannen dokodoko dondodoko (万年どこどこどんドドコ)", name_en: "mannen dokodoko dondodoko" },
      // New groups from user request
      { id: "black smile", name_zhTW: "black smile", name_en: "black smile" }
      // mannen dokodoko dondodoko is already present
    ],
    language: [
      { id: "chinese", name_zhTW: "chinese (中文)", name_en: "chinese" },
      { id: "japanese", name_zhTW: "japanese (日文)", name_en: "japanese" },
      { id: "english", name_zhTW: "english (英文)", name_en: "english" },
      { id: "translated", name_zhTW: "translated (翻譯)", name_en: "translated" },
      { id: "korean", name_zhTW: "korean (韓文)", name_en: "korean" }
      // { id: "russian", name_zhTW: "russian (俄文)", name_en: "russian" },
      // { id: "french", name_zhTW: "french (法文)", name_en: "french" },
      // { id: "german", name_zhTW: "german (德文)", name_en: "german" },
      // { id: "spanish", name_zhTW: "spanish (西班牙文)", name_en: "spanish" },
      // { id: "rewrite", name_zhTW: "rewrite (改寫)", name_en: "rewrite" }
    ],
    parody: [
      { id: "original", name_zhTW: "original (原創)", name_en: "original" },
      { id: "touhou project", name_zhTW: "touhou project (東方Project)", name_en: "touhou project" },
      { id: "kantai collection", name_zhTW: "kantai collection (艦隊これくしょん)", name_en: "kantai collection" },
      { id: "fate grand order", name_zhTW: "fate/grand order (天命/冠位指定)", name_en: "fate/grand order" },
      { id: "azur lane", name_zhTW: "azur lane (碧藍航線)", name_en: "azur lane" },
      { id: "the idolmaster", name_zhTW: "the idolmaster (偶像大師)", name_en: "the idolmaster" },
      { id: "granblue fantasy", name_zhTW: "granblue fantasy (碧藍幻想)", name_en: "granblue fantasy" },
      { id: "love live", name_zhTW: "love live! (ラブライブ!)", name_en: "love live!" },
      { id: "pokemon", name_zhTW: "pokemon (寶可夢)", name_en: "pokemon" },
      { id: "blue archive", name_zhTW: "blue archive (蔚藍檔案)", name_en: "blue archive" },
      { id: "genshin impact", name_zhTW: "genshin impact (原神)", name_en: "genshin impact" },
      { id: "princess connect re dive", name_zhTW: "princess connect! re:dive (超異域公主連結)", name_en: "princess connect! re:dive" },
      { id: "street fighter", name_zhTW: "street fighter (快打旋風)", name_en: "street fighter" },
      { id: "neon genesis evangelion", name_zhTW: "neon genesis evangelion (新世紀福音戰士)", name_en: "neon genesis evangelion" },
      { id: "persona 5", name_zhTW: "persona 5 (女神異聞錄5)", name_en: "persona 5" }
    ],
    character: [
      { id: "hatsune miku", name_zhTW: "hatsune miku (初音未來)", name_en: "hatsune miku" },
      { id: "rem", name_zhTW: "rem (雷姆)", name_en: "rem" },
      { id: "asuna yuuki", name_zhTW: "asuna yuuki (結城明日奈)", name_en: "asuna yuuki" },
      { id: "artoria pendragon", name_zhTW: "artoria pendragon (阿爾托莉雅·潘德拉剛)", name_en: "artoria pendragon" },
      { id: "makise kurisu", name_zhTW: "makise kurisu (牧瀬紅莉栖)", name_en: "makise kurisu" },
      { id: "shirakami fubuki", name_zhTW: "shirakami fubuki (白上吹雪)", name_en: "shirakami fubuki" },
      { id: "usada pekora", name_zhTW: "usada pekora (兎田ぺこら)", name_en: "usada pekora" },
      { id: "nanashi mumei", name_zhTW: "nanashi mumei (七詩ムメイ)", name_en: "nanashi mumei" },
      { id: "gawr gura", name_zhTW: "gawr gura (噶嗚·古拉)", name_en: "gawr gura" },
      { id: "tokino sora", name_zhTW: "tokino sora (ときのそら)", name_en: "tokino sora" },
      { id: "frieren", name_zhTW: "frieren (芙莉蓮)", name_en: "frieren" }, // From Sousou no Frieren
      { id: "yor forger", name_zhTW: "yor forger (約兒·佛傑)", name_en: "yor forger" }, // From Spy x Family
      { id: "bocchi", name_zhTW: "hitori gotoh (後藤一里)", name_en: "hitori gotoh" }, // Bocchi the Rock!
      { id: "kasumigaoka utaha", name_zhTW: "kasumigaoka utaha (霞ヶ丘詩羽)", name_en: "kasumigaoka utaha" }, // Saekano
      { id: " Elaina", name_zhTW: "elaina (伊蕾娜)", name_en: "elaina" } // Majo no Tabitabi
    ],
    female: [
      { id: "lolicon", name_zhTW: "lolicon (蘿莉控)", name_en: "lolicon" },
      { id: "big breasts", name_zhTW: "big breasts (巨乳)", name_en: "big breasts" },
      { id: "sole female", name_zhTW: "sole female (單獨女性)", name_en: "sole female" },
      { id: "nakadashi", name_zhTW: "nakadashi (中出)", name_en: "nakadashi" },
      { id: "schoolgirl uniform", name_zhTW: "schoolgirl uniform (女學生制服)", name_en: "schoolgirl uniform" },
      { id: "anal", name_zhTW: "anal (肛交)", name_en: "anal" },
      { id: "rape", name_zhTW: "rape (強姦)", name_en: "rape" },
      { id: "tentacles", name_zhTW: "tentacles (觸手)", name_en: "tentacles" },
      { id: "netorare", name_zhTW: "netorare (寢取)", name_en: "netorare" },
      { id: "mind break", name_zhTW: "mind break (精神崩潰)", name_en: "mind break" },
      { id: "milf", name_zhTW: "milf (熟女)", name_en: "milf" },
      { id: "stockings", name_zhTW: "stockings (長襪)", name_en: "stockings" },
      { id: "x-ray", name_zhTW: "x-ray (透視)", name_en: "x-ray" },
      { id: "defloration", name_zhTW: "defloration (破處)", name_en: "defloration" },
      { id: "inseki", name_zhTW: "inseki (飲精)", name_en: "inseki" }
    ],
    category: [
      { id: "doujinshi", name_zhTW: "doujinshi (同人誌)", name_en: "doujinshi" },
      { id: "manga", name_zhTW: "manga (漫畫)", name_en: "manga" },
      { id: "artist cg", name_zhTW: "artist cg (藝術家CG)", name_en: "artist cg" },
      { id: "game cg", name_zhTW: "game cg (遊戲CG)", name_en: "game cg" },
      { id: "western", name_zhTW: "western (西方)", name_en: "western" },
      { id: "non-h", name_zhTW: "non-h (非H)", name_en: "non-h" },
      { id: "image set", name_zhTW: "image set (圖集)", name_en: "image set" },
      { id: "cosplay", name_zhTW: "cosplay (角色扮演)", name_en: "cosplay" },
      { id: "asian porn", name_zhTW: "asian porn (亞洲成人)", name_en: "asian porn" },
      { id: "misc", name_zhTW: "misc (雜項)", name_en: "misc" }
    ]
  };
  
  function showStatus(messageKey, args, isError = false, isWarning = false) {
    const s = uiStrings[currentLanguage] || uiStrings['en'];
    let messageText = messageKey; 
    if (s && typeof s[messageKey] === 'function') {
      messageText = s[messageKey](args);
    } else if (s && s[messageKey]) {
      messageText = s[messageKey];
    }

    statusDiv.textContent = messageText;
    statusDiv.className = "";
    if (isError) {
      statusDiv.classList.add("error");
    } else if (isWarning) {
      statusDiv.classList.add("warning");
    }
    
    setTimeout(() => {
      statusDiv.textContent = "";
      statusDiv.className = "";
    }, 3000);
  }

  function saveTrackedTags() {
    chrome.storage.local.set({ trackedTags: currentTrackedTags }, () => {
      console.log("Tracked tags saved:", currentTrackedTags);
      // renderCurrentlyTrackedTags();
      updatePredefinedButtonStates();
      chrome.runtime.sendMessage({ type: "TRACKED_TAGS_UPDATED" })
        .catch(err => console.warn("Error sending TRACKED_TAGS_UPDATED message:", err.message));
    });
  }

  function addTag(tagValue, type) {
    const tagName = tagValue.trim().toLowerCase();
    if (!tagName) {
      showStatus('statusEnterTagName', type, true);
      return;
    }
    const fullTag = `${type}:${tagName}`;

    if (!currentTrackedTags.includes(fullTag)) {
      currentTrackedTags.push(fullTag);
      currentTrackedTags.sort();
      saveTrackedTags();
      showStatus('statusTagAdded', fullTag);
      if (inputs[type]) inputs[type].value = ''; 
    } else {
      showStatus('statusTagExists', fullTag, false, true);
    }
  }

  function removeTag(fullTag) {
    const indexToRemove = currentTrackedTags.indexOf(fullTag);
    if (indexToRemove > -1) {
      currentTrackedTags.splice(indexToRemove, 1);
      saveTrackedTags();
      showStatus('statusTagRemoved', fullTag);
    }    
  }

  // Helper function to create a tag button
  function createTagButton(tagId, type, lang, name_zhTW, name_en, isPredefined) {
    const button = document.createElement('button');
    const s = uiStrings[lang] || uiStrings['en'];
    let displayName;

    if (isPredefined && name_zhTW && name_en) {
        displayName = lang === 'en' ? name_en : name_zhTW;
    } else {
        // For user-added tags (not predefined), or predefined tags missing a specific lang name
        displayName = tagId; 
    }
    button.textContent = displayName;
    button.classList.add('predefined-tag-btn'); // Reuse class for styling

    const fullTag = `${type}:${tagId.toLowerCase().replace(/\s+/g, ' ')}`;
    button.dataset.fullTag = fullTag; // Store full tag for easy access

    if (currentTrackedTags.includes(fullTag)) {
        button.classList.add('selected');
    }

    button.addEventListener('click', () => {
        if (currentTrackedTags.includes(fullTag)) {
            removeTag(fullTag);
        } else {
            addTag(tagId, type); // addTag handles duplicates, saving, and UI updates via saveTrackedTags
        }
    });
    return button;
  }

  function populateAllPredefinedTags(lang = 'zh-TW') {
    for (const type in predefinedTagsData) {
      populatePredefinedTagsForType(type, lang);
    }
    updatePredefinedButtonStates(); // Ensure all states are correct after initial population
  }

  function populatePredefinedTagsForType(type, lang = 'zh-TW') {
    const container = predefinedTagsContainers[type];
    const predefinedTagsForCategory = predefinedTagsData[type] || [];
    const s = uiStrings[lang] || uiStrings['en'];
    if (!container) return;

    container.innerHTML = ''; // Clear existing buttons
    const displayedTagIdsThisCategory = new Set();

    // 1. Add buttons for predefined tags for this category
    predefinedTagsForCategory.forEach(tagObject => {
        const button = createTagButton(tagObject.id, type, lang, tagObject.name_zhTW, tagObject.name_en, true);
        container.appendChild(button);
        displayedTagIdsThisCategory.add(tagObject.id.toLowerCase());
    });

    // 2. Add buttons for other tracked tags that belong to this category and are not predefined
    currentTrackedTags.forEach(fullTag => {
        const [tagType, ...tagNameParts] = fullTag.split(':');
        const tagName = tagNameParts.join(':').trim();

        if (tagType === type && tagName && !displayedTagIdsThisCategory.has(tagName.toLowerCase())) {
            const button = createTagButton(tagName, type, lang, null, null, false); // Not predefined
            container.appendChild(button);
            // No need to add to displayedTagIdsThisCategory here as we won't iterate again for this type
        }
    });
    
    // If after adding all relevant buttons, the container for this type is still empty, show the message.
    if (container.children.length === 0) {
         const noTagsMessage = document.createElement('p');
         noTagsMessage.textContent = s.noTagsInCategory;
         noTagsMessage.className = 'no-tags-in-category-message';
         container.appendChild(noTagsMessage);
    }
  }

  function updatePredefinedButtonStates(specificType = null) {
    const typesToUpdate = specificType ? [specificType] : Object.keys(predefinedTagsContainers);

    typesToUpdate.forEach(type => {
        const container = predefinedTagsContainers[type];
        if (!container) return;

        const buttons = container.querySelectorAll('.predefined-tag-btn');
        buttons.forEach(button => {
            const fullTag = button.dataset.fullTag;
            if (fullTag) {
                if (currentTrackedTags.includes(fullTag)) {
                    button.classList.add('selected');
                } else {
                    button.classList.remove('selected');
                }
            }
        });
    });
  }

  const inputs = {
    artist: document.getElementById('artist-input'),
    group: document.getElementById('group-input'),
    language: document.getElementById('language-input'),
    parody: document.getElementById('parody-input'),
    character: document.getElementById('character-input'),
    female: document.getElementById('female-input'),
    category: document.getElementById('category-input'),
  };
  const addButtons = {
    artist: document.getElementById('add-artist-button'),
    group: document.getElementById('add-group-button'),
    language: document.getElementById('add-language-button'),
    parody: document.getElementById('add-parody-button'),
    character: document.getElementById('add-character-button'),
    female: document.getElementById('add-female-button'),
    category: document.getElementById('add-category-button'),
  };
  const predefinedTagsContainers = {
    artist: document.getElementById('predefined-artists-container'),
    group: document.getElementById('predefined-groups-container'),
    language: document.getElementById('predefined-languages-container'),
    parody: document.getElementById('predefined-parodies-container'),
    character: document.getElementById('predefined-characters-container'),
    female: document.getElementById('predefined-females-container'),
    category: document.getElementById('predefined-categories-container'),
    blacklist: document.getElementById('predefined-blacklist-tags-container') // New container
  };

  for (const type in addButtons) {
    addButtons[type].addEventListener('click', () => {
      addTag(inputs[type].value, type);
    });
    inputs[type].addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        addTag(inputs[type].value, type);
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(nav => nav.classList.remove('active'));
      link.classList.add('active');
      
      const targetId = link.getAttribute('href').substring(1);
      contentSections.forEach(section => {
        if (section.id === targetId) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });
    });
  });

  async function loadLanguagePreference() {
    try {
      const data = await chrome.storage.sync.get('language');
      currentLanguage = data.language || 'zh-TW'; // Default to zh-TW if not set
      languageSelect.value = currentLanguage;
      applyTranslations(currentLanguage);
    } catch (error) {
      console.error("Error loading language preference:", error);
      currentLanguage = 'zh-TW'; // Fallback
      languageSelect.value = currentLanguage;
      applyTranslations(currentLanguage);
    }
  }

  async function saveLanguagePreference() {
    currentLanguage = languageSelect.value;
    try {
      await chrome.storage.sync.set({ language: currentLanguage });
      applyTranslations(currentLanguage);
      showStatus('statusLangSet', currentLanguage);

      // Notify content scripts about the language change
      chrome.tabs.query({}, (tabs) => { // Query all tabs
        for (let tab of tabs) {
          if (tab.id) { // Check if tab.id is defined
            chrome.tabs.sendMessage(tab.id, { action: "LANGUAGE_CHANGED", newLanguage: currentLanguage })
              .catch(err => {
                // It's common for this to error if the content script isn't injected on a page
                // or if the tab is a special page (e.g., chrome://, about:), so we'll just log it.
                if (!tab.url || (!tab.url.startsWith('chrome://') && !tab.url.startsWith('about:'))) {
                  console.warn(`Options.js: Could not send LANGUAGE_CHANGED to tab ${tab.id} (${tab.url || 'no URL'}): ${err.message}`);
                }
              });
          }
        }
      });

    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  }
  languageSelect.addEventListener('change', saveLanguagePreference);

  function loadUpdateFrequency() {
    chrome.storage.sync.get("updateFrequencyInMinutes", (data) => {
      const freq = data.updateFrequencyInMinutes || DEFAULT_UPDATE_FREQUENCY_MINUTES;
      updateFrequencySelect.value = freq;
    });
  }

  function saveUpdateFrequency() {
    const newFrequency = parseInt(updateFrequencySelect.value, 10);
    chrome.storage.sync.set({ updateFrequencyInMinutes: newFrequency }, () => {
      showStatus('statusFreqSet', newFrequency);
      chrome.runtime.sendMessage({ type: "UPDATE_ALARM_FREQUENCY", frequency: newFrequency })
        .catch(err => console.warn("Error sending UPDATE_ALARM_FREQUENCY: ", err.message));
    });
  }
  updateFrequencySelect.addEventListener('change', saveUpdateFrequency);

  // Event listener for the new "Update Now" button
  if (updateNowButton) {
    updateNowButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: "REQUEST_IMMEDIATE_CHECK" })
        .then(response => {
            if (response && response.status) {
                showStatus('statusUpdateInitiated'); // Show generic initiated message
                console.log('Immediate check requested, background responded:', response.status);
            } else {
                // Handle cases where background script might not respond or error occurs
                console.warn('Immediate check request sent, but no specific status in response or response was undefined.');
                showStatus('statusUpdateInitiated'); // Still show initiated, as message was sent
            }
        })
        .catch(err => {
          console.error("Error sending REQUEST_IMMEDIATE_CHECK message:", err.message);
          // Optionally show an error status to the user
          showStatus('Error requesting update: ' + err.message, null, true); 
        });
    });
  }

  async function loadInitialData() {
    await loadLanguagePreference(); // Load language first to apply translations
    await loadDesktopNotificationSetting();
    await loadBlacklistedTags();

    const data = await chrome.storage.local.get("trackedTags");
    if (data.trackedTags && Array.isArray(data.trackedTags)) {
      currentTrackedTags = data.trackedTags.sort();
    }
    populateAllPredefinedTags(currentLanguage); 
    populatePredefinedBlacklistTags(currentLanguage); // Add this call
    loadUpdateFrequency();

    const hash = window.location.hash;
    let activeSectionFound = false;
    if (hash) {
      navLinks.forEach(link => {
        if (link.getAttribute('href') === hash) {
          link.click();
          activeSectionFound = true;
        }
      });
    }
    if (!activeSectionFound && navLinks.length > 0) {
      navLinks[0].click(); 
    }
  }

  // Initial load
  loadInitialData();

  // Listener for updates from background script (e.g., context menu add)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "TRACKED_TAGS_UPDATED") {
      console.log("Options.js: Received TRACKED_TAGS_UPDATED, reloading data.");
      // Reload tags to reflect changes made elsewhere (e.g., context menu)
      loadInitialData(); // This function should reload trackedTags and update the UI (including currently tracked)
      sendResponse({ status: "Tags reloaded in options page" });
    } else if (request.action === "LAST_UPLOAD_DATES_UPDATED") {
        // If options page needs to display something based on last upload dates, handle here
        console.log("Options.js: Received LAST_UPLOAD_DATES_UPDATED.");
        // Potentially re-render parts of the UI if necessary
    }
    return true; // Keep message channel open for async response
  });

  // --- Blacklist Logic ---
  async function loadBlacklistedTags() {
    const data = await chrome.storage.local.get('blacklistedTags');
    currentBlacklistedTags = (data.blacklistedTags && Array.isArray(data.blacklistedTags)) ? data.blacklistedTags.sort() : [];
    renderBlacklistedTags();
    if (predefinedTagsContainers.blacklist) { // Ensure container is there before populating
        populatePredefinedBlacklistTags(currentLanguage); // Update predefined buttons based on current blacklist
    }
  }

  async function saveBlacklistedTags() {
    await chrome.storage.local.set({ blacklistedTags: currentBlacklistedTags });
    // Potentially send a message if background script needs to know immediately, though it usually reads on check.
  }

  function addBlacklistedTag() {
    const tagName = blacklistInput.value.trim().toLowerCase();
    if (!tagName) {
      showStatus('statusInvalidBlacklistTag', null, true);
      return;
    }
    if (!currentBlacklistedTags.includes(tagName)) {
      currentBlacklistedTags.push(tagName);
      currentBlacklistedTags.sort();
      saveBlacklistedTags(); // This will now also trigger re-render of predefined blacklist buttons
      renderBlacklistedTags();
      blacklistInput.value = '';
      showStatus('statusBlacklistTagAdded', tagName);
      // Update predefined blacklist buttons state
      populatePredefinedBlacklistTags(currentLanguage);
    } else {
      showStatus('statusBlacklistTagExists', tagName, false, true);
    }
  }

  function removeBlacklistedTag(tagToRemove) {
    currentBlacklistedTags = currentBlacklistedTags.filter(tag => tag !== tagToRemove);
    saveBlacklistedTags(); // This will now also trigger re-render of predefined blacklist buttons
    renderBlacklistedTags();
    showStatus('statusTagRemoved', tagToRemove); // Corrected from statusBlacklistTagRemoved for i18n consistency
     // Update predefined blacklist buttons state
    populatePredefinedBlacklistTags(currentLanguage);
  }

  function renderBlacklistedTags() {
    blacklistedTagsContainer.innerHTML = '';
    const s = uiStrings[currentLanguage] || uiStrings['en'];

    if (currentBlacklistedTags.length === 0) { // Check if blacklist is empty
        const noTagsMessage = document.createElement('p');
        noTagsMessage.textContent = s.noBlacklistTagsYet || "No tags are currently blacklisted."; // Add new i18n string
        noTagsMessage.className = 'no-tags-message'; // Can reuse or make specific
        blacklistedTagsContainer.appendChild(noTagsMessage);
        return;
    }

    currentBlacklistedTags.forEach(tag => {
      const tagButton = document.createElement('button');
      tagButton.textContent = tag;
      tagButton.classList.add('blacklisted-tag-item-btn');
      
      const removeBtn = document.createElement('button');
      removeBtn.textContent = s.removeButtonText || 'X';
      removeBtn.classList.add('remove-btn');
      removeBtn.title = (s.statusTagRemoved ? s.statusTagRemoved(tag).replace(s.removeButtonText, '').trim() : `Remove ${tag}`); // Adjusted title source
      
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        removeBlacklistedTag(tag);
      });
      tagButton.appendChild(removeBtn);
    });
  }

  addBlacklistTagButton.addEventListener('click', addBlacklistedTag);
  blacklistInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      addBlacklistedTag();
    }
  });

  // --- Desktop Notification Logic ---
  async function loadDesktopNotificationSetting() {
    const data = await chrome.storage.sync.get('showDesktopNotifications');
    desktopNotificationsToggle.checked = data.showDesktopNotifications !== undefined ? data.showDesktopNotifications : true; // Default to true
  }

  async function saveDesktopNotificationSetting() {
    const enabled = desktopNotificationsToggle.checked;
    await chrome.storage.sync.set({ showDesktopNotifications: enabled });
    showStatus(enabled ? 'statusDesktopNotificationEnabled' : 'statusDesktopNotificationDisabled');
  }
  desktopNotificationsToggle.addEventListener('change', saveDesktopNotificationSetting);

  // --- Import/Export Logic ---
  async function exportSettings() {
    try {
      const localData = await chrome.storage.local.get(['trackedTags', 'blacklistedTags', 'discoveredGalleries', 'trackedWorks', 'lastUploadedDates']);
      const syncData = await chrome.storage.sync.get(['updateFrequencyInMinutes', 'showDesktopNotifications', 'language']);

      const settings = {
        trackedTags: localData.trackedTags || [],
        blacklistedTags: localData.blacklistedTags || [],
        // Optional: include discoveredGalleries and trackedWorks if desired, though they can get large
        // discoveredGalleries: localData.discoveredGalleries || {},
        // trackedWorks: localData.trackedWorks || {},
        // lastUploadedDates: localData.lastUploadedDates || {},
        updateFrequencyInMinutes: syncData.updateFrequencyInMinutes || DEFAULT_UPDATE_FREQUENCY_MINUTES,
        showDesktopNotifications: syncData.showDesktopNotifications !== undefined ? syncData.showDesktopNotifications : true,
        language: syncData.language || 'zh-TW'
      };

      const jsonString = JSON.stringify(settings, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ehentai_tracker_settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showStatus('statusSettingsExported');
    } catch (error) {
      console.error("Error exporting settings:", error);
      showStatus('Error exporting settings: ' + error.message, null, true);
    }
  }

  function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result);

        // Basic validation
        if (typeof importedSettings !== 'object' || importedSettings === null) {
          throw new Error("Invalid file content.");
        }

        const { 
          trackedTags,
          blacklistedTags,
          updateFrequencyInMinutes,
          showDesktopNotifications,
          language
          // discoveredGalleries, // If exported, decide if/how to import
          // trackedWorks,
          // lastUploadedDates
        } = importedSettings;

        // Validate presence and types more thoroughly if needed
        if (!Array.isArray(trackedTags) || !Array.isArray(blacklistedTags)) {
          showStatus('statusImportInvalidData', null, true);
          return;
        }
        // Further checks for other fields can be added

        const localSettingsToSave = {};
        if (trackedTags) localSettingsToSave.trackedTags = trackedTags;
        if (blacklistedTags) localSettingsToSave.blacklistedTags = blacklistedTags;
        // If you decide to import discoveredGalleries, trackedWorks, lastUploadedDates, add them here:
        // if (importedSettings.discoveredGalleries) localSettingsToSave.discoveredGalleries = importedSettings.discoveredGalleries;
        // if (importedSettings.trackedWorks) localSettingsToSave.trackedWorks = importedSettings.trackedWorks;
        // if (importedSettings.lastUploadedDates) localSettingsToSave.lastUploadedDates = importedSettings.lastUploadedDates;

        const syncSettingsToSave = {};
        if (updateFrequencyInMinutes) syncSettingsToSave.updateFrequencyInMinutes = updateFrequencyInMinutes;
        if (showDesktopNotifications !== undefined) syncSettingsToSave.showDesktopNotifications = showDesktopNotifications;
        if (language) syncSettingsToSave.language = language;

        if (Object.keys(localSettingsToSave).length > 0) {
            await chrome.storage.local.set(localSettingsToSave);
        }
        if (Object.keys(syncSettingsToSave).length > 0) {
            await chrome.storage.sync.set(syncSettingsToSave);
        }
        
        showStatus('statusSettingsImported');
        // Reload the options page to reflect new settings
        setTimeout(() => window.location.reload(), 1500);

      } catch (error) {
        console.error("Error importing settings:", error);
        if (error instanceof SyntaxError) {
          showStatus('statusImportParseError', null, true);
        } else {
          showStatus('statusImportInvalidData', error.message , true);
        }
      } finally {
        // Reset file input so the same file can be imported again if needed after a failure
        importFileInput.value = ''; 
      }
    };
    reader.onerror = () => {
      showStatus('statusImportReadError', null, true);
      importFileInput.value = ''; 
    };
    reader.readAsText(file);
  }

  if (exportSettingsButton) {
    exportSettingsButton.addEventListener('click', exportSettings);
  }

  if (importSettingsButton) {
    importSettingsButton.addEventListener('click', () => {
      importFileInput.click(); // Trigger hidden file input
    });
  }

  if (importFileInput) {
    importFileInput.addEventListener('change', handleImportFile);
  }

  // New predefined blacklist tags
  const predefinedBlacklistTags = [
    { id: "yaoi", name_zhTW: "yaoi (男同性戀)", name_en: "yaoi" },
    { id: "yuri", name_zhTW: "yuri (女同性戀)", name_en: "yuri" },
    { id: "guro", name_zhTW: "guro (獵奇)", name_en: "guro" },
    { id: "scat", name_zhTW: "scat (嗜糞)", name_en: "scat" },
    { id: "furry", name_zhTW: "furry (獸人)", name_en: "furry" },
    { id: "vore", name_zhTW: "vore (吞噬)", name_en: "vore" }
  ];

  // New function to populate predefined blacklist tags
  function populatePredefinedBlacklistTags(lang = 'zh-TW') {
    const container = predefinedTagsContainers.blacklist; // Use the new container
    const s = uiStrings[lang] || uiStrings['en'];
    if (!container) {
        console.warn("Predefined blacklist tags container not found.");
        return;
    }

    container.innerHTML = ''; // Clear existing buttons

    predefinedBlacklistTags.forEach(tagObject => {
        const button = document.createElement('button');
        const displayName = lang === 'en' ? (tagObject.name_en || tagObject.id) : (tagObject.name_zhTW || tagObject.id);
        button.textContent = displayName;
        button.classList.add('predefined-tag-btn'); // Can reuse styling
        button.dataset.tagId = tagObject.id; // Store tag id

        // Check if already blacklisted to style differently or disable
        if (currentBlacklistedTags.includes(tagObject.id.toLowerCase())) {
            button.classList.add('selected'); // Or a different class like 'disabled' or style directly
            button.disabled = true; 
        }

        button.addEventListener('click', () => {
            if (!currentBlacklistedTags.includes(tagObject.id.toLowerCase())) {
                blacklistInput.value = tagObject.id; // Populate input for consistency with addBlacklistedTag
                addBlacklistedTag(); // This function handles UI update, saving, and clearing input
                // After adding, we might want to disable this button
                button.classList.add('selected'); 
                button.disabled = true;
            }
        });
        container.appendChild(button);
    });

    if (container.children.length === 0) {
        // Optional: Message if no predefined blacklist tags (should not happen with current setup)
        // const noTagsMessage = document.createElement('p');
        // noTagsMessage.textContent = "No predefined blacklist tags available.";
        // container.appendChild(noTagsMessage);
    }
  }
}); 