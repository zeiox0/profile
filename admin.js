// إعدادات Supabase الصحيحة
const SUPABASE_URL = "https://mtdevelmgoinumifpcpb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZGV2ZWxtZ29pbnVtaWZwY3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzM0MTMsImV4cCI6MjA4ODM0OTQxM30.xronBSbgZPVd79VDTEoLuB3XsCwQwGfB_uCW2hPIlMQ";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const AUTHORIZED_EMAIL = "abdallah.ali2812@gmail.com";

// قائمة الأيقونات المتاحة
const availableIcons = [
    { name: 'Discord', icon: 'fab fa-discord', placeholder: 'https://discord.com/users/YOUR_ID' },
    { name: 'YouTube', icon: 'fab fa-youtube', placeholder: 'https://youtube.com/@YOUR_CHANNEL' },
    { name: 'TikTok', icon: 'fab fa-tiktok', placeholder: 'https://tiktok.com/@YOUR_USERNAME' },
    { name: 'Steam', icon: 'fab fa-steam', placeholder: 'https://steamcommunity.com/id/YOUR_ID' },
    { name: 'SoundCloud', icon: 'fab fa-soundcloud', placeholder: 'https://soundcloud.com/YOUR_USERNAME' },
    { name: 'Twitch', icon: 'fab fa-twitch', placeholder: 'https://twitch.tv/YOUR_USERNAME' },
    { name: 'Twitter', icon: 'fab fa-twitter', placeholder: 'https://twitter.com/YOUR_USERNAME' },
    { name: 'Instagram', icon: 'fab fa-instagram', placeholder: 'https://instagram.com/YOUR_USERNAME' },
    { name: 'GitHub', icon: 'fab fa-github', placeholder: 'https://github.com/YOUR_USERNAME' },
    { name: 'LinkedIn', icon: 'fab fa-linkedin', placeholder: 'https://linkedin.com/in/YOUR_PROFILE' },
    { name: 'Facebook', icon: 'fab fa-facebook', placeholder: 'https://facebook.com/YOUR_PROFILE' },
    { name: 'Reddit', icon: 'fab fa-reddit', placeholder: 'https://reddit.com/u/YOUR_USERNAME' }
];

let socialLinksData = [];

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
        loadData(); 
    })
    .catch((error) => {
        errorMsg.innerText = "خطأ: الباسورد غلط أو الحساب غير مفعل.";
        errorMsg.style.display = "block";
    });
}

function loadData() {
    db.collection('siteData').doc('config').get().then(doc => {
        if(doc.exists) {
            const d = doc.data();
            document.getElementById('admin-name').value = d.name || "";
            document.getElementById('admin-bio').value = d.bio || "";
            
            // تحميل أيقونات التواصل الاجتماعي
            if (d.socialLinks && Array.isArray(d.socialLinks)) {
                socialLinksData = d.socialLinks;
            }
            renderSocialLinks();
        }
    });
}

function saveData() {
    const data = {
        name: document.getElementById('admin-name').value,
        bio: document.getElementById('admin-bio').value
    };
    db.collection('siteData').doc('config').set(data, { merge: true }).then(() => {
        alert("✅ تم حفظ البيانات الشخصية!");
    });
}

// وظائف إدارة أيقونات التواصل الاجتماعي
function renderSocialLinks() {
    const container = document.getElementById('social-links-container');
    container.innerHTML = '';
    
    socialLinksData.forEach((link, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'background: #222; padding: 12px; border-radius: 5px; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;';
        
        const iconDisplay = document.createElement('i');
        iconDisplay.className = link.icon;
        iconDisplay.style.cssText = 'font-size: 1.5rem; color: #007bff; width: 30px; text-align: center;';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = link.url;
        input.placeholder = link.placeholder;
        input.style.cssText = 'flex: 1; padding: 8px; background: #333; border: 1px solid #555; color: #fff; border-radius: 3px;';
        input.onchange = (e) => {
            socialLinksData[index].url = e.target.value;
        };
        
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '❌';
        removeBtn.style.cssText = 'background: #ff4444; border: none; color: #fff; padding: 8px 12px; border-radius: 3px; cursor: pointer;';
        removeBtn.onclick = () => {
            socialLinksData.splice(index, 1);
            renderSocialLinks();
        };
        
        div.appendChild(iconDisplay);
        div.appendChild(input);
        div.appendChild(removeBtn);
        container.appendChild(div);
    });
}

function addSocialLink() {
    const select = document.createElement('select');
    select.style.cssText = 'width: 100%; padding: 10px; background: #333; border: 1px solid #555; color: #fff; border-radius: 3px; margin-bottom: 10px;';
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'اختر أيقونة...';
    select.appendChild(defaultOption);
    
    availableIcons.forEach(icon => {
        const option = document.createElement('option');
        option.value = JSON.stringify(icon);
        option.text = icon.name;
        select.appendChild(option);
    });
    
    const container = document.getElementById('social-links-container');
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = 'background: #222; padding: 12px; border-radius: 5px; margin-bottom: 10px;';
    
    const label = document.createElement('p');
    label.innerText = 'اختر أيقونة جديدة:';
    label.style.cssText = 'color: #ccc; margin-bottom: 8px;';
    
    tempDiv.appendChild(label);
    tempDiv.appendChild(select);
    
    const addBtn = document.createElement('button');
    addBtn.innerText = 'إضافة';
    addBtn.style.cssText = 'background: #007bff; border: none; color: #fff; padding: 8px 16px; border-radius: 3px; cursor: pointer; width: 100%; margin-top: 8px;';
    addBtn.onclick = () => {
        if (select.value) {
            const selectedIcon = JSON.parse(select.value);
            socialLinksData.push({
                name: selectedIcon.name,
                icon: selectedIcon.icon,
                url: '',
                placeholder: selectedIcon.placeholder
            });
            tempDiv.remove();
            renderSocialLinks();
        }
    };
    
    tempDiv.appendChild(addBtn);
    container.appendChild(tempDiv);
}

function saveSocialLinks() {
    db.collection('siteData').doc('config').set({ socialLinks: socialLinksData }, { merge: true }).then(() => {
        alert("✅ تم حفظ أيقونات التواصل الاجتماعي!");
    }).catch(err => {
        alert("❌ حدث خطأ في الحفظ: " + err.message);
    });
}

async function handleMediaAction(type) {
    const linkInput = document.getElementById(`${type}-link`).value.trim();
    const fileInput = document.getElementById(`${type}-file`).files[0];
    const statusMsg = document.getElementById(`${type}-status`);
    const progressBar = document.getElementById(`${type}-progress-bar`);
    const progressContainer = document.getElementById(`${type}-progress-container`);
    const skipCompression = document.getElementById(`skip-${type}-compression`)?.checked;

    statusMsg.innerText = "";
    if (progressContainer) progressContainer.style.display = 'none';

    if (linkInput) {
        statusMsg.innerText = "جاري حفظ الرابط المباشر...";
        updateFirebaseMedia(type, linkInput, statusMsg);
    } 
    else if (fileInput) {
        try {
            statusMsg.innerText = "جاري معالجة الملف...";
            if (progressContainer) progressContainer.style.display = 'block';
            if (progressBar) progressBar.style.width = '0%';

            let fileToUpload = fileInput;

            // تنفيذ الضغط إذا لم يتم اختيار التخطي
            if (!skipCompression) {
                statusMsg.innerText = "جاري الضغط... يرجى الانتظار";
                try {
                    if (type === 'video') {
                        const blob = await compressVideo(fileInput, (p) => {
                            if (progressBar) progressBar.style.width = p + '%';
                            if (progressBar) progressBar.innerText = p + '%';
                        });
                        fileToUpload = blobToFile(blob, `compressed_${Date.now()}.mp4`);
                    } else {
                        const blob = await compressAudio(fileInput, (p) => {
                            if (progressBar) progressBar.style.width = p + '%';
                            if (progressBar) progressBar.innerText = p + '%';
                        });
                        fileToUpload = blobToFile(blob, `compressed_${Date.now()}.mp3`);
                    }
                } catch (err) {
                    console.error("Compression failed, falling back to original file:", err);
                    statusMsg.innerText = "⚠️ فشل الضغط، سيتم رفع الملف الأصلي...";
                    fileToUpload = fileInput;
                }
            }

            statusMsg.innerText = "جاري الرفع إلى السيرفر...";
            const fileName = `${type}_${Date.now()}_${fileToUpload.name.replace(/\s+/g, '_')}`;
            const bucketName = 'Abdallah';

            const { data, error } = await supabaseClient.storage
                .from(bucketName)
                .upload(fileName, fileToUpload, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                throw error;
            } else {
                const { data: urlData } = supabaseClient.storage.from(bucketName).getPublicUrl(fileName);
                updateFirebaseMedia(type, urlData.publicUrl, statusMsg);
            }
        } catch (error) {
            statusMsg.innerText = "❌ حدث خطأ: " + (error.message || "فشل الرفع");
            console.error('Error details:', error);
        } finally {
            setTimeout(() => {
                if (progressContainer) progressContainer.style.display = 'none';
            }, 2000);
        }
    } 
    else {
        alert("من فضلك أدخل رابطاً أو اختر ملفاً!");
    }
}

function updateFirebaseMedia(type, url, statusMsgElement) {
    db.collection('siteData').doc('config').update({ [type]: url })
      .then(() => {
          statusMsgElement.innerText = "✅ تم التحديث بنجاح!";
          statusMsgElement.style.color = "#00ff00";
          document.getElementById(`${type}-link`).value = '';
          document.getElementById(`${type}-file`).value = '';
      })
      .catch(err => {
          statusMsgElement.innerText = "❌ خطأ في تحديث قاعدة البيانات.";
          statusMsgElement.style.color = "#ff4444";
          console.error('Firebase Error:', err);
      });
}

function displayFileInfo(type) {
    const fileInput = document.getElementById(`${type}-file`);
    const infoElement = document.getElementById(`${type}-info`);
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const size = (file.size / (1024 * 1024)).toFixed(2);
        infoElement.innerHTML = `<small style="color: #888;">📄 ${file.name} (${size} MB)</small>`;
    }
}
