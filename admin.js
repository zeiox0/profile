const AUTHORIZED_EMAIL = "abdallah.ali2812@gmail.com";
let currentData = {
    videos: [],
    audios: [],
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
    .then((userCredential) => {
        console.log("Login successful");
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
    db.collection('siteData').doc('config').onSnapshot(doc => {
        if(doc.exists) {
            currentData = doc.data();
            renderAdminPanel();
        } else {
            // تهيئة البيانات الافتراضية
            db.collection('siteData').doc('config').set(currentData);
        }
    }, error => {
        console.error("Load data error:", error);
    });
}

function renderAdminPanel() {
    // تحديث قسم البروفايل
    const profile = currentData.profile || {};
    document.getElementById('admin-name').value = profile.name || "";
    document.getElementById('admin-bio').value = profile.bio || "";
    document.getElementById('admin-avatar-url').value = profile.avatar || "";
    document.getElementById('profile-visibility').value = profile.visibility || "public";
    
    // تحديث الروابط الاجتماعية
    const social = profile.social || {};
    document.getElementById('social-discord').value = social.discord || "";
    document.getElementById('social-youtube').value = social.youtube || "";
    document.getElementById('social-twitter').value = social.twitter || "";
    document.getElementById('social-instagram').value = social.instagram || "";
    document.getElementById('social-tiktok').value = social.tiktok || "";
    document.getElementById('social-github').value = social.github || "";

    // تحديث الهيستوري
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
                <span>${item.name || (item.url ? item.url.split('/').pop().substring(0, 20) : 'Unnamed')}</span>
            </div>
            <button onclick="removeItem('${type}', ${index})" style="background:none; border:none; color:#ff4d4d; cursor:pointer;">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

// رفع فيديو (دعم الملفات والروابط)
async function uploadVideo() {
    const fileInput = document.getElementById('video-file');
    const urlInput = document.getElementById('video-url');
    const progressDiv = document.getElementById('video-progress');
    const progressBar = progressDiv.querySelector('progress');
    
    let videoUrl = urlInput.value.trim();
    let videoName = "فيديو من رابط";

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        videoName = file.name;
        progressDiv.style.display = 'block';
        
        try {
            const storageRef = storage.ref(`videos/${Date.now()}_${file.name}`);
            const uploadTask = storageRef.put(file);
            
            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progressBar.value = progress;
                }, 
                (error) => { alert("خطأ في الرفع: " + error.message); }, 
                async () => {
                    videoUrl = await uploadTask.snapshot.ref.getDownloadURL();
                    saveMedia('videos', { url: videoUrl, name: videoName, type: 'file' });
                    progressDiv.style.display = 'none';
                    fileInput.value = '';
                }
            );
            return;
        } catch (err) {
            alert("خطأ: " + err.message);
            return;
        }
    }

    if (videoUrl) {
        saveMedia('videos', { url: videoUrl, name: videoName, type: 'url' });
        urlInput.value = '';
    } else {
        alert("يرجى اختيار ملف أو إدخال رابط");
    }
}

// رفع صوت
async function uploadAudio() {
    const fileInput = document.getElementById('audio-file');
    const urlInput = document.getElementById('audio-url');
    const fromVideoInput = document.getElementById('audio-from-video');
    
    let audioUrl = urlInput.value.trim();
    let audioName = "صوت مضاف";

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const storageRef = storage.ref(`audios/${Date.now()}_${file.name}`);
        const uploadTask = await storageRef.put(file);
        audioUrl = await uploadTask.ref.getDownloadURL();
        audioName = file.name;
    } else if (fromVideoInput.value.trim()) {
        audioUrl = fromVideoInput.value.trim();
        audioName = "صوت مستخرج من فيديو";
    }

    if (audioUrl) {
        saveMedia('audios', { url: audioUrl, name: audioName });
        fileInput.value = '';
        urlInput.value = '';
        fromVideoInput.value = '';
    } else {
        alert("يرجى إدخال مصدر للصوت");
    }
}

function saveMedia(type, item) {
    const list = currentData[type] || [];
    list.unshift(item); // إضافة في البداية للهيستوري
    db.collection('siteData').doc('config').update({ [type]: list })
    .then(() => alert("✅ تم الإضافة بنجاح!"));
}

function removeItem(type, index) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    const list = [...(currentData[type] || [])];
    list.splice(index, 1);
    db.collection('siteData').doc('config').update({ [type]: list });
}

function saveProfileData() {
    const profile = {
        ...currentData.profile,
        name: document.getElementById('admin-name').value,
        bio: document.getElementById('admin-bio').value,
        avatar: document.getElementById('admin-avatar-url').value,
        visibility: document.getElementById('profile-visibility').value
    };
    db.collection('siteData').doc('config').update({ profile })
    .then(() => alert("✅ تم حفظ بيانات البروفايل!"));
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

function logout() {
    auth.signOut().then(() => location.reload());
}

// محاكاة البحث في المكتبة أونلاين
function searchOnlineVideos() {
    const query = document.getElementById('video-search').value.toLowerCase();
    const results = document.getElementById('online-video-results');
    
    // بيانات تجريبية للمكتبة
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

// تهيئة البحث عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('video-search')) searchOnlineVideos();
});
