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
        console.warn('⚠️ حقول فارغة');
        return;
    }
    
    // التحقق من CAPTCHA
    if (!validateCaptcha()) {
        errorMsg.innerText = "❌ إجابة CAPTCHA غير صحيحة. حاول مجدداً.";
        errorMsg.style.display = "block";
        generateCaptcha();
        document.getElementById('captcha-answer').value = '';
        console.warn('⚠️ CAPTCHA غير صحيح');
        return;
    }
    
    // التحقق من البريد الإلكتروني
    if (email.toLowerCase() !== AUTHORIZED_EMAIL.toLowerCase()) {
        errorMsg.innerText = "❌ هذا الإيميل غير مصرح له كمسؤول!";
        errorMsg.style.display = "block";
        console.warn('⚠️ بريد غير معتمد');
        return;
    }
    
    // التحقق من كلمة المرور
    if (pass !== AUTHORIZED_PASSWORD) {
        errorMsg.innerText = "❌ كلمة المرور غير صحيحة!";
        errorMsg.style.display = "block";
        generateCaptcha();
        document.getElementById('captcha-answer').value = '';
        console.warn('⚠️ كلمة مرور خاطئة');
        return;
    }
    
    // نجح الدخول
    console.log('✅ تم التحقق من جميع البيانات بنجاح');
    
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
    
    console.log('✅ تم الدخول بنجاح');
}

// ========== تهيئة النظام عند تحميل الصفحة ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 تم تحميل الصفحة - بدء تهيئة نظام الدخول');
    
    // توليد CAPTCHA
    generateCaptcha();
    
    // إضافة مستمعين للمفاتيح
    const passInput = document.getElementById('password');
    const captchaInput = document.getElementById('captcha-answer');
    const emailInput = document.getElementById('email');
    
    if (emailInput) {
        emailInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') attemptLogin();
        });
    }
    
    if (passInput) {
        passInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') attemptLogin();
        });
    }
    
    if (captchaInput) {
        captchaInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') attemptLogin();
        });
    }
    
    console.log('✅ تم تهيئة نظام الدخول بنجاح');
});

// ========== دالة تسجيل الخروج ==========
function logout() {
    console.log('👋 تسجيل خروج...');
    
    const loginOverlay = document.getElementById('login-overlay');
    const adminPanel = document.getElementById('admin-panel');
    
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (adminPanel) adminPanel.style.display = 'none';
    
    // مسح الحقول
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const captchaInput = document.getElementById('captcha-answer');
    
    if (emailInput) emailInput.value = '';
    if (passInput) passInput.value = '';
    if (captchaInput) captchaInput.value = '';
    
    // إعادة توليد CAPTCHA
    generateCaptcha();
    
    console.log('✅ تم تسجيل الخروج');
}
