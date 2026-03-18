// ========== متغيرات الحماية والجلسة ==========
let isLoggedIn = false;

// التحقق من الجلسة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    initializeAdmin();
});

// دالة التحقق من الجلسة
function checkSession() {
    const loginOverlay = document.getElementById('login-overlay');
    const adminPanel = document.getElementById('admin-panel');
    
    // إذا كانت هناك جلسة نشطة
    if (sessionStorage.getItem('admin-logged-in') === 'true') {
        isLoggedIn = true;
        if (loginOverlay) loginOverlay.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'flex';
        loadData();
    } else {
        isLoggedIn = false;
        if (loginOverlay) loginOverlay.style.display = 'flex';
        if (adminPanel) adminPanel.style.display = 'none';
    }
}

// دالة تهيئة لوحة التحكم
function initializeAdmin() {
    // تعيين أحداث القائمة الجانبية
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            switchSection(sectionId, this);
        });
    });
}

// ========== بيانات التطبيق ==========
const appData = {
    videos: [],
    audios: [],
    images: [],
    profile: {
        name: "Abdallah",
        bio: "Hi I 👋",
        avatar: "",
        visibility: "public",
        social: {}
    },
    studioImages: [],
    customization: {
        primaryColor: "#00ff88",
        secondaryColor: "#ff4d4d",
        playerStyle: "modern",
        playerPosition: "bottom",
        enableAnimations: true,
        enableParticles: false,
        enableGlow: true,
        layout: "organic"
    },
    customElements: []
};

// ========== نظام الإشعارات ==========
function showNotification(type, title, message, duration = 4000) {
    const container = document.getElementById('notifications-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    let icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    
    notification.innerHTML = `
        <div><i class="fas fa-${icon}"></i></div>
        <div>
            <strong>${title}</strong><br>
            ${message}
        </div>
    `;
    
    container.appendChild(notification);
    setTimeout(() => notification.remove(), duration);
}

function showSuccess(title, message) {
    showNotification('success', title, message);
}

function showError(title, message) {
    showNotification('error', title, message);
}

// ========== التنقل بين الأقسام ==========
function switchSection(sectionId, menuItem) {
    // التحقق من تسجيل الدخول
    if (!isLoggedIn) {
        showError('❌ خطأ', 'يجب تسجيل الدخول أولاً');
        return;
    }
    
    // إخفاء جميع الأقسام
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // إظهار القسم المطلوب
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // تحديث القائمة النشطة
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    if (menuItem) menuItem.classList.add('active');
}

// ========== إدارة الفيديوهات ==========
function uploadMedia(type) {
    const fileInput = document.getElementById(`${type}-file`);
    if (!fileInput || !fileInput.files[0]) {
        showError('❌ خطأ', 'اختر ملف أولاً');
        return;
    }
    
    const file = fileInput.files[0];
    const fileName = file.name;
    
    // محاكاة الرفع (يمكن ربطها بـ Firebase أو Supabase)
    appData[type === 'video' ? 'videos' : type === 'audio' ? 'audios' : 'images'].push({
        name: fileName,
        size: file.size,
        uploadedAt: new Date().toLocaleString('ar-SA')
    });
    
    showSuccess('✅ نجح', `تم رفع ${type} بنجاح`);
    fileInput.value = '';
    saveData();
}

// ========== نظام المظهر الجديد ==========
function updateLayout(layoutType) {
    appData.customization.layout = layoutType;
    
    // تحديث الواجهة
    const layoutCards = document.querySelectorAll('.layout-card');
    layoutCards.forEach(card => card.classList.remove('active'));
    event.target.closest('.layout-card').classList.add('active');
    
    showSuccess('✅ تم التحديث', `تم تطبيق مظهر: ${layoutType}`);
    saveData();
}

// ========== أداة البناء المخصص (سحب وإفلات) ==========
function addCustomElement(type) {
    const builderArea = document.getElementById('custom-builder-area');
    if (!builderArea) return;
    
    const element = document.createElement('div');
    element.className = 'draggable-element';
    
    if (type === 'text') {
        element.textContent = 'نص جديد';
        element.style.background = '#00ff88';
    } else if (type === 'box') {
        element.textContent = '';
        element.style.width = '100px';
        element.style.height = '100px';
        element.style.background = '#ff4d4d';
    } else if (type === 'image') {
        element.innerHTML = '<i class="fas fa-image"></i>';
        element.style.width = '100px';
        element.style.height = '100px';
        element.style.background = '#0066ff';
    }
    
    // جعل العنصر قابل للسحب
    makeElementDraggable(element);
    builderArea.appendChild(element);
    
    appData.customElements.push({
        type: type,
        content: element.textContent,
        style: element.getAttribute('style')
    });
}

function makeElementDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// ========== حفظ التصميم المخصص ==========
function saveCustomization() {
    if (!isLoggedIn) {
        showError('❌ خطأ', 'يجب تسجيل الدخول أولاً');
        return;
    }
    
    showSuccess('✅ تم الحفظ', 'تم حفظ التصميم المخصص بنجاح');
    saveData();
}

// ========== إدارة البروفايل ==========
function saveProfileData() {
    if (!isLoggedIn) {
        showError('❌ خطأ', 'يجب تسجيل الدخول أولاً');
        return;
    }
    
    const nameInput = document.getElementById('admin-name');
    const bioInput = document.getElementById('admin-bio');
    
    if (nameInput) appData.profile.name = nameInput.value;
    if (bioInput) appData.profile.bio = bioInput.value;
    
    showSuccess('✅ تم الحفظ', 'تم حفظ بيانات البروفايل بنجاح');
    saveData();
}

// ========== حفظ البيانات ==========
function saveData() {
    if (isLoggedIn) {
        localStorage.setItem('admin-data', JSON.stringify(appData));
        sessionStorage.setItem('admin-logged-in', 'true');
    }
}

// ========== تحميل البيانات ==========
function loadData() {
    const savedData = localStorage.getItem('admin-data');
    if (savedData) {
        Object.assign(appData, JSON.parse(savedData));
    }
    
    // تحديث الواجهة
    const nameInput = document.getElementById('admin-name');
    const bioInput = document.getElementById('admin-bio');
    if (nameInput) nameInput.value = appData.profile.name;
    if (bioInput) bioInput.value = appData.profile.bio;
}

// ========== تسجيل الخروج ==========
function logout() {
    isLoggedIn = false;
    sessionStorage.removeItem('admin-logged-in');
    localStorage.removeItem('admin-data');
    
    const loginOverlay = document.getElementById('login-overlay');
    const adminPanel = document.getElementById('admin-panel');
    
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (adminPanel) adminPanel.style.display = 'none';
    
    // مسح الحقول
    const fields = ['email', 'password', 'captcha-answer'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    const errorMsg = document.getElementById('error-msg');
    if (errorMsg) errorMsg.style.display = 'none';
    
    if (typeof generateCaptcha === 'function') {
        generateCaptcha();
    }
    
    showSuccess('👋 وداعاً', 'تم تسجيل الخروج بنجاح');
}

// ========== تحديث حالة تسجيل الدخول من login-system.js ==========
function setLoginState(state) {
    isLoggedIn = state;
    if (state) {
        sessionStorage.setItem('admin-logged-in', 'true');
        loadData();
    }
}
