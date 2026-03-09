/**
 * مكتبة ضغط الفيديو والصوت
 * تستخدم FFmpeg.js لضغط الملفات بدون فقدان جودة كبيرة
 */

// تحميل FFmpeg من CDN
const FFmpegModule = FFmpeg.FFmpeg;
const { createFFmpeg, fetchFile } = FFmpeg;

let ffmpeg = null;
let ffmpegReady = false;

/**
 * تهيئة FFmpeg
 */
async function initFFmpeg() {
    if (ffmpegReady) return;
    
    try {
        ffmpeg = createFFmpeg({ 
            log: true,
            corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js'
        });
        
        if (!ffmpeg.isLoaded()) {
            await ffmpeg.load();
        }
        ffmpegReady = true;
        console.log('✅ FFmpeg جاهز للاستخدام');
    } catch (error) {
        console.error('❌ خطأ في تحميل FFmpeg:', error);
        throw error;
    }
}

/**
 * ضغط الفيديو مع الحفاظ على الجودة
 * @param {File} videoFile - ملف الفيديو
 * @param {Function} onProgress - دالة تتبع التقدم
 * @returns {Promise<Blob>} - الفيديو المضغوط
 */
async function compressVideo(videoFile, onProgress = null) {
    try {
        await initFFmpeg();
        
        const inputName = videoFile.name;
        const outputName = `compressed_${Date.now()}.mp4`;
        
        // كتابة الملف إلى نظام الملفات الافتراضي لـ FFmpeg
        ffmpeg.FS('writeFile', inputName, await fetchFile(videoFile));
        
        // تشغيل أمر FFmpeg لضغط الفيديو
        // الإعدادات:
        // -c:v libx264: استخدام H.264 codec
        // -preset medium: توازن بين السرعة والجودة
        // -crf 23: جودة (0-51، كلما قل الرقم كانت الجودة أفضل)
        // -c:a aac: صوت AAC
        // -b:a 128k: معدل البت للصوت
        await ffmpeg.run(
            '-i', inputName,
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-movflags', 'faststart',
            outputName
        );
        
        // قراءة الملف المضغوط
        const compressedData = ffmpeg.FS('readFile', outputName);
        const blob = new Blob([compressedData.buffer], { type: 'video/mp4' });
        
        // تنظيف الملفات
        ffmpeg.FS('unlink', inputName);
        ffmpeg.FS('unlink', outputName);
        
        if (onProgress) onProgress(100);
        return blob;
    } catch (error) {
        console.error('❌ خطأ في ضغط الفيديو:', error);
        throw error;
    }
}

/**
 * ضغط الصوت مع الحفاظ على الجودة
 * @param {File} audioFile - ملف الصوت
 * @param {Function} onProgress - دالة تتبع التقدم
 * @returns {Promise<Blob>} - الصوت المضغوط
 */
async function compressAudio(audioFile, onProgress = null) {
    try {
        await initFFmpeg();
        
        const inputName = audioFile.name;
        const outputName = `compressed_${Date.now()}.mp3`;
        
        // كتابة الملف إلى نظام الملفات الافتراضي لـ FFmpeg
        ffmpeg.FS('writeFile', inputName, await fetchFile(audioFile));
        
        // تشغيل أمر FFmpeg لضغط الصوت
        // الإعدادات:
        // -b:a 192k: معدل البت (جودة عالية مع ضغط)
        // -q:a 4: جودة VBR (Variable Bit Rate)
        await ffmpeg.run(
            '-i', inputName,
            '-b:a', '192k',
            '-q:a', '4',
            outputName
        );
        
        // قراءة الملف المضغوط
        const compressedData = ffmpeg.FS('readFile', outputName);
        const blob = new Blob([compressedData.buffer], { type: 'audio/mpeg' });
        
        // تنظيف الملفات
        ffmpeg.FS('unlink', inputName);
        ffmpeg.FS('unlink', outputName);
        
        if (onProgress) onProgress(100);
        return blob;
    } catch (error) {
        console.error('❌ خطأ في ضغط الصوت:', error);
        throw error;
    }
}

/**
 * الحصول على معلومات الملف (الحجم والمدة)
 * @param {File} file - الملف
 * @returns {Object} - معلومات الملف
 */
function getFileInfo(file) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
        name: file.name,
        size: sizeInMB,
        type: file.type,
        lastModified: new Date(file.lastModified).toLocaleString('ar-SA')
    };
}

/**
 * تحويل Blob إلى File
 * @param {Blob} blob - البيانات
 * @param {String} filename - اسم الملف
 * @returns {File} - ملف
 */
function blobToFile(blob, filename) {
    return new File([blob], filename, { type: blob.type });
}
