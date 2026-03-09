// إعدادات Supabase
const SUPABASE_URL = "https://mtdevelmgoinumifpcpb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZGV2ZWxtZ29pbnVtaWZwY3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzM0MTMsImV4cCI6MjA4ODM0OTQxM30.xronBSbgZPVd79VDTEoLuB3XsCwQwGfB_uCW2hPIlMQ";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const AUTHORIZED_EMAIL = "abdallah.ali2812@gmail.com";
const bucketName = 'Abdallah'; 

let mediaLibrary = { videos: [], images: [], gifs: [], audio: [] };
let selectedMedia = { videos: "", images: "", gifs: "", audio: "" };
let onlineLinks = { videos: [], images: [], gifs: [], audio: [] };

// تسجيل الدخول
function attemptLogin() {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    if (email.toLowerCase() !== AUTHORIZED_EMAIL) {
        errorMsg.innerText = "هذا الإيميل غير مصرح له كمسؤول!";
        errorMsg.style.display = "block";
        return;
    }

    auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
        document.getElementById('login-overlay').style.display = 'none';
        loadAllData();
        loadAllLibraries();
        loadOnlineLinks();
    })
    .catch((error) => {
        errorMsg.innerText = "خطأ: الباسورد غلط أو الحساب غير مفعل.";
        errorMsg.style.display = "block";
    });
}

// تبديل التبويبات
function switchTab(tabId, evt) {
    document.querySelectorAll('.library-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    const tabElement = document.getElementById(`tab-${tabId}`);
    if(tabElement) {
        tabElement.classList.add('active');
    }
    if(evt && evt.target) {
        evt.target.classList.add('active');
    }
}

// تحديث نوع الخلفية
function updateBackgroundType() {
    const type = document.getElementById('background-type').value;
    document.getElementById('video-speed').disabled = type !== 'video';
}

// تحديث عرض القيمة
function updateRangeVal(id, val) {
    document.getElementById(`${id}-val`).innerText = val;
}

// جلب البيانات الأساسية
function loadAllData() {
    db.collection('siteData').doc('config').get().then(doc => {
        if(doc.exists) {
            const d = doc.data();
            document.getElementById('admin-name').value = d.name || "";
            document.getElementById('admin-bio').value = d.bio || "";
            document.getElementById('background-type').value = d.backgroundType || "video";
            if(d.videoSpeed) {
                document.getElementById('video-speed').value = d.videoSpeed;
                updateRangeVal('speed', d.videoSpeed + 'x');
            }
            if(d.bgVolume !== undefined) {
                document.getElementById('bg-volume').value = d.bgVolume;
                updateRangeVal('volume', Math.round(d.bgVolume*100)+'%');
            }
            if(d.videoFit) document.getElementById('video-fit').value = d.videoFit;
        }
    });
}

// حفظ جميع الإعدادات
function saveAllSettings() {
    const bgType = document.getElementById('background-type').value;
    const data = {
        name: document.getElementById('admin-name').value,
        bio: document.getElementById('admin-bio').value,
        backgroundType: bgType,
        videoSpeed: parseFloat(document.getElementById('video-speed').value),
        bgVolume: parseFloat(document.getElementById('bg-volume').value),
        videoFit: document.getElementById('video-fit').value
    };
    
    // إضافة الوسائط المختارة
    if(selectedMedia.videos) data.video = selectedMedia.videos;
    if(selectedMedia.images) data.image = selectedMedia.images;
    if(selectedMedia.gifs) data.gif = selectedMedia.gifs;
    if(selectedMedia.audio) data.audio = selectedMedia.audio;
    
    db.collection('siteData').doc('config').set(data, { merge: true }).then(() => {
        alert("✅ تم حفظ جميع الإعدادات وتحديث الموقع!");
    });
}

// تحميل جميع المكتبات
async function loadAllLibraries() {
    const types = ['videos', 'images', 'gifs', 'audio'];
    for(let type of types) {
        await loadLibraryByType(type);
    }
}

// تحميل مكتبة حسب النوع
async function loadLibraryByType(type) {
    const { data, error } = await supabaseClient.storage.from(bucketName).list(`${type}/`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
    });

    if (error) {
        console.error(`Library Error (${type}):`, error);
        return;
    }

    mediaLibrary[type] = data;
    renderLibrary(type, data);
}

// عرض المكتبة
function renderLibrary(type, files) {
    const containerId = `library-${type}`;
    const container = document.getElementById(containerId);
    
    if(!files || files.length === 0) {
        container.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color:#666;">لا توجد ملفات في هذا القسم.</p>`;
        return;
    }

    container.innerHTML = files.map(file => {
        const { data } = supabaseClient.storage.from(bucketName).getPublicUrl(`${type}/${file.name}`);
        let preview = '';
        
        if(type === 'videos') preview = `<video src="${data.publicUrl}" muted></video>`;
        else if(type === 'audio') preview = `<div style="height:80px; display:flex; align-items:center; justify-content:center; background:#333;"><i class="fas fa-music fa-2x"></i></div>`;
        else preview = `<img src="${data.publicUrl}" alt="${file.name}">`;

        return `
            <div class="media-item" onclick="selectMediaItem(this, '${data.publicUrl}', '${type}')">
                ${preview}
                <div class="media-info" title="${file.name}">${file.name}</div>
            </div>
        `;
    }).join('');
}

// اختيار ملف من المكتبة
function selectMediaItem(element, url, type) {
    document.querySelectorAll(`#library-${type} .media-item`).forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    selectedMedia[type] = url;
}

// استخدام الملف المختار
function useSelectedMedia(type) {
    if(!selectedMedia[type]) {
        alert("من فضلك اختر ملفاً أولاً!");
        return;
    }
    
    const data = {
        backgroundType: type
    };
    data[type] = selectedMedia[type];
    
    db.collection('siteData').doc('config').set(data, { merge: true }).then(() => {
        alert(`✅ تم تعيين ${type === 'audio' ? 'الصوت' : 'الخلفية'} بنجاح!`);
    });
}

// البحث في المكتبة
function filterLibrary(type) {
    const term = document.getElementById(`search-${type}`).value.toLowerCase();
    const filtered = mediaLibrary[type].filter(f => f.name.toLowerCase().includes(term));
    renderLibrary(type, filtered);
}

// رفع ملف للمكتبة
async function uploadMedia(type) {
    const fileInput = document.getElementById(`upload-${type}`);
    const statusMsg = document.getElementById(`upload-status-${type}`);
    const file = fileInput.files[0];

    if(!file) {
        alert("اختر ملفاً أولاً!");
        return;
    }

    statusMsg.innerText = "جاري الرفع...";
    statusMsg.style.color = "#007bff";

    const fileName = `${Date.now()}_${file.name}`;
    const path = `${type}/${fileName}`;
    
    const { data, error } = await supabaseClient.storage.from(bucketName).upload(path, file);

    if (error) {
        statusMsg.innerText = "❌ فشل الرفع: " + error.message;
        statusMsg.style.color = "red";
    } else {
        statusMsg.innerText = "✅ تم الرفع بنجاح!";
        statusMsg.style.color = "#28a745";
        fileInput.value = "";
        loadLibraryByType(type);
    }
}

// تحميل الروابط الخارجية
function loadOnlineLinks() {
    db.collection('siteData').doc('onlineLinks').get().then(doc => {
        if(doc.exists) {
            onlineLinks = doc.data();
            renderOnlineLinks();
        }
    });
}

// عرض الروابط الخارجية
function renderOnlineLinks() {
    const container = document.getElementById('online-links-list');
    let html = '';
    
    for(let type in onlineLinks) {
        if(Array.isArray(onlineLinks[type])) {
            onlineLinks[type].forEach((link, index) => {
                const typeLabel = { videos: 'فيديو', images: 'صورة', gifs: 'GIF', audio: 'صوت' }[type] || type;
                const escapedUrl = (link.url || '').replace(/'/g, "\\'");
                const displayName = link.name || link.url.substring(0, 30);
                html += `
                    <div class="link-item" onclick="selectOnlineLink(this, '${escapedUrl}', '${type}')">
                        <span>${displayName}... (${typeLabel})</span>
                        <button onclick="event.stopPropagation(); deleteOnlineLink('${type}', ${index})">حذف</button>
                    </div>
                `;
            });
        }
    }
    
    container.innerHTML = html || '<p style="color:#666;">لا توجد روابط محفوظة.</p>';
}

// إضافة رابط خارجي
function addOnlineLink() {
    const url = document.getElementById('online-url').value.trim();
    const name = document.getElementById('online-name').value.trim();
    const type = document.getElementById('online-type').value;

    if(!url) {
        alert("أدخل رابطاً صحيحاً!");
        return;
    }

    if(!onlineLinks[type]) onlineLinks[type] = [];
    
    onlineLinks[type].push({ url, name: name || url });
    
    db.collection('siteData').doc('onlineLinks').set(onlineLinks, { merge: true }).then(() => {
        alert("✅ تم إضافة الرابط!");
        document.getElementById('online-url').value = "";
        document.getElementById('online-name').value = "";
        renderOnlineLinks();
    });
}

// اختيار رابط خارجي
function selectOnlineLink(element, url, type) {
    if(element && element.classList) {
        document.querySelectorAll('.link-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }
    if(selectedMedia && type) {
        selectedMedia[type] = url;
    }
}

// حذف رابط خارجي
function deleteOnlineLink(type, index) {
    if(confirm("هل تريد حذف هذا الرابط؟")) {
        onlineLinks[type].splice(index, 1);
        db.collection('siteData').doc('onlineLinks').set(onlineLinks, { merge: true }).then(() => {
            renderOnlineLinks();
        });
    }
}
