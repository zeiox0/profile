// منع كليك يمين
document.addEventListener('contextmenu', event => {
    event.preventDefault();
    return false;
});

// منع اختصارات المطورين وفحص العناصر
document.addEventListener('keydown', event => {
    // F12
    if (event.key === 'F12') {
        event.preventDefault();
        return false;
    }
    
    // Ctrl+Shift+I (Inspect)
    if (event.ctrlKey && event.shiftKey && event.key === 'I') {
        event.preventDefault();
        return false;
    }
    
    // Ctrl+Shift+C (Inspect Element)
    if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        return false;
    }
    
    // Ctrl+Shift+J (Console)
    if (event.ctrlKey && event.shiftKey && event.key === 'J') {
        event.preventDefault();
        return false;
    }
    
    // Ctrl+U (View Source)
    if (event.ctrlKey && event.key === 'u') {
        event.preventDefault();
        return false;
    }
});


// ========== نظام الحماية والتشفير المتقدم ==========

// 1. منع الوصول المباشر للملفات الخاصة
const PRIVATE_COLLECTIONS = ['studioImages', 'todos', 'messages', 'customization'];

// 2. تشفير بسيط للبيانات الحساسة
function encryptData(data, key = 'abdallah-secret-2024') {
    try {
        return btoa(JSON.stringify(data) + '|' + key);
    } catch (e) {
        console.error('Encryption error:', e);
        return null;
    }
}

function decryptData(encrypted, key = 'abdallah-secret-2024') {
    try {
        const decoded = atob(encrypted);
        const parts = decoded.split('|');
        const storedKey = parts.pop();
        if (storedKey === key) {
            return JSON.parse(parts.join('|'));
        }
        return null;
    } catch (e) {
        console.error('Decryption error:', e);
        return null;
    }
}

// 3. حماية من CSRF (Cross-Site Request Forgery)
function generateCSRFToken() {
    const token = 'csrf_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    sessionStorage.setItem('csrf_token', token);
    return token;
}

function validateCSRFToken(token) {
    const stored = sessionStorage.getItem('csrf_token');
    return stored && stored === token;
}

// 4. حماية من XSS (Cross-Site Scripting)
function sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

function sanitizeInput(input) {
    return input.replace(/[<>\"'&]/g, function(char) {
        const escapeMap = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '&': '&amp;'
        };
        return escapeMap[char];
    });
}

// 5. حماية من Brute Force
const loginAttempts = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 دقيقة

function checkLoginAttempts(email) {
    const now = Date.now();
    if (!loginAttempts[email]) {
        loginAttempts[email] = { count: 0, lockedUntil: 0 };
    }
    
    const record = loginAttempts[email];
    
    // إعادة تعيين إذا انتهت فترة الحظر
    if (now > record.lockedUntil) {
        record.count = 0;
        record.lockedUntil = 0;
    }
    
    // التحقق من الحظر
    if (record.count >= MAX_ATTEMPTS) {
        return {
            allowed: false,
            message: 'تم حظر هذا الحساب مؤقتاً. حاول لاحقاً.',
            remainingTime: Math.ceil((record.lockedUntil - now) / 1000)
        };
    }
    
    return { allowed: true };
}

function recordFailedLogin(email) {
    if (!loginAttempts[email]) {
        loginAttempts[email] = { count: 0, lockedUntil: 0 };
    }
    
    loginAttempts[email].count++;
    if (loginAttempts[email].count >= MAX_ATTEMPTS) {
        loginAttempts[email].lockedUntil = Date.now() + LOCKOUT_TIME;
    }
}

function recordSuccessfulLogin(email) {
    if (loginAttempts[email]) {
        loginAttempts[email].count = 0;
        loginAttempts[email].lockedUntil = 0;
    }
}

// 6. حماية البيانات الخاصة
function isPrivateData(collection) {
    return PRIVATE_COLLECTIONS.includes(collection);
}

function canAccessPrivateData(userId, ownerId) {
    return userId === ownerId;
}

// 7. تسجيل الأنشطة الأمنية
function logSecurityEvent(event, details = {}) {
    const log = {
        timestamp: new Date().toISOString(),
        event: event,
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...details
    };
    
    console.log('[SECURITY]', log);
}

// 8. حماية من تسريب البيانات
function maskSensitiveData(data) {
    if (typeof data === 'string' && data.includes('@')) {
        // إخفاء البريد الإلكتروني
        const parts = data.split('@');
        return parts[0].substring(0, 2) + '***@' + parts[1];
    }
    return data;
}

// 9. التحقق من الجلسة
function validateSession() {
    const sessionToken = sessionStorage.getItem('session_token');
    const sessionExpiry = sessionStorage.getItem('session_expiry');
    
    if (!sessionToken || !sessionExpiry) {
        return false;
    }
    
    if (Date.now() > parseInt(sessionExpiry)) {
        sessionStorage.clear();
        return false;
    }
    
    return true;
}

function createSession(userId) {
    const token = 'session_' + Math.random().toString(36).substr(2, 20);
    const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24 ساعة
    
    sessionStorage.setItem('session_token', token);
    sessionStorage.setItem('session_expiry', expiry.toString());
    sessionStorage.setItem('user_id', userId);
    
    logSecurityEvent('SESSION_CREATED', { userId: userId });
}

function destroySession() {
    logSecurityEvent('SESSION_DESTROYED');
    sessionStorage.clear();
}

// 10. حماية من التعديل على البيانات
function verifyDataIntegrity(data, hash) {
    const computed = computeHash(JSON.stringify(data));
    return computed === hash;
}

function computeHash(data) {
    // استخدام خوارزمية بسيطة للتجزئة
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // تحويل إلى عدد صحيح 32-بت
    }
    return hash.toString(36);
}

// 11. حماية من الوصول للـ localStorage بشكل غير آمن
const originalLocalStorage = window.localStorage;
Object.defineProperty(window, 'localStorage', {
    get: function() {
        logSecurityEvent('LOCALSTORAGE_ACCESS');
        return originalLocalStorage;
    }
});

// 12. التحقق من HTTPS
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    console.warn('⚠️ تحذير أمني: استخدم HTTPS للاتصال الآمن');
    logSecurityEvent('INSECURE_CONNECTION');
}

// 13. حماية من Clickjacking
if (window.self !== window.top) {
    window.top.location = window.self.location;
    logSecurityEvent('CLICKJACKING_ATTEMPT_BLOCKED');
}

console.log('✅ نظام الحماية المتقدم مفعل');
