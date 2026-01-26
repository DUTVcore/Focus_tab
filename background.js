// Lắng nghe khi người dùng chuyển Tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    checkTab(activeInfo.tabId);
});

// Lắng nghe khi Tab tải xong hoặc đổi URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        checkTab(tabId);
    }
});

async function checkTab(tabId) {
    // Lấy dữ liệu từ bộ nhớ
    const result = await chrome.storage.local.get(['focusModeStatus', 'focusDomain']);
    const isFocusing = result.focusModeStatus === true;
    const allowedDomain = result.focusDomain || "";

    if (!isFocusing || !allowedDomain) return;

    // Lấy thông tin tab hiện tại
    try {
        const tab = await chrome.tabs.get(tabId);
        // Bỏ qua các trang hệ thống chrome:// hoặc trang newtab của mình
        if (!tab.url || tab.url.startsWith('chrome://') || tab.url.includes('newtab.html')) return;

        // Phân tích domain của tab hiện tại
        const currentDomain = new URL(tab.url).hostname;

        // So sánh (cho phép subdomain và path con)
        // Logic: currentDomain phải CHỨA allowedDomain hoặc ngược lại để bao quát
        // Ví dụ: allowed "google.com" thì "gemini.google.com" vẫn ok.
        if (!currentDomain.includes(allowedDomain) && !allowedDomain.includes(currentDomain)) {
            
            // VI PHẠM! Bắn cảnh báo vào mặt
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: (domain) => {
                    alert(`⚠️ CẢNH BÁO TẬP TRUNG!\n\nBạn đang focus vào: ${domain}\n\nQuay lại làm việc đi! NO DISTRACTION !!!`);
                    // Tùy chọn: Tự động quay về trang newtab (bỏ comment dòng dưới nếu muốn gắt hơn)
                    // window.location.href = "chrome://newtab"; 
                },
                args: [allowedDomain]
            });
        }
    } catch (e) {
        console.log("Lỗi check tab:", e);
    }
}