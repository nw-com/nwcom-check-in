// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA5v8dLjY2s3j9qLQb7dKpW7mN6v8x9yZ0",
    authDomain: "nwcom-check-in.firebaseapp.com",
    projectId: "nwcom-check-in",
    storageBucket: "nwcom-check-in.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Global variables
let currentUser = null;
let currentLocation = null;
let stream = null;
let map = null;
let marker = null;
let currentCheckInTab = 'morning';
let currentSettingsTab = 'profile';
let accounts = [];
let currentEditingAccount = null;

// DOM elements
const loginView = document.getElementById('login-view');
const mainView = document.getElementById('main-view');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userPhoto = document.getElementById('user-photo');
const profilePhoto = document.getElementById('profile-photo');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profilePosition = document.getElementById('profile-position');
const profileDepartment = document.getElementById('profile-department');
const profileEditBtn = document.getElementById('profile-edit-btn');
const profileSaveBtn = document.getElementById('profile-save-btn');
const profileCancelBtn = document.getElementById('profile-cancel-btn');
const profileEditForm = document.getElementById('profile-edit-form');
const profileDisplay = document.getElementById('profile-display');

// Check-in elements
const checkInTabs = document.querySelectorAll('#check-in-tabs button');
const morningCheckIn = document.getElementById('morning-check-in');
const afternoonCheckIn = document.getElementById('afternoon-check-in');
const checkInBtn = document.getElementById('check-in-btn');
const checkInLocation = document.getElementById('check-in-location');
const checkInTime = document.getElementById('check-in-time');
const checkInStatus = document.getElementById('check-in-status');
const checkInHistoryBtn = document.getElementById('check-in-history-btn');

// Navigation elements
const navItems = document.querySelectorAll('#bottom-nav button');
const dashboardBtn = document.getElementById('nav-dashboard');
const checkInBtnNav = document.getElementById('nav-checkin');
const settingsBtn = document.getElementById('nav-settings');

// Page elements
const dashboardPage = document.getElementById('dashboard-page');
const checkInPage = document.getElementById('check-in-page');
const settingsPage = document.getElementById('settings-page');
const checkInHistoryPage = document.getElementById('check-in-history-page');

// Settings elements
const settingsTabs = document.querySelectorAll('#settings-tabs button');
const profileTab = document.getElementById('settings-profile-tab');
const accountTab = document.getElementById('settings-account-tab');
const profileContent = document.getElementById('profile-content');
const accountContent = document.getElementById('account-content');
const addAccountBtn = document.getElementById('add-account-btn');
const accountsList = document.getElementById('accounts-list');

// Modal elements
const cameraModal = document.getElementById('camera-modal');
const addAccountModal = document.getElementById('add-account-modal');
const mapModal = document.getElementById('map-modal');
const profileCameraModal = document.getElementById('profile-camera-modal');
const editAccountModal = document.getElementById('edit-account-modal');
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const profileModal = document.getElementById('profile-modal');

// Camera elements
const cameraVideo = document.getElementById('camera-video');
const cameraCanvas = document.getElementById('camera-canvas');
const cameraCaptureBtn = document.getElementById('camera-capture-btn');
const cameraCloseBtn = document.getElementById('camera-close-btn');
const profileCameraVideo = document.getElementById('profile-camera-video');
const profileCameraCanvas = document.getElementById('profile-camera-canvas');
const profileCameraCaptureBtn = document.getElementById('profile-camera-capture-btn');
const profileCameraCloseBtn = document.getElementById('profile-camera-close-btn');

// Map elements
const mapContainer = document.getElementById('map-container');
const mapCloseBtn = document.getElementById('map-close-btn');

// Profile photo elements
const profilePhotoUpload = document.getElementById('profile-photo-upload');
const profilePhotoBtn = document.getElementById('profile-photo-btn');
const profilePhotoCameraBtn = document.getElementById('profile-photo-camera-btn');

// Account form elements
const accountForm = document.getElementById('account-form');
const accountNameInput = document.getElementById('account-name');
const accountEmailInput = document.getElementById('account-email');
const accountPositionInput = document.getElementById('account-position');
const accountDepartmentInput = document.getElementById('account-department');
const accountRoleSelect = document.getElementById('account-role');
const accountStatusSelect = document.getElementById('account-status');
const saveAccountBtn = document.getElementById('save-account-btn');
const cancelAccountBtn = document.getElementById('cancel-account-btn');

// Edit account elements
const editAccountForm = document.getElementById('edit-account-form');
const editAccountNameInput = document.getElementById('edit-account-name');
const editAccountEmailInput = document.getElementById('edit-account-email');
const editAccountPositionInput = document.getElementById('edit-account-position');
const editAccountDepartmentInput = document.getElementById('edit-account-department');
const editAccountRoleSelect = document.getElementById('edit-account-role');
const editAccountStatusSelect = document.getElementById('edit-account-status');
const updateAccountBtn = document.getElementById('update-account-btn');
const cancelEditAccountBtn = document.getElementById('cancel-edit-account-btn');

// Delete confirmation elements
const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
const deleteCancelBtn = document.getElementById('delete-cancel-btn');

// Photo viewer elements
const photoViewer = document.getElementById('photo-viewer');
const photoViewerImg = document.getElementById('photo-viewer-img');
const photoViewerClose = document.getElementById('photo-viewer-close');

// Check-in history elements
const checkInHistoryList = document.getElementById('check-in-history-list');
const backToCheckInBtn = document.getElementById('back-to-checkin-btn');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
    setupEventListeners();
    loadAccounts();
});

// Check authentication state
function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            showMainView();
            loadUserData();
        } else {
            showLoginView();
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    dashboardBtn.addEventListener('click', () => showPage('dashboard'));
    checkInBtnNav.addEventListener('click', () => showPage('checkin'));
    settingsBtn.addEventListener('click', () => showPage('settings'));
    checkInHistoryBtn.addEventListener('click', () => showPage('checkin-history'));
    backToCheckInBtn.addEventListener('click', () => showPage('checkin'));
    
    // Check-in tabs
    checkInTabs.forEach(tab => {
        tab.addEventListener('click', () => switchCheckInTab(tab.dataset.tab));
    });
    
    // Settings tabs
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => switchSettingsTab(tab.dataset.tab));
    });
    
    // Check-in
    checkInBtn.addEventListener('click', handleCheckIn);
    
    // Profile
    profileEditBtn.addEventListener('click', showProfileEdit);
    profileSaveBtn.addEventListener('click', saveProfile);
    profileCancelBtn.addEventListener('click', hideProfileEdit);
    
    // Photo upload
    profilePhotoUpload.addEventListener('change', handlePhotoUpload);
    profilePhotoBtn.addEventListener('click', () => profilePhotoUpload.click());
    profilePhotoCameraBtn.addEventListener('click', openProfileCamera);
    
    // Camera
    cameraCaptureBtn.addEventListener('click', capturePhoto);
    cameraCloseBtn.addEventListener('click', closeCamera);
    profileCameraCaptureBtn.addEventListener('click', captureProfilePhoto);
    profileCameraCloseBtn.addEventListener('click', closeProfileCamera);
    
    // Map
    checkInLocation.addEventListener('click', openMap);
    mapCloseBtn.addEventListener('click', closeMap);
    
    // Account management
    addAccountBtn.addEventListener('click', openAddAccountModal);
    saveAccountBtn.addEventListener('click', saveAccount);
    cancelAccountBtn.addEventListener('click', closeAddAccountModal);
    updateAccountBtn.addEventListener('click', updateAccount);
    cancelEditAccountBtn.addEventListener('click', closeEditAccountModal);
    deleteConfirmBtn.addEventListener('click', confirmDeleteAccount);
    deleteCancelBtn.addEventListener('click', closeDeleteConfirmModal);
    
    // Photo viewer
    photoViewerClose.addEventListener('click', closePhotoViewer);
    
    // Easter egg
    document.getElementById('login-logo').addEventListener('click', function() {
        if (event.detail === 3) { // Triple click
            alert('🎉 彩蛋觸發！歡迎使用 NWCOM 打卡系統！');
        }
    });
}

// Authentication functions
function handleLogin(e) {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    
    loginBtn.innerHTML = '<div class="spinner"></div> 登入中...';
    loginBtn.disabled = true;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            loginError.classList.add('hidden');
        })
        .catch((error) => {
            loginError.textContent = '登入失敗：' + error.message;
            loginError.classList.remove('hidden');
            loginBtn.innerHTML = '登入';
            loginBtn.disabled = false;
        });
}

function handleLogout() {
    auth.signOut().then(() => {
        currentUser = null;
        showLoginView();
    });
}

// UI functions
function showLoginView() {
    loginView.classList.remove('hidden');
    mainView.classList.add('hidden');
    loginBtn.innerHTML = '登入';
    loginBtn.disabled = false;
    loginForm.reset();
}

function showMainView() {
    loginView.classList.add('hidden');
    mainView.classList.remove('hidden');
    showPage('dashboard');
}

function showPage(page) {
    // Hide all pages
    dashboardPage.classList.add('hidden');
    checkInPage.classList.add('hidden');
    settingsPage.classList.add('hidden');
    checkInHistoryPage.classList.add('hidden');
    
    // Show selected page
    switch(page) {
        case 'dashboard':
            dashboardPage.classList.remove('hidden');
            setActiveNav(dashboardBtn);
            break;
        case 'checkin':
            checkInPage.classList.remove('hidden');
            setActiveNav(checkInBtnNav);
            updateCheckInTime();
            break;
        case 'settings':
            settingsPage.classList.remove('hidden');
            setActiveNav(settingsBtn);
            break;
        case 'checkin-history':
            checkInHistoryPage.classList.remove('hidden');
            loadCheckInHistory();
            break;
    }
}

function setActiveNav(button) {
    navItems.forEach(item => {
        item.classList.remove('text-blue-600', 'border-blue-600');
        item.classList.add('text-gray-500');
    });
    button.classList.remove('text-gray-500');
    button.classList.add('text-blue-600', 'border-blue-600');
}

// Check-in functions
function switchCheckInTab(tab) {
    currentCheckInTab = tab;
    checkInTabs.forEach(t => {
        t.classList.remove('border-blue-500', 'text-blue-600');
        t.classList.add('border-transparent', 'text-gray-500');
    });
    
    const activeTab = document.querySelector(`[data-tab="${tab}"]`);
    activeTab.classList.remove('border-transparent', 'text-gray-500');
    activeTab.classList.add('border-blue-500', 'text-blue-600');
    
    if (tab === 'morning') {
        morningCheckIn.classList.remove('hidden');
        afternoonCheckIn.classList.add('hidden');
    } else {
        morningCheckIn.classList.add('hidden');
        afternoonCheckIn.classList.remove('hidden');
    }
}

function updateCheckInTime() {
    const now = new Date();
    const timeString = now.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    checkInTime.textContent = timeString;
}

function handleCheckIn() {
    if (!currentLocation) {
        alert('請先獲取位置資訊');
        return;
    }
    
    checkInBtn.innerHTML = '<div class="spinner-gray"></div> 打卡中...';
    checkInBtn.disabled = true;
    
    // Simulate check-in process
    setTimeout(() => {
        const checkInData = {
            userId: currentUser.uid,
            type: currentCheckInTab,
            location: currentLocation,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'success'
        };
        
        db.collection('checkins').add(checkInData)
            .then(() => {
                checkInStatus.textContent = '打卡成功！';
                checkInStatus.className = 'text-green-600 font-medium';
                checkInBtn.innerHTML = '✓ 已打卡';
                checkInBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                checkInBtn.classList.add('bg-green-600');
                
                setTimeout(() => {
                    checkInBtn.innerHTML = '立即打卡';
                    checkInBtn.disabled = false;
                    checkInBtn.classList.remove('bg-green-600');
                    checkInBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
                }, 3000);
            })
            .catch((error) => {
                checkInStatus.textContent = '打卡失敗：' + error.message;
                checkInStatus.className = 'text-red-600 font-medium';
                checkInBtn.innerHTML = '立即打卡';
                checkInBtn.disabled = false;
            });
    }, 2000);
}

// Settings functions
function switchSettingsTab(tab) {
    currentSettingsTab = tab;
    settingsTabs.forEach(t => {
        t.classList.remove('border-blue-500', 'text-blue-600');
        t.classList.add('border-transparent', 'text-gray-500');
    });
    
    const activeTab = document.querySelector(`[data-settings-tab="${tab}"]`);
    activeTab.classList.remove('border-transparent', 'text-gray-500');
    activeTab.classList.add('border-blue-500', 'text-blue-600');
    
    if (tab === 'profile') {
        profileContent.classList.remove('hidden');
        accountContent.classList.add('hidden');
    } else {
        profileContent.classList.add('hidden');
        accountContent.classList.remove('hidden');
    }
}

// Profile functions
function loadUserData() {
    if (!currentUser) return;
    
    db.collection('users').doc(currentUser.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                userName.textContent = userData.name || currentUser.displayName || '使用者';
                userEmail.textContent = currentUser.email;
                profileName.textContent = userData.name || currentUser.displayName || '使用者';
                profileEmail.textContent = currentUser.email;
                profilePosition.textContent = userData.position || '未設定';
                profileDepartment.textContent = userData.department || '未設定';
                
                if (userData.photoURL || currentUser.photoURL) {
                    const photoURL = userData.photoURL || currentUser.photoURL;
                    userPhoto.src = photoURL;
                    profilePhoto.src = photoURL;
                }
            }
        });
}

function showProfileEdit() {
    profileDisplay.classList.add('hidden');
    profileEditForm.classList.remove('hidden');
    
    document.getElementById('edit-name').value = profileName.textContent;
    document.getElementById('edit-position').value = profilePosition.textContent === '未設定' ? '' : profilePosition.textContent;
    document.getElementById('edit-department').value = profileDepartment.textContent === '未設定' ? '' : profileDepartment.textContent;
}

function hideProfileEdit() {
    profileDisplay.classList.remove('hidden');
    profileEditForm.classList.add('hidden');
}

function saveProfile() {
    const name = document.getElementById('edit-name').value;
    const position = document.getElementById('edit-position').value;
    const department = document.getElementById('edit-department').value;
    
    db.collection('users').doc(currentUser.uid).update({
        name: name,
        position: position,
        department: department,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        profileName.textContent = name;
        profilePosition.textContent = position || '未設定';
        profileDepartment.textContent = department || '未設定';
        userName.textContent = name;
        hideProfileEdit();
    }).catch((error) => {
        alert('更新失敗：' + error.message);
    });
}

// Photo functions
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const storageRef = storage.ref(`profile-photos/${currentUser.uid}`);
    const uploadTask = storageRef.put(file);
    
    uploadTask.on('state_changed',
        (snapshot) => {
            // Progress
        },
        (error) => {
            alert('上傳失敗：' + error.message);
        },
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                db.collection('users').doc(currentUser.uid).update({
                    photoURL: downloadURL
                }).then(() => {
                    userPhoto.src = downloadURL;
                    profilePhoto.src = downloadURL;
                });
            });
        }
    );
}

// Camera functions
function openCamera() {
    cameraModal.classList.remove('hidden');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream) => {
            stream = mediaStream;
            cameraVideo.srcObject = mediaStream;
        })
        .catch((error) => {
            alert('無法開啟相機：' + error.message);
            closeCamera();
        });
}

function closeCamera() {
    cameraModal.classList.add('hidden');
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

function capturePhoto() {
    const canvas = cameraCanvas;
    const video = cameraVideo;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
        const storageRef = storage.ref(`checkin-photos/${currentUser.uid}/${Date.now()}.jpg`);
        const uploadTask = storageRef.put(blob);
        
        uploadTask.on('state_changed',
            (snapshot) => {
                // Progress
            },
            (error) => {
                alert('上傳失敗：' + error.message);
            },
            () => {
                alert('照片上傳成功！');
                closeCamera();
            }
        );
    }, 'image/jpeg');
}

function openProfileCamera() {
    profileCameraModal.classList.remove('hidden');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream) => {
            stream = mediaStream;
            profileCameraVideo.srcObject = mediaStream;
        })
        .catch((error) => {
            alert('無法開啟相機：' + error.message);
            closeProfileCamera();
        });
}

function closeProfileCamera() {
    profileCameraModal.classList.add('hidden');
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

function captureProfilePhoto() {
    const canvas = profileCameraCanvas;
    const video = profileCameraVideo;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
        const storageRef = storage.ref(`profile-photos/${currentUser.uid}`);
        const uploadTask = storageRef.put(blob);
        
        uploadTask.on('state_changed',
            (snapshot) => {
                // Progress
            },
            (error) => {
                alert('上傳失敗：' + error.message);
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    db.collection('users').doc(currentUser.uid).update({
                        photoURL: downloadURL
                    }).then(() => {
                        userPhoto.src = downloadURL;
                        profilePhoto.src = downloadURL;
                        closeProfileCamera();
                    });
                });
            }
        );
    }, 'image/jpeg');
}

// Location functions
function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert('您的瀏覽器不支援地理位置功能');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
            };
            checkInLocation.textContent = `位置已獲取 (精度: ${Math.round(currentLocation.accuracy)}m)`;
            checkInLocation.classList.remove('text-gray-500');
            checkInLocation.classList.add('text-green-600');
        },
        (error) => {
            checkInLocation.textContent = '無法獲取位置資訊';
            checkInLocation.classList.remove('text-gray-500');
            checkInLocation.classList.add('text-red-600');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

function openMap() {
    mapModal.classList.remove('hidden');
    
    if (!map) {
        map = L.map('map-container').setView([25.0330, 121.5654], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }
    
    if (currentLocation) {
        if (marker) {
            marker.setLatLng([currentLocation.lat, currentLocation.lng]);
        } else {
            marker = L.marker([currentLocation.lat, currentLocation.lng]).addTo(map);
        }
        map.setView([currentLocation.lat, currentLocation.lng], 15);
    }
}

function closeMap() {
    mapModal.classList.add('hidden');
}

// Account management functions
function loadAccounts() {
    db.collection('users').get()
        .then((querySnapshot) => {
            accounts = [];
            accountsList.innerHTML = '';
            
            querySnapshot.forEach((doc) => {
                const account = { id: doc.id, ...doc.data() };
                accounts.push(account);
                renderAccount(account);
            });
        });
}

function renderAccount(account) {
    const accountItem = document.createElement('div');
    accountItem.className = 'flex items-center justify-between p-4 bg-white rounded-lg border';
    accountItem.innerHTML = `
        <div class="flex items-center space-x-3">
            <img src="${account.photoURL || 'https://via.placeholder.com/40'}" alt="頭像" class="w-10 h-10 rounded-full">
            <div>
                <p class="font-medium text-gray-900">${account.name}</p>
                <p class="text-sm text-gray-500">${account.email}</p>
            </div>
        </div>
        <div class="flex items-center space-x-2">
            <span class="px-2 py-1 text-xs rounded-full ${account.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}">
                ${account.role === 'admin' ? '管理員' : '使用者'}
            </span>
            <span class="px-2 py-1 text-xs rounded-full ${account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                ${account.status === 'active' ? '啟用' : '停用'}
            </span>
            <button onclick="editAccount('${account.id}')" class="text-blue-600 hover:text-blue-800">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
            </button>
            <button onclick="deleteAccount('${account.id}')" class="text-red-600 hover:text-red-800">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>
        </div>
    `;
    accountsList.appendChild(accountItem);
}

function openAddAccountModal() {
    addAccountModal.classList.remove('hidden');
    accountForm.reset();
}

function closeAddAccountModal() {
    addAccountModal.classList.add('hidden');
}

function saveAccount() {
    const accountData = {
        name: accountNameInput.value,
        email: accountEmailInput.value,
        position: accountPositionInput.value,
        department: accountDepartmentInput.value,
        role: accountRoleSelect.value,
        status: accountStatusSelect.value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Create user account
    auth.createUserWithEmailAndPassword(accountEmailInput.value, 'defaultPassword123')
        .then((userCredential) => {
            return db.collection('users').doc(userCredential.user.uid).set(accountData);
        })
        .then(() => {
            closeAddAccountModal();
            loadAccounts();
        })
        .catch((error) => {
            alert('建立帳號失敗：' + error.message);
        });
}

function editAccount(id) {
    const account = accounts.find(a => a.id === id);
    if (!account) return;
    
    currentEditingAccount = account;
    editAccountNameInput.value = account.name;
    editAccountEmailInput.value = account.email;
    editAccountPositionInput.value = account.position || '';
    editAccountDepartmentInput.value = account.department || '';
    editAccountRoleSelect.value = account.role || 'user';
    editAccountStatusSelect.value = account.status || 'active';
    
    editAccountModal.classList.remove('hidden');
}

function closeEditAccountModal() {
    editAccountModal.classList.add('hidden');
    currentEditingAccount = null;
}

function updateAccount() {
    if (!currentEditingAccount) return;
    
    const accountData = {
        name: editAccountNameInput.value,
        position: editAccountPositionInput.value,
        department: editAccountDepartmentInput.value,
        role: editAccountRoleSelect.value,
        status: editAccountStatusSelect.value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('users').doc(currentEditingAccount.id).update(accountData)
        .then(() => {
            closeEditAccountModal();
            loadAccounts();
        })
        .catch((error) => {
            alert('更新失敗：' + error.message);
        });
}

function deleteAccount(id) {
    currentEditingAccount = accounts.find(a => a.id === id);
    if (!currentEditingAccount) return;
    
    deleteConfirmModal.classList.remove('hidden');
}

function closeDeleteConfirmModal() {
    deleteConfirmModal.classList.add('hidden');
    currentEditingAccount = null;
}

function confirmDeleteAccount() {
    if (!currentEditingAccount) return;
    
    db.collection('users').doc(currentEditingAccount.id).delete()
        .then(() => {
            closeDeleteConfirmModal();
            loadAccounts();
        })
        .catch((error) => {
            alert('刪除失敗：' + error.message);
        });
}

// Check-in history functions
function loadCheckInHistory() {
    db.collection('checkins')
        .where('userId', '==', currentUser.uid)
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get()
        .then((querySnapshot) => {
            checkInHistoryList.innerHTML = '';
            
            if (querySnapshot.empty) {
                checkInHistoryList.innerHTML = '<p class="text-gray-500 text-center py-8">尚無打卡紀錄</p>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const checkIn = doc.data();
                renderCheckInHistory(checkIn);
            });
        });
}

function renderCheckInHistory(checkIn) {
    const historyItem = document.createElement('div');
    historyItem.className = 'flex items-center justify-between p-4 bg-white rounded-lg border';
    
    const date = checkIn.timestamp ? new Date(checkIn.timestamp.toDate()) : new Date();
    const dateString = date.toLocaleString('zh-TW', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    historyItem.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <div>
                <p class="font-medium text-gray-900">${checkIn.type === 'morning' ? '上班打卡' : '下班打卡'}</p>
                <p class="text-sm text-gray-500">${dateString}</p>
            </div>
        </div>
        <div class="text-right">
            <p class="text-sm font-medium text-green-600">成功</p>
            <p class="text-xs text-gray-500">精度: ${Math.round(checkIn.location.accuracy)}m</p>
        </div>
    `;
    
    checkInHistoryList.appendChild(historyItem);
}

// Photo viewer functions
function openPhotoViewer(src) {
    photoViewerImg.src = src;
    photoViewer.classList.remove('hidden');
}

function closePhotoViewer() {
    photoViewer.classList.add('hidden');
}

// Force geolocation
function forceGeolocation() {
    getCurrentLocation();
    alert('正在強制獲取位置資訊...');
}

// Initialize location on page load
setTimeout(() => {
    getCurrentLocation();
}, 1000);

// Update time every second
setInterval(updateCheckInTime, 1000);