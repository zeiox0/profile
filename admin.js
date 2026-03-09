// إعدادات Supabase الصحيحة
const SUPABASE_URL = "https://mtdevelmgoinumifpcpb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZGV2ZWxtZ29pbnVtaWZwY3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzM0MTMsImV4cCI6MjA4ODM0OTQxM30.xronBSbgZPVd79VDTEoLuB3XsCwQwGfB_uCW2hPIlMQ";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const AUTHORIZED_EMAIL = "abdallah.ali2812@gmail.com";
const bucketName = 'Abdallah'; 

let mediaFiles = []; // قائمة الملفات في المكتبة
let selectedMediaUrl = ""; // الرابط المختار حالياً من المكتبة

// وظيفة تسجيل الدخول
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
        loadLibrary(); // تحميل المكتبة عند الدخول
    })
    .catch((error) => {
        errorMsg.innerText = "خطأ: الباسورد غلط أو الحساب غير مفعل.";
        errorMsg.style.display = "block";
    });
}

// تبديل التبويبات
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).style.display = 'block';
    event.target.classList.add('active');
}

// تحديث عرض القيمة للشريط المنزلق (Range)
function updateRangeVal(id, val) {
    document.getElementById(`${id}-val`).innerText = val;
}

// جلب جميع البيانات
function loadAllData() {
    db.collection('siteData').doc('config').get().then(doc => {
        if(doc.exists) {
            const d = doc.data();
            document.getElementById('admin-name').value = d.name || "";
            document.getElementById('admin-bio').value = d.bio || "";
            document.getElementById('video-link').value = d.video || "";
            document.getElementById('audio-link').value = d.audio || "";
            
            // إعدادات الفيديو والصوت
            if(d.videoSpeed) {
                document.getElementById('video-speed').value = d.videoSpeed;
                updateRangeVal('speed', d.videoSpeed + 'x');
            }
            if(d.bgVolume !== undefined) {
                document.getElementById('bg-volume').value = d.bgVolume;
                updateRangeVal('volume', Math.round(d.bgVolume*100)+'%');
            }
            if(d.videoFit) {
                document.getElementById('video-fit').value = d.videoFit;
            }
        }
    });
}

// حفظ جميع الإعدادات
function saveAllSettings() {
    const data = {
        name: document.getElementById('admin-name').value,
        bio: document.getElementById('admin-bio').value,
        video: document.getElementById('video-link').value,
        audio: document.getElementById('audio-link').value,
        videoSpeed: parseFloat(document.getElementById('video-speed').value),
        bgVolume: parseFloat(document.getElementById('bg-volume').value),
        videoFit: document.getElementById('video-fit').value
    };
    
    db.collection('siteData').doc('config').set(data, { merge: true }).then(() => {
        alert("✅ تم حفظ جميع الإعدادات وتحديث الموقع!");
    });
}

// تحميل المكتبة من سوبابيس
async function loadLibrary() {
    const libraryContainer = document.getElementById('media-library');
    const { data, error } = await supabaseClient.storage.from(bucketName).list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
    });

    if (error) {
        console.error("Library Error:", error);
        libraryContainer.innerHTML = `<p style="color:red;">خطأ في تحميل المكتبة: ${error.message}</p>`;
        return;
    }

    mediaFiles = data;
    renderLibrary(mediaFiles);
}

// عرض المكتبة
function renderLibrary(files) {
    const libraryContainer = document.getElementById('media-library');
    if(files.length === 0) {
        libraryContainer.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color:#666;">المكتبة فارغة حالياً.</p>`;
        return;
    }

    libraryContainer.innerHTML = files.map(file => {
        const { data } = supabaseClient.storage.from(bucketName).getPublicUrl(file.name);
        const isVideo = file.name.match(/\.(mp4|webm|ogg)$/i);
        const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        const isAudio = file.name.match(/\.(mp3|wav|ogg)$/i);

        let preview = '';
        if(isVideo) preview = `<video src="${data.publicUrl}" muted></video>`;
        else if(isImage) preview = `<img src="${data.publicUrl}" alt="${file.name}">`;
        else if(isAudio) preview = `<div style="height:100px; display:flex; align-items:center; justify-content:center; background:#333;"><i class="fas fa-music fa-2x"></i></div>`;
        else preview = `<div style="height:100px; display:flex; align-items:center; justify-content:center; background:#333;"><i class="fas fa-file fa-2x"></i></div>`;

        return `
            <div class="media-item" onclick="selectMedia(this, '${data.publicUrl}')">
                ${preview}
                <div class="media-info" title="${file.name}">${file.name}</div>
            </div>
        `;
    }).join('');
}

// اختيار ملف من المكتبة
function selectMedia(element, url) {
    document.querySelectorAll('.media-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    selectedMediaUrl = url;
}

// استخدام الملف المختار
function useSelectedMedia(type) {
    if(!selectedMediaUrl) {
        alert("من فضلك اختر ملفاً من المكتبة أولاً!");
        return;
    }
    document.getElementById(`${type}-link`).value = selectedMediaUrl;
    alert(`✅ تم تعيين الرابط في حقل ${type === 'video' ? 'الفيديو' : 'الصوت'}. لا تنسى الضغط على حفظ!`);
}

// البحث في المكتبة
function filterLibrary() {
    const term = document.getElementById('library-search').value.toLowerCase();
    const filtered = mediaFiles.filter(f => f.name.toLowerCase().includes(term));
    renderLibrary(filtered);
}

// رفع ملف للمكتبة
async function uploadToLibrary() {
    const fileInput = document.getElementById('upload-file');
    const statusMsg = document.getElementById('upload-status');
    const file = fileInput.files[0];

    if(!file) {
        alert("اختر ملفاً أولاً!");
        return;
    }

    statusMsg.innerText = "جاري الرفع...";
    statusMsg.style.color = "#007bff";

    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabaseClient.storage.from(bucketName).upload(fileName, file);

    if (error) {
        statusMsg.innerText = "❌ فشل الرفع: " + error.message;
        statusMsg.style.color = "red";
    } else {
        statusMsg.innerText = "✅ تم الرفع بنجاح!";
        statusMsg.style.color = "#28a745";
        fileInput.value = "";
        loadLibrary(); // تحديث المكتبة
    }
}
