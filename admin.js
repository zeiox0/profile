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
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    
    document.getElementById(sectionId).classList.add('active');
    element.classList.add('active');
    
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
    
    if (!list || list.length === 0) {
        container.innerHTML = '<p style="color:#666; text-align:center; padding:20px;">لا يوجد تاريخ مضاف</p>';
        return;
    }

    list.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; flex:1; overflow:hidden;">
                <i class="${type === 'videos' ? 'fas fa-video' : 'fas fa-music'}"></i>
                <span title="${item.url}" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name || 'Unnamed'}</span>
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

function replayMedia(type, index) {
    const list = [...(currentData[type] || [])];
    const item = list.splice(index, 1)[0];
    list.unshift(item);
    db.collection('siteData').doc('config').update({ [type]: list })
    .then(() => alert("✅ تم إعادة تفعيل الميديا المختارة!"));
}

// دالة للتحقق من نوع الملف
function isValidVideoFile(file) {
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
    const validExtensions = ['.mp4', '.webm', '.ogv', '.mov', '.avi', '.mkv', '.flv', '.wmv'];
    
    // التحقق من نوع MIME
    if (validVideoTypes.includes(file.type)) {
        return true;
    }
    
    // التحقق من الامتداد إذا لم يكن نوع MIME معروفاً
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
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
        const file = fileInput.files[0];
        
        // التحقق من نوع الملف للفيديو
        if (type === 'video' && !isValidVideoFile(file)) {
            if(statusMsg) statusMsg.innerText = "❌ خطأ: الملف يجب أن يكون فيديو صحيح (mp4, webm, ogv, mov, avi, mkv, flv, wmv)";
            console.error("Invalid video file type:", file.type, file.name);
            return;
        }
        
        // التحقق من حجم الملف (حد أقصى 500 MB)
        const maxSize = 500 * 1024 * 1024;
        if (file.size > maxSize) {
            if(statusMsg) statusMsg.innerText = "❌ خطأ: حجم الملف كبير جداً (الحد الأقصى 500 MB)";
            console.error("File size too large:", file.size);
            return;
        }
        
        mediaName = file.name;
        if(statusMsg) statusMsg.innerText = "جاري الرفع إلى السيرفر...";
        if(progressDiv) progressDiv.style.display = 'block';
        if(progressBar) progressBar.value = 10;
        
        try {
            console.log(`Starting upload for ${type}:`, file.name, "Size:", file.size, "Type:", file.type);
            const fileName = `${type}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const bucketName = 'Abdallah';

            if(progressBar) progressBar.value = 30;

            // التحقق من وجود Supabase client
            if (!window.supabaseClient) {
                throw new Error("Supabase client not initialized. Please refresh the page.");
            }

            const { data, error } = await window.supabaseClient.storage
                .from(bucketName)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error("Supabase Upload Error:", error);
                throw new Error(`Supabase Error: ${error.message}`);
            }

            if(progressBar) progressBar.value = 80;
            console.log("Supabase upload success:", data);
            
            // الحصول على الرابط العام للملف
            const { data: urlData } = window.supabaseClient.storage.from(bucketName).getPublicUrl(fileName);
            mediaUrl = urlData.publicUrl;
            
            if (!mediaUrl) {
                throw new Error("Failed to get public URL from Supabase");
            }
            
            console.log("Public URL obtained:", mediaUrl);
            
            if(progressBar) progressBar.value = 100;
            
            if (type === 'avatar') {
                document.getElementById('admin-avatar-url').value = mediaUrl;
                const profile = {
                    ...currentData.profile,
                    avatar: mediaUrl
                };
                await db.collection('siteData').doc('config').update({ profile });
            } else {
                await saveMedia(`${type}s`, { url: mediaUrl, name: mediaName, timestamp: Date.now() });
            }
            
            if(statusMsg) statusMsg.innerText = "✅ تم الرفع بنجاح!";
            setTimeout(() => { if(progressDiv) progressDiv.style.display = 'none'; }, 2000);
            fileInput.value = '';
        } catch (err) {
            if(statusMsg) statusMsg.innerText = "❌ خطأ في الرفع: " + err.message;
            console.error('Upload Error:', err);
        }
    } else if (mediaUrl) {
        // التحقق من أن الرابط صحيح
        if (!mediaUrl.startsWith('http://') && !mediaUrl.startsWith('https://')) {
            if(statusMsg) statusMsg.innerText = "❌ خطأ: الرابط يجب أن يبدأ بـ http:// أو https://";
            return;
        }
        
        if (type === 'avatar') {
            const profile = {
                ...currentData.profile,
                avatar: mediaUrl
            };
            await db.collection('siteData').doc('config').update({ profile });
        } else {
            await saveMedia(`${type}s`, { url: mediaUrl, name: mediaName, timestamp: Date.now() });
        }
        if(urlInput) urlInput.value = '';
        if(statusMsg) statusMsg.innerText = "✅ تم الإضافة بنجاح!";
    } else {
        alert("من فضلك أدخل رابطاً أو اختر ملفاً!");
    }
}

function uploadVideo() { uploadMedia('video'); }
function uploadAudio() { uploadMedia('audio'); }
function uploadAvatar() { uploadMedia('avatar'); }

async function saveMedia(type, item) {
    const list = currentData[type] || [];
    // منع التكرار بناءً على الرابط
    const exists = list.some(i => i.url === item.url);
    if (exists) {
        // إذا كان موجوداً، انقله للمقدمة
        const index = list.findIndex(i => i.url === item.url);
        list.splice(index, 1);
    }
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
        visibility: document.getElementById('profile-visibility').value,
        social: currentData.profile.social || {}
    };
    db.collection('siteData').doc('config').update({ profile })
    .then(() => {
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
