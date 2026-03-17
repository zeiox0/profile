// ========== Advanced Media Studio - عالم التعديل المتقدم ==========

class MediaEditor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.currentImage = null;
        this.editHistory = [];
        this.currentEditIndex = -1;
        this.filters = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            hueRotate: 0,
            grayscale: 0,
            sepia: 0,
            invert: 0
        };
        this.selectedTool = null;
    }

    // تحميل الصورة
    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.currentImage = img;
                this.editHistory = [];
                this.currentEditIndex = -1;
                this.resetFilters();
                this.render();
                showSuccess('✅ تم التحميل', 'تم تحميل الصورة بنجاح');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // إعادة تعيين الفلاتر
    resetFilters() {
        this.filters = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            hueRotate: 0,
            grayscale: 0,
            sepia: 0,
            invert: 0
        };
    }

    // تطبيق الفلاتر
    applyFilters() {
        if (!this.canvas || !this.ctx) return;

        const filters = [
            `brightness(${this.filters.brightness}%)`,
            `contrast(${this.filters.contrast}%)`,
            `saturate(${this.filters.saturation}%)`,
            `blur(${this.filters.blur}px)`,
            `hue-rotate(${this.filters.hueRotate}deg)`,
            `grayscale(${this.filters.grayscale}%)`,
            `sepia(${this.filters.sepia}%)`,
            `invert(${this.filters.invert}%)`
        ];

        this.canvas.style.filter = filters.join(' ');
    }

    // تحديث قيمة الفلتر
    updateFilter(filterName, value) {
        this.filters[filterName] = value;
        this.applyFilters();
        this.saveToHistory();
    }

    // حفظ في السجل (للتراجع)
    saveToHistory() {
        this.currentEditIndex++;
        this.editHistory = this.editHistory.slice(0, this.currentEditIndex);
        this.editHistory.push({...this.filters});
    }

    // التراجع عن التعديل
    undo() {
        if (this.currentEditIndex > 0) {
            this.currentEditIndex--;
            this.filters = {...this.editHistory[this.currentEditIndex]};
            this.applyFilters();
            showInfo('↶ تراجع', 'تم التراجع عن آخر تعديل');
        }
    }

    // إعادة التعديل
    redo() {
        if (this.currentEditIndex < this.editHistory.length - 1) {
            this.currentEditIndex++;
            this.filters = {...this.editHistory[this.currentEditIndex]};
            this.applyFilters();
            showInfo('↷ إعادة', 'تم إعادة التعديل');
        }
    }

    // إعادة تعيين كل شيء
    reset() {
        if (confirm('هل تريد إعادة تعيين جميع التعديلات؟')) {
            this.resetFilters();
            this.editHistory = [];
            this.currentEditIndex = -1;
            this.render();
            showSuccess('✅ تم الإعادة', 'تم إعادة تعيين جميع التعديلات');
        }
    }

    // تقليل حجم الصورة
    resize(width, height) {
        if (!this.currentImage) return;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.currentImage, 0, 0, width, height);

        const resized = new Image();
        resized.onload = () => {
            this.currentImage = resized;
            this.render();
            showSuccess('✅ تم التغيير', `تم تغيير حجم الصورة إلى ${width}x${height}`);
        };
        resized.src = canvas.toDataURL();
    }

    // قص الصورة
    crop(x, y, width, height) {
        if (!this.currentImage) return;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.currentImage, x, y, width, height, 0, 0, width, height);

        const cropped = new Image();
        cropped.onload = () => {
            this.currentImage = cropped;
            this.render();
            showSuccess('✅ تم القص', 'تم قص الصورة بنجاح');
        };
        cropped.src = canvas.toDataURL();
    }

    // تدوير الصورة
    rotate(degrees) {
        if (!this.currentImage) return;

        const canvas = document.createElement('canvas');
        const rad = (degrees * Math.PI) / 180;
        canvas.width = Math.abs(this.currentImage.width * Math.cos(rad)) + Math.abs(this.currentImage.height * Math.sin(rad));
        canvas.height = Math.abs(this.currentImage.width * Math.sin(rad)) + Math.abs(this.currentImage.height * Math.cos(rad));

        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.drawImage(this.currentImage, -this.currentImage.width / 2, -this.currentImage.height / 2);

        const rotated = new Image();
        rotated.onload = () => {
            this.currentImage = rotated;
            this.render();
            showSuccess('✅ تم الدوران', `تم تدوير الصورة بمقدار ${degrees}°`);
        };
        rotated.src = canvas.toDataURL();
    }

    // قلب الصورة أفقياً
    flipHorizontal() {
        if (!this.currentImage) return;

        const canvas = document.createElement('canvas');
        canvas.width = this.currentImage.width;
        canvas.height = this.currentImage.height;
        const ctx = canvas.getContext('2d');

        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.currentImage, 0, 0);

        const flipped = new Image();
        flipped.onload = () => {
            this.currentImage = flipped;
            this.render();
            showSuccess('✅ تم القلب', 'تم قلب الصورة أفقياً');
        };
        flipped.src = canvas.toDataURL();
    }

    // قلب الصورة عمودياً
    flipVertical() {
        if (!this.currentImage) return;

        const canvas = document.createElement('canvas');
        canvas.width = this.currentImage.width;
        canvas.height = this.currentImage.height;
        const ctx = canvas.getContext('2d');

        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
        ctx.drawImage(this.currentImage, 0, 0);

        const flipped = new Image();
        flipped.onload = () => {
            this.currentImage = flipped;
            this.render();
            showSuccess('✅ تم القلب', 'تم قلب الصورة عمودياً');
        };
        flipped.src = canvas.toDataURL();
    }

    // تحميل الصورة المعدلة
    download() {
        if (!this.currentImage) {
            showWarning('⚠️ تنبيه', 'لا توجد صورة لتحميلها');
            return;
        }

        const link = document.createElement('a');
        link.href = this.currentImage.src;
        link.download = `edited-image-${Date.now()}.png`;
        link.click();
        showSuccess('✅ تم التحميل', 'تم تحميل الصورة المعدلة');
    }

    // عرض الصورة
    render() {
        if (!this.currentImage) return;

        const container = document.getElementById('editor-canvas');
        if (!container) return;

        container.innerHTML = '';
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.currentImage.width;
        this.canvas.height = this.currentImage.height;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.drawImage(this.currentImage, 0, 0);

        this.canvas.style.maxWidth = '100%';
        this.canvas.style.maxHeight = '400px';
        this.canvas.style.borderRadius = '8px';
        this.canvas.style.cursor = 'pointer';

        container.appendChild(this.canvas);
        this.applyFilters();
    }
}

// إنشاء نسخة عامة من المحرر
let mediaEditor = new MediaEditor();

// دوال التحكم
function loadMediaFile(type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'image') {
                mediaEditor.loadImage(file);
            } else {
                showInfo('ℹ️ معلومة', `تم اختيار ملف ${type}: ${file.name}`);
            }
        }
    };
    input.click();
}

function updateBrightness(value) {
    mediaEditor.updateFilter('brightness', value);
}

function updateContrast(value) {
    mediaEditor.updateFilter('contrast', value);
}

function updateSaturation(value) {
    mediaEditor.updateFilter('saturation', value);
}

function updateBlur(value) {
    mediaEditor.updateFilter('blur', value);
}

function undoEdit() {
    mediaEditor.undo();
}

function redoEdit() {
    mediaEditor.redo();
}

function resetEdit() {
    mediaEditor.reset();
}

function rotateImage(degrees) {
    mediaEditor.rotate(degrees);
}

function flipImageH() {
    mediaEditor.flipHorizontal();
}

function flipImageV() {
    mediaEditor.flipVertical();
}

function downloadImage() {
    mediaEditor.download();
}
