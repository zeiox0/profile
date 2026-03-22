// ========== ميزات متقدمة إضافية للمحرر البصري ==========

// ========== نظام الحركات المتقدمة ==========
const animationPresets = {
    none: { name: 'بدون حركة', keyframes: [] },
    scale: { 
        name: 'تكبير/تصغير', 
        keyframes: '@keyframes scale { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }'
    },
    move: { 
        name: 'حركة', 
        keyframes: '@keyframes move { 0% { transform: translate(0, 0); } 50% { transform: translate(20px, 20px); } 100% { transform: translate(0, 0); } }'
    },
    random: { 
        name: 'عشوائية', 
        keyframes: '@keyframes random { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(15px, 10px) rotate(5deg); } 50% { transform: translate(-10px, 15px) rotate(-5deg); } 75% { transform: translate(10px, -10px) rotate(3deg); } 100% { transform: translate(0, 0) rotate(0deg); } }'
    },
    pulse: { 
        name: 'نبض', 
        keyframes: '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }'
    }
};

// ========== تطبيق الحركات على العناصر ==========
function applyAnimation(element, animationType, linkToMusic = false) {
    const animationPreset = animationPresets[animationType];
    if (!animationPreset) return;

    const elementDOM = document.getElementById(`elem-${element.id}`);
    if (!elementDOM) return;

    if (animationType === 'none') {
        elementDOM.style.animation = 'none';
    } else {
        const duration = linkToMusic ? '0.5s' : '2s';
        const timing = linkToMusic ? 'linear' : 'ease-in-out';
        elementDOM.style.animation = `${animationType} ${duration} ${timing} infinite`;
    }
}

// ========== ربط الحركات بالموسيقى ==========
function syncAnimationWithMusic(element) {
    if (!element.linkToMusic) return;

    const audioElement = document.querySelector('audio');
    if (!audioElement) return;

    const elementDOM = document.getElementById(`elem-${element.id}`);
    if (!elementDOM) return;

    audioElement.addEventListener('play', () => {
        applyAnimation(element, element.animation, true);
    });

    audioElement.addEventListener('pause', () => {
        elementDOM.style.animation = 'none';
    });
}

// ========== نظام الألوان المتقدم ==========
function getColorPalette() {
    return {
        primary: '#00ff88',
        secondary: '#ff4d4d',
        accent: '#00d4ff',
        light: '#ffffff',
        dark: '#000000',
        custom: []
    };
}

// ========== تطبيق تدرج لوني ==========
function applyGradient(element, gradient) {
    const elementDOM = document.getElementById(`elem-${element.id}`);
    if (elementDOM) {
        elementDOM.style.background = gradient;
    }
}

// ========== نظام الظلال والتأثيرات ==========
const shadowPresets = {
    none: 'none',
    soft: '0 4px 15px rgba(0, 0, 0, 0.3)',
    medium: '0 8px 25px rgba(0, 0, 0, 0.5)',
    hard: '0 12px 35px rgba(0, 0, 0, 0.7)',
    glow: '0 0 20px rgba(0, 255, 136, 0.5)',
    neon: '0 0 30px rgba(0, 255, 136, 0.8), 0 0 60px rgba(0, 255, 136, 0.4)'
};

function applyShadow(element, shadowType) {
    const elementDOM = document.getElementById(`elem-${element.id}`);
    if (elementDOM) {
        elementDOM.style.boxShadow = shadowPresets[shadowType] || shadowPresets.none;
    }
}

// ========== نظام الحدود المتقدمة ==========
function applyBorder(element, borderStyle) {
    const elementDOM = document.getElementById(`elem-${element.id}`);
    if (!elementDOM) return;

    const borderMap = {
        none: 'none',
        solid: `2px solid ${element.color}`,
        dashed: `2px dashed ${element.color}`,
        dotted: `2px dotted ${element.color}`,
        double: `4px double ${element.color}`,
        glow: `2px solid ${element.color}; box-shadow: 0 0 10px ${element.color}`
    };

    elementDOM.style.border = borderMap[borderStyle] || borderMap.none;
}

// ========== نظام التصفية (Filters) ==========
const filterPresets = {
    none: 'none',
    blur: 'blur(5px)',
    brightness: 'brightness(1.2)',
    contrast: 'contrast(1.3)',
    grayscale: 'grayscale(100%)',
    sepia: 'sepia(100%)',
    saturate: 'saturate(1.5)',
    hueRotate: 'hue-rotate(90deg)',
    invert: 'invert(100%)'
};

function applyFilter(element, filterType) {
    const elementDOM = document.getElementById(`elem-${element.id}`);
    if (elementDOM) {
        elementDOM.style.filter = filterPresets[filterType] || filterPresets.none;
    }
}

// ========== نظام التحويلات (Transforms) ==========
function applyTransform(element, transformType, value) {
    const elementDOM = document.getElementById(`elem-${element.id}`);
    if (!elementDOM) return;

    const transforms = {
        rotate: `rotate(${value}deg)`,
        skewX: `skewX(${value}deg)`,
        skewY: `skewY(${value}deg)`,
        perspective: `perspective(${value}px)`
    };

    elementDOM.style.transform = transforms[transformType] || 'none';
}

// ========== نظام الخطوط المتقدم ==========
const fontPresets = {
    default: { family: 'Segoe UI', size: 16, weight: 400 },
    title: { family: 'Arial Black', size: 32, weight: 700 },
    subtitle: { family: 'Arial', size: 24, weight: 600 },
    body: { family: 'Segoe UI', size: 14, weight: 400 },
    code: { family: 'Courier New', size: 12, weight: 400 }
};

function applyFontStyle(element, fontPreset) {
    const elementDOM = document.getElementById(`elem-${element.id}`);
    if (!elementDOM) return;

    const preset = fontPresets[fontPreset] || fontPresets.default;
    elementDOM.style.fontFamily = preset.family;
    elementDOM.style.fontSize = preset.size + 'px';
    elementDOM.style.fontWeight = preset.weight;
}

// ========== نظام المحاذاة ==========
function alignElement(element, alignment) {
    const elementDOM = document.getElementById(`elem-${element.id}`);
    if (!elementDOM) return;

    const alignmentMap = {
        left: 'text-align: left;',
        center: 'text-align: center;',
        right: 'text-align: right;',
        justify: 'text-align: justify;'
    };

    elementDOM.style.textAlign = alignment;
}

// ========== نظام الطبقات المتقدم ==========
function bringToFront(element) {
    const maxZIndex = Math.max(...editorState.elements.map(el => el.zIndex || 0));
    element.zIndex = maxZIndex + 1;
}

function sendToBack(element) {
    editorState.elements.forEach(el => {
        if (el.zIndex > 0) el.zIndex--;
    });
    element.zIndex = 0;
}

// ========== نظام المجموعات ==========
let elementGroups = [];

function createGroup(elementIds) {
    const group = {
        id: 'group_' + Date.now(),
        elements: elementIds,
        x: 0,
        y: 0,
        visible: true
    };
    elementGroups.push(group);
    return group;
}

function moveGroup(groupId, x, y) {
    const group = elementGroups.find(g => g.id === groupId);
    if (!group) return;

    const offsetX = x - group.x;
    const offsetY = y - group.y;

    group.elements.forEach(elementId => {
        const element = editorState.elements.find(el => el.id === elementId);
        if (element) {
            element.x += offsetX;
            element.y += offsetY;
        }
    });

    group.x = x;
    group.y = y;
}

// ========== نظام الاختصارات ==========
const shortcuts = {
    'ctrl+z': undoAction,
    'ctrl+y': redoAction,
    'delete': deleteSelectedElement,
    'ctrl+d': duplicateSelectedElement,
    'ctrl+c': copySelectedElement,
    'ctrl+v': pasteElement
};

let clipboard = null;

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const key = `${e.ctrlKey ? 'ctrl+' : ''}${e.key.toLowerCase()}`;
        if (shortcuts[key]) {
            e.preventDefault();
            shortcuts[key]();
        }
    });
}

function duplicateSelectedElement() {
    if (!editorState.selectedElement) return;

    const duplicate = JSON.parse(JSON.stringify(editorState.selectedElement));
    duplicate.id = 'element_' + Date.now();
    duplicate.x += 20;
    duplicate.y += 20;

    editorState.elements.push(duplicate);
    addToHistory();
    editorState.isDirty = true;
    renderCanvas();
    renderLayersPanel();
    selectElement(duplicate.id);
}

function copySelectedElement() {
    if (editorState.selectedElement) {
        clipboard = JSON.parse(JSON.stringify(editorState.selectedElement));
        showNotification('✅ تم نسخ العنصر');
    }
}

function pasteElement() {
    if (!clipboard) {
        showNotification('⚠️ لا يوجد عنصر في الحافظة');
        return;
    }

    const pasted = JSON.parse(JSON.stringify(clipboard));
    pasted.id = 'element_' + Date.now();
    pasted.x += 30;
    pasted.y += 30;

    editorState.elements.push(pasted);
    addToHistory();
    editorState.isDirty = true;
    renderCanvas();
    renderLayersPanel();
    selectElement(pasted.id);
    showNotification('✅ تم لصق العنصر');
}

// ========== نظام الإحصائيات ==========
function getEditorStats() {
    return {
        totalElements: editorState.elements.length,
        totalLayers: editorState.history.length,
        currentHistoryIndex: editorState.historyIndex,
        isDirty: editorState.isDirty,
        selectedElement: editorState.selectedElement ? editorState.selectedElement.id : null
    };
}

// ========== نظام الحفظ التلقائي ==========
let autoSaveInterval = null;

function enableAutoSave(intervalMs = 30000) {
    autoSaveInterval = setInterval(() => {
        if (editorState.isDirty) {
            console.log('جاري الحفظ التلقائي...');
            // يمكن إضافة منطق الحفظ التلقائي هنا
        }
    }, intervalMs);
}

function disableAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

// ========== نظام الاستيراد والتصدير ==========
function exportDesign() {
    const designData = {
        elements: editorState.elements,
        playerSettings: editorState.playerSettings,
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(designData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `design_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('✅ تم تصدير التصميم');
}

function importDesign(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const designData = JSON.parse(e.target.result);
            editorState.elements = designData.elements || [];
            editorState.playerSettings = designData.playerSettings || editorState.playerSettings;
            addToHistory();
            editorState.isDirty = true;
            renderCanvas();
            renderLayersPanel();
            showNotification('✅ تم استيراد التصميم');
        } catch (error) {
            showNotification('❌ خطأ في استيراد التصميم: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// ========== نظام المعاينة المباشرة ==========
function toggleLivePreview() {
    const canvas = document.getElementById('editor-canvas');
    if (!canvas) return;

    canvas.style.border = canvas.style.border === '2px solid rgba(0, 255, 136, 0.2)' 
        ? '2px solid #00ff88' 
        : '2px solid rgba(0, 255, 136, 0.2)';
}

// ========== نظام الشبكة (Grid) ==========
let gridEnabled = false;
let gridSize = 20;

function toggleGrid() {
    gridEnabled = !gridEnabled;
    const canvas = document.getElementById('editor-canvas');
    if (!canvas) return;

    if (gridEnabled) {
        canvas.style.backgroundImage = `
            linear-gradient(0deg, transparent 24%, rgba(0, 255, 136, 0.05) 25%, rgba(0, 255, 136, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 136, 0.05) 75%, rgba(0, 255, 136, 0.05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(0, 255, 136, 0.05) 25%, rgba(0, 255, 136, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 136, 0.05) 75%, rgba(0, 255, 136, 0.05) 76%, transparent 77%, transparent)
        `;
        canvas.style.backgroundSize = `${gridSize}px ${gridSize}px`;
    } else {
        canvas.style.backgroundImage = 'none';
    }

    showNotification(gridEnabled ? '✅ تم تفعيل الشبكة' : '✅ تم تعطيل الشبكة');
}

// ========== نظام الالتزام بالشبكة (Snap to Grid) ==========
function snapToGrid(position) {
    if (!gridEnabled) return position;
    return Math.round(position / gridSize) * gridSize;
}

// ========== تهيئة الميزات المتقدمة ==========
function initAdvancedFeatures() {
    setupKeyboardShortcuts();
    enableAutoSave();
}
