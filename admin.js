let currentData = {
    videos: [], audios: [], images: [],
    profile: { name: "Abdallah", bio: "Hi I 👋", avatar: "", visibility: "public", social: {} }
};

// وظيفة لانتظار تهيئة سوبابيس مع محاولة إنشاءه إذا لم يكن موجوداً
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

// ========== نظام الإشعارات (Toast Notifications) ==========
function showNotification(type, title, message, duration = 4000) {
    const container = document.getElementById('notifications-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'info':
            icon = '<i class="fas fa-info-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-warning"></i>';
            break;
    }

    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(notification);

    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('removing');
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
}

function showSuccess(title, message) { showNotification('success', title, message); }
function showError(title, message) { showNotification('error', title, message); }
function showInfo(title, message) { showNotification('info', title, message); }
function showWarning(title, message) { showNotification('warning', title, message); }

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
    
    loadVideoHistory();
    loadAudioHistory();
    loadStudioGallery();
    loadCloudLibrary();
}

function loadVideoHistory() {
    const list = document.getElementById('video-history');
    if (!list) return;
    list.innerHTML = '';
    const videos = currentData.videos || [];
    videos.forEach(video => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;';
        item.innerHTML = `
            <span>${video.name}</span>
            <button onclick="deleteVideo('${video.url}')" class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;">حذف</button>
        `;
        list.appendChild(item);
    });
}

function loadAudioHistory() {
    const list = document.getElementById('audio-history');
    if (!list) return;
    list.innerHTML = '';
    const audios = currentData.audios || [];
    audios.forEach(audio => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;';
        item.innerHTML = `
            <span>${audio.name}</span>
            <button onclick="deleteAudio('${audio.url}')" class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;">حذف</button>
        `;
        list.appendChild(item);
    });
}

// ========== دالة الرفع الموحدة مع الإشعارات ==========
async function uploadMedia(type) {
    const fileInput = document.getElementById(`${type}-input`);
    const urlInput = document.getElementById(`${type}-url-input`);
    const statusMsg = document.getElementById(`${type}-status-msg`);
    const progressBar = document.getElementById(`${type}-progress-bar`);
    const progressDiv = document.getElementById(`${type}-progress-container`);
    
    let mediaUrl = urlInput ? urlInput.value.trim() : "";
    let mediaName = "ميديا من رابط";

    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const maxSize = 50 * 1024 * 1024;
        
        if (file.size > maxSize) {
            showError('❌ خطأ', 'الحجم كبير جداً (أقصى حد 50MB)');
            return;
        }
        
        mediaName = file.name;
        showInfo('⏳ جاري الرفع', `رفع ${type}: ${mediaName}`);
        if(progressDiv) progressDiv.style.display = 'block';
        if(progressBar) progressBar.value = 20;
        
        const isSupabaseReady = await waitForSupabase();
        if (!isSupabaseReady) {
            showError('❌ خطأ', 'فشل الاتصال بخادم الرفع. يرجى تحديث الصفحة والمحاولة مجدداً.');
            return;
        }

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
            
            showSuccess('✅ تم بنجاح', `تم رفع ${mediaName}`);
            setTimeout(() => { 
                if(progressDiv) progressDiv.style.display = 'none';
                if(statusMsg) statusMsg.innerText = '';
            }, 3000);
            fileInput.value = '';
        } catch (err) {
            showError('❌ فشل الرفع', err.message);
            if(progressDiv) progressDiv.style.display = 'none';
            console.error("Upload error:", err);
        }
    } else if (mediaUrl) {
        try {
            if (type === 'avatar') {
                const profile = { ...currentData.profile, avatar: mediaUrl };
                await db.collection('siteData').doc('config').update({ profile });
            } else {
                await saveMedia(`${type}s`, { url: mediaUrl, name: mediaName, timestamp: Date.now() });
            }
            showSuccess('✅ تمت الإضافة', `تم إضافة ${mediaName}`);
            if(urlInput) urlInput.value = '';
        } catch (err) {
            showError('❌ خطأ', err.message);
        }
    } else {
        showWarning('⚠️ تنبيه', 'يرجى اختيار ملف أو إدخال رابط');
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
    db.collection('siteData').doc('config').update({ profile })
        .then(() => showSuccess('✅ تم الحفظ', 'تم حفظ بيانات البروفايل بنجاح'))
        .catch(err => showError('❌ خطأ', err.message));
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
        .then(() => showSuccess('✅ تم الحفظ', 'تم حفظ الروابط الاجتماعية بنجاح'))
        .catch(err => showError('❌ خطأ', err.message));
}

function deleteVideo(url) {
    if (confirm('هل تريد حذف هذا الفيديو؟')) {
        const videos = (currentData.videos || []).filter(v => v.url !== url);
        db.collection('siteData').doc('config').update({ videos })
            .then(() => {
                showSuccess('✅ تم الحذف', 'تم حذف الفيديو بنجاح');
                loadVideoHistory();
            })
            .catch(err => showError('❌ خطأ', err.message));
    }
}

function deleteAudio(url) {
    if (confirm('هل تريد حذف هذا الصوت؟')) {
        const audios = (currentData.audios || []).filter(a => a.url !== url);
        db.collection('siteData').doc('config').update({ audios })
            .then(() => {
                showSuccess('✅ تم الحذف', 'تم حذف الصوت بنجاح');
                loadAudioHistory();
            })
            .catch(err => showError('❌ خطأ', err.message));
    }
}

function updateLivePreview() {
    const frame = document.getElementById('live-preview-frame');
    if (frame) frame.src = 'index.html?t=' + Date.now();
}

function logout() { auth.signOut().then(() => location.reload()); }

document.addEventListener('DOMContentLoaded', () => {
    const passInput = document.getElementById('password');
    if (passInput) {
        passInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') attemptLogin();
        });
    }
});

// ========== استوديو الصور ==========
async function uploadStudioImage() {
    const fileInput = document.getElementById('studio-file');
    if (!fileInput.files.length) {
        showWarning('⚠️ تنبيه', 'اختر صورة');
        return;
    }

    const file = fileInput.files[0];
    const isSupabaseReady = await waitForSupabase();
    if (!isSupabaseReady) {
        showError('❌ خطأ', 'فشل الاتصال بخادم الرفع');
        return;
    }

    try {
        showInfo('⏳ جاري الرفع', `رفع الصورة: ${file.name}`);
        const fileName = 'studio_' + Date.now() + '_' + file.name.replace(/\s+/g, '_');
        const { data, error } = await window.supabaseClient.storage
            .from('Abdallah')
            .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (error) throw error;

        const { data: urlData } = window.supabaseClient.storage.from('Abdallah').getPublicUrl(fileName);
        
        const studioImages = currentData.studioImages || [];
        studioImages.unshift({ url: urlData.publicUrl, name: file.name, timestamp: Date.now() });
        await db.collection('siteData').doc('config').update({ studioImages });

        fileInput.value = '';
        loadStudioGallery();
        showSuccess('✅ تم بنجاح', 'تم رفع الصورة بنجاح');
    } catch (err) {
        showError('❌ فشل الرفع', err.message);
        console.error('Upload error:', err);
    }
}

function loadStudioGallery() {
    const gallery = document.getElementById('studio-gallery');
    if (!gallery) return;
    gallery.innerHTML = '';
    const images = currentData.studioImages || [];
    images.forEach(img => {
        const div = document.createElement('div');
        div.style.cssText = 'position: relative; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px; margin-bottom: 8px;';
        div.innerHTML = `
            <img src="${img.url}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
            <button onclick="deleteStudioImage('${img.url}')" class="btn btn-secondary" style="width: 100%; padding: 5px;">حذف</button>
        `;
        gallery.appendChild(div);
    });
}

function deleteStudioImage(url) {
    if (confirm('هل تريد حذف هذه الصورة؟')) {
        const studioImages = (currentData.studioImages || []).filter(img => img.url !== url);
        db.collection('siteData').doc('config').update({ studioImages })
            .then(() => {
                showSuccess('✅ تم الحذف', 'تم حذف الصورة بنجاح');
                loadStudioGallery();
            })
            .catch(err => showError('❌ خطأ', err.message));
    }
}

// ========== المكتبة السحابية ==========
const cloudLibrary = {
    videos: [
        { name: 'شاطئ هادئ', url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4', thumbnail: '🏖️' },
        { name: 'غابة خضراء', url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4', thumbnail: '🌲' }
    ],
    audios: [
        { name: 'موسيقى هادئة', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', thumbnail: '🎵' },
        { name: 'موسيقى استرخاء', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', thumbnail: '🧘' }
    ]
};

function loadCloudLibrary() {
    const videosContainer = document.getElementById('library-videos');
    const audiosContainer = document.getElementById('library-audios');
    
    if (videosContainer) {
        videosContainer.innerHTML = '';
        cloudLibrary.videos.forEach(video => {
            const card = document.createElement('div');
            card.style.cssText = 'background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); border-radius: 8px; padding: 15px; text-align: center; cursor: pointer;';
            card.innerHTML = `
                <div style="font-size: 40px; margin-bottom: 10px;">${video.thumbnail}</div>
                <div style="font-weight: bold; margin-bottom: 10px;">${video.name}</div>
                <button onclick="addVideoFromLibrary('${video.url}', '${video.name}')" class="btn" style="width: 100%; padding: 8px; font-size: 12px;">إضافة</button>
            `;
            videosContainer.appendChild(card);
        });
    }
    
    if (audiosContainer) {
        audiosContainer.innerHTML = '';
        cloudLibrary.audios.forEach(audio => {
            const card = document.createElement('div');
            card.style.cssText = 'background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); border-radius: 8px; padding: 15px; text-align: center; cursor: pointer;';
            card.innerHTML = `
                <div style="font-size: 40px; margin-bottom: 10px;">${audio.thumbnail}</div>
                <div style="font-weight: bold; margin-bottom: 10px;">${audio.name}</div>
                <button onclick="addAudioFromLibrary('${audio.url}', '${audio.name}')" class="btn" style="width: 100%; padding: 8px; font-size: 12px;">إضافة</button>
            `;
            audiosContainer.appendChild(card);
        });
    }
}

async function addVideoFromLibrary(videoUrl, videoName) {
    try {
        showInfo('⏳ جاري الإضافة', `إضافة: ${videoName}`);
        const list = currentData.videos || [];
        list.unshift({ url: videoUrl, name: videoName, timestamp: Date.now(), fromLibrary: true });
        await db.collection('siteData').doc('config').update({ videos: list });
        showSuccess('✅ تمت الإضافة', `تم إضافة ${videoName} بنجاح`);
        loadVideoHistory();
    } catch (err) {
        showError('❌ خطأ', err.message);
    }
}

async function addAudioFromLibrary(audioUrl, audioName) {
    try {
        showInfo('⏳ جاري الإضافة', `إضافة: ${audioName}`);
        const list = currentData.audios || [];
        list.unshift({ url: audioUrl, name: audioName, timestamp: Date.now(), fromLibrary: true });
        await db.collection('siteData').doc('config').update({ audios: list });
        showSuccess('✅ تمت الإضافة', `تم إضافة ${audioName} بنجاح`);
        loadAudioHistory();
    } catch (err) {
        showError('❌ خطأ', err.message);
    }
}
