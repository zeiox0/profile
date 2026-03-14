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

// ========== استوديو الصور ==========
async function uploadStudioImage() {
    const fileInput = document.getElementById('studio-file');
    if (!fileInput.files.length) {
        alert('اختر صورة');
        return;
    }

    const file = fileInput.files[0];
    const isSupabaseReady = await waitForSupabase();
    if (!isSupabaseReady) {
        alert('خطأ: فشل الاتصال بخادم الرفع');
        return;
    }

    try {
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
        alert('تم رفع الصورة بنجاح!');
    } catch (err) {
        alert('خطأ في الرفع: ' + err.message);
    }
}

function loadStudioGallery() {
    const gallery = document.getElementById('studio-gallery');
    const images = currentData.studioImages || [];
    gallery.innerHTML = '';
    images.forEach((img, index) => {
        const item = document.createElement('div');
        item.style.cssText = 'position: relative; cursor: pointer; border-radius: 8px; overflow: hidden; border: 1px solid #333;';
        item.innerHTML = '<img src="' + img.url + '" style="width: 100%; height: 100px; object-fit: cover;"><div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s;" class="img-overlay"><button onclick="deleteStudioImage(' + index + ')" style="background: #ff4d4d; border: none; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer;">حذف</button></div>';
        item.addEventListener('mouseenter', function() { this.querySelector('.img-overlay').style.opacity = '1'; });
        item.addEventListener('mouseleave', function() { this.querySelector('.img-overlay').style.opacity = '0'; });
        gallery.appendChild(item);
    });
}

async function deleteStudioImage(index) {
    if (!confirm('هل أنت متأكد؟')) return;
    const studioImages = currentData.studioImages || [];
    studioImages.splice(index, 1);
    await db.collection('siteData').doc('config').update({ studioImages });
}

// ========== قائمة المهام ==========
async function addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();
    if (!text) return;

    const todos = currentData.todos || [];
    todos.unshift({ text: text, completed: false, timestamp: Date.now() });
    await db.collection('siteData').doc('config').update({ todos });
    input.value = '';
    loadTodoList();
}

async function toggleTodo(index) {
    const todos = currentData.todos || [];
    todos[index].completed = !todos[index].completed;
    await db.collection('siteData').doc('config').update({ todos });
}

async function deleteTodo(index) {
    const todos = currentData.todos || [];
    todos.splice(index, 1);
    await db.collection('siteData').doc('config').update({ todos });
}

function loadTodoList() {
    const list = document.getElementById('todo-list');
    const todos = currentData.todos || [];
    list.innerHTML = '';
    todos.forEach(function(todo, index) {
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(0,255,136,0.05); border-radius: 6px; border: 1px solid #333;';
        item.innerHTML = '<input type="checkbox" ' + (todo.completed ? 'checked' : '') + ' onchange="toggleTodo(' + index + ')" style="cursor: pointer;"><span style="flex: 1; ' + (todo.completed ? 'text-decoration: line-through; color: #666;' : '') + '">' + todo.text + '</span><button onclick="deleteTodo(' + index + ')" style="background: none; border: none; color: #ff4d4d; cursor: pointer;">حذف</button>';
        list.appendChild(item);
    });
}

// ========== صندوق الرسائل ==========
function loadMessages() {
    const list = document.getElementById('messages-list');
    const noMessages = document.getElementById('no-messages');
    const messages = currentData.messages || [];
    
    if (messages.length === 0) {
        list.style.display = 'none';
        noMessages.style.display = 'block';
        return;
    }
    
    list.style.display = 'flex';
    noMessages.style.display = 'block';
    list.innerHTML = '';
    
    messages.forEach(function(msg) {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 12px; background: rgba(0,255,136,0.05); border-left: 3px solid #00ff88; border-radius: 4px;';
        item.innerHTML = '<div style="font-weight: bold; color: #00ff88;">' + (msg.name || 'بدون اسم') + '</div><div style="font-size: 12px; color: #999; margin: 5px 0;">' + (msg.email || 'بدون بريد') + '</div><div style="margin: 8px 0;">' + msg.message + '</div><div style="font-size: 11px; color: #666;">' + new Date(msg.timestamp).toLocaleString('ar-SA') + '</div>';
        list.appendChild(item);
    });
}

// ========== تحميل البيانات الجديدة ==========
function loadNewData() {
    loadStudioGallery();
    loadTodoList();
    loadMessages();
}


// ========== تخصيص المظهر ==========
function updateCustomization() {
    const primaryColor = document.getElementById('primary-color').value;
    const secondaryColor = document.getElementById('secondary-color').value;
    const playerStyle = document.getElementById('player-style').value;
    const playerPosition = document.getElementById('player-position').value;
    const enableAnimations = document.getElementById('enable-animations').checked;
    const enableParticles = document.getElementById('enable-particles').checked;
    const enableGlow = document.getElementById('enable-glow').checked;
    const enableSidebar = document.getElementById('enable-sidebar').checked;
    
    const customization = {
        colors: { primary: primaryColor, secondary: secondaryColor },
        player: { style: playerStyle, position: playerPosition },
        animations: { enabled: enableAnimations, particles: enableParticles, glow: enableGlow },
        sidebar: { enabled: enableSidebar }
    };
    
    localStorage.setItem('customization', JSON.stringify(customization));
}

async function saveCustomization() {
    updateCustomization();
    const customization = JSON.parse(localStorage.getItem('customization') || '{}');
    await db.collection('siteData').doc('config').update({ customization });
    alert('تم حفظ التخصيص بنجاح!');
    updateLivePreview();
}

function loadCustomization() {
    if (typeof db === 'undefined') return setTimeout(loadCustomization, 500);
    
    db.collection('siteData').doc('config').onSnapshot((doc) => {
        if (doc.exists && doc.data().customization) {
            const custom = doc.data().customization;
            if (custom.colors) {
                const primaryInput = document.getElementById('primary-color');
                const secondaryInput = document.getElementById('secondary-color');
                if (primaryInput) primaryInput.value = custom.colors.primary || '#00ff88';
                if (secondaryInput) secondaryInput.value = custom.colors.secondary || '#ff4d4d';
            }
            if (custom.player) {
                const playerStyleSelect = document.getElementById('player-style');
                const playerPosSelect = document.getElementById('player-position');
                if (playerStyleSelect) playerStyleSelect.value = custom.player.style || 'minimal';
                if (playerPosSelect) playerPosSelect.value = custom.player.position || 'bottom';
            }
            if (custom.animations) {
                const animCheckbox = document.getElementById('enable-animations');
                const particlesCheckbox = document.getElementById('enable-particles');
                const glowCheckbox = document.getElementById('enable-glow');
                if (animCheckbox) animCheckbox.checked = custom.animations.enabled !== false;
                if (particlesCheckbox) particlesCheckbox.checked = custom.animations.particles || false;
                if (glowCheckbox) glowCheckbox.checked = custom.animations.glow !== false;
            }
            if (custom.sidebar) {
                const sidebarCheckbox = document.getElementById('enable-sidebar');
                if (sidebarCheckbox) sidebarCheckbox.checked = custom.sidebar.enabled !== false;
            }
        }
    });
}

// ========== تحميل جميع البيانات عند الدخول ==========
function loadAllData() {
    if (typeof db === 'undefined') return setTimeout(loadAllData, 500);
    
    db.collection('siteData').doc('config').onSnapshot((doc) => {
        if (doc.exists) {
            currentData = doc.data();
            loadNewData();
            loadCustomization();
        }
    });
}

// استدعاء تحميل البيانات عند الدخول الناجح
if (typeof attemptLogin !== 'undefined') {
    const originalAttemptLogin = window.attemptLogin;
    window.attemptLogin = async function() {
        await originalAttemptLogin.call(this);
        if (!document.getElementById('login-overlay').style.display || document.getElementById('login-overlay').style.display === 'none') {
            loadAllData();
        }
    };
}


// ========== المكتبة السحابية (Cloud Library) ==========
const cloudLibrary = {
    videos: [
        { name: 'شاطئ هادئ', url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4', thumbnail: '🏖️' },
        { name: 'غابة خضراء', url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4', thumbnail: '🌲' },
        { name: 'مدينة ليلاً', url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4', thumbnail: '🌃' },
        { name: 'جبال مغطاة بالثلج', url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerEscapes.mp4', thumbnail: '⛰️' },
        { name: 'محيط أزرق', url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerFun.mp4', thumbnail: '🌊' }
    ],
    audios: [
        { name: 'موسيقى هادئة', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', thumbnail: '🎵' },
        { name: 'موسيقى استرخاء', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', thumbnail: '🧘' },
        { name: 'موسيقى طاقة', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', thumbnail: '⚡' },
        { name: 'موسيقى عمل', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', thumbnail: '💼' },
        { name: 'موسيقى حفلة', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', thumbnail: '🎉' }
    ]
};

function loadCloudLibrary() {
    const videosContainer = document.getElementById('library-videos');
    const audiosContainer = document.getElementById('library-audios');
    
    if (!videosContainer || !audiosContainer) return;
    
    // تحميل الفيديوهات
    videosContainer.innerHTML = '';
    cloudLibrary.videos.forEach(video => {
        const card = document.createElement('div');
        card.style.cssText = `
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
        `;
        card.onmouseover = () => card.style.background = 'rgba(0, 255, 136, 0.1)';
        card.onmouseout = () => card.style.background = 'rgba(255, 255, 255, 0.05)';
        
        card.innerHTML = `
            <div style="font-size: 40px; margin-bottom: 10px;">${video.thumbnail}</div>
            <div style="font-weight: bold; margin-bottom: 10px;">${video.name}</div>
            <button onclick="addVideoFromLibrary('${video.url}', '${video.name}')" class="btn" style="width: 100%; padding: 8px; font-size: 12px;">
                <i class="fas fa-plus"></i> إضافة
            </button>
        `;
        videosContainer.appendChild(card);
    });
    
    // تحميل الأصوات
    audiosContainer.innerHTML = '';
    cloudLibrary.audios.forEach(audio => {
        const card = document.createElement('div');
        card.style.cssText = `
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
        `;
        card.onmouseover = () => card.style.background = 'rgba(0, 255, 136, 0.1)';
        card.onmouseout = () => card.style.background = 'rgba(255, 255, 255, 0.05)';
        
        card.innerHTML = `
            <div style="font-size: 40px; margin-bottom: 10px;">${audio.thumbnail}</div>
            <div style="font-weight: bold; margin-bottom: 10px;">${audio.name}</div>
            <div style="display: flex; gap: 5px;">
                <button onclick="playAudioPreview('${audio.url}', '${audio.name}')" class="btn btn-secondary" style="flex: 1; padding: 8px; font-size: 12px;">
                    <i class="fas fa-play"></i>
                </button>
                <button onclick="addAudioFromLibrary('${audio.url}', '${audio.name}')" class="btn" style="flex: 1; padding: 8px; font-size: 12px;">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        audiosContainer.appendChild(card);
    });
}

// ========== إضافة من المكتبة ==========
async function addVideoFromLibrary(videoUrl, videoName) {
    const list = currentData.videos || [];
    list.unshift({ url: videoUrl, name: videoName, timestamp: Date.now(), fromLibrary: true });
    await db.collection('siteData').doc('config').update({ videos: list });
    alert(`✅ تمت إضافة "${videoName}" بنجاح!`);
    loadVideoHistory();
}

async function addAudioFromLibrary(audioUrl, audioName) {
    const list = currentData.audios || [];
    list.unshift({ url: audioUrl, name: audioName, timestamp: Date.now(), fromLibrary: true });
    await db.collection('siteData').doc('config').update({ audios: list });
    alert(`✅ تمت إضافة "${audioName}" بنجاح!`);
    loadAudioHistory();
}

// ========== دالة الاستماع للأغنية (معاد استخدامها) ==========
function playAudioPreview(audioUrl, audioName) {
    const previewAudio = new Audio();
    previewAudio.src = audioUrl;
    previewAudio.volume = 0.5;
    previewAudio.play().catch(e => {
        alert('❌ لم يتمكن من تشغيل الصوت');
    });
}

// ========== تحميل المكتبة عند الدخول ==========
const originalLoadAllData = window.loadAllData;
window.loadAllData = async function() {
    if (originalLoadAllData) await originalLoadAllData.call(this);
    loadCloudLibrary();
};
