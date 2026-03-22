// ========== نظام اللمس والحركة المتقدم ==========

class TouchEditor {
    constructor() {
        this.selectedElement = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.elementStartX = 0;
        this.elementStartY = 0;
        this.isDragging = false;
        this.pinned = {};
        this.history = [];
        this.historyIndex = -1;
        this.iframeDoc = null;
    }

    // ========== تهيئة النظام ==========
    init(iframeDoc) {
        this.iframeDoc = iframeDoc;
        this.setupTouchListeners();
        this.setupClickListeners();
        this.loadPinnedElements();
    }

    // ========== إعداد مستمعي اللمس ==========
    setupTouchListeners() {
        if (!this.iframeDoc) return;

        this.iframeDoc.addEventListener('touchstart', (e) => this.handleTouchStart(e), true);
        this.iframeDoc.addEventListener('touchmove', (e) => this.handleTouchMove(e), true);
        this.iframeDoc.addEventListener('touchend', (e) => this.handleTouchEnd(e), true);
    }

    // ========== إعداد مستمعي النقر ==========
    setupClickListeners() {
        if (!this.iframeDoc) return;

        this.iframeDoc.addEventListener('click', (e) => this.handleClick(e), true);
        this.iframeDoc.addEventListener('contextmenu', (e) => this.handleRightClick(e), true);
    }

    // ========== معالجة بداية اللمس ==========
    handleTouchStart(e) {
        const el = e.target;
        if (!el || el === this.iframeDoc.body || this.pinned[el.id]) return;

        this.selectedElement = el;
        this.isDragging = true;
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;

        const rect = el.getBoundingClientRect();
        this.elementStartX = rect.left;
        this.elementStartY = rect.top;

        // تأثير بصري
        el.style.transition = 'all 0.1s ease';
        el.style.transform = 'scale(1.05)';
        el.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.5)';

        // عرض تأثير اللمس
        this.showTouchEffect(e.touches[0].clientX, e.touches[0].clientY);
    }

    // ========== معالجة حركة اللمس ==========
    handleTouchMove(e) {
        if (!this.isDragging || !this.selectedElement) return;

        const deltaX = e.touches[0].clientX - this.touchStartX;
        const deltaY = e.touches[0].clientY - this.touchStartY;

        this.selectedElement.style.position = 'relative';
        this.selectedElement.style.left = deltaX + 'px';
        this.selectedElement.style.top = deltaY + 'px';
        this.selectedElement.style.zIndex = '9999';

        // تحديث الموضع في البيانات
        this.selectedElement.dataset.touchX = deltaX;
        this.selectedElement.dataset.touchY = deltaY;
    }

    // ========== معالجة نهاية اللمس ==========
    handleTouchEnd(e) {
        if (!this.selectedElement) return;

        this.isDragging = false;

        // إزالة التأثير البصري
        this.selectedElement.style.transform = 'scale(1)';
        this.selectedElement.style.boxShadow = 'none';

        // حفظ الحالة
        this.addToHistory();
    }

    // ========== معالجة النقر ==========
    handleClick(e) {
        e.stopPropagation();
        const el = e.target;

        if (!el || el === this.iframeDoc.body) return;

        this.selectElement(el);
    }

    // ========== معالجة النقر بزر الفأرة الأيمن ==========
    handleRightClick(e) {
        e.preventDefault();
        const el = e.target;

        if (!el || el === this.iframeDoc.body) return;

        this.selectElement(el);
        this.showContextMenu(e, el);
    }

    // ========== تحديد العنصر ==========
    selectElement(el) {
        // إزالة التحديد السابق
        if (this.selectedElement) {
            this.selectedElement.style.outline = 'none';
            this.selectedElement.style.outlineOffset = '0';
        }

        this.selectedElement = el;
        el.style.outline = '3px solid #00ff88';
        el.style.outlineOffset = '2px';
    }

    // ========== عرض قائمة الخيارات ==========
    showContextMenu(e, el) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';

        const isPinned = this.pinned[el.id];

        menu.innerHTML = `
            <div class="context-menu-item" onclick="touchEditor.togglePin('${el.id}')">
                <i class="fas fa-${isPinned ? 'lock' : 'unlock'}"></i>
                ${isPinned ? 'فك التثبيت' : 'تثبيت العنصر'}
            </div>
            <div class="context-menu-item" onclick="touchEditor.hideElement('${el.id}')">
                <i class="fas fa-eye-slash"></i> إخفاء
            </div>
            <div class="context-menu-item" onclick="touchEditor.showElement('${el.id}')">
                <i class="fas fa-eye"></i> إظهار
            </div>
            <div class="context-menu-item" onclick="touchEditor.bringToFront('${el.id}')">
                <i class="fas fa-arrow-up"></i> للأمام
            </div>
            <div class="context-menu-item" onclick="touchEditor.sendToBack('${el.id}')">
                <i class="fas fa-arrow-down"></i> للخلف
            </div>
            <div class="context-menu-item" onclick="touchEditor.duplicateElement('${el.id}')">
                <i class="fas fa-copy"></i> نسخ
            </div>
            <div class="context-menu-item danger" onclick="touchEditor.deleteElement('${el.id}')">
                <i class="fas fa-trash"></i> حذف
            </div>
        `;

        document.body.appendChild(menu);

        // إغلاق القائمة عند النقر خارجها
        setTimeout(() => {
            document.addEventListener('click', () => {
                menu.remove();
            }, { once: true });
        }, 100);
    }

    // ========== تثبيت/فك تثبيت العنصر ==========
    togglePin(elementId) {
        this.pinned[elementId] = !this.pinned[elementId];
        const el = this.iframeDoc.getElementById(elementId);
        
        if (el) {
            el.style.cursor = this.pinned[elementId] ? 'not-allowed' : 'pointer';
            el.style.opacity = this.pinned[elementId] ? '0.7' : '1';
            
            if (this.pinned[elementId]) {
                el.style.border = '2px solid #00ff88';
            } else {
                el.style.border = 'none';
            }

            this.savePinnedElements();
            this.addToHistory();
            this.showNotification(this.pinned[elementId] ? '📌 تم تثبيت العنصر' : '📌 تم فك تثبيت العنصر');
        }
    }

    // ========== إخفاء العنصر ==========
    hideElement(elementId) {
        const el = this.iframeDoc.getElementById(elementId);
        if (el) {
            el.style.display = 'none';
            el.dataset.hidden = 'true';
            this.showNotification('👁️ تم إخفاء العنصر');
            this.addToHistory();
        }
    }

    // ========== إظهار العنصر ==========
    showElement(elementId) {
        const el = this.iframeDoc.getElementById(elementId);
        if (el) {
            el.style.display = '';
            el.dataset.hidden = 'false';
            this.showNotification('👁️ تم إظهار العنصر');
            this.addToHistory();
        }
    }

    // ========== نقل العنصر للأمام ==========
    bringToFront(elementId) {
        const el = this.iframeDoc.getElementById(elementId);
        if (el) {
            el.style.zIndex = '9999';
            this.showNotification('⬆️ تم نقل العنصر للأمام');
            this.addToHistory();
        }
    }

    // ========== نقل العنصر للخلف ==========
    sendToBack(elementId) {
        const el = this.iframeDoc.getElementById(elementId);
        if (el) {
            el.style.zIndex = '1';
            this.showNotification('⬇️ تم نقل العنصر للخلف');
            this.addToHistory();
        }
    }

    // ========== نسخ العنصر ==========
    duplicateElement(elementId) {
        const el = this.iframeDoc.getElementById(elementId);
        if (el) {
            const clone = el.cloneNode(true);
            clone.id = elementId + '_copy_' + Date.now();
            
            // تعديل الموضع قليلاً
            clone.style.left = (parseInt(clone.style.left || 0) + 20) + 'px';
            clone.style.top = (parseInt(clone.style.top || 0) + 20) + 'px';
            
            el.parentNode.insertBefore(clone, el.nextSibling);
            this.showNotification('📋 تم نسخ العنصر');
            this.addToHistory();
        }
    }

    // ========== حذف العنصر ==========
    deleteElement(elementId) {
        if (confirm('هل تريد حذف هذا العنصر؟')) {
            const el = this.iframeDoc.getElementById(elementId);
            if (el) {
                el.remove();
                this.showNotification('🗑️ تم حذف العنصر');
                this.addToHistory();
            }
        }
    }

    // ========== تأثير اللمس ==========
    showTouchEffect(x, y) {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            width: 30px;
            height: 30px;
            border: 2px solid #00ff88;
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            left: ${x - 15}px;
            top: ${y - 15}px;
            animation: touchPulse 0.6s ease-out;
        `;

        document.body.appendChild(effect);
        setTimeout(() => effect.remove(), 600);
    }

    // ========== الإشعارات ==========
    showNotification(message) {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00ff88;
            color: #000;
            padding: 15px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 10001;
            animation: slideIn 0.3s ease;
        `;
        notif.textContent = message;
        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 2000);
    }

    // ========== السجل (Undo/Redo) ==========
    addToHistory() {
        this.historyIndex++;
        this.history = this.history.slice(0, this.historyIndex);
        this.history.push(this.saveState());
    }

    saveState() {
        return {
            pinned: JSON.parse(JSON.stringify(this.pinned)),
            html: this.iframeDoc.body.innerHTML,
            timestamp: Date.now()
        };
    }

    restoreState(state) {
        this.pinned = JSON.parse(JSON.stringify(state.pinned));
        this.iframeDoc.body.innerHTML = state.html;
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
            this.showNotification('↶ تم التراجع');
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
            this.showNotification('↷ تم الإعادة');
        }
    }

    // ========== حفظ العناصر المثبتة ==========
    savePinnedElements() {
        localStorage.setItem('pinnedElements', JSON.stringify(this.pinned));
    }

    loadPinnedElements() {
        const saved = localStorage.getItem('pinnedElements');
        if (saved) {
            this.pinned = JSON.parse(saved);
        }
    }

    // ========== الحصول على البيانات ==========
    getEditorData() {
        return {
            html: this.iframeDoc.body.innerHTML,
            pinned: this.pinned,
            timestamp: Date.now()
        };
    }

    // ========== تطبيق البيانات ==========
    applyEditorData(data) {
        this.iframeDoc.body.innerHTML = data.html;
        this.pinned = data.pinned || {};
        this.setupTouchListeners();
        this.setupClickListeners();
    }
}

// إنشاء مثيل عام
let touchEditor = new TouchEditor();
