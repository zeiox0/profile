// ========== نظام المحرر البصري المتقدم ==========

let editorState = {
    elements: [],
    selectedElement: null,
    history: [],
    historyIndex: -1,
    playerSettings: {
        visibility: 'show',
        position: 'bottom',
        transparentBg: true
    },
    isDirty: false
};

let draggedElement = null;
let dragOffset = { x: 0, y: 0 };

// ========== تهيئة المحرر ==========
function initVisualEditor() {
    console.log('تهيئة محرر التصميم المتقدم...');
    loadEditorData();
    setupCanvasEventListeners();
    renderLayersPanel();
    setupDragAndDrop();
}

// ========== تحميل البيانات من Firebase ==========
async function loadEditorData() {
    try {
        const doc = await db.collection('siteData').doc('config').get();
        if (doc.exists) {
            const data = doc.data();
            if (data.designElements) {
                editorState.elements = data.designElements;
            }
            if (data.playerSettings) {
                editorState.playerSettings = data.playerSettings;
            }
            renderCanvas();
        }
    } catch (error) {
        console.error('خطأ في تحميل بيانات المحرر:', error);
    }
}

// ========== تبديل القوائم الجانبية ==========
function toggleSidebars() {
    const leftSidebar = document.getElementById('left-sidebar');
    const rightSidebar = document.getElementById('right-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    
    leftSidebar.classList.toggle('hidden');
    rightSidebar.classList.toggle('hidden');
    toggleBtn.classList.toggle('active');
    
    if (leftSidebar.classList.contains('hidden')) {
        toggleBtn.innerHTML = '<i class="fas fa-columns"></i>';
        showNotification('🙈 تم إخفاء القوائم');
    } else {
        toggleBtn.innerHTML = '<i class="fas fa-columns"></i>';
        showNotification('👁️ تم إظهار القوائم');
    }
}

// ========== تبديل التبويبات ==========
function switchEditorTab(tabName) {
    // إخفاء جميع التبويبات
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // إظهار التبويب المختار
    const tabContent = document.getElementById(`${tabName}-tab`);
    if (tabContent) {
        tabContent.classList.add('active');
    }

    // تحديد الزر النشط
    event.target.closest('.tab-btn').classList.add('active');
}

// ========== إعداد مستمعي أحداث المحرر ==========
function setupCanvasEventListeners() {
    const canvas = document.getElementById('editor-canvas');
    
    canvas.addEventListener('click', (e) => {
        if (e.target === canvas) {
            deselectElement();
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (draggedElement) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - dragOffset.x;
            const y = e.clientY - rect.top - dragOffset.y;
            
            // Update position in real-time without re-rendering everything
            draggedElement.style.left = Math.max(0, Math.min(x, rect.width - draggedElement.offsetWidth)) + 'px';
            draggedElement.style.top = Math.max(0, Math.min(y, rect.height - draggedElement.offsetHeight)) + 'px';
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (draggedElement) {
            // Update state only on mouseup to prevent shaking/lag
            updateElementProperty('x', parseInt(draggedElement.style.left));
            updateElementProperty('y', parseInt(draggedElement.style.top));
            draggedElement = null;
        }
    });
}

// ========== إعداد السحب والإفلات ==========
function setupDragAndDrop() {
    const canvas = document.getElementById('editor-canvas');
    
    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        canvas.style.background = 'rgba(0, 255, 136, 0.1)';
    });

    canvas.addEventListener('dragleave', () => {
        canvas.style.background = '#000';
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        canvas.style.background = '#000';
    });
}

// ========== إضافة عنصر جديد ==========
function addNewElement(type) {
    const newElement = {
        id: 'element_' + Date.now(),
        type: type,
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        opacity: 100,
        color: '#ffffff',
        shape: 'square',
        animation: 'none',
        linkToMusic: false,
        content: type === 'text' ? 'نص جديد' : '',
        zIndex: editorState.elements.length
    };

    editorState.elements.push(newElement);
    addToHistory();
    renderCanvas();
    renderLayersPanel();
    selectElement(newElement.id);
    
    showNotification('✅ تم إضافة عنصر جديد');
}

// ========== تحديد عنصر ==========
function selectElement(elementId) {
    deselectElement();
    
    const element = editorState.elements.find(el => el.id === elementId);
    if (element) {
        editorState.selectedElement = element;
        
        // تحديث الواجهة
        const elementDOM = document.getElementById(`elem-${elementId}`);
        if (elementDOM) {
            elementDOM.classList.add('selected');
        }

        // تحديث لوحة الخصائص
        updatePropertiesPanel(element);
        
        // تحديث لوحة الطبقات
        document.querySelectorAll('.layer-item').forEach(item => {
            item.classList.remove('selected');
        });
        const layerItem = document.querySelector(`[data-element-id="${elementId}"]`);
        if (layerItem) {
            layerItem.classList.add('selected');
        }
    }
}

// ========== إلغاء تحديد عنصر ==========
function deselectElement() {
    if (editorState.selectedElement) {
        const elementDOM = document.getElementById(`elem-${editorState.selectedElement.id}`);
        if (elementDOM) {
            elementDOM.classList.remove('selected');
        }
    }
    editorState.selectedElement = null;
    
    // إعادة تعيين لوحة الخصائص
    const propertiesPanel = document.getElementById('properties-panel');
    if (propertiesPanel) {
        propertiesPanel.innerHTML = '<p style="color: #999; text-align: center;">اختر عنصراً لتعديل خصائصه</p>';
    }
}

// ========== تحديث خصائص العنصر ==========
function updateElementProperty(property, value) {
    if (!editorState.selectedElement) return;

    const oldValue = editorState.selectedElement[property];
    editorState.selectedElement[property] = value;
    
    if (oldValue !== value) {
        addToHistory();
        editorState.isDirty = true;
    }

    renderCanvas();
    updatePropertiesPanel(editorState.selectedElement);
}

// ========== تحديث إعدادات مشغل الصوت ==========
function updatePlayerSettings(setting, value) {
    editorState.playerSettings[setting] = value;
    editorState.isDirty = true;
    addToHistory();
    renderCanvas();
}

// ========== تحديث لوحة الخصائص ==========
function updatePropertiesPanel(element) {
    const panel = document.getElementById('properties-panel');
    if (!panel) return;

    let html = `
        <div class="property-group">
            <label>النوع:</label>
            <input type="text" class="property-input" value="${element.type}" disabled>
        </div>
        <div class="property-group">
            <label>المعرف:</label>
            <input type="text" class="property-input" value="${element.id}" disabled>
        </div>
    `;

    if (element.type === 'text') {
        html += `
            <div class="property-group">
                <label>المحتوى:</label>
                <textarea class="property-input" onchange="updateElementProperty('content', this.value)">${element.content || ''}</textarea>
            </div>
        `;
    }

    html += `
        <div class="property-group">
            <label>العرض:</label>
            <input type="number" class="property-input" value="${element.width}" onchange="updateElementProperty('width', this.value)">
        </div>
        <div class="property-group">
            <label>الارتفاع:</label>
            <input type="number" class="property-input" value="${element.height}" onchange="updateElementProperty('height', this.value)">
        </div>
    `;

    panel.innerHTML = html;
}

// ========== حذف العنصر المختار ==========
function deleteSelectedElement() {
    if (!editorState.selectedElement) {
        showNotification('⚠️ لم يتم تحديد عنصر');
        return;
    }

    const index = editorState.elements.findIndex(el => el.id === editorState.selectedElement.id);
    if (index !== -1) {
        editorState.elements.splice(index, 1);
        addToHistory();
        editorState.isDirty = true;
        deselectElement();
        renderCanvas();
        renderLayersPanel();
        showNotification('✅ تم حذف العنصر');
    }
}

// ========== رسم العناصر على المحرر ==========
function renderCanvas() {
    const canvas = document.getElementById('editor-canvas');
    if (!canvas) return;

    // مسح العناصر القديمة
    canvas.querySelectorAll('.editable-element').forEach(el => el.remove());

    // رسم العناصر الجديدة
    editorState.elements.forEach(element => {
        const div = document.createElement('div');
        div.id = `elem-${element.id}`;
        div.className = 'editable-element';
        div.style.left = element.x + 'px';
        div.style.top = element.y + 'px';
        div.style.width = element.width + 'px';
        div.style.height = element.height + 'px';
        div.style.opacity = element.opacity / 100;
        div.style.zIndex = element.zIndex;

        let content = '';
        switch (element.type) {
            case 'text':
                content = `<span style="color: ${element.color}; font-size: 14px; word-wrap: break-word;">${element.content || 'نص'}</span>`;
                break;
            case 'image':
                content = `<img src="${element.content || 'https://via.placeholder.com/100'}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`;
                break;
            case 'icon':
                content = `<i class="${element.content || 'fas fa-star'}" style="color: ${element.color}; font-size: 40px;"></i>`;
                break;
            case 'shape':
                const shapeStyle = getShapeStyle(element);
                div.style.cssText += shapeStyle;
                break;
            case 'tab':
                content = `<div style="background: ${element.color}; padding: 10px; border-radius: 6px; color: #fff; text-align: center;">تاب</div>`;
                break;
        }

        div.innerHTML = content;
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            selectElement(element.id);
        });

        div.addEventListener('mousedown', (e) => {
            draggedElement = div;
            dragOffset.x = e.clientX - div.getBoundingClientRect().left;
            dragOffset.y = e.clientY - div.getBoundingClientRect().top;
        });

        canvas.appendChild(div);
    });
}

// ========== الحصول على نمط الشكل ==========
function getShapeStyle(element) {
    let style = `background: ${element.color};`;
    
    switch (element.shape) {
        case 'circle':
            style += `border-radius: 50%;`;
            break;
        case 'triangle':
            style += `width: 0; height: 0; border-left: ${element.width/2}px solid transparent; border-right: ${element.width/2}px solid transparent; border-bottom: ${element.height}px solid ${element.color};`;
            break;
        case 'star':
            // تطبيق شكل نجمة باستخدام clip-path
            style += `clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);`;
            break;
        default:
            style += `border-radius: 6px;`;
    }
    
    return style;
}

// ========== رسم لوحة الطبقات ==========
function renderLayersPanel() {
    const panel = document.getElementById('layers-panel');
    if (!panel) return;

    panel.innerHTML = '';

    editorState.elements.forEach((element, index) => {
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        layerItem.setAttribute('data-element-id', element.id);
        
        if (editorState.selectedElement && editorState.selectedElement.id === element.id) {
            layerItem.classList.add('selected');
        }

        const iconMap = {
            'text': 'fa-font',
            'image': 'fa-image',
            'icon': 'fa-star',
            'shape': 'fa-circle',
            'tab': 'fa-square'
        };

        layerItem.innerHTML = `
            <div class="layer-item-name">
                <div class="layer-item-icon">
                    <i class="fas ${iconMap[element.type] || 'fa-cube'}"></i>
                </div>
                <span>${element.type} #${index + 1}</span>
            </div>
            <div class="layer-item-controls">
                <button class="layer-btn" onclick="moveLayerUp('${element.id}')" title="للأمام">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="layer-btn" onclick="moveLayerDown('${element.id}')" title="للخلف">
                    <i class="fas fa-arrow-down"></i>
                </button>
                <button class="layer-btn" onclick="toggleLayerVisibility('${element.id}')" title="إظهار/إخفاء">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `;

        layerItem.addEventListener('click', () => selectElement(element.id));
        panel.appendChild(layerItem);
    });
}

// ========== تحريك الطبقة للأمام ==========
function moveLayerUp(elementId) {
    const index = editorState.elements.findIndex(el => el.id === elementId);
    if (index < editorState.elements.length - 1) {
        [editorState.elements[index], editorState.elements[index + 1]] = 
        [editorState.elements[index + 1], editorState.elements[index]];
        
        editorState.elements.forEach((el, i) => el.zIndex = i);
        addToHistory();
        editorState.isDirty = true;
        renderCanvas();
        renderLayersPanel();
    }
}

// ========== تحريك الطبقة للخلف ==========
function moveLayerDown(elementId) {
    const index = editorState.elements.findIndex(el => el.id === elementId);
    if (index > 0) {
        [editorState.elements[index], editorState.elements[index - 1]] = 
        [editorState.elements[index - 1], editorState.elements[index]];
        
        editorState.elements.forEach((el, i) => el.zIndex = i);
        addToHistory();
        editorState.isDirty = true;
        renderCanvas();
        renderLayersPanel();
    }
}

// ========== تبديل رؤية الطبقة ==========
function toggleLayerVisibility(elementId) {
    const element = editorState.elements.find(el => el.id === elementId);
    if (element) {
        element.opacity = element.opacity === 0 ? 100 : 0;
        addToHistory();
        editorState.isDirty = true;
        renderCanvas();
        renderLayersPanel();
    }
}

// ========== نظام السجل (Undo/Redo) ==========
function addToHistory() {
    // حذف أي عناصر في السجل بعد الفهرس الحالي
    editorState.history = editorState.history.slice(0, editorState.historyIndex + 1);
    
    // إضافة الحالة الحالية
    editorState.history.push(JSON.parse(JSON.stringify(editorState.elements)));
    editorState.historyIndex++;
}

function undoAction() {
    if (editorState.historyIndex > 0) {
        editorState.historyIndex--;
        editorState.elements = JSON.parse(JSON.stringify(editorState.history[editorState.historyIndex]));
        editorState.isDirty = true;
        renderCanvas();
        renderLayersPanel();
        showNotification('↶ تم التراجع');
    }
}

function redoAction() {
    if (editorState.historyIndex < editorState.history.length - 1) {
        editorState.historyIndex++;
        editorState.elements = JSON.parse(JSON.stringify(editorState.history[editorState.historyIndex]));
        editorState.isDirty = true;
        renderCanvas();
        renderLayersPanel();
        showNotification('↷ تم الإعادة');
    }
}

// ========== إعادة تعيين إلى الافتراضي ==========
function resetToDefault() {
    if (confirm('هل أنت متأكد من رغبتك في إعادة تعيين التصميم إلى الحالة الافتراضية؟')) {
        editorState.elements = [];
        editorState.selectedElement = null;
        editorState.history = [[]];
        editorState.historyIndex = 0;
        editorState.isDirty = true;
        renderCanvas();
        renderLayersPanel();
        showNotification('✅ تم إعادة التعيين');
    }
}

// ========== حفظ التغييرات ==========
async function saveChanges() {
    try {
        await db.collection('siteData').doc('config').update({
            designElements: editorState.elements,
            playerSettings: editorState.playerSettings,
            lastModified: new Date()
        });
        
        editorState.isDirty = false;
        showNotification('✅ تم حفظ التغييرات بنجاح');
        setTimeout(() => {
            exitEditor();
        }, 1500);
    } catch (error) {
        console.error('خطأ في حفظ التغييرات:', error);
        showNotification('❌ خطأ في الحفظ: ' + error.message);
    }
}

// ========== إلغاء التغييرات ==========
function discardChanges() {
    if (editorState.isDirty) {
        if (confirm('هل أنت متأكد من رغبتك في إلغاء جميع التغييرات؟')) {
            exitEditor();
        }
    } else {
        exitEditor();
    }
}

// ========== الخروج من المحرر ==========
function exitEditor() {
    window.location.href = 'admin.html';
}

// ========== إظهار إشعار ==========
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 255, 136, 0.2);
        border: 1px solid #00ff88;
        color: #00ff88;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== تهيئة المحرر عند تحميل الصفحة ==========
document.addEventListener('DOMContentLoaded', () => {
    initVisualEditor();
});

// ========== منع الخروج بدون حفظ ==========
window.addEventListener('beforeunload', (e) => {
    if (editorState.isDirty) {
        e.preventDefault();
        e.returnValue = '';
    }
});
