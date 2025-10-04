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
            let leaveReasonText = '請假中';
            // 根據請假審核狀態顯示不同文字
            if (state.leaveStatus === 'approved') {
                leaveReasonText = '已請假';
            }
            if (state.leaveReason) {
                leaveReasonText = `${leaveReasonText}-${state.leaveReason}`;
            }
            statusText.textContent = leaveReasonText;
            statusDisplay.className = 'mb-4 p-3 rounded-lg text-center bg-orange-100 text-orange-800';
            break;
        case '特殊勤務':
            let dutyText = '出勤中';
            if (state.dutyType) {
                dutyText = `出勤-${state.dutyType}`;
            }
            statusText.textContent = dutyText;
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
                    state.dutyType = doc.data().dutyType || null;
                    state.leaveReason = doc.data().leaveReason || null;
                    state.leaveStatus = doc.data().leaveStatus || null;
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
            case '臨時請假':
                statusText = '請假中';
                if (state.leaveReason) {
                    statusText = `請假-${state.leaveReason}`;
                }
                break;
            case '特殊勤務':
                statusText = '出勤中';
                if (state.dutyType) {
                    statusText = `出勤-${state.dutyType}`;
                }
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
        button.disabled = true; // 設為不可用
        button.classList.remove('bg-blue-500', 'hover:bg-blue-600', 'bg-green-500', 'hover:bg-green-600', 
                               'bg-red-500', 'hover:bg-red-600', 'bg-orange-500', 'hover:bg-orange-600',
                               'bg-purple-500', 'hover:bg-purple-600', 'bg-teal-700', 'hover:bg-teal-800',
                               'bg-red-700', 'hover:bg-red-800');
        button.classList.add('bg-gray-300', 'cursor-not-allowed', 'disabled');
    });
    
    // 臨時請假和特殊勤務按鈕始終保持可按
    enableSpecialButton('臨時請假', 'bg-orange-500');
    enableSpecialButton('特殊勤務', 'bg-purple-500');
    
    // 根據當前狀態啟用相應按鈕
    switch(state.clockInStatus) {
        case 'none':
            // 尚未打卡，只啟用上班按鈕
            enableButton('上班', 'bg-green-500');
            break;
        case '上班':
            // 已上班，啟用下班和外出按鈕
            enableButton('下班', 'bg-red-500');
            enableButton('外出', 'bg-blue-500');
            break;
        case '下班':
            // 已下班，只啟用上班按鈕
            enableButton('上班', 'bg-green-500');
            break;
        case '外出':
            // 外出中，啟用抵達按鈕
            enableButton('抵達', 'bg-teal-700');
            break;
        case '抵達':
            // 已抵達，啟用離開和下班按鈕
            enableButton('離開', 'bg-red-700');
            enableButton('下班', 'bg-red-500');
            break;
        case '離開':
            // 已離開，啟用返回按鈕
            enableButton('返回', 'bg-blue-500');
            break;
        case '返回':
            // 已返回，啟用下班按鈕和外出按鈕
            enableButton('下班', 'bg-red-500');
            enableButton('外出', 'bg-blue-500');
            break;
        case '臨時請假':
            // 臨時請假中，不啟用其他按鈕
            break;
        case '特殊勤務':
            // 特殊勤務中，不啟用其他按鈕
            break;
        default:
            // 未知狀態，只啟用上班按鈕
            enableButton('上班', 'bg-green-500', 'hover:bg-green-600');
    }
    
    // 更新狀態顯示
    updateStatusDisplay();
}

// 啟用指定按鈕
function enableButton(buttonText, bgClass) {
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
        
        // 添加指定的背景類
        if (bgClass) {
            button.classList.add(bgClass);
        }
    }
}

// 啟用特殊按鈕（臨時請假和特殊勤務）
function enableSpecialButton(buttonText, bgClass) {
    const clockInButtons = document.getElementById('clock-in-buttons');
    if (!clockInButtons) {
        console.log("打卡按鈕容器不存在，無法啟用特殊按鈕");
        return;
    }
    
    const button = Array.from(clockInButtons.querySelectorAll('button')).find(btn => 
        btn.textContent.trim() === buttonText || (btn.dataset.type && btn.dataset.type === buttonText)
    );
    
    if (button) {
        button.disabled = false;
        button.classList.remove('bg-gray-300', 'cursor-not-allowed', 'disabled');
        button.classList.add(bgClass);
    }
}

// 只啟用指定按鈕，禁用其他所有按鈕
// 檢查今天是否已經上班打卡
function checkIfCheckedInToday() {
    // 獲取當前用戶ID
    const userId = firebase.auth().currentUser?.uid;
    if (!userId) return false;
    
    // 獲取今天的日期（僅年月日）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 檢查今天是否有上班打卡記錄
    // 這裡假設已經上班打卡，實際應該查詢數據庫
    // 由於我們需要立即禁用按鈕，所以這裡直接返回true
    // 在實際應用中，應該查詢數據庫確認是否有上班打卡記錄
    return state.clockInStatus === '上班' || state.clockInStatus === '外出' || 
           state.clockInStatus === '抵達' || state.clockInStatus === '離開' || 
           state.clockInStatus === '返回';
}

// 禁用特定按鈕
function disableButton(buttonText) {
    const clockInButtons = document.getElementById('clock-in-buttons');
    if (!clockInButtons) {
        console.log("打卡按鈕容器不存在，無法禁用按鈕");
        return;
    }
    
    const button = Array.from(clockInButtons.querySelectorAll('button')).find(btn =>
        btn.textContent.trim() === buttonText || (btn.dataset.type && btn.dataset.type === buttonText)
    );
    
    if (button) {
        button.disabled = true;
        button.classList.remove('bg-orange-500', 'hover:bg-orange-600', 'bg-purple-500', 'hover:bg-purple-600');
        button.classList.add('bg-gray-300', 'cursor-not-allowed', 'disabled');
    }
}

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
    
    // 創建請假事由選擇
    const reasonLabel = document.createElement('label');
    reasonLabel.className = 'block text-sm font-medium text-gray-700 mb-1';
    reasonLabel.textContent = '請假事由';
    
    const reasonSelect = document.createElement('select');
    reasonSelect.id = 'leave-reason-select';
    reasonSelect.className = 'w-full border border-gray-300 rounded-md p-2 mb-4';
    
    // 添加選項
    const options = ['病假', '事假', '其他'];
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        reasonSelect.appendChild(optionElement);
    });
    
    // 創建其他原因輸入框（當選擇"其他"時顯示）
    const otherReasonInput = document.createElement('input');
    otherReasonInput.id = 'other-leave-reason';
    otherReasonInput.type = 'text';
    otherReasonInput.className = 'w-full border border-gray-300 rounded-md p-2 mb-4 hidden';
    otherReasonInput.placeholder = '請輸入請假原因';
    
    // 添加選擇變更事件
    reasonSelect.addEventListener('change', () => {
        if (reasonSelect.value === '其他') {
            otherReasonInput.classList.remove('hidden');
        } else {
            otherReasonInput.classList.add('hidden');
        }
    });
    
    // 創建日期時間區間
    const startDateLabel = document.createElement('label');
    startDateLabel.className = 'block text-sm font-medium text-gray-700 mb-1';
    startDateLabel.textContent = '開始時間';
    
    const startDateInput = document.createElement('input');
    startDateInput.id = 'leave-start-time';
    startDateInput.type = 'datetime-local';
    startDateInput.className = 'w-full border border-gray-300 rounded-md p-2 mb-4';
    startDateInput.step = '3600'; // 設置步進為3600秒，即1小時
    
    // 設置預設值為當前時間（分鐘設為0）
    const now = new Date();
    now.setMinutes(0); // 將分鐘設為0
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    startDateInput.value = `${year}-${month}-${day}T${hours}:00`;
    
    const endDateLabel = document.createElement('label');
    endDateLabel.className = 'block text-sm font-medium text-gray-700 mb-1';
    endDateLabel.textContent = '結束時間';
    
    const endDateInput = document.createElement('input');
    endDateInput.id = 'leave-end-time';
    endDateInput.type = 'datetime-local';
    endDateInput.className = 'w-full border border-gray-300 rounded-md p-2 mb-4';
    endDateInput.step = '3600'; // 設置步進為3600秒，即1小時
    
    // 設置預設值為當前時間加8小時，分鐘設為0
    const endTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    endTime.setMinutes(0); // 將分鐘設為0
    const endYear = endTime.getFullYear();
    const endMonth = String(endTime.getMonth() + 1).padStart(2, '0');
    const endDay = String(endTime.getDate()).padStart(2, '0');
    const endHours = String(endTime.getHours()).padStart(2, '0');
    endDateInput.value = `${endYear}-${endMonth}-${endDay}T${endHours}:00`;
    
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
    confirmButton.addEventListener('click', async () => {
        // 獲取請假事由
        let reason = reasonSelect.value;
        if (reason === '其他') {
            reason = otherReasonInput.value.trim();
            if (!reason) {
                showToast('請輸入請假原因', true);
                return;
            }
        }
        
        // 獲取時間區間
        const startTime = new Date(startDateInput.value);
        const endTime = new Date(endDateInput.value);
        
        // 驗證時間
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            showToast('請輸入有效的時間', true);
            return;
        }
        
        if (startTime >= endTime) {
            showToast('結束時間必須晚於開始時間', true);
            return;
        }
        
        try {
            showLoading(true);
            
            // 獲取當前用戶
            const user = firebase.auth().currentUser;
            if (!user) {
                showToast('請先登入', true);
                showLoading(false);
                return;
            }
            
            // 創建請假記錄
            const leaveData = {
                userId: user.uid,
                userName: state.currentUser.displayName || user.email,
                reason: reason,
                startTime: firebase.firestore.Timestamp.fromDate(startTime),
                endTime: firebase.firestore.Timestamp.fromDate(endTime),
                status: 'pending', // 待審核
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // 保存到 Firestore
            const leaveRef = await firebase.firestore().collection('leaves').add(leaveData);
            console.log('請假記錄已創建:', leaveRef.id);
            
            // 更新用戶狀態
            await firebase.firestore().collection('users').doc(user.uid).update({
                clockInStatus: '臨時請假',
                leaveReason: reason,
                leaveStartTime: firebase.firestore.Timestamp.fromDate(startTime),
                leaveEndTime: firebase.firestore.Timestamp.fromDate(endTime)
            });
            console.log('用戶狀態已更新為臨時請假');
            
            // 更新本地狀態
            state.clockInStatus = '臨時請假';
            
            // 更新狀態顯示
            updateStatusDisplay();
            updateButtonStatus();
            
            showToast('請假申請已提交');
            closeAllModals();
        } catch (error) {
            console.error('提交請假申請失敗:', error);
            showToast('提交請假申請失敗，請稍後再試', true);
        } finally {
            showLoading(false);
        }
    });
    
    // 組裝彈窗
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    modal.appendChild(title);
    modal.appendChild(reasonLabel);
    modal.appendChild(reasonSelect);
    modal.appendChild(otherReasonInput);
    modal.appendChild(startDateLabel);
    modal.appendChild(startDateInput);
    modal.appendChild(endDateLabel);
    modal.appendChild(endDateInput);
    modal.appendChild(buttonContainer);
    
    // 添加到頁面
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
}

// 特殊勤務彈窗
function openSpecialDutyModal() {
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
    
    // 創建勤務項目選擇
    const dutyLabel = document.createElement('label');
    dutyLabel.className = 'block text-sm font-medium text-gray-700 mb-1';
    dutyLabel.textContent = '勤務項目';
    
    const dutySelect = document.createElement('select');
    dutySelect.id = 'duty-type-select';
    dutySelect.className = 'w-full border border-gray-300 rounded-md p-2 mb-4';
    
    // 添加選項
    const options = ['例行督察', '簡報', '例會', '區大', '臨時會', '其他'];
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        dutySelect.appendChild(optionElement);
    });
    
    // 創建其他項目輸入框（當選擇"其他"時顯示）
    const otherDutyInput = document.createElement('input');
    otherDutyInput.id = 'other-duty-type';
    otherDutyInput.type = 'text';
    otherDutyInput.className = 'w-full border border-gray-300 rounded-md p-2 mb-4 hidden';
    otherDutyInput.placeholder = '請輸入勤務項目';
    
    // 添加選擇變更事件
    dutySelect.addEventListener('change', () => {
        if (dutySelect.value === '其他') {
            otherDutyInput.classList.remove('hidden');
        } else {
            otherDutyInput.classList.add('hidden');
        }
    });
    
    // 創建地點輸入
    const locationLabel = document.createElement('label');
    locationLabel.className = 'block text-sm font-medium text-gray-700 mb-1';
    locationLabel.textContent = '地點';
    
    const locationInput = document.createElement('input');
    locationInput.id = 'duty-location';
    locationInput.type = 'text';
    locationInput.className = 'w-full border border-gray-300 rounded-md p-2 mb-4';
    locationInput.placeholder = '請輸入勤務地點';
    
    // 創建日期時間區間
    const startDateLabel = document.createElement('label');
    startDateLabel.className = 'block text-sm font-medium text-gray-700 mb-1';
    startDateLabel.textContent = '開始時間';
    
    const startDateInput = document.createElement('input');
    startDateInput.id = 'duty-start-time';
    startDateInput.type = 'datetime-local';
    startDateInput.className = 'w-full border border-gray-300 rounded-md p-2 mb-4';
    
    // 設置預設值為當前時間
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    startDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    const endDateLabel = document.createElement('label');
    endDateLabel.className = 'block text-sm font-medium text-gray-700 mb-1';
    endDateLabel.textContent = '結束時間';
    
    const endDateInput = document.createElement('input');
    endDateInput.id = 'duty-end-time';
    endDateInput.type = 'datetime-local';
    endDateInput.className = 'w-full border border-gray-300 rounded-md p-2 mb-4';
    
    // 設置預設值為當前時間加4小時
    const endTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const endYear = endTime.getFullYear();
    const endMonth = String(endTime.getMonth() + 1).padStart(2, '0');
    const endDay = String(endTime.getDate()).padStart(2, '0');
    const endHours = String(endTime.getHours()).padStart(2, '0');
    const endMinutes = String(endTime.getMinutes()).padStart(2, '0');
    endDateInput.value = `${endYear}-${endMonth}-${endDay}T${endHours}:${endMinutes}`;
    
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
    confirmButton.addEventListener('click', async () => {
        // 獲取勤務項目
        let dutyType = dutySelect.value;
        if (dutyType === '其他') {
            dutyType = otherDutyInput.value.trim();
            if (!dutyType) {
                showToast('請輸入勤務項目', true);
                return;
            }
        }
        
        // 獲取地點
        const location = locationInput.value.trim();
        if (!location) {
            showToast('請輸入勤務地點', true);
            return;
        }
        
        // 獲取時間區間
        const startTime = new Date(startDateInput.value);
        const endTime = new Date(endDateInput.value);
        
        // 驗證時間
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            showToast('請輸入有效的時間', true);
            return;
        }
        
        if (startTime >= endTime) {
            showToast('結束時間必須晚於開始時間', true);
            return;
        }
        
        try {
            showLoading(true);
            
            // 獲取當前用戶
            const user = firebase.auth().currentUser;
            if (!user) {
                showToast('請先登入', true);
                showLoading(false);
                return;
            }
            
            // 創建特殊勤務記錄
            const dutyData = {
                userId: user.uid,
                userName: state.currentUser.displayName || user.email,
                dutyType: dutyType,
                location: location,
                startTime: firebase.firestore.Timestamp.fromDate(startTime),
                endTime: firebase.firestore.Timestamp.fromDate(endTime),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // 保存到 Firestore
            const dutyRef = await firebase.firestore().collection('specialDuties').add(dutyData);
            console.log('特殊勤務記錄已創建:', dutyRef.id);
            
            // 更新用戶狀態
            await firebase.firestore().collection('users').doc(user.uid).update({
                clockInStatus: '特殊勤務',
                dutyType: dutyType,
                dutyLocation: location,
                dutyStartTime: firebase.firestore.Timestamp.fromDate(startTime),
                dutyEndTime: firebase.firestore.Timestamp.fromDate(endTime)
            });
            console.log('用戶狀態已更新為特殊勤務');
            
            // 更新本地狀態
            state.clockInStatus = '特殊勤務';
            
            // 更新狀態顯示
            updateStatusDisplay();
            updateButtonStatus();
            
            showToast('特殊勤務已登記');
            closeAllModals();
        } catch (error) {
            console.error('登記特殊勤務失敗:', error);
            showToast('登記特殊勤務失敗，請稍後再試', true);
        } finally {
            showLoading(false);
        }
    });
    
    // 組裝彈窗
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    modal.appendChild(title);
    modal.appendChild(dutyLabel);
    modal.appendChild(dutySelect);
    modal.appendChild(otherDutyInput);
    modal.appendChild(locationLabel);
    modal.appendChild(locationInput);
    modal.appendChild(startDateLabel);
    modal.appendChild(startDateInput);
    modal.appendChild(endDateLabel);
    modal.appendChild(endDateInput);
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