const AUTHORIZED_EMAIL = "abdallah.ali2812@gmail.com";
let currentData = {};

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
        document.getElementById('admin-panel').style.display = 'block';
        loadData(); 
    })
    .catch((error) => {
        errorMsg.innerText = "خطأ: الباسورد غلط أو الحساب غير مفعل.";
        errorMsg.style.display = "block";
    });
}

function loadData() {
    db.collection('siteData').doc('config').onSnapshot(doc => {
        if(doc.exists) {
            currentData = doc.data();
            renderAdminPanel();
        }
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
    container.innerHTML = '';
    list.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'media-item';
        div.innerHTML = `
            <span>${item.name || item.url.split('/').pop()}</span>
            <button onclick="removeItem('${type}', ${index})">❌</button>
        `;
        container.appendChild(div);
    });
}

function saveProfileData() {
    const name = document.getElementById('admin-name').value;
    const bio = document.getElementById('admin-bio').value;
    db.collection('siteData').doc('config').update({ name, bio })
    .then(() => alert("✅ تم حفظ البيانات الشخصية!"));
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
    images.push({ url, duration: parseInt(duration) });
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
    audios.push({ url, name, artist });
    db.collection('siteData').doc('config').update({ audios })
    .then(() => {
        document.getElementById('audio-url').value = '';
        document.getElementById('audio-name').value = '';
        document.getElementById('audio-artist').value = '';
        alert("✅ تم إضافة الصوت!");
    });
}

function removeItem(type, index) {
    const list = currentData[type];
    list.splice(index, 1);
    db.collection('siteData').doc('config').update({ [type]: list });
}

function logout() {
    auth.signOut().then(() => location.reload());
}
