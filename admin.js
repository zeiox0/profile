let currentData = {
    videos: [], audios: [], images: [],
    profile: { name: "Abdallah", bio: "Hi I 👋", avatar: "", visibility: "public", social: {} },
    studioImages: [],
    customization: {
        primaryColor: "#00ff88",
        secondaryColor: "#ff4d4d",
        playerStyle: "modern",
        playerPosition: "bottom",
        enableAnimations: true,
        enableParticles: false,
        enableGlow: true,
        layout: "organic" // organic, rounded, card, vertical
    },
    customElements: [] // العناصر المخصصة (سحب وإفلات)
};

// وظيفة لانتظار تهيئة سوبابيس
async function waitForSupabase() {
    let attempts = 0;
    while (attempts < 20) {
        if (window.supabaseClient) return true;
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            try {
                window.supabaseClient = supabase.createClient(
                    "https://mtdevelmgoinumifpcpb.supabase.co",
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZGV2ZWxtZ29pbnVtaWZwY3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzM0MTMsImV4cCI6MjA4ODM0OTQxM30.xronBSbgZPVd79VDTEoLuB3XsCwQwGfB_uCW2hPIlMQ"
                );
                return true;
            } catch(e) { console.error(e); }
        }
        await new Promise(r => setTimeout(r, 300));
        attempts++;
    }
    return false;
}

// ========== نظام الإشعارات ==========
function showNotification(type, title, message, duration = 4000) {
    const container = document.getElementById('notifications-container');
    if (!container) return;
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    let icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    notification.innerHTML = `
        <div class="notification-icon"><i class="fas fa-${icon}"></i></div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;
    container.appendChild(notification);
    setTimeout(() => notification.remove(), duration);
}
const showSuccess = (t, m) => showNotification('success', t, m);
const showError = (t, m) => showNotification('error', t, m);

// ========== التنقل بين الأقسام (إصلاح الأزرار) ==========
function switchSection(sectionId, element) {
    console.log("Switching to section:", sectionId);
    // إخفاء جميع الأقسام
    document.querySelectorAll('.admin-section').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    // إزالة النشاط من جميع الأزرار
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    
    // إظهار القسم المطلوب
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        section.style.display = 'block';
    } else {
        console.error("Section not found:", sectionId);
    }
    
    // تفعيل الزر
    if (element) element.classList.add('active');
    
    if(sectionId === 'preview-section') updateLivePreview();
}

// ========== تحميل البيانات ==========
function loadData() {
    if (typeof db === 'undefined') {
        setTimeout(loadData, 500);
        return;
    }
    db.collection('siteData').doc('config').onSnapshot(doc => {
        if(doc.exists) {
            currentData = { ...currentData, ...doc.data() };
            renderAdminPanel();
        } else {
            db.collection('siteData').doc('config').set(currentData);
        }
    });
}

function renderAdminPanel() {
    const p = currentData.profile || {};
    if (document.getElementById('admin-name')) document.getElementById('admin-name').value = p.name || "";
    if (document.getElementById('admin-bio')) document.getElementById('admin-bio').value = p.bio || "";
    if (document.getElementById('admin-avatar-url')) document.getElementById('admin-avatar-url').value = p.avatar || "";
    
    // تحديث قيم التخصيص
    const c = currentData.customization || {};
    if (document.getElementById('primary-color')) document.getElementById('primary-color').value = c.primaryColor || "#00ff88";
    if (document.getElementById('layout-select')) document.getElementById('layout-select').value = c.layout || "organic";
    
    loadVideoHistory();
    loadAudioHistory();
    renderCustomElements();
}

// ========== نظام المظهر الجديد (Layout System) ==========
function updateLayout(type) {
    currentData.customization.layout = type;
    showSuccess("تم التحديث", `تم اختيار مظهر: ${type}`);
    saveCustomization();
}

function addCustomElement(type) {
    const id = "el_" + Date.now();
    const newEl = { id, type, content: "عنصر جديد", x: 50, y: 50 };
    currentData.customElements.push(newEl);
    renderCustomElements();
    saveCustomization();
}

function renderCustomElements() {
    const container = document.getElementById('custom-builder-area');
    if (!container) return;
    container.innerHTML = '';
    (currentData.customElements || []).forEach(el => {
        const div = document.createElement('div');
        div.className = 'draggable-element';
        div.style.left = el.x + 'px';
        div.style.top = el.y + 'px';
        div.innerHTML = `<span>${el.type}: ${el.content}</span><button onclick="removeElement('${el.id}')">×</button>`;
        container.appendChild(div);
    });
}

function saveCustomization() {
    db.collection('siteData').doc('config').update({ 
        customization: currentData.customization,
        customElements: currentData.customElements
    }).then(() => showSuccess("تم الحفظ", "تم حفظ التغييرات بنجاح"));
}

// تهيئة عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    // التأكد من إظهار أول قسم
    switchSection('video-section', document.querySelector('.menu-item'));
});

// دوال الرفع والحذف (مختصرة للضرورة)
async function uploadMedia(type) {
    const file = document.getElementById(`${type}-file`).files[0];
    if (!file) return showError("تنبيه", "اختر ملفاً أولاً");
    showSuccess("جاري الرفع", "يرجى الانتظار...");
    // منطق الرفع للسوبابيس...
}

function loadVideoHistory() { /* ... */ }
function loadAudioHistory() { /* ... */ }
function logout() { location.reload(); }
