// 行事曆分頁渲染函數
function renderCalendar(subPage) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="h-[50px] flex items-center justify-around border-b border-gray-200 bg-white">
            <button data-subtab="overview" class="sub-tab-btn px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 ${subPage === 'overview' ? 'bg-red-100 text-red-600 active' : 'text-gray-600'}">總覽</button>
            <button data-subtab="schedule" class="sub-tab-btn px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 ${subPage === 'schedule' ? 'bg-red-100 text-red-600 active' : 'text-gray-600'}">行程表</button>
            <button data-subtab="notifications" class="sub-tab-btn px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 ${subPage === 'notifications' ? 'bg-red-100 text-red-600 active' : 'text-gray-600'}">訊息通知</button>
        </div>
        <div id="sub-page-content" class="overflow-y-auto" style="height: calc(100% - 50px);"></div>`;
    
    const subPageContent = document.getElementById('sub-page-content');
    if (subPage === 'overview') {
        renderCalendarOverview(subPageContent);
    } else if (subPage === 'schedule') {
        renderCalendarSchedule(subPageContent);
    } else if (subPage === 'notifications') {
        renderCalendarNotifications(subPageContent);
    }
    
    // 添加子分頁切換事件監聽器
    setTimeout(() => {
        mainContent.querySelectorAll('.sub-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const subtab = btn.dataset.subtab;
                console.log('Switching to subtab:', subtab);
                
                // 更新按鈕狀態
                mainContent.querySelectorAll('.sub-tab-btn').forEach(b => {
                    b.classList.remove('active', 'bg-red-100', 'text-red-600');
                    b.classList.add('text-gray-600');
                });
                btn.classList.remove('text-gray-600');
                btn.classList.add('active', 'bg-red-100', 'text-red-600');
                
                // 渲染對應的子分頁內容
                const subPageContent = document.getElementById('sub-page-content');
                if (subtab === 'overview') {
                    renderCalendarOverview(subPageContent);
                } else if (subtab === 'schedule') {
                    renderCalendarSchedule(subPageContent);
                } else if (subtab === 'notifications') {
                    renderCalendarNotifications(subPageContent);
                }
            });
        });
    }, 100);
}

// 總覽子分頁 - 月曆表格
function renderCalendarOverview(container) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    container.innerHTML = `
        <div class="p-4 space-y-4">
            <div class="bg-white rounded-lg shadow-sm border p-4">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-gray-800">行事曆總覽</h2>
                    <div class="flex items-center space-x-2">
                        <button id="prev-month" class="p-2 rounded-md bg-gray-100 hover:bg-gray-200">
                            <i data-lucide="chevron-left" class="w-4 h-4"></i>
                        </button>
                        <span id="current-month-year" class="text-lg font-semibold px-4">${currentYear}年${currentMonth + 1}月</span>
                        <button id="next-month" class="p-2 rounded-md bg-gray-100 hover:bg-gray-200">
                            <i data-lucide="chevron-right" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
                <div id="calendar-grid" class="grid grid-cols-7 gap-1">
                    <!-- 月曆將在這裡動態生成 -->
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-sm border p-4">
                <h3 class="text-lg font-bold text-gray-800 mb-3">本月重要事項</h3>
                <div id="monthly-events" class="space-y-2">
                    <!-- 重要事項將在這裡顯示 -->
                </div>
            </div>
        </div>`;
    
    generateCalendar(currentYear, currentMonth);
    loadMonthlyEvents(currentYear, currentMonth);
    
    // 月份切換事件
    document.getElementById('prev-month').addEventListener('click', () => {
        const newDate = new Date(currentYear, currentMonth - 1);
        generateCalendar(newDate.getFullYear(), newDate.getMonth());
        loadMonthlyEvents(newDate.getFullYear(), newDate.getMonth());
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        const newDate = new Date(currentYear, currentMonth + 1);
        generateCalendar(newDate.getFullYear(), newDate.getMonth());
        loadMonthlyEvents(newDate.getFullYear(), newDate.getMonth());
    });
}

// 生成月曆表格
function generateCalendar(year, month) {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearSpan = document.getElementById('current-month-year');
    
    monthYearSpan.textContent = `${year}年${month + 1}月`;
    
    // 清空現有內容
    calendarGrid.innerHTML = '';
    
    // 星期標題
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    weekdays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'p-2 text-center font-semibold text-gray-600 bg-gray-50';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // 獲取月份第一天和最後一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // 生成日期格子
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const dayCell = document.createElement('div');
        dayCell.className = 'p-2 min-h-[60px] border border-gray-200 cursor-pointer hover:bg-gray-50';
        
        const isCurrentMonth = currentDate.getMonth() === month;
        const isToday = currentDate.toDateString() === new Date().toDateString();
        
        if (!isCurrentMonth) {
            dayCell.classList.add('text-gray-400', 'bg-gray-50');
        }
        
        if (isToday) {
            dayCell.classList.add('bg-red-100', 'border-red-300');
        }
        
        dayCell.innerHTML = `
            <div class="text-sm ${isToday ? 'font-bold text-red-600' : ''}">${currentDate.getDate()}</div>
            <div class="text-xs text-gray-500 mt-1" id="events-${currentDate.getTime()}">
                <!-- 事件將在這裡顯示 -->
            </div>
        `;
        
        calendarGrid.appendChild(dayCell);
    }
}

// 載入月份事件
function loadMonthlyEvents(year, month) {
    const monthlyEventsContainer = document.getElementById('monthly-events');
    
    // 模擬事件數據（實際應用中應從Firebase獲取）
    const events = [
        { date: new Date(year, month, 5), title: '月會', type: 'meeting' },
        { date: new Date(year, month, 15), title: '員工訓練', type: 'training' },
        { date: new Date(year, month, 25), title: '績效評估', type: 'evaluation' }
    ];
    
    monthlyEventsContainer.innerHTML = '';
    
    if (events.length === 0) {
        monthlyEventsContainer.innerHTML = '<p class="text-gray-500 text-center py-4">本月暫無重要事項</p>';
        return;
    }
    
    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-md';
        eventDiv.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full ${getEventColor(event.type)}"></div>
                <span class="font-medium">${event.title}</span>
            </div>
            <span class="text-sm text-gray-500">${event.date.getDate()}日</span>
        `;
        monthlyEventsContainer.appendChild(eventDiv);
    });
}

// 行程表子分頁
function renderCalendarSchedule(container) {
    container.innerHTML = `
        <div class="p-4 space-y-4">
            <div class="bg-white rounded-lg shadow-sm border p-4">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-gray-800">個人行程表</h2>
                    <button id="add-schedule" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                        <span>新增行程</span>
                    </button>
                </div>
                
                <div class="space-y-3" id="schedule-list">
                    <!-- 行程列表將在這裡顯示 -->
                </div>
            </div>
        </div>`;
    
    loadPersonalSchedule();
    
    document.getElementById('add-schedule').addEventListener('click', showAddScheduleModal);
}

// 載入個人行程
function loadPersonalSchedule() {
    const scheduleList = document.getElementById('schedule-list');
    
    // 模擬個人行程數據
    const schedules = [
        { 
            id: 1, 
            title: '客戶會議', 
            date: new Date(), 
            time: '10:00', 
            location: '會議室A',
            description: '與ABC公司討論合作案'
        },
        { 
            id: 2, 
            title: '專案檢討', 
            date: new Date(Date.now() + 86400000), 
            time: '14:00', 
            location: '辦公室',
            description: '檢討本月專案進度'
        }
    ];
    
    scheduleList.innerHTML = '';
    
    if (schedules.length === 0) {
        scheduleList.innerHTML = '<p class="text-gray-500 text-center py-8">暫無行程安排</p>';
        return;
    }
    
    schedules.forEach(schedule => {
        const scheduleDiv = document.createElement('div');
        scheduleDiv.className = 'border border-gray-200 rounded-lg p-4 hover:bg-gray-50';
        scheduleDiv.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <h3 class="font-semibold text-gray-800">${schedule.title}</h3>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span><i data-lucide="calendar" class="w-4 h-4 inline mr-1"></i>${schedule.date.toLocaleDateString('zh-TW')}</span>
                        <span><i data-lucide="clock" class="w-4 h-4 inline mr-1"></i>${schedule.time}</span>
                        <span><i data-lucide="map-pin" class="w-4 h-4 inline mr-1"></i>${schedule.location}</span>
                    </div>
                    <p class="text-gray-600 mt-2">${schedule.description}</p>
                </div>
                <div class="flex space-x-2">
                    <button class="text-blue-600 hover:text-blue-800" onclick="editSchedule(${schedule.id})">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800" onclick="deleteSchedule(${schedule.id})">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
        scheduleList.appendChild(scheduleDiv);
    });
}

// 訊息通知子分頁
function renderCalendarNotifications(container) {
    container.innerHTML = `
        <div class="p-4 space-y-4">
            <div class="bg-white rounded-lg shadow-sm border p-4">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-gray-800">訊息通知</h2>
                    <button id="mark-all-read" class="text-blue-600 hover:text-blue-800 text-sm">
                        全部標記為已讀
                    </button>
                </div>
                
                <div class="space-y-3" id="notifications-list">
                    <!-- 通知列表將在這裡顯示 -->
                </div>
            </div>
        </div>`;
    
    loadNotifications();
    
    document.getElementById('mark-all-read').addEventListener('click', markAllNotificationsRead);
}

// 載入通知
function loadNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    
    // 模擬通知數據
    const notifications = [
        {
            id: 1,
            title: '會議提醒',
            message: '您有一個會議將在30分鐘後開始',
            time: new Date(Date.now() - 1800000),
            read: false,
            type: 'meeting'
        },
        {
            id: 2,
            title: '打卡提醒',
            message: '請記得完成今日的打卡',
            time: new Date(Date.now() - 3600000),
            read: true,
            type: 'clock-in'
        },
        {
            id: 3,
            title: '系統通知',
            message: '系統將於今晚進行維護',
            time: new Date(Date.now() - 7200000),
            read: false,
            type: 'system'
        }
    ];
    
    notificationsList.innerHTML = '';
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = '<p class="text-gray-500 text-center py-8">暫無通知</p>';
        return;
    }
    
    notifications.forEach(notification => {
        const notificationDiv = document.createElement('div');
        notificationDiv.className = `border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`;
        notificationDiv.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center space-x-2">
                        <h3 class="font-semibold text-gray-800">${notification.title}</h3>
                        ${!notification.read ? '<div class="w-2 h-2 bg-blue-600 rounded-full"></div>' : ''}
                    </div>
                    <p class="text-gray-600 mt-1">${notification.message}</p>
                    <span class="text-xs text-gray-500 mt-2">${formatTimeAgo(notification.time)}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full ${getNotificationColor(notification.type)}"></div>
                    <button class="text-gray-400 hover:text-gray-600" onclick="deleteNotification(${notification.id})">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
        
        notificationDiv.addEventListener('click', () => markNotificationRead(notification.id));
        notificationsList.appendChild(notificationDiv);
    });
}

// 輔助函數
function getEventColor(type) {
    const colors = {
        'meeting': 'bg-blue-500',
        'training': 'bg-green-500',
        'evaluation': 'bg-yellow-500',
        'default': 'bg-gray-500'
    };
    return colors[type] || colors.default;
}

function getNotificationColor(type) {
    const colors = {
        'meeting': 'bg-blue-500',
        'clock-in': 'bg-green-500',
        'system': 'bg-yellow-500',
        'default': 'bg-gray-500'
    };
    return colors[type] || colors.default;
}

function formatTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) {
        return `${minutes}分鐘前`;
    } else if (hours < 24) {
        return `${hours}小時前`;
    } else {
        return `${days}天前`;
    }
}

// 事件處理函數
function showAddScheduleModal() {
    // 實作新增行程的彈窗
    alert('新增行程功能將在後續版本中實作');
}

function editSchedule(id) {
    // 實作編輯行程功能
    alert(`編輯行程 ${id} 功能將在後續版本中實作`);
}

function deleteSchedule(id) {
    // 實作刪除行程功能
    if (confirm('確定要刪除此行程嗎？')) {
        alert(`刪除行程 ${id} 功能將在後續版本中實作`);
    }
}

function markNotificationRead(id) {
    // 實作標記通知為已讀功能
    console.log(`標記通知 ${id} 為已讀`);
}

function deleteNotification(id) {
    // 實作刪除通知功能
    if (confirm('確定要刪除此通知嗎？')) {
        console.log(`刪除通知 ${id}`);
    }
}

function markAllNotificationsRead() {
    // 實作全部標記為已讀功能
    if (confirm('確定要將所有通知標記為已讀嗎？')) {
        console.log('全部通知標記為已讀');
        loadNotifications(); // 重新載入通知列表
    }
}