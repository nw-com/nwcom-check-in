// 儀錶板功能函數

/**
 * 計算工作時間
 * @param {string} status - 打卡狀態
 * @param {object} clockInTime - 上班打卡時間
 * @returns {string} 格式化的工作時間
 */
function calculateWorkingTime(status, clockInTime) {
    if (!clockInTime || status === '下班' || status === '未打卡') {
        return '';
    }
    
    const startTime = clockInTime.toDate ? clockInTime.toDate() : new Date(clockInTime);
    const now = new Date();
    const diffMs = now - startTime;
    
    // 如果時間差為負或無效，返回空字符串
    if (isNaN(diffMs) || diffMs < 0) {
        return '';
    }
    
    // 計算小時、分鐘和秒
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}小時${minutes}分鐘`;
}

/**
 * 獲取狀態顯示文本
 * @param {string} status - 打卡狀態
 * @param {string} location - 位置信息
 * @returns {string} 格式化的狀態文本
 */
function getStatusDisplayText(status, location) {
    switch(status) {
        case '上班': return '上班中-辦公室';
        case '下班': return '已下班';
        case '外出': return location ? `外出-${location}` : '外出中';
        case '抵達': return location ? `抵達-${location}` : '抵達';
        case '離開': return location ? `離開-${location}` : '離開';
        case '返回': return '返回-辦公室';
        case '臨時請假': return location ? `請假-${location}` : '請假中';
        case '特殊勤務': return location ? `出勤-${location}` : '出勤中';
        default: return '尚未打卡';
    }
}

/**
 * 獲取狀態顏色
 * @param {string} status - 打卡狀態
 * @returns {string} 對應的CSS顏色類
 */
function getStatusColor(status) {
    if (status.includes('上班中')) return 'text-green-600';
    if (status.includes('已下班')) return 'text-red-600';
    if (status.includes('外出-')) return 'text-emerald-700';
    if (status.includes('抵達-')) return 'text-blue-600';
    if (status.includes('離開-')) return 'text-amber-800';
    if (status.includes('返回-')) return 'text-pink-600';
    if (status.includes('請假中')) return 'text-orange-500';
    if (status.includes('出勤中')) return 'text-purple-600';
    return 'text-gray-500';
}

// 導出函數供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateWorkingTime,
        getStatusDisplayText,
        getStatusColor
    };
}