// offscreen.js

// 監聽來自 background script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'parse-rss-in-offscreen') {
    if (message.rssText) {
      console.log("Offscreen: Received RSS text. Length:", message.rssText.length);
      try {
        const galleryInfos = parseRssXml(message.rssText);
        console.log("Offscreen: Parsed galleryInfos successfully. Count:", galleryInfos.length, "Infos:", JSON.stringify(galleryInfos));
        sendResponse({ success: true, galleryInfos: galleryInfos });
      } catch (error) {
        console.error("Offscreen: Error parsing RSS:", error.message, error.stack);
        sendResponse({ success: false, error: error.message });
      }
    } else {
      console.error("Offscreen: Received parse-rss request without rssText.");
      sendResponse({ success: false, error: "No rssText provided." });
    }
    return true; // 表示將異步發送響應
  }
});

function parseRssXml(rssText) {
  const galleryInfos = [];
  console.log("Offscreen parseRssXml: Starting parsing...");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(rssText, "text/xml");

  const parseError = xmlDoc.getElementsByTagName("parsererror");
  if (parseError.length > 0) {
    const errorDetails = parseError[0].textContent;
    console.error("Offscreen parseRssXml: XML parsing error detected by <parsererror> tag:", errorDetails);
    throw new Error("Failed to parse RSS XML: " + errorDetails);
  }

  const items = xmlDoc.getElementsByTagName("item");
  console.log(`Offscreen parseRssXml: Found ${items.length} <item> elements.`);

  if (items.length === 0) {
    // 有時 RSS feed 的條目可能是 <entry> 而不是 <item> (Atom vs RSS 2.0)
    const entries = xmlDoc.getElementsByTagName("entry");
    console.log(`Offscreen parseRssXml: No <item> elements found, trying <entry>. Found ${entries.length} <entry> elements.`);
    if (entries.length > 0) {
        // 如果是 <entry>，那麼連結標籤可能是 <link href="...">，需要調整提取方式
        for (const entry of entries) {
            const linkTags = entry.getElementsByTagName("link");
            let galleryUrl = null;
            if (linkTags) {
                for (const linkTag of linkTags) {
                    if (linkTag.getAttribute("rel") === "alternate" && linkTag.getAttribute("type") === "text/html") {
                        galleryUrl = linkTag.getAttribute("href")?.trim();
                        if (galleryUrl) {
                            console.log("Offscreen parseRssXml: Found <entry> with rel='alternate' link href:", galleryUrl);
                            break; // Found the correct link
                        }
                    }
                }
            }

            if (!galleryUrl) {
                // Fallback or log if no alternate link found
                const firstLinkTag = entry.getElementsByTagName("link")[0];
                if (firstLinkTag && firstLinkTag.getAttribute("href")) {
                    galleryUrl = firstLinkTag.getAttribute("href").trim();
                    console.log("Offscreen parseRssXml: No rel='alternate' link found, falling back to first link href:", galleryUrl);
                } else {
                    console.log("Offscreen parseRssXml: <entry> found, but no suitable <link href=...> tag inside or href is empty.", entry.innerHTML);
                }
            }
            
            // ... (接下來的 URL 匹配邏輯與 item 類似) ...
            if (galleryUrl) {
              const match = galleryUrl.match(/e-hentai\.org\/g\/(\d+)\/([a-f0-9]+)\/?/);
              if (match && match[1] && match[2]) {
                console.log("Offscreen parseRssXml: Matched gallery from <entry>:", match[1], match[2]);
                
                // Extract title and category from <entry>
                const titleTag = entry.getElementsByTagName("title")[0];
                let title = "";
                let category = "";
                if (titleTag && titleTag.textContent) {
                  title = titleTag.textContent.trim();
                  // Extract category from title format: [Category] Title
                  const categoryMatch = title.match(/^\[([^\]]+)\]\s*(.*)$/);
                  if (categoryMatch) {
                    category = categoryMatch[1].toLowerCase().trim();
                    title = categoryMatch[2].trim();
                  }
                }
                
                galleryInfos.push({ 
                  gid: parseInt(match[1]), 
                  token: match[2], 
                  url: galleryUrl,
                  title: title,
                  category: category
                });
              } else {
                console.log("Offscreen parseRssXml: URL from <entry> did not match regex:", galleryUrl);
              }
            }
        }
        return galleryInfos; // 如果是 <entry> 處理完就返回
    } else {
        // 如果連 <entry> 都沒有，可能 XML 結構不對，或者真的是空的
        console.warn("Offscreen parseRssXml: Neither <item> nor <entry> tags found in RSS feed. XML structure might be unexpected or feed is empty.");
        // 可以打印出一小部分 xmlDoc 內容幫助調試
        // console.log("Offscreen parseRssXml: XML Document (first 500 chars):", xmlDoc.documentElement.outerHTML.substring(0,500));
        return []; // 確定沒有可解析的條目
    }
  }

  // 原來的 <item> 處理邏輯
  for (const item of items) {
    const linkTag = item.getElementsByTagName("link")[0];
    const guidTag = item.getElementsByTagName("guid")[0]; // guid 也可能包含 URL，並且有時 isPermaLink="true"
    let galleryUrl = null;

    console.log("Offscreen parseRssXml: Processing an <item> element.");

    if (linkTag && linkTag.textContent) {
      galleryUrl = linkTag.textContent.trim();
      console.log("Offscreen parseRssXml: Found <link> content:", galleryUrl);
    } else if (guidTag && guidTag.textContent) {
      galleryUrl = guidTag.textContent.trim();
      console.log("Offscreen parseRssXml: Found <guid> content:", galleryUrl);
    } else {
        console.log("Offscreen parseRssXml: No <link> or <guid> tag found inside <item> or their content is empty.", item.innerHTML);
    }

    if (galleryUrl) {
      const match = galleryUrl.match(/e-hentai\.org\/g\/(\d+)\/([a-f0-9]+)\/?/);
      if (match && match[1] && match[2]) {
        console.log("Offscreen parseRssXml: Matched gallery from <item>:", match[1], match[2]);
        
        // Extract title and category from <item>
        const titleTag = item.getElementsByTagName("title")[0];
        let title = "";
        let category = "";
        if (titleTag && titleTag.textContent) {
          title = titleTag.textContent.trim();
          // Extract category from title format: [Category] Title
          const categoryMatch = title.match(/^\[([^\]]+)\]\s*(.*)$/);
          if (categoryMatch) {
            category = categoryMatch[1].toLowerCase().trim();
            title = categoryMatch[2].trim();
          }
        }
        
        galleryInfos.push({ 
          gid: parseInt(match[1]), 
          token: match[2], 
          url: galleryUrl,
          title: title,
          category: category
        });
      } else {
        console.log("Offscreen parseRssXml: URL from <item> did not match regex:", galleryUrl);
      }
    }
  }
  console.log("Offscreen parseRssXml: Finished parsing. Total galleries extracted:", galleryInfos.length);
  return galleryInfos;
}

console.log("Offscreen document script loaded and listening."); 