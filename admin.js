function initSupabase() { if (typeof supabase !== "undefined" && !window.supabaseClient) { window.supabaseClient = supabase.createClient(supabaseConfig.url, supabaseConfig.key); } }
const AUTHORIZED_EMAIL = "abdallah.ali2812@gmail.com";
let currentData = {
    videos: [],
    audios: [],
    images: [],
    profile: {
        name: "Abdallah",
        bio: "Hi I 👋",
        avatar: "",
        visibility: "public",
        social: {
            discord: "",
            youtube: "",
            twitter: "",
            instagram: "",
            tiktok: "",
            github: ""
        }
    }
};

// تبديل الأقسام في لوحة التحكم
function switchSection(sectionId, element) {
    console.log("Switching to section:", sectionId);
    
    // إخفاء جميع الأقسام
    document.querySelectorAll('.admin-section').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    
    // إزالة النشاط من جميع عناصر القائمة
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    
    // إظهار القسم المطلوب
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
    }
    
    // تحديد العنصر النشط في القائمة
    if (element) {
        const menuItem = element.classList.contains('menu-item') ? element : element.closest('.menu-item');
        if (menuItem) menuItem.classList.add('active');
    }
    
    if(sectionId === 'preview-section') {
        updateLivePreview();
    }
}

function attemptLogin() {
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-msg');
    
    const email = emailInput.value.trim();
    const pass = passInput.value;

    if (!email || !pass) {
        errorMsg.innerText = "يرجى إدخال البريد الإلكتروني وكلمة المرور";
        errorMsg.style.display = "block";
        return;
    }

    if (email.toLowerCase() !== AUTHORIZED_EMAIL) {
        errorMsg.innerText = "هذا الإيميل غير مصرح له كمسؤول!";
        errorMsg.style.display = "block";
        return;
    }

    console.log("Attempting login for:", email);
    auth.signInWithEmailAndPassword(email, pass)
    .then((userCredential) => {
        console.log("Login successful:", userCredential.user.email);
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'flex';
        loadData(); 
        
        // إظهار القسم الافتراضي
        switchSection('video-section', document.querySelector('.menu-item.active'));
    })
    .catch((error) => {
        console.error("Login error:", error);
        errorMsg.innerText = "خطأ: " + (error.message || "الباسورد غلط أو الحساب غير مفعل.");
        errorMsg.style.display = "block";
    });
}

function loadData() {
    console.log("Attempting to load data from Firestore...");
    db.collection('siteData').doc('config').onSnapshot(doc => {
        if(doc.exists) {
            console.log("Data loaded successfully:", doc.data());
            currentData = doc.data();
            renderAdminPanel();
            updateLivePreview();
        } else {
            console.log("No config document found, creating default...");
            db.collection('siteData').doc('config').set(currentData)
                .then(() => console.log("Default config created"))
                .catch(err => console.error("Error creating default config:", err));
        }
    }, error => {
        console.error("Firestore Snapshot Error:", error);
        alert("خطأ في الاتصال بـ Firebase: " + error.message);
    });
}

function renderAdminPanel() {
    const profile = currentData.profile || {};
    document.getElementById('admin-name').value = profile.name || "";
    document.getElementById('admin-bio').value = profile.bio || "";
    document.getElementById('admin-avatar-url').value = profile.avatar || "";
    document.getElementById('profile-visibility').value = profile.visibility || "public";
    
    const social = profile.social || {};
    document.getElementById('social-discord').value = social.discord || "";
    document.getElementById('social-youtube').value = social.youtube || "";
    document.getElementById('social-twitter').value = social.twitter || "";
    document.getElementById('social-instagram').value = social.instagram || "";
    document.getElementById('social-tiktok').value = social.tiktok || "";
    document.getElementById('social-github').value = social.github || "";

    renderHistory('video-history', currentData.videos || [], 'videos');
    renderHistory('audio-history', currentData.audios || [], 'audios');
}

function renderHistory(containerId, list, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    if (list.length === 0) {
        container.innerHTML = '<p style="color:#666; text-align:center; padding:20px;">لا يوجد تاريخ مضاف</p>';
        return;
    }

    list.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <i class="${type === 'videos' ? 'fas fa-video' : 'fas fa-music'}"></i>
                <span title="${item.url}">${item.name || 'Unnamed'}</span>
            </div>
            <div style="display:flex; gap:5px;">
                <button onclick="replayMedia('${type}', ${index})" title="إعادة تشغيل" style="background:none; border:none; color:#00ff88; cursor:pointer;">
                    <i class="fas fa-play-circle"></i>
                </button>
                <button onclick="removeItem('${type}', ${index})" title="حذف" style="background:none; border:none; color:#ff4d4d; cursor:pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}

// ميزة إعادة تشغيل الوسائط القديمة (جعلها هي الحالية)
function replayMedia(type, index) {
    const list = [...(currentData[type] || [])];
    const item = list.splice(index, 1)[0];
    list.unshift(item); // نقلها للأمام لتكون هي المفعلة حالياً
    db.collection('siteData').doc('config').update({ [type]: list })
    .then(() => alert("✅ تم إعادة تفعيل الميديا المختارة!"));
}

// استعادة منطق الرفع المستقر باستخدام Supabase من نسخة يوم الاثنين
async function uploadMedia(type) {
    initSupabase();
    const fileInput = document.getElementById(`${type}-file`);
    const urlInput = document.getElementById(`${type}-url`);
    const statusMsg = document.getElementById(`${type}-status-msg`);
    const progressBar = document.getElementById(`${type}-progress-bar`);
    const progressDiv = document.getElementById(`${type}-progress-container`);
    
    let mediaUrl = urlInput ? urlInput.value.trim() : "";
    let mediaName = "ميديا من رابط";

    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        mediaName = file.name;
        if(statusMsg) statusMsg.innerText = "جاري الرفع إلى السيرفر...";
        if(progressDiv) progressDiv.style.display = 'block';
        if(progressBar) progressBar.value = 0;
        
        try {
            console.log(`Starting upload for ${type}:`, file.name);
            const fileName = `${type}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const bucketName = 'Abdallah';

            const { data, error } = await window.supabaseClient.storage
                .from(bucketName)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error("Supabase Upload Error:", error);
                throw error;
            }

            console.log("Supabase upload success:", data);
            const { data: urlData } = window.supabaseClient.storage.from(bucketName).getPublicUrl(fileName);
            mediaUrl = urlData.publicUrl;
            console.log("Public URL generated:", mediaUrl);
            
            if (type === 'avatar') {
                document.getElementById('admin-avatar-url').value = mediaUrl;
                const profile = {
                    ...currentData.profile,
                    name: document.getElementById('admin-name').value,
                    bio: document.getElementById('admin-bio').value,
                    avatar: mediaUrl,
                    visibility: document.getElementById('profile-visibility').value
                };
                await db.collection('siteData').doc('config').update({ profile });
                currentData.profile = profile;
            } else {
                await saveMedia(`${type}s`, { url: mediaUrl, name: mediaName, timestamp: Date.now() });
            }
            
            if(statusMsg) statusMsg.innerText = "✅ تم الرفع بنجاح!";
            if(progressDiv) progressDiv.style.display = 'none';
            fileInput.value = '';
        } catch (err) {
            if(statusMsg) statusMsg.innerText = "❌ خطأ في الرفع: " + err.message;
            console.error('Upload Error:', err);
        }
    } else if (mediaUrl) {
        if (type === 'avatar') {
            // تحديث قيمة الرابط في الكائن قبل الحفظ
            currentData.profile.avatar = mediaUrl;
            saveProfileData();
        } else {
            saveMedia(`${type}s`, { url: mediaUrl, name: mediaName, timestamp: Date.now() });
        }
        if(urlInput) urlInput.value = '';
    } else {
        alert("من فضلك أدخل رابطاً أو اختر ملفاً!");
    }
}

function uploadVideo() { uploadMedia('video'); }
function uploadAudio() { uploadMedia('audio'); }
function uploadAvatar() { uploadMedia('avatar'); }

async function saveMedia(type, item) {
    const list = currentData[type] || [];
    list.unshift(item);
    try {
        await db.collection('siteData').doc('config').update({ [type]: list });
        alert("✅ تم الحفظ بنجاح!");
    } catch (err) {
        console.error("Error saving media:", err);
        alert("❌ خطأ في الحفظ: " + err.message);
    }
}

function removeItem(type, index) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    const list = [...(currentData[type] || [])];
    list.splice(index, 1);
    db.collection('siteData').doc('config').update({ [type]: list });
}

function saveProfileData() {
    const avatarUrl = document.getElementById('admin-avatar-url').value;
    const profile = {
        ...currentData.profile,
        name: document.getElementById('admin-name').value,
        bio: document.getElementById('admin-bio').value,
        avatar: avatarUrl,
        visibility: document.getElementById('profile-visibility').value
    };
    db.collection('siteData').doc('config').update({ profile })
    .then(() => {
        currentData.profile = profile; // تحديث البيانات المحلية
        alert("✅ تم حفظ بيانات البروفايل!");
    });
}

function saveSocialLinks() {
    const social = {
        discord: document.getElementById('social-discord').value,
        youtube: document.getElementById('social-youtube').value,
        twitter: document.getElementById('social-twitter').value,
        instagram: document.getElementById('social-instagram').value,
        tiktok: document.getElementById('social-tiktok').value,
        github: document.getElementById('social-github').value
    };
    const profile = { ...currentData.profile, social };
    db.collection('siteData').doc('config').update({ profile })
    .then(() => alert("✅ تم حفظ الروابط الاجتماعية!"));
}

function updateLivePreview() {
    const previewFrame = document.getElementById('live-preview-frame');
    if (previewFrame) {
        previewFrame.src = 'index.html?preview=' + Date.now();
    }
}

function logout() {
    auth.signOut().then(() => location.reload());
}

function searchOnlineVideos() {
    const query = document.getElementById('video-search').value.toLowerCase();
    const results = document.getElementById('online-video-results');
    const library = [
        { name: "Nature Relax", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
        { name: "Abstract Motion", url: "https://vjs.zencdn.net/v/oceans.mp4" }
    ];
    const filtered = library.filter(v => v.name.toLowerCase().includes(query));
    results.innerHTML = filtered.map(v => `
        <div class="history-item">
            <span>${v.name}</span>
            <button onclick="document.getElementById('video-url').value='${v.url}'; alert('تم اختيار الفيديو من المكتبة')" class="admin-btn small" style="padding:2px 8px; font-size:12px;">اختيار</button>
        </div>
    `).join('') || '<p style="color:#666; text-align:center;">لا توجد نتائج</p>';
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('video-search')) searchOnlineVideos();
});
