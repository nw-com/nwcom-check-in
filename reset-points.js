// 重置所有用戶點數為0的函數
async function resetAllUserPoints() {
    if (!confirm('確定要將所有用戶的獎懲點數重置為0嗎？此操作無法撤銷。')) {
        return;
    }
    
    try {
        showLoading(true);
        
        // 獲取所有用戶
        const usersSnapshot = await firebase.firestore().collection("users").get();
        const batch = firebase.firestore().batch();
        
        // 批量更新所有用戶的點數為0
        usersSnapshot.forEach(userDoc => {
            const userRef = firebase.firestore().collection("users").doc(userDoc.id);
            batch.update(userRef, { points: 0 });
        });
        
        // 提交批量更新
        await batch.commit();
        
        showToast("已成功將所有用戶的獎懲點數重置為0");
    } catch (error) {
        console.error("重置點數失敗:", error);
        showToast("重置點數失敗，請稍後再試", true);
    } finally {
        showLoading(false);
    }
}

// 設定每月自動重置點數的函數
function setupMonthlyPointsReset() {
    console.log("設定每月自動重置點數");
    
    // 檢查是否已經設定了自動重置
    const lastSetupTime = localStorage.getItem('monthlyResetSetupTime');
    const currentTime = new Date().getTime();
    
    // 如果已經設定過且距離上次設定不到24小時，則不重複設定
    if (lastSetupTime && (currentTime - parseInt(lastSetupTime)) < 24 * 60 * 60 * 1000) {
        console.log("已經設定過自動重置，不重複設定");
        return;
    }
    
    // 計算下個月1日00:01的時間
    function getNextMonthResetTime() {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 1, 0);
        return nextMonth.getTime() - now.getTime();
    }
    
    // 設定定時器
    function scheduleNextReset() {
        const timeUntilNextReset = getNextMonthResetTime();
        console.log(`下次重置將在 ${new Date(Date.now() + timeUntilNextReset).toLocaleString()} 執行`);
        
        setTimeout(async () => {
            try {
                console.log("執行每月自動重置點數");
                
                // 獲取所有用戶
                const usersSnapshot = await firebase.firestore().collection("users").get();
                const batch = firebase.firestore().batch();
                
                // 批量更新所有用戶的點數為0
                usersSnapshot.forEach(userDoc => {
                    const userRef = firebase.firestore().collection("users").doc(userDoc.id);
                    batch.update(userRef, { points: 0 });
                });
                
                // 提交批量更新
                await batch.commit();
                
                console.log("每月自動重置點數完成");
                
                // 記錄重置時間
                const resetLog = {
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    action: "monthly_auto_reset",
                    description: "系統自動執行每月點數重置"
                };
                
                await firebase.firestore().collection("systemLogs").add(resetLog);
                
                // 設定下一次重置
                scheduleNextReset();
                
            } catch (error) {
                console.error("自動重置點數失敗:", error);
                // 如果失敗，1小時後重試
                setTimeout(scheduleNextReset, 60 * 60 * 1000);
            }
        }, timeUntilNextReset);
    }
    
    // 啟動定時器
    scheduleNextReset();
    
    // 記錄設定時間
    localStorage.setItem('monthlyResetSetupTime', currentTime.toString());
}

// 當管理員登入時初始化每月重置功能
function initPointsResetFeatures() {
    // 檢查用戶是否為管理員
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            firebase.firestore().collection("users").doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().role === 'admin') {
                    // 設定每月自動重置
                    setupMonthlyPointsReset();
                }
            });
        }
    });
}

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', () => {
    initPointsResetFeatures();
});