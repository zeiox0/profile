// إعدادات Supabase الصحيحة
const SUPABASE_URL = "https://mtdevelmgoinumifpcpb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZGV2ZWxtZ29pbnVtaWZwY3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzM0MTMsImV4cCI6MjA4ODM0OTQxM30.xronBSbgZPVd79VDTEoLuB3XsCwQwGfB_uCW2hPIlMQ";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const AUTHORIZED_EMAIL = "abdallah.ali2812@gmail.com";

// إعدادات الضغط
const COMPRESSION_SETTINGS = {
    video: {
        maxSize: 50 * 1024 * 1024, // 50 MB
        quality: 23, // CRF (0-51)
        bitrate: '2500k',
        preset: 'medium'
    },
    audio: {
        maxSize: 20 * 1024 * 1024, // 20 MB
        bitrate: '192k',
        quality: 4
    }
};

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

// جلب البيانات الأساسية عند الدخول
function loadData() {
    db.collection('siteData').doc('config').get().then(doc => {
        if(doc.exists) {
            const d = doc.data();
            document.getElementById('admin-name').value = d.name || "";
            document.getElementById('admin-bio').value = d.bio || "";
        }
    });
}

// حفظ البيانات الأساسية
function saveData() {
    const data = {
        name: document.getElementById('admin-name').value,
        bio: document.getElementById('admin-bio').value
    };
    db.collection('siteData').doc('config').set(data, { merge: true }).then(() => {
        alert("✅ تم حفظ البيانات الشخصية!");
    });
}

/**
 * معالجة الفيديو والصوت مع الضغط
 * @param {String} type - نوع الملف (video أو audio)
 */
async function handleMediaAction(type) {
    const linkInput = document.getElementById(`${type}-link`).value.trim();
    const fileInput = document.getElementById(`${type}-file`).files[0];
    const statusMsg = document.getElementById(`${type}-status`);
    const progressBar = document.getElementById(`${type}-progress-bar`);
    const progressContainer = document.getElementById(`${type}-progress-container`);

    statusMsg.innerText = "";
    if (progressContainer) progressContainer.style.display = 'none';

    // إذا أدخل رابط مباشر
    if (linkInput) {
        statusMsg.innerText = "جاري حفظ الرابط المباشر...";
        updateFirebaseMedia(type, linkInput, statusMsg);
    } 
    // إذا اختار ملف للرفع
    else if (fileInput) {
        try {
            statusMsg.innerText = "جاري فحص الملف...";
            
            // التحقق من نوع الملف
            const isVideo = type === 'video';
            const isAudio = type === 'audio';
            
            if (isVideo && !fileInput.type.startsWith('video/')) {
                throw new Error('الملف يجب أن يكون فيديو');
            }
            if (isAudio && !fileInput.type.startsWith('audio/')) {
                throw new Error('الملف يجب أن يكون صوت');
            }
            
            // عرض شريط التقدم
            if (progressContainer) progressContainer.style.display = 'block';
            
            // ضغط الملف
            statusMsg.innerText = `جاري ضغط ${type === 'video' ? 'الفيديو' : 'الصوت'}... قد يستغرق وقتاً`;
            
            let compressedFile;
            if (isVideo) {
                const compressedBlob = await compressVideo(fileInput, (progress) => {
                    if (progressBar) progressBar.style.width = progress + '%';
                });
                compressedFile = blobToFile(compressedBlob, `compressed_${Date.now()}.mp4`);
            } else if (isAudio) {
                const compressedBlob = await compressAudio(fileInput, (progress) => {
                    if (progressBar) progressBar.style.width = progress + '%';
                });
                compressedFile = blobToFile(compressedBlob, `compressed_${Date.now()}.mp3`);
            }
            
            // الحصول على معلومات الملف الأصلي والمضغوط
            const originalSize = (fileInput.size / (1024 * 1024)).toFixed(2);
            const compressedSize = (compressedFile.size / (1024 * 1024)).toFixed(2);
            const compressionRatio = ((1 - compressedFile.size / fileInput.size) * 100).toFixed(2);
            
            statusMsg.innerText = `✅ تم الضغط! الحجم الأصلي: ${originalSize}MB → المضغوط: ${compressedSize}MB (توفير: ${compressionRatio}%)`;
            
            // رفع الملف المضغوط
            statusMsg.innerText = "جاري رفع الملف إلى Supabase...";
            const fileName = `${type}_${Date.now()}_${compressedFile.name}`;
            const bucketName = 'Abdallah';

            const { data, error } = await supabaseClient.storage
                .from(bucketName)
                .upload(fileName, compressedFile);

            if (error) {
                statusMsg.innerText = "❌ فشل الرفع: " + error.message;
                console.error('Supabase Error:', error);
                alert("تأكد من إعدادات الـ Policies في سوبابيس والتأكد من أن اسم المخزن صحيح.");
            } else {
                const { data: urlData } = supabaseClient.storage.from(bucketName).getPublicUrl(fileName);
                updateFirebaseMedia(type, urlData.publicUrl, statusMsg);
            }
            
            if (progressContainer) progressContainer.style.display = 'none';
        } catch (error) {
            statusMsg.innerText = "❌ خطأ: " + error.message;
            console.error('Error:', error);
            if (progressContainer) progressContainer.style.display = 'none';
        }
    } 
    // إذا لم يقم بإدخال شيء
    else {
        alert("من فضلك أدخل رابطاً مباشراً أو اختر ملفاً للرفع!");
    }
}

/**
 * تحديث قاعدة البيانات بالرابط النهائي
 * @param {String} type - نوع الملف
 * @param {String} url - رابط الملف
 * @param {Element} statusMsgElement - عنصر رسالة الحالة
 */
function updateFirebaseMedia(type, url, statusMsgElement) {
    db.collection('siteData').doc('config').update({ [type]: url })
      .then(() => {
          statusMsgElement.innerText = "✅ تم تحديث الموقع بنجاح!";
          // إعادة تعيين حقول الإدخال
          document.getElementById(`${type}-link`).value = '';
          document.getElementById(`${type}-file`).value = '';
      })
      .catch(err => {
          statusMsgElement.innerText = "❌ حدث خطأ أثناء التحديث.";
          console.error('Firebase Error:', err);
      });
}

/**
 * عرض معلومات الملف المختار
 * @param {String} type - نوع الملف
 */
function displayFileInfo(type) {
    const fileInput = document.getElementById(`${type}-file`);
    const infoElement = document.getElementById(`${type}-info`);
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const info = getFileInfo(file);
        
        if (infoElement) {
            infoElement.innerHTML = `
                <small style="color: #888;">
                    📄 ${info.name}<br>
                    💾 الحجم: ${info.size} MB<br>
                    🕐 التاريخ: ${info.lastModified}
                </small>
            `;
        }
    }
}
