/**
 * قوالب Vibe العصرية
 * تصاميم حديثة بأشكال هندسية عضوية وعناصر عائمة
 */

const vibeTemplates = [
    {
        id: 'vibe-dark',
        name: 'Vibe Dark',
        description: 'قالب عصري بخلفية مظلمة مع تدرج ملون',
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23000" width="400" height="300"/%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2300ff88;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23ff00ff;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx="200" cy="150" r="80" fill="url(%23grad)" opacity="0.3"/%3E%3C/svg%3E',
        html: `
            <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%); position: relative; overflow: hidden;">
                <!-- خلفية متحركة -->
                <div style="position: absolute; width: 400px; height: 400px; background: radial-gradient(circle, rgba(0,255,136,0.2) 0%, transparent 70%); border-radius: 50%; top: -100px; right: -100px; animation: float 6s ease-in-out infinite;"></div>
                
                <!-- محتوى -->
                <div style="position: relative; z-index: 1; padding: 40px; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                    <h1 style="font-size: 3em; color: #fff; margin: 0; text-shadow: 0 0 20px rgba(0,255,136,0.5);">Vibe</h1>
                    <p style="font-size: 1.2em; color: #00ff88; margin: 10px 0;">عصري وجميل</p>
                </div>
                
                <style>
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(20px); }
                    }
                </style>
            </div>
        `
    },
    {
        id: 'vibe-light',
        name: 'Vibe Light',
        description: 'قالب عصري بخلفية فاتحة وتصميم نظيف',
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23fff" width="400" height="300"/%3E%3Cdefs%3E%3ClinearGradient id="grad2" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2300d4ff;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23ff00ff;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx="200" cy="150" r="80" fill="url(%23grad2)" opacity="0.2"/%3E%3C/svg%3E',
        html: `
            <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%); position: relative; overflow: hidden;">
                <!-- أشكال هندسية عضوية -->
                <div style="position: absolute; width: 300px; height: 300px; background: radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%); border-radius: 45% 55% 50% 50%; top: -50px; left: -50px; animation: rotate 8s linear infinite;"></div>
                
                <!-- محتوى -->
                <div style="position: relative; z-index: 1; padding: 40px; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                    <h1 style="font-size: 3em; color: #333; margin: 0;">Vibe</h1>
                    <p style="font-size: 1.2em; color: #00d4ff; margin: 10px 0;">نظيف وحديث</p>
                </div>
                
                <style>
                    @keyframes rotate {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `
    },
    {
        id: 'vibe-gradient',
        name: 'Vibe Gradient',
        description: 'قالب بتدرج ملون متحرك',
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23ff00ff" width="400" height="300"/%3E%3Cdefs%3E%3ClinearGradient id="grad3" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23ff00ff;stop-opacity:1" /%3E%3Cstop offset="50%25" style="stop-color:%2300ffff;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23ffff00;stop-opacity:1" /%3E%3C/linearGradient%3E%3Crect fill="url(%23grad3)" width="400" height="300"/%3E%3C/defs%3E%3C/svg%3E',
        html: `
            <div style="width: 100%; height: 100%; background: linear-gradient(-45deg, #ff00ff, #00ffff, #ffff00, #ff00ff); background-size: 400% 400%; position: relative; overflow: hidden; animation: gradient 8s ease infinite;">
                <!-- محتوى -->
                <div style="position: relative; z-index: 1; padding: 40px; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                    <h1 style="font-size: 3em; color: #fff; margin: 0; text-shadow: 0 0 20px rgba(0,0,0,0.3);">Vibe</h1>
                    <p style="font-size: 1.2em; color: #fff; margin: 10px 0; text-shadow: 0 0 10px rgba(0,0,0,0.2);">ألوان متحركة</p>
                </div>
                
                <style>
                    @keyframes gradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                </style>
            </div>
        `
    },
    {
        id: 'vibe-geometric',
        name: 'Vibe Geometric',
        description: 'قالب بأشكال هندسية عضوية متحركة',
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%231a1a2e" width="400" height="300"/%3E%3Ccircle cx="100" cy="100" r="50" fill="%2300ff88" opacity="0.3"/%3E%3Ccircle cx="300" cy="200" r="60" fill="%23ff00ff" opacity="0.3"/%3E%3C/svg%3E',
        html: `
            <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); position: relative; overflow: hidden;">
                <!-- أشكال هندسية متحركة -->
                <div style="position: absolute; width: 200px; height: 200px; background: radial-gradient(circle, rgba(0,255,136,0.3) 0%, transparent 70%); border-radius: 40% 60% 70% 30%; top: 10%; left: 10%; animation: morph1 8s ease-in-out infinite;"></div>
                
                <div style="position: absolute; width: 150px; height: 150px; background: radial-gradient(circle, rgba(255,0,255,0.3) 0%, transparent 70%); border-radius: 60% 40% 30% 70%; bottom: 10%; right: 10%; animation: morph2 8s ease-in-out infinite;"></div>
                
                <!-- محتوى -->
                <div style="position: relative; z-index: 1; padding: 40px; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                    <h1 style="font-size: 3em; color: #fff; margin: 0;">Vibe</h1>
                    <p style="font-size: 1.2em; color: #00ff88; margin: 10px 0;">أشكال عضوية</p>
                </div>
                
                <style>
                    @keyframes morph1 {
                        0%, 100% { border-radius: 40% 60% 70% 30%; }
                        50% { border-radius: 70% 30% 40% 60%; }
                    }
                    @keyframes morph2 {
                        0%, 100% { border-radius: 60% 40% 30% 70%; }
                        50% { border-radius: 30% 70% 60% 40%; }
                    }
                </style>
            </div>
        `
    },
    {
        id: 'vibe-profile',
        name: 'Vibe Profile',
        description: 'قالب ملف شخصي عصري',
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23000" width="400" height="300"/%3E%3Ccircle cx="200" cy="100" r="40" fill="%2300ff88"/%3E%3Crect x="100" y="160" width="200" height="80" fill="%231a1f3a" rx="10"/%3E%3C/svg%3E',
        html: `
            <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #000 0%, #1a1f3a 100%); position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <!-- إطار دائري عضوي -->
                <div style="position: relative; width: 150px; height: 150px; margin-bottom: 30px;">
                    <div style="position: absolute; width: 100%; height: 100%; background: radial-gradient(circle, #00ff88 0%, #00dd77 100%); border-radius: 45% 55% 50% 50%; animation: pulse 3s ease-in-out infinite;"></div>
                    <div style="position: absolute; width: 90%; height: 90%; background: #000; border-radius: 50%; top: 5%; left: 5%;"></div>
                </div>
                
                <!-- نص -->
                <h1 style="color: #fff; font-size: 2em; margin: 0; margin-bottom: 10px;">Profile</h1>
                <p style="color: #00ff88; font-size: 1em; margin: 0;">عصري وجميل</p>
                
                <style>
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                </style>
            </div>
        `
    }
];

/**
 * الحصول على قالب بواسطة المعرف
 */
function getTemplate(templateId) {
    return vibeTemplates.find(t => t.id === templateId);
}

/**
 * الحصول على جميع القوالب
 */
function getAllTemplates() {
    return vibeTemplates;
}

/**
 * تطبيق قالب على الصفحة
 */
function applyTemplate(templateId, iframeDoc) {
    const template = getTemplate(templateId);
    if (template && iframeDoc) {
        iframeDoc.body.innerHTML = template.html;
        return true;
    }
    return false;
}
