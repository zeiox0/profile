const AUTHORIZED_EMAIL = "abdallah.ali2812@gmail.com";
let currentData = {};

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
        document.getElementById('admin-panel').style.display = 'block';
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
            // تهيئة المستند إذا لم يكن موجوداً
            db.collection('siteData').doc('config').set({
                name: "Abdallah",
                bio: "Hi I 👋",
                videos: [],
                images: [],
                audios: [],
                apps: [],
                socialLinks: []
            });
        }
    }, error => {
        console.error("Load data error:", error);
    });
}

function renderAdminPanel() {
    document.getElementById('admin-name').value = currentData.name || "";
    document.getElementById('admin-bio').value = currentData.bio || "";
    
    renderMediaList('video-list', currentData.videos || [], 'videos');
    renderMediaList('image-list', currentData.images || [], 'images');
    renderMediaList('audio-list', currentData.audios || [], 'audios');
}

function renderMediaList(containerId, list, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    list.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'media-item';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.padding = '10px';
        div.style.background = 'rgba(255,255,255,0.05)';
        div.style.marginBottom = '5px';
        div.style.borderRadius = '5px';
        
        div.innerHTML = `
            <span>${item.name || (item.url ? item.url.split('/').pop().substring(0, 20) : 'Unnamed')}</span>
            <button onclick="removeItem('${type}', ${index})" style="background:none; border:none; color:red; cursor:pointer;">❌</button>
        `;
        container.appendChild(div);
    });
}

function saveProfileData() {
    const name = document.getElementById('admin-name').value;
    const bio = document.getElementById('admin-bio').value;
    db.collection('siteData').doc('config').update({ name, bio })
    .then(() => alert("✅ تم حفظ البيانات الشخصية!"))
    .catch(err => alert("❌ خطأ في الحفظ: " + err.message));
}

function addVideo() {
    const url = document.getElementById('video-url').value;
    const loop = document.getElementById('video-loop').checked;
    if (!url) return alert("يرجى إدخال الرابط");
    
    const videos = currentData.videos || [];
    videos.push({ url, loop });
    db.collection('siteData').doc('config').update({ videos })
    .then(() => {
        document.getElementById('video-url').value = '';
        alert("✅ تم إضافة الفيديو!");
    });
}

function addImage() {
    const url = document.getElementById('image-url').value;
    const duration = document.getElementById('image-duration').value;
    if (!url) return alert("يرجى إدخال الرابط");
    
    const images = currentData.images || [];
    images.push({ url, duration: parseInt(duration) || 5 });
    db.collection('siteData').doc('config').update({ images })
    .then(() => {
        document.getElementById('image-url').value = '';
        alert("✅ تم إضافة الصورة!");
    });
}

function addAudio() {
    const url = document.getElementById('audio-url').value;
    const name = document.getElementById('audio-name').value;
    const artist = document.getElementById('audio-artist').value;
    if (!url) return alert("يرجى إدخال الرابط");
    
    const audios = currentData.audios || [];
    audios.push({ url, name: name || "مجهول", artist: artist || "فنان غير معروف" });
    db.collection('siteData').doc('config').update({ audios })
    .then(() => {
        document.getElementById('audio-url').value = '';
        document.getElementById('audio-name').value = '';
        document.getElementById('audio-artist').value = '';
        alert("✅ تم إضافة الصوت!");
    });
}

function removeItem(type, index) {
    const list = [...(currentData[type] || [])];
    list.splice(index, 1);
    db.collection('siteData').doc('config').update({ [type]: list });
}

function logout() {
    auth.signOut().then(() => location.reload());
}

// إضافة مستمع لحدث الضغط على Enter في شاشة الدخول
document.addEventListener('DOMContentLoaded', () => {
    const passInput = document.getElementById('password');
    if (passInput) {
        passInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') attemptLogin();
        });
    }
});
