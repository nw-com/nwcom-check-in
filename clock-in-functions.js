// 打卡功能相關函數

// 確保state對象存在
if (typeof state === 'undefined') {
    window.state = {};
}

// 設置打卡狀態屬性
if (typeof state.clockInStatus === 'undefined') {
    state.clockInStatus = 'none';
}

// 根據狀態更新顯示文本和樣式
function updateStatusTextAndStyle(statusText, statusDisplay) {
    switch(state.clockInStatus) {
        case '上班':
            statusText.textContent = '上班中-辦公室';
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-green-100 text-green-800';
            break;
        case '下班':
            statusText.textContent = '已下班';
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-red-100 text-red-800';
            break;
        case '外出':
            let outboundText = '外出中';
            if (state.outboundLocation) {
                outboundText = `外出-${state.outboundLocation}`;
            }
            statusText.textContent = outboundText;
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-emerald-100 text-emerald-800';
            break;
        case '抵達':
            let arriveText = '抵達';
            if (state.outboundLocation) {
                arriveText = `抵達-${state.outboundLocation}`;
            }
            statusText.textContent = arriveText;
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-blue-100 text-blue-800';
            break;
        case '離開':
            let leaveText = '離開';
            if (state.outboundLocation) {
                leaveText = `離開-${state.outboundLocation}`;
            }
            statusText.textContent = leaveText;
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-amber-100 text-amber-800';
            break;
        case '返回':
            statusText.textContent = '返回-辦公室';
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-pink-100 text-pink-800';
            break;
        case '臨時請假':
            statusText.textContent = '請假中';
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-orange-100 text-orange-800';
            break;
        case '特殊勤務':
            statusText.textContent = '出勤中';
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-purple-100 text-purple-800';
            break;
        default:
            statusText.textContent = '尚未打卡';
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-gray-100 text-gray-800';
    }
}

// 更新狀態顯示
function updateStatusDisplay() {
    // 檢查狀態顯示區域是否存在，如果不存在則創建
    let statusDisplay = document.getElementById('status-display');
    if (!statusDisplay) {
        const clockInContainer = document.getElementById('clock-in-container');
        const clockInButtons = document.getElementById('clock-in-buttons');
        
        if (!clockInContainer || !clockInButtons) return;
        
        statusDisplay = document.createElement('div');
        statusDisplay.id = 'status-display';
        statusDisplay.className = 'mb-4 p-3 rounded-lg text-center';
        
        const statusText = document.createElement('span');
        statusText.id = 'status-text';
        statusText.textContent = '尚未打卡';
        statusDisplay.appendChild(statusText);
        
        clockInContainer.insertBefore(statusDisplay, clockInButtons);
    }
    
    // 更新儀表板狀態
    updateDashboardStatus();
    
    // 更新打卡狀態顯示
    const statusText = document.getElementById('status-text');
    if (statusText) {
        // 強制檢查當前用戶的打卡狀態
        if (firebase.auth().currentUser) {
            const userId = firebase.auth().currentUser.uid;
            firebase.firestore().collection('users').doc(userId).get().then(doc => {
                if (doc.exists && doc.data().clockInStatus) {
                    state.clockInStatus = doc.data().clockInStatus;
                    state.outboundLocation = doc.data().outboundLocation || null;
                }
                
                // 根據狀態更新顯示
                updateStatusTextAndStyle(statusText, statusDisplay);
            }).catch(error => {
                console.error("獲取用戶狀態失敗:", error);
                updateStatusTextAndStyle(statusText, statusDisplay);
            });
        } else {
            updateStatusTextAndStyle(statusText, statusDisplay);
        }
    }
}

// 更新儀表板狀態
function updateDashboardStatus() {
    const dashboardStatusElement = document.getElementById('my-status');
    if (dashboardStatusElement) {
        let statusText = '';
        switch(state.clockInStatus) {
            case '上班':
                statusText = '上班中-辦公室';
                break;
            case '下班':
                statusText = '已下班';
                break;
            case '外出':
                statusText = '外出中';
                if (state.outboundLocation) {
                    statusText = `外出-${state.outboundLocation}`;
                }
                break;
            case '抵達':
                statusText = '抵達';
                if (state.outboundLocation) {
                    statusText = `抵達-${state.outboundLocation}`;
                }
                break;
            case '離開':
                statusText = '離開';
                if (state.outboundLocation) {
                    statusText = `離開-${state.outboundLocation}`;
                }
                break;
            case '返回':
                statusText = '返回-辦公室';
                break;
            default:
                statusText = '尚未打卡';
        }
        dashboardStatusElement.textContent = statusText;
    }
}

// 初始化打卡按鈕狀態
function initClockInButtonStatus() {
    // 檢查用戶是否已登入
    if (!firebase.auth().currentUser) {
        console.log("用戶尚未登入，無法初始化打卡按鈕");
        setTimeout(initClockInButtonStatus, 1000); // 延遲重試
        return;
    }
    
    // 獲取當前用戶ID
    const userId = firebase.auth().currentUser.uid;
    
    // 檢查按鈕容器是否存在
    const clockInButtons = document.getElementById('clock-in-buttons');
    if (!clockInButtons) {
        console.log("打卡按鈕容器不存在，稍後重試");
        setTimeout(initClockInButtonStatus, 500);
        return;
    }
    
    // 禁用所有按鈕，等待狀態確認
    clockInButtons.querySelectorAll('button').forEach(button => {
        button.disabled = false; // 先設為可用
        button.classList.remove('disabled');
        if (button.dataset.type === '上班') {
            button.classList.remove('bg-gray-300', 'cursor-not-allowed');
            button.classList.add('bg-green-500', 'hover:bg-green-600');
        } else {
            button.classList.remove('bg-blue-500', 'hover:bg-blue-600', 'bg-green-500', 'hover:bg-green-600');
            button.classList.add('bg-gray-300', 'cursor-not-allowed');
            button.classList.add('disabled');
        }
    });
    
    // 從Firestore獲取用戶最後的打卡狀態
    firebase.firestore().collection('users').doc(userId).get().then(doc => {
        if (doc.exists && doc.data().clockInStatus) {
            // 設置全局狀態
            state.clockInStatus = doc.data().clockInStatus;
            state.outboundLocation = doc.data().outboundLocation || null;
            
            // 更新按鈕狀態
            updateButtonStatus();
        } else {
            // 新用戶，只啟用上班打卡
            state.clockInStatus = 'none';
            state.outboundLocation = null;
            enableOnlyButton('上班');
        }
        
        // 更新狀態顯示
        updateStatusDisplay();
    }).catch(error => {
        console.error("獲取用戶狀態失敗:", error);
        showToast("獲取用戶狀態失敗，請重新整理頁面", true);
        // 出錯時至少啟用上班打卡按鈕
        enableOnlyButton('上班');
    });
}

// 更新按鈕狀態
function updateButtonStatus() {
    // 先檢查按鈕容器是否存在
    const clockInButtons = document.getElementById('clock-in-buttons');
    if (!clockInButtons) {
        console.log("打卡按鈕容器不存在，無法更新按鈕狀態");
        return;
    }
    
    // 先禁用所有按鈕
    clockInButtons.querySelectorAll('button').forEach(button => {
        button.disabled = false; // 設為可用但添加disabled類
        button.classList.remove('bg-blue-500', 'hover:bg-blue-600', 'bg-green-500', 'hover:bg-green-600');
        button.classList.add('bg-gray-300', 'cursor-not-allowed', 'disabled');
    });
    
    // 根據當前狀態啟用相應按鈕
    switch(state.clockInStatus) {
        case 'none':
            // 尚未打卡，只啟用上班按鈕
            enableOnlyButton('上班');
            break;
        case '上班':
            // 已上班，啟用下班和外出按鈕
            enableButton('下班');
            enableButton('外出');
            enableButton('臨時請假');
            enableButton('特殊勤務');
            break;
        case '下班':
            // 已下班，只啟用上班按鈕
            enableOnlyButton('上班');
            break;
        case '外出':
            // 外出中，啟用抵達按鈕
            enableOnlyButton('抵達');
            break;
        case '抵達':
            // 已抵達，啟用離開按鈕
            enableOnlyButton('離開');
            break;
        case '離開':
            // 已離開，啟用返回按鈕
            enableOnlyButton('返回');
            break;
        case '返回':
            // 已返回，啟用下班和外出按鈕
            enableButton('下班');
            enableButton('外出');
            enableButton('臨時請假');
            enableButton('特殊勤務');
            break;
        case '臨時請假':
            // 臨時請假中，不啟用任何按鈕
            break;
        case '特殊勤務':
            // 特殊勤務中，不啟用任何按鈕
            break;
        default:
            // 未知狀態，只啟用上班按鈕
            enableOnlyButton('上班');
    }
    
    // 更新狀態顯示
    updateStatusDisplay();
}

// 啟用指定按鈕
function enableButton(buttonText) {
    const clockInButtons = document.getElementById('clock-in-buttons');
    if (!clockInButtons) {
        console.log("打卡按鈕容器不存在，無法啟用按鈕");
        return;
    }
    
    const button = Array.from(clockInButtons.querySelectorAll('button')).find(btn => 
        btn.textContent.trim() === buttonText || (btn.dataset.type && btn.dataset.type === buttonText)
    );
    
    if (button) {
        button.disabled = false;
        button.classList.remove('bg-gray-300', 'cursor-not-allowed', 'disabled');
        
        // 根據按鈕類型設置不同顏色
        if (buttonText === '下班') {
            button.classList.add('bg-red-500', 'hover:bg-red-600');
        } else if (buttonText === '臨時請假') {
            button.classList.add('bg-orange-500', 'hover:bg-orange-600');
        } else if (buttonText === '上班') {
            button.classList.add('bg-green-500', 'hover:bg-green-600');
        } else {
            button.classList.add('bg-blue-500', 'hover:bg-blue-600');
        }
    }
}

// 只啟用指定按鈕，禁用其他所有按鈕
function enableOnlyButton(buttonText) {
    const clockInButtons = document.getElementById('clock-in-buttons');
    if (!clockInButtons) {
        console.log("打卡按鈕容器不存在，無法啟用按鈕");
        return;
    }
    
    clockInButtons.querySelectorAll('button').forEach(button => {
        if (button.textContent.trim() === buttonText || (button.dataset.type && button.dataset.type === buttonText)) {
            button.disabled = false;
            button.classList.remove('bg-gray-300', 'cursor-not-allowed', 'disabled');
            
            // 根據按鈕類型設置不同顏色
            if (buttonText === '上班') {
                button.classList.add('bg-green-500', 'hover:bg-green-600');
            } else if (buttonText === '下班') {
                button.classList.add('bg-red-500', 'hover:bg-red-600');
            } else {
                button.classList.add('bg-blue-500', 'hover:bg-blue-600');
            }
        } else {
            button.disabled = false; // 設為可用但添加disabled類
            button.classList.remove('bg-blue-500', 'hover:bg-blue-600', 'bg-green-500', 'hover:bg-green-600');
            button.classList.add('bg-gray-300', 'cursor-not-allowed', 'disabled');
        }
    });
}

// 打開外出地點輸入彈窗
function openLocationInputModal() {
    const modal = document.getElementById('location-input-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const locationInput = document.getElementById('outbound-location');
    
    if (!modal || !backdrop || !locationInput) {
        // 如果元素不存在，創建彈窗
        createLocationInputModal();
        return;
    }
    
    // 清空輸入框
    locationInput.value = '';
    
    // 顯示彈窗
    modal.classList.remove('hidden');
    backdrop.classList.remove('hidden');
}

// 創建外出地點輸入彈窗
function createLocationInputModal() {
    // 創建背景
    const backdrop = document.createElement('div');
    backdrop.id = 'modal-backdrop';
    backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 z-40';
    backdrop.addEventListener('click', closeAllModals);
    
    // 創建彈窗
    const modal = document.createElement('div');
    modal.id = 'location-input-modal';
    modal.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 z-50 w-80';
    
    // 創建標題
    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold mb-4';
    title.textContent = '請輸入外出地點';
    
    // 創建輸入框
    const input = document.createElement('input');
    input.id = 'outbound-location';
    input.type = 'text';
    input.className = 'w-full border border-gray-300 rounded-md p-2 mb-4';
    input.placeholder = '例如：客戶公司、醫院等';
    
    // 創建按鈕容器
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-end space-x-2';
    
    // 創建取消按鈕
    const cancelButton = document.createElement('button');
    cancelButton.className = 'px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300';
    cancelButton.textContent = '取消';
    cancelButton.addEventListener('click', closeAllModals);
    
    // 創建確認按鈕
    const confirmButton = document.createElement('button');
    confirmButton.className = 'px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600';
    confirmButton.textContent = '確認';
    confirmButton.addEventListener('click', () => {
        const location = document.getElementById('outbound-location').value.trim();
        if (location) {
            state.outboundLocation = location;
            closeAllModals();
            openCameraModal('外出');
        } else {
            showToast('請輸入外出地點', true);
        }
    });
    
    // 組裝彈窗
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    modal.appendChild(title);
    modal.appendChild(input);
    modal.appendChild(buttonContainer);
    
    // 添加到頁面
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
}

// 臨時請假彈窗
function openTempLeaveModal() {
    if (!state.currentLocation) {
        showToast("無法取得目前位置，請稍後再試", true);
        return;
    }
    
    // 創建彈窗背景
    const backdrop = document.createElement('div');
    backdrop.id = 'modal-backdrop';
    backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    // 創建彈窗
    const modal = document.createElement('div');
    modal.id = 'temp-leave-modal';
    modal.className = 'bg-white rounded-lg p-6 w-[90%] max-w-md';
    
    // 彈窗標題
    const title = document.createElement('h3');
    title.className = 'text-lg font-bold mb-4 text-center';
    title.textContent = '臨時請假';
    
    // 請假原因輸入框
    const reasonLabel = document.createElement('label');
    reasonLabel.className = 'block text-sm font-medium text-gray-700 mb-1';
    reasonLabel.textContent = '請假原因';
    
    const reasonInput = document.createElement('textarea');
    reasonInput.id = 'leave-reason';
    reasonInput.className = 'w-full border border-gray-300 rounded-md p-2 mb-4';
    reasonInput.rows = 3;
    reasonInput.placeholder = '請輸入請假原因';
    
    // 按鈕容器
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-end space-x-2';
    
    // 取消按鈕
    const cancelButton = document.createElement('button');
    cancelButton.className = 'px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400';
    cancelButton.textContent = '取消';
    cancelButton.addEventListener('click', closeAllModals);
    
    // 確認按鈕
    const confirmButton = document.createElement('button');
    confirmButton.className = 'px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600';
    confirmButton.textContent = '確認請假';
    confirmButton.addEventListener('click', () => {
        const reason = document.getElementById('leave-reason').value.trim();
        if (reason) {
            closeAllModals();
            openCameraModal('臨時請假', state.currentLocation, { reason });
        } else {
            showToast('請輸入請假原因', true);
        }
    });
    
    // 組裝彈窗
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    modal.appendChild(title);
    modal.appendChild(reasonLabel);
    modal.appendChild(reasonInput);
    modal.appendChild(buttonContainer);
    
    // 添加到頁面
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
}

// 特殊勤務彈窗
function openSpecialDutyModal() {
    if (!state.currentLocation) {
        showToast("無法取得目前位置，請稍後再試", true);
        return;
    }
    
    // 創建彈窗背景
    const backdrop = document.createElement('div');
    backdrop.id = 'modal-backdrop';
    backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    // 創建彈窗
    const modal = document.createElement('div');
    modal.id = 'special-duty-modal';
    modal.className = 'bg-white rounded-lg p-6 w-[90%] max-w-md';
    
    // 彈窗標題
    const title = document.createElement('h3');
    title.className = 'text-lg font-bold mb-4 text-center';
    title.textContent = '特殊勤務';
    
    // 勤務說明輸入框
    const dutyLabel = document.createElement('label');
    dutyLabel.className = 'block text-sm font-medium text-gray-700 mb-1';
    dutyLabel.textContent = '勤務說明';
    
    const dutyInput = document.createElement('textarea');
    dutyInput.id = 'duty-description';
    dutyInput.className = 'w-full border border-gray-300 rounded-md p-2 mb-4';
    dutyInput.rows = 3;
    dutyInput.placeholder = '請輸入特殊勤務說明';
    
    // 按鈕容器
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-end space-x-2';
    
    // 取消按鈕
    const cancelButton = document.createElement('button');
    cancelButton.className = 'px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400';
    cancelButton.textContent = '取消';
    cancelButton.addEventListener('click', closeAllModals);
    
    // 確認按鈕
    const confirmButton = document.createElement('button');
    confirmButton.className = 'px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600';
    confirmButton.textContent = '確認勤務';
    confirmButton.addEventListener('click', () => {
        const description = document.getElementById('duty-description').value.trim();
        if (description) {
            closeAllModals();
            openCameraModal('特殊勤務', state.currentLocation, { description });
        } else {
            showToast('請輸入勤務說明', true);
        }
    });
    
    // 組裝彈窗
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    modal.appendChild(title);
    modal.appendChild(dutyLabel);
    modal.appendChild(dutyInput);
    modal.appendChild(buttonContainer);
    
    // 添加到頁面
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
}

// 關閉所有彈窗
function closeAllModals() {
    const backdrop = document.getElementById('modal-backdrop');
    const locationModal = document.getElementById('location-input-modal');
    const leaveModal = document.getElementById('temp-leave-modal');
    const dutyModal = document.getElementById('special-duty-modal');
    
    if (backdrop) backdrop.classList.add('hidden');
    if (locationModal) locationModal.classList.add('hidden');
    if (leaveModal) leaveModal.classList.add('hidden');
    if (dutyModal) dutyModal.classList.add('hidden');
    
    // 如果元素存在但沒有hidden類，則移除元素
    if (backdrop && !backdrop.classList.contains('hidden')) {
        backdrop.remove();
    }
    if (locationModal && !locationModal.classList.contains('hidden')) {
        locationModal.remove();
    }
    if (leaveModal && !leaveModal.classList.contains('hidden')) {
        leaveModal.remove();
    }
    if (dutyModal && !dutyModal.classList.contains('hidden')) {
        dutyModal.remove();
    }
}

// 添加事件監聽器
document.addEventListener('DOMContentLoaded', function() {
    // 外出按鈕
    const outboundButton = document.querySelector('#clock-in-buttons button:nth-child(3)');
    if (outboundButton) {
        outboundButton.addEventListener('click', openLocationInputModal);
    }
    
    // 初始化打卡按鈕狀態
    setTimeout(initClockInButtonStatus, 1000);
});