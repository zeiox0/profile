const AUTHORIZED_EMAIL = "abdallah.ali2812@gmail.com";
let currentData = {
    videos: [], audios: [], images: [],
    profile: { name: "Abdallah", bio: "Hi I 👋", avatar: "", visibility: "public", social: {} }
};

// وظيفة لانتظار تهيئة سوبابيس مع محاولة إنشائه إذا لم يكن موجوداً
async function waitForSupabase() {
    let attempts = 0;
    while (attempts < 20) {
        // إذا كان الـ client موجوداً، نعود بنجاح
        if (window.supabaseClient) {
            return true;
        }
        
        // محاولة إنشاء الـ client إذا كانت المكتبة متاحة
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            try {
                window.supabaseClient = supabase.createClient(
                    "https://mtdevelmgoinumifpcpb.supabase.co",
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZGV2ZWxtZ29pbnVtaWZwY3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzM0MTMsImV4cCI6MjA4ODM0OTQxM30.xronBSbgZPVd79VDTEoLuB3XsCwQwGfB_uCW2hPIlMQ"
                );
                console.log("Supabase client created in waitForSupabase");
                return true;
            } catch(e) {
                console.error("Failed to create Supabase client:", e);
            }
        }
        
        console.log("Waiting for Supabase client... attempt", attempts + 1);
        await new Promise(resolve => setTimeout(resolve, 300));
        attempts++;
    }
    return false;
}

function switchSection(sectionId, element) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    element.classList.add('active');
    if(sectionId === 'preview-section') updateLivePreview();
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

    auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'flex';
        loadData(); 
    })
    .catch((error) => {
        errorMsg.innerText = "خطأ: " + (error.message || "الباسورد غلط.");
        errorMsg.style.display = "block";
    });
}

function loadData() {
    db.collection('siteData').doc('config').onSnapshot(doc => {
        if(doc.exists) {
            currentData = doc.data();
            renderAdminPanel();
            updateLivePreview();
        } else {
            db.collection('siteData').doc('config').set(currentData);
        }
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
    container.innerHTML = list && list.length > 0 ? list.map((item, index) => `
        <div class="history-item">
            <div style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                <i class="${type === 'videos' ? 'fas fa-video' : 'fas fa-music'}"></i>
                <span>${item.name || 'Unnamed'}</span>
            </div>
            <div style="display:flex; gap:5px;">
                <button onclick="replayMedia('${type}', ${index})" style="background:none; border:none; color:#00ff88; cursor:pointer;"><i class="fas fa-play-circle"></i></button>
                <button onclick="removeItem('${type}', ${index})" style="background:none; border:none; color:#ff4d4d; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('') : '<p style="color:#666; text-align:center; padding:20px;">لا يوجد تاريخ</p>';
}

function replayMedia(type, index) {
    const list = [...(currentData[type] || [])];
    const item = list.splice(index, 1)[0];
    list.unshift(item);
    db.collection('siteData').doc('config').update({ [type]: list }).then(() => alert("✅ تم التحديث!"));
}

function removeItem(type, index) {
    if (!confirm("حذف؟")) return;
    const list = [...(currentData[type] || [])];
    list.splice(index, 1);
    db.collection('siteData').doc('config').update({ [type]: list });
}

async function uploadMedia(type) {
    const fileInput = document.getElementById(`${type}-file`);
    const urlInput = document.getElementById(`${type}-url`);
    const statusMsg = document.getElementById(`${type}-status-msg`);
    const progressBar = document.getElementById(`${type}-progress-bar`);
    const progressDiv = document.getElementById(`${type}-progress-container`);
    
    let mediaUrl = urlInput ? urlInput.value.trim() : "";
    let mediaName = "ميديا من رابط";

    if (fileInput && fileInput.files.length > 0) {
        // رفع ملف - نحتاج Supabase
        if(statusMsg) { statusMsg.innerText = "جاري التحضير..."; statusMsg.style.color = "#aaa"; }
        
        const isSupabaseReady = await waitForSupabase();
        if (!isSupabaseReady) {
            if(statusMsg) { statusMsg.innerText = "❌ خطأ: فشل الاتصال بخادم الرفع. يرجى تحديث الصفحة والمحاولة مجدداً."; statusMsg.style.color = "#ff4d4d"; }
            return;
        }

        const file = fileInput.files[0];
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            if(statusMsg) { statusMsg.innerText = "❌ الحجم كبير جداً (أقصى حد 50MB)"; statusMsg.style.color = "#ff4d4d"; }
            return;
        }
        
        mediaName = file.name;
        if(statusMsg) { statusMsg.innerText = "جاري الرفع..."; statusMsg.style.color = "#aaa"; }
        if(progressDiv) progressDiv.style.display = 'block';
        if(progressBar) progressBar.value = 20;
        
        try {
            const fileName = `${type}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const { data, error } = await window.supabaseClient.storage
                .from('Abdallah')
                .upload(fileName, file, { cacheControl: '3600', upsert: true });

            if (error) throw error;

            if(progressBar) progressBar.value = 80;
            const { data: urlData } = window.supabaseClient.storage.from('Abdallah').getPublicUrl(fileName);
            mediaUrl = urlData.publicUrl;
            
            if(progressBar) progressBar.value = 100;
            if (type === 'avatar') {
                const profile = { ...currentData.profile, avatar: mediaUrl };
                await db.collection('siteData').doc('config').update({ profile });
            } else {
                await saveMedia(`${type}s`, { url: mediaUrl, name: mediaName, timestamp: Date.now() });
            }
            if(statusMsg) { statusMsg.innerText = "✅ نجح الرفع!"; statusMsg.style.color = "#00ff88"; }
            setTimeout(() => { 
                if(progressDiv) progressDiv.style.display = 'none';
                if(statusMsg) statusMsg.innerText = '';
            }, 3000);
            fileInput.value = '';
        } catch (err) {
            if(statusMsg) { statusMsg.innerText = "❌ خطأ في الرفع: " + err.message; statusMsg.style.color = "#ff4d4d"; }
            if(progressDiv) progressDiv.style.display = 'none';
            console.error("Upload error:", err);
        }
    } else if (mediaUrl) {
        // إضافة من رابط - لا تحتاج Supabase
        if (type === 'avatar') {
            const profile = { ...currentData.profile, avatar: mediaUrl };
            await db.collection('siteData').doc('config').update({ profile });
        } else {
            await saveMedia(`${type}s`, { url: mediaUrl, name: mediaName, timestamp: Date.now() });
        }
        if(urlInput) urlInput.value = '';
        if(statusMsg) { statusMsg.innerText = "✅ تم الإضافة!"; statusMsg.style.color = "#00ff88"; }
        setTimeout(() => { if(statusMsg) statusMsg.innerText = ''; }, 3000);
    } else {
        if(statusMsg) { statusMsg.innerText = "⚠️ يرجى اختيار ملف أو إدخال رابط"; statusMsg.style.color = "#ffaa00"; }
    }
}

async function saveMedia(type, item) {
    const list = currentData[type] || [];
    const exists = list.some(i => i.url === item.url);
    if (exists) list.splice(list.findIndex(i => i.url === item.url), 1);
    list.unshift(item);
    await db.collection('siteData').doc('config').update({ [type]: list });
}

function uploadVideo() { uploadMedia('video'); }
function uploadAudio() { uploadMedia('audio'); }
function uploadAvatar() { uploadMedia('avatar'); }

function saveProfileData() {
    const profile = {
        ...currentData.profile,
        name: document.getElementById('admin-name').value,
        bio: document.getElementById('admin-bio').value,
        avatar: document.getElementById('admin-avatar-url').value,
        visibility: document.getElementById('profile-visibility').value
    };
    db.collection('siteData').doc('config').update({ profile }).then(() => alert("✅ تم الحفظ!"));
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
    db.collection('siteData').doc('config').update({ profile }).then(() => alert("✅ تم الحفظ!"));
}

function updateLivePreview() {
    const frame = document.getElementById('live-preview-frame');
    if (frame) frame.src = 'index.html?t=' + Date.now();
}

function logout() { auth.signOut().then(() => location.reload()); }

// إضافة مستمع لحدث Enter في شاشة الدخول
document.addEventListener('DOMContentLoaded', () => {
    const passInput = document.getElementById('password');
    if (passInput) {
        passInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') attemptLogin();
        });
    }
});
