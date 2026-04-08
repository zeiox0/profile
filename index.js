// ========== نظام الودجات والتحكم المتقدم ==========

let siteData = {};
let currentAudioIndex = 0;
let isPlaying = false;
let widgets = [];
let draggedWidget = null;

// تم نقل المتغيرات إلى index.html لضمان توفرها لجميع السكريبتات بشكل عالمي
// const audioElem = document.getElementById('main-audio');
// const videoElem = document.getElementById('bg-video');
// const enterScreen = document.getElementById('enter-screen');
// const mainContent = document.getElementById('main-content');

// ========== تهيئة الصفحة ==========
function initPage() {
    loadData();
    setupEventListeners();
    setupWidgets();
}

// ========== إعداد مستمعي الأحداث ==========
function setupEventListeners() {
    // زر الشريط الجانبي
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }

    // زر ملء الشاشة
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    if (fullscreenToggle) {
        fullscreenToggle.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log('Fullscreen request failed:', err);
                });
            } else {
                document.exitFullscreen();
            }
        });
    }

    // أزرار التشغيل
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const muteBtn = document.getElementById('mute-btn');

    if (playBtn) playBtn.addEventListener('click', () => togglePlay(true));
    if (pauseBtn) pauseBtn.addEventListener('click', () => togglePlay(false));
    if (prevBtn) prevBtn.addEventListener('click', prevTrack);
    if (nextBtn) nextBtn.addEventListener('click', nextTrack);
    if (muteBtn) muteBtn.addEventListener('click', toggleMute);
}

// ========== نظام الودجات ==========
function setupWidgets() {
    const container = document.getElementById('widgets-container');
    if (!container) return;

    // إنشاء الودجات الأساسية
    const widgetTypes = [
        { id: 'profile', title: 'الملف الشخصي', icon: 'fas fa-user' },
        { id: 'player', title: 'مشغل الموسيقى', icon: 'fas fa-music' },
        { id: 'videos', title: 'الفيديوهات', icon: 'fas fa-video' },
        { id: 'stats', title: 'الإحصائيات', icon: 'fas fa-chart-bar' }
    ];

    container.innerHTML = '';
    widgetTypes.forEach(type => {
        const widget = createWidget(type);
        container.appendChild(widget);
        widgets.push({ id: type.id, element: widget });
    });

    // تفعيل Drag & Drop
    enableDragAndDrop();
}

function createWidget(type) {
    const widget = document.createElement('div');
    widget.className = 'widget';
    widget.id = `widget-${type.id}`;
    widget.draggable = true;

    let content = '';

    switch (type.id) {
        case 'profile':
            content = `
                <div class="widget-header">
                    <div class="widget-title"><i class="${type.icon}"></i> ${type.title}</div>
                    <div class="widget-controls">
                        <button class="edit-widget" data-widget="${type.id}"><i class="fas fa-edit"></i></button>
                    </div>
                </div>
                <div class="profile-widget">
                    <img id="widget-avatar" class="profile-avatar" src="https://via.placeholder.com/100" alt="Avatar">
                    <div class="profile-name" id="widget-name">Abdallah</div>
                    <div class="profile-bio" id="widget-bio">جاري التحميل...</div>
                    <div class="profile-social" id="widget-social"></div>
                </div>
            `;
            break;

        case 'player':
            content = `
                <div class="widget-header">
                    <div class="widget-title"><i class="${type.icon}"></i> ${type.title}</div>
                    <div class="widget-controls">
                        <button class="edit-widget" data-widget="${type.id}"><i class="fas fa-edit"></i></button>
                    </div>
                </div>
                <div class="player-widget">
                    <div class="player-display">
                        <div class="player-title" id="widget-track-title">لا يوجد صوت</div>
                        <div class="player-artist" id="widget-track-artist">---</div>
                    </div>
                    <input type="range" class="progress-bar" id="widget-progress" min="0" max="100" value="0">
                    <div class="player-controls">
                        <button class="player-btn" onclick="prevTrack()"><i class="fas fa-step-backward"></i></button>
                        <button class="player-btn" id="widget-play-btn" onclick="togglePlay()"><i class="fas fa-play"></i></button>
                        <button class="player-btn" onclick="nextTrack()"><i class="fas fa-step-forward"></i></button>
                    </div>
                </div>
            `;
            break;

        case 'videos':
            content = `
                <div class="widget-header">
                    <div class="widget-title"><i class="${type.icon}"></i> ${type.title}</div>
                    <div class="widget-controls">
                        <button class="edit-widget" data-widget="${type.id}"><i class="fas fa-edit"></i></button>
                    </div>
                </div>
                <div class="videos-widget" id="widget-videos-list"></div>
            `;
            break;

        case 'stats':
            content = `
                <div class="widget-header">
                    <div class="widget-title"><i class="${type.icon}"></i> ${type.title}</div>
                    <div class="widget-controls">
                        <button class="edit-widget" data-widget="${type.id}"><i class="fas fa-edit"></i></button>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(0,255,136,0.1); border-radius: 6px;">
                        <span>الزيارات:</span>
                        <span id="widget-views" style="color: var(--primary); font-weight: bold;">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(255,77,77,0.1); border-radius: 6px;">
                        <span>الملفات:</span>
                        <span id="widget-files" style="color: var(--secondary); font-weight: bold;">0</span>
                    </div>
                </div>
            `;
            break;
    }

    widget.innerHTML = content;

    // إضافة مستمع للتحرير
    const editBtn = widget.querySelector('.edit-widget');
    if (editBtn) {
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openWidgetEditor(type.id);
        });
    }

    return widget;
}

// ========== Drag & Drop ==========
function enableDragAndDrop() {
    const container = document.getElementById('widgets-container');
    if (!container) return;

    container.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('widget')) {
            draggedWidget = e.target;
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    container.addEventListener('dragend', (e) => {
        if (draggedWidget) {
            draggedWidget.classList.remove('dragging');
            draggedWidget = null;
        }
    });

    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });

    container.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedWidget && e.target.classList.contains('widget')) {
            const allWidgets = Array.from(container.querySelectorAll('.widget'));
            const draggedIndex = allWidgets.indexOf(draggedWidget);
            const targetIndex = allWidgets.indexOf(e.target);

            if (draggedIndex < targetIndex) {
                e.target.parentNode.insertBefore(draggedWidget, e.target.nextSibling);
            } else {
                e.target.parentNode.insertBefore(draggedWidget, e.target);
            }
        }
    });
}

// ========== تحميل البيانات ==========
function loadData() {
    if (typeof db === 'undefined') {
        return setTimeout(loadData, 500);
    }

    db.collection('siteData').doc('config').onSnapshot((doc) => {
        if (doc.exists) {
            siteData = doc.data();
            updateAllWidgets();
        }
    }, (error) => {
        console.error("Firestore error:", error);
    });
}

// ========== تحديث جميع الودجات ==========
function updateAllWidgets() {
    updateProfileWidget();
    updatePlayerWidget();
    updateVideosWidget();
    updateStatsWidget();
    updateSidebar();
}

function updateProfileWidget() {
    const profile = siteData.profile || {};
    const avatar = document.getElementById('widget-avatar');
    const name = document.getElementById('widget-name');
    const bio = document.getElementById('widget-bio');
    const social = document.getElementById('widget-social');

    if (avatar) avatar.src = profile.avatar || 'https://via.placeholder.com/100';
    if (name) name.innerText = profile.name || 'Abdallah';
    if (bio) bio.innerText = profile.bio || 'جاري التحميل...';

    if (social) {
        social.innerHTML = '';
        const socialLinks = profile.social || {};
        const icons = {
            discord: 'fab fa-discord',
            youtube: 'fab fa-youtube',
            twitter: 'fab fa-twitter',
            instagram: 'fab fa-instagram',
            tiktok: 'fab fa-tiktok',
            github: 'fab fa-github'
        };

        for (let key in socialLinks) {
            if (socialLinks[key]) {
                const link = document.createElement('a');
                let url = socialLinks[key].trim();
                if (!url.startsWith('http')) {
                    if (key === 'discord') url = `https://discord.com/users/${url}`;
                    else if (key === 'tiktok') url = `https://tiktok.com/@${url}`;
                    else url = `https://${key}.com/${url}`;
                }
                link.href = url;
                link.target = '_blank';
                link.className = 'social-link';
                link.innerHTML = `<i class="${icons[key] || 'fas fa-link'}"></i>`;
                social.appendChild(link);
            }
        }
    }

    // تحديث الخلفية
    updateBackground();
}

function updateBackground() {
    const profile = siteData.profile || {};
    const bgImage = document.getElementById('bg-image');

    if (siteData.videos && siteData.videos.length > 0) {
        const videoUrl = siteData.videos[0].url;
        if (videoUrl && videoUrl.startsWith('http')) {
            if (videoElem && videoElem.src !== videoUrl) {
                videoElem.src = videoUrl;
                videoElem.load();
            }
            if (videoElem) videoElem.style.display = 'block';
            if (bgImage) bgImage.style.display = 'none';
        }
    } else if (profile.avatar && bgImage) {
        bgImage.style.backgroundImage = `url('${profile.avatar}')`;
        bgImage.style.display = 'block';
        if (videoElem) videoElem.style.display = 'none';
    }
}

function updatePlayerWidget() {
    if (!siteData.audios || siteData.audios.length === 0) return;

    const audio = siteData.audios[currentAudioIndex];
    const trackTitle = document.getElementById('widget-track-title');
    const trackArtist = document.getElementById('widget-track-artist');

    if (trackTitle) trackTitle.innerText = audio.name || 'صوت مضاف';
    if (trackArtist) trackArtist.innerText = 'فنان';

    if (!audioElem.src || audioElem.getAttribute('data-src') !== audio.url) {
        audioElem.setAttribute('data-src', audio.url);
        audioElem.src = audio.url;
        audioElem.load();
    }
}

function updateVideosWidget() {
    const videosList = document.getElementById('widget-videos-list');
    if (!videosList) return;

    videosList.innerHTML = '';
    if (siteData.videos && siteData.videos.length > 0) {
        siteData.videos.forEach((video, index) => {
            const item = document.createElement('div');
            item.className = 'video-item';
            item.innerHTML = `
                <span class="video-name">${video.name || 'فيديو'}</span>
                <button class="video-btn" onclick="playVideo(${index})"><i class="fas fa-play"></i></button>
            `;
            videosList.appendChild(item);
        });
    } else {
        videosList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">لا توجد فيديوهات</p>';
    }
}

function updateStatsWidget() {
    const views = document.getElementById('widget-views');
    const files = document.getElementById('widget-files');

    if (views) views.innerText = localStorage.getItem('siteViews') || '0';
    if (files) {
        const totalFiles = (siteData.videos || []).length + (siteData.audios || []).length;
        files.innerText = totalFiles;
    }
}

function updateSidebar() {
    const sidebarContent = document.getElementById('sidebar-content');
    if (!sidebarContent) return;

    sidebarContent.innerHTML = `
        <div class="sidebar-item">
            <i class="fas fa-info-circle"></i> معلومات
        </div>
        <div class="sidebar-item">
            <i class="fas fa-cog"></i> الإعدادات
        </div>
        <div class="sidebar-item">
            <i class="fas fa-envelope"></i> تواصل معي
        </div>
        <div class="sidebar-item">
            <i class="fas fa-heart"></i> المفضلة
        </div>
    `;
}

// ========== التحكم في التشغيل ==========
function togglePlay(play) {
    if (play === true) {
        audioElem.play().catch(e => console.log('Play failed:', e));
        isPlaying = true;
    } else if (play === false) {
        audioElem.pause();
        isPlaying = false;
    } else {
        if (audioElem.paused) {
            audioElem.play().catch(e => console.log('Play failed:', e));
            isPlaying = true;
        } else {
            audioElem.pause();
            isPlaying = false;
        }
    }

    updatePlayButton();
}

function updatePlayButton() {
    const btn = document.getElementById('widget-play-btn');
    if (btn) {
        btn.innerHTML = audioElem.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
    }
}

function nextTrack() {
    if (!siteData.audios) return;
    currentAudioIndex = (currentAudioIndex + 1) % siteData.audios.length;
    updatePlayerWidget();
    if (isPlaying) audioElem.play().catch(e => console.log('Play failed:', e));
}

function prevTrack() {
    if (!siteData.audios) return;
    currentAudioIndex = (currentAudioIndex - 1 + siteData.audios.length) % siteData.audios.length;
    updatePlayerWidget();
    if (isPlaying) audioElem.play().catch(e => console.log('Play failed:', e));
}

function toggleMute() {
    audioElem.muted = !audioElem.muted;
}

function playVideo(index) {
    if (siteData.videos && siteData.videos[index]) {
        const video = siteData.videos[index];
        if (videoElem) {
            videoElem.src = video.url;
            videoElem.load();
            videoElem.play().catch(e => console.log('Video play failed:', e));
        }
    }
}

// ========== محرر الودجات ==========
function openWidgetEditor(widgetId) {
    alert(`محرر الودجة: ${widgetId}\n(سيتم تطويره في المرحلة التالية)`);
}

// ========== تحديث شريط التقدم ==========
audioElem.ontimeupdate = () => {
    if (audioElem.duration) {
        const progress = (audioElem.currentTime / audioElem.duration) * 100;
        const progressBar = document.getElementById('widget-progress');
        if (progressBar) progressBar.value = progress;
    }
};

// ========== تتبع الزيارات ==========
function trackVisit() {
    let views = localStorage.getItem('siteViews') || '0';
    views = parseInt(views) + 1;
    localStorage.setItem('siteViews', views);
}

// ========== التهيئة ==========
window.addEventListener('load', () => {
    initPage();
    trackVisit();
});


// ========== نافذة التأكيد قبل تشغيل الفيديو ==========
function showVideoConfirmation(videoUrl, videoName) {
    const confirmed = confirm(`هل أنت متأكد من تشغيل الفيديو: "${videoName}"؟`);
    if (confirmed) {
        playVideo(videoUrl);
    }
}

function playVideo(videoUrl) {
    const videoElem = document.getElementById('bg-video');
    if (videoElem) {
        videoElem.src = videoUrl;
        videoElem.style.display = 'block';
        videoElem.play().catch(e => console.log("Video play failed:", e));
    }
}

// ========== زر الاستماع للأغنية ==========
function playAudioPreview(audioUrl, audioName) {
    const previewAudio = new Audio();
    previewAudio.src = audioUrl;
    previewAudio.volume = 0.5;
    previewAudio.play().catch(e => {
        alert('❌ لم يتمكن من تشغيل الصوت: ' + e.message);
    });
    
    // إظهار رسالة
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 255, 136, 0.9);
        color: #000;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 999;
        font-weight: bold;
        animation: slideIn 0.3s ease-out;
    `;
    msg.innerText = `🎵 تشغيل: ${audioName}`;
    document.body.appendChild(msg);
    
    setTimeout(() => msg.remove(), 3000);
}

// ========== إضافة أزرار التحكم للفيديوهات ==========
function addVideoControls(videoUrl, videoName) {
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = `
        display: flex;
        gap: 8px;
        margin-top: 10px;
    `;
    
    const playBtn = document.createElement('button');
    playBtn.innerHTML = '▶️ تشغيل';
    playBtn.style.cssText = `
        flex: 1;
        padding: 8px;
        background: linear-gradient(135deg, #00ff88 0%, #00cc66 100%);
        border: none;
        border-radius: 6px;
        color: #000;
        font-weight: bold;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s;
    `;
    playBtn.onmouseover = () => playBtn.style.transform = 'scale(1.05)';
    playBtn.onmouseout = () => playBtn.style.transform = 'scale(1)';
    playBtn.onclick = () => showVideoConfirmation(videoUrl, videoName);
    
    const listenBtn = document.createElement('button');
    listenBtn.innerHTML = '🎵 استماع';
    listenBtn.style.cssText = `
        flex: 1;
        padding: 8px;
        background: rgba(255, 77, 77, 0.2);
        border: 1px solid #ff4d4d;
        border-radius: 6px;
        color: #ff4d4d;
        font-weight: bold;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s;
    `;
    listenBtn.onmouseover = () => listenBtn.style.background = 'rgba(255, 77, 77, 0.3)';
    listenBtn.onmouseout = () => listenBtn.style.background = 'rgba(255, 77, 77, 0.2)';
    listenBtn.onclick = () => playAudioPreview(videoUrl, videoName);
    
    controlsDiv.appendChild(playBtn);
    controlsDiv.appendChild(listenBtn);
    
    return controlsDiv;
}
