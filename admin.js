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

// الوظيفة المدمجة الجديدة لإدارة الفيديو والصوت (رابط أو رفع)
async function handleMediaAction(type) {
    const linkInput = document.getElementById(`${type}-link`).value.trim();
    const fileInput = document.getElementById(`${type}-file`).files[0];
    const statusMsg = document.getElementById(`${type}-status`);

    statusMsg.innerText = ""; // تصفير الرسالة

    // إذا أدخل رابط مباشر
    if (linkInput) {
        statusMsg.innerText = "جاري حفظ الرابط المباشر...";
        updateFirebaseMedia(type, linkInput, statusMsg);
    } 
    // إذا اختار ملف للرفع
    else if (fileInput) {
        statusMsg.innerText = "جاري رفع الملف لـ Supabase... برجاء الانتظار";
        const fileName = `${type}_${Date.now()}_${fileInput.name}`;
        
        // اسم المخزن الخاص بك في سوبابيس
        const bucketName = 'Abdallah'; 

        const { data, error } = await supabaseClient.storage
            .from(bucketName)
            .upload(fileName, fileInput);

        if (error) {
            statusMsg.innerText = "❌ فشل الرفع: " + error.message;
            alert("تأكد من إعدادات الـ Policies في سوبابيس.");
        } else {
            const { data: urlData } = supabaseClient.storage.from(bucketName).getPublicUrl(fileName);
            updateFirebaseMedia(type, urlData.publicUrl, statusMsg);
        }
    } 
    // إذا لم يقم بإدخال شيء
    else {
        alert("من فضلك أدخل رابطاً مباشراً أو اختر ملفاً للرفع!");
    }
}

// تحديث قاعدة البيانات بالرابط النهائي
function updateFirebaseMedia(type, url, statusMsgElement) {
    db.collection('siteData').doc('config').update({ [type]: url })
      .then(() => {
          statusMsgElement.innerText = "✅ تم تحديث الموقع بنجاح!";
      })
      .catch(err => {
          statusMsgElement.innerText = "❌ حدث خطأ أثناء التحديث.";
          console.error(err);
      });
}
