// ========== Isolated Mail System - نظام البريد المعزول ==========

class IsolatedMailSystem {
    constructor() {
        this.mailAccounts = [];
        this.currentAccount = null;
        this.mails = [];
        this.isLocked = false;
        this.encryptionKey = this.generateEncryptionKey();
        this.loadMailData();
    }

    // توليد مفتاح التشفير
    generateEncryptionKey() {
        return 'secure_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // تشفير البيانات
    encrypt(data) {
        try {
            return btoa(JSON.stringify(data)); // تشفير بسيط (يجب استخدام تشفير حقيقي في الإنتاج)
        } catch (e) {
            console.error('Encryption error:', e);
            return null;
        }
    }

    // فك التشفير
    decrypt(encryptedData) {
        try {
            return JSON.parse(atob(encryptedData));
        } catch (e) {
            console.error('Decryption error:', e);
            return null;
        }
    }

    // إضافة حساب بريد جديد
    addMailAccount(email, password, provider = 'gmail') {
        if (!email || !password) {
            showWarning('⚠️ تنبيه', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
            return false;
        }

        const account = {
            id: 'mail_' + Date.now(),
            email: email,
            password: this.encrypt(password),
            provider: provider,
            createdAt: new Date(),
            isActive: false,
            lastSync: null,
            mails: []
        };

        this.mailAccounts.push(account);
        this.saveMailData();
        showSuccess('✅ تم الإضافة', `تم إضافة حساب البريد: ${email}`);
        return true;
    }

    // تنشيط حساب بريد
    activateAccount(accountId) {
        this.mailAccounts.forEach(acc => acc.isActive = false);
        const account = this.mailAccounts.find(acc => acc.id === accountId);
        if (account) {
            account.isActive = true;
            this.currentAccount = account;
            this.saveMailData();
            showSuccess('✅ تم التنشيط', `تم تنشيط حساب: ${account.email}`);
        }
    }

    // حذف حساب بريد
    deleteAccount(accountId) {
        if (confirm('هل تريد حذف هذا الحساب؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            this.mailAccounts = this.mailAccounts.filter(acc => acc.id !== accountId);
            if (this.currentAccount?.id === accountId) {
                this.currentAccount = null;
            }
            this.saveMailData();
            showSuccess('✅ تم الحذف', 'تم حذف الحساب بنجاح');
        }
    }

    // إضافة بريد جديد
    addMail(subject, body, from = null, to = null) {
        if (!this.currentAccount) {
            showWarning('⚠️ تنبيه', 'يرجى تنشيط حساب بريد أولاً');
            return false;
        }

        const mail = {
            id: 'mail_' + Date.now(),
            subject: subject,
            body: body,
            from: from || this.currentAccount.email,
            to: to || this.currentAccount.email,
            timestamp: new Date(),
            isRead: false,
            isStarred: false,
            attachments: []
        };

        this.currentAccount.mails.push(mail);
        this.saveMailData();
        showSuccess('✅ تم الحفظ', 'تم حفظ البريد بنجاح');
        return true;
    }

    // قراءة بريد
    readMail(mailId) {
        if (!this.currentAccount) return null;

        const mail = this.currentAccount.mails.find(m => m.id === mailId);
        if (mail) {
            mail.isRead = true;
            this.saveMailData();
        }
        return mail;
    }

    // حذف بريد
    deleteMail(mailId) {
        if (!this.currentAccount) return;

        this.currentAccount.mails = this.currentAccount.mails.filter(m => m.id !== mailId);
        this.saveMailData();
        showSuccess('✅ تم الحذف', 'تم حذف البريد');
    }

    // وضع علامة على البريد
    starMail(mailId) {
        if (!this.currentAccount) return;

        const mail = this.currentAccount.mails.find(m => m.id === mailId);
        if (mail) {
            mail.isStarred = !mail.isStarred;
            this.saveMailData();
        }
    }

    // البحث عن رسائل بريد
    searchMails(query) {
        if (!this.currentAccount) return [];

        return this.currentAccount.mails.filter(m =>
            m.subject.toLowerCase().includes(query.toLowerCase()) ||
            m.body.toLowerCase().includes(query.toLowerCase())
        );
    }

    // حفظ بيانات البريد
    saveMailData() {
        try {
            const encryptedData = this.encrypt(this.mailAccounts);
            localStorage.setItem('isolated_mail_system', encryptedData);
        } catch (e) {
            console.error('Save error:', e);
        }
    }

    // تحميل بيانات البريد
    loadMailData() {
        try {
            const encryptedData = localStorage.getItem('isolated_mail_system');
            if (encryptedData) {
                this.mailAccounts = this.decrypt(encryptedData) || [];
            }
        } catch (e) {
            console.error('Load error:', e);
            this.mailAccounts = [];
        }
    }

    // قفل النظام
    lockSystem() {
        this.isLocked = true;
        sessionStorage.setItem('mail_system_locked', 'true');
        showInfo('🔒 مقفول', 'تم قفل نظام البريد');
    }

    // فتح النظام
    unlockSystem(password) {
        // يجب التحقق من كلمة المرور الرئيسية
        if (password === 'admin_password') { // استبدل بكلمة المرور الفعلية
            this.isLocked = false;
            sessionStorage.removeItem('mail_system_locked');
            showSuccess('✅ مفتوح', 'تم فتح نظام البريد');
            return true;
        } else {
            showError('❌ خطأ', 'كلمة المرور غير صحيحة');
            return false;
        }
    }

    // الحصول على جميع الحسابات
    getAllAccounts() {
        return this.mailAccounts;
    }

    // الحصول على جميع الرسائل للحساب الحالي
    getAllMails() {
        return this.currentAccount ? this.currentAccount.mails : [];
    }

    // الحصول على إحصائيات البريد
    getMailStats() {
        if (!this.currentAccount) return null;

        return {
            total: this.currentAccount.mails.length,
            unread: this.currentAccount.mails.filter(m => !m.isRead).length,
            starred: this.currentAccount.mails.filter(m => m.isStarred).length
        };
    }
}

// إنشاء نسخة عامة من نظام البريد
let mailSystem = new IsolatedMailSystem();

// دوال التحكم
function addNewMailAccount() {
    const email = prompt('أدخل البريد الإلكتروني:');
    if (!email) return;

    const password = prompt('أدخل كلمة المرور:');
    if (!password) return;

    const provider = confirm('هل هذا حساب Gmail؟ (نعم) أم حساب آخر؟ (لا)') ? 'gmail' : 'other';
    mailSystem.addMailAccount(email, password, provider);
    renderMailAccounts();
}

function activateMailAccount(accountId) {
    mailSystem.activateAccount(accountId);
    renderMailAccounts();
}

function deleteMailAccount(accountId) {
    mailSystem.deleteAccount(accountId);
    renderMailAccounts();
}

function addNewMail() {
    const subject = prompt('موضوع البريد:');
    if (!subject) return;

    const body = prompt('محتوى البريد:');
    if (!body) return;

    mailSystem.addMail(subject, body);
    renderMailList();
}

function renderMailAccounts() {
    const container = document.getElementById('mail-accounts-list');
    if (!container) return;

    container.innerHTML = '';
    mailSystem.getAllAccounts().forEach(account => {
        const div = document.createElement('div');
        div.className = 'mail-account-item';
        div.innerHTML = `
            <div style="flex: 1;">
                <strong>${account.email}</strong>
                <p style="color: var(--text-secondary); font-size: 12px;">
                    ${account.provider} • ${account.mails.length} رسالة
                </p>
            </div>
            <button onclick="activateMailAccount('${account.id}')" class="btn" style="padding: 5px 10px; font-size: 12px;">
                ${account.isActive ? '✓ نشط' : 'تنشيط'}
            </button>
            <button onclick="deleteMailAccount('${account.id}')" class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;">
                حذف
            </button>
        `;
        container.appendChild(div);
    });
}

function renderMailList() {
    const container = document.getElementById('mail-list');
    if (!container) return;

    container.innerHTML = '';
    mailSystem.getAllMails().forEach(mail => {
        const div = document.createElement('div');
        div.className = 'mail-item';
        div.innerHTML = `
            <div style="flex: 1; cursor: pointer;" onclick="viewMail('${mail.id}')">
                <strong>${mail.subject}</strong>
                <p style="color: var(--text-secondary); font-size: 12px; margin-top: 5px;">
                    من: ${mail.from} • ${new Date(mail.timestamp).toLocaleDateString('ar')}
                </p>
            </div>
            <button onclick="mailSystem.starMail('${mail.id}'); renderMailList();" class="btn" style="padding: 5px 10px;">
                ${mail.isStarred ? '⭐' : '☆'}
            </button>
            <button onclick="mailSystem.deleteMail('${mail.id}'); renderMailList();" class="btn btn-secondary" style="padding: 5px 10px;">
                حذف
            </button>
        `;
        container.appendChild(div);
    });
}

function viewMail(mailId) {
    const mail = mailSystem.readMail(mailId);
    if (mail) {
        alert(`الموضوع: ${mail.subject}\n\n${mail.body}`);
        renderMailList();
    }
}

function lockMailSystem() {
    mailSystem.lockSystem();
}

function unlockMailSystem() {
    const password = prompt('أدخل كلمة المرور لفتح النظام:');
    if (password) {
        mailSystem.unlockSystem(password);
    }
}
