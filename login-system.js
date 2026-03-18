// ========== نظام الدخول المحسّن - Login System ==========

// متغيرات عامة
let captchaAnswer = '';
const AUTHORIZED_EMAIL = 'abdallah.ali2812@gmail.com';
const AUTHORIZED_PASSWORD = 'Abdallah.ali2882011';

// ========== دالة توليد CAPTCHA ==========
function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    captchaAnswer = '';
    for (let i = 0; i < 5; i++) {
        captchaAnswer += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const puzzle = document.getElementById('captcha-puzzle');
    if (puzzle) {
        puzzle.textContent = captchaAnswer;
        puzzle.style.transform = 'rotate(' + (Math.random() * 6 - 3) + 'deg)';
        puzzle.style.opacity = '0.8';
    }
}

// ========== دالة التحقق من CAPTCHA ==========
function validateCaptcha() {
    const captchaInput = document.getElementById('captcha-answer');
    const answer = captchaInput ? captchaInput.value.toUpperCase() : '';
    return answer === captchaAnswer;
}

// ========== دالة إظهار/إخفاء كلمة المرور ==========
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        if (toggleBtn) {
            toggleBtn.classList.remove('fa-eye');
            toggleBtn.classList.add('fa-eye-slash');
        }
    } else {
        passwordInput.type = 'password';
        if (toggleBtn) {
            toggleBtn.classList.remove('fa-eye-slash');
            toggleBtn.classList.add('fa-eye');
        }
    }
}

// ========== دالة الدخول الرئيسية ==========
function attemptLogin() {
    console.log('🔐 محاولة الدخول...');
    
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-msg');
    
    if (!emailInput || !passInput || !errorMsg) {
        console.error('❌ عناصر الدخول غير موجودة في الصفحة');
        return;
    }
    
    const email = emailInput.value.trim();
    const pass = passInput.value;
    
    // التحقق من عدم ترك الحقول فارغة
    if (!email || !pass) {
        errorMsg.innerText = "يرجى إدخال البريد الإلكتروني وكلمة المرور";
        errorMsg.style.display = "block";
        return;
    }
    
    // التحقق من CAPTCHA
    if (!validateCaptcha()) {
        errorMsg.innerText = "❌ إجابة CAPTCHA غير صحيحة. حاول مجدداً.";
        errorMsg.style.display = "block";
        generateCaptcha();
        const cInput = document.getElementById('captcha-answer');
        if(cInput) cInput.value = '';
        return;
    }
    
    // التحقق من البريد الإلكتروني وكلمة المرور
    if (email.toLowerCase() === AUTHORIZED_EMAIL.toLowerCase() && pass === AUTHORIZED_PASSWORD) {
        console.log('✅ تم التحقق بنجاح');
        
        // إخفاء شاشة الدخول وإظهار لوحة التحكم
        const loginOverlay = document.getElementById('login-overlay');
        const adminPanel = document.getElementById('admin-panel');
        
        if (loginOverlay) loginOverlay.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'flex';
        
        // إظهار رسالة النجاح
        if (typeof showSuccess === 'function') {
            showSuccess('✅ مرحباً', 'تم تسجيل الدخول بنجاح');
        }
        
        // تحميل البيانات
        if (typeof loadData === 'function') {
            loadData();
        }
    } else {
        errorMsg.innerText = "❌ البريد الإلكتروني أو كلمة المرور غير صحيحة!";
        errorMsg.style.display = "block";
        generateCaptcha();
        const cInput = document.getElementById('captcha-answer');
        if(cInput) cInput.value = '';
    }
}

// ========== تهيئة النظام عند تحميل الصفحة ==========
document.addEventListener('DOMContentLoaded', function() {
    generateCaptcha();
    
    const inputs = ['email', 'password', 'captcha-answer'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') attemptLogin();
            });
        }
    });
});

// ========== دالة تسجيل الخروج ==========
function logout() {
    console.log('👋 تسجيل خروج...');
    
    // إذا كان هناك جلسة فايربيس
    if (typeof auth !== 'undefined' && auth.signOut) {
        auth.signOut();
    }
    
    const loginOverlay = document.getElementById('login-overlay');
    const adminPanel = document.getElementById('admin-panel');
    
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (adminPanel) adminPanel.style.display = 'none';
    
    // مسح الحقول
    const fields = ['email', 'password', 'captcha-answer'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    const errorMsg = document.getElementById('error-msg');
    if (errorMsg) errorMsg.style.display = 'none';
    
    generateCaptcha();
    console.log('✅ تم تسجيل الخروج');
}
