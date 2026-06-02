chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTranslation") {
    translatePage(request.apiKey, request.alphabet);
    sendResponse({ started: true });
  }
});

async function translatePage(apiKey, alphabet) {
  const url = window.location.href;
  if (url.includes(":3001") || url.toLowerCase().includes("/admin") || url.toLowerCase().includes("/admin-maff")) {
    console.log("Translation disabled on admin pages.");
    return;
  }

  const textNodes = [];
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"].includes(tag)) return NodeFilter.FILTER_REJECT;
        
        const text = node.textContent.trim();
        if (!text) return NodeFilter.FILTER_REJECT;
        
        // Skip purely numeric, symbolic, or unit-only values (e.g., "8mm", "1,380*0,157", "40014", "33/AC5", "m²")
        if (/^[0-9\s.,*x\-+()\/m²²³°%]+$/i.test(text)) return NodeFilter.FILTER_REJECT;
        if (text.length < 2) return NodeFilter.FILTER_REJECT;
        
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  const BATCH = 20;
  for (let i = 0; i < textNodes.length; i += BATCH) {
    const batch = textNodes.slice(i, i + BATCH);
    const texts = batch.map(n => n.textContent.trim());

    const response = await chrome.runtime.sendMessage({
      action: "translate",
      texts,
      apiKey,
      alphabet
    });

    if (response && response.success) {
      batch.forEach((node, idx) => {
        if (response.translations[idx]) {
          node.textContent = response.translations[idx];
        }
      });
    } else {
      console.error("Translation failed for batch starting at index " + i, response ? response.error : "no response");
    }
  }
}
