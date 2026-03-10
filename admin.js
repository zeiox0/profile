// إعدادات Supabase الصحيحة
const SUPABASE_URL = "https://mtdevelmgoinumifpcpb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZGV2ZWxtZ29pbnVtaWZwY3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzM0MTMsImV4cCI6MjA4ODM0OTQxM30.xronBSbgZPVd79VDTEoLuB3XsCwQwGfB_uCW2hPIlMQ";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const AUTHORIZED_EMAIL = "abdallah.ali2812@gmail.com";

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
            // لا نخفي شريط التقدم فوراً للسماح للمستخدم برؤية 100%
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
