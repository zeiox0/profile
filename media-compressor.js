/**
 * مكتبة ضغط الفيديو والصوت المحسنة
 * تستخدم FFmpeg.js (الإصدار الحديث) لضغط الملفات في المتصفح
 */

let ffmpeg = null;
let ffmpegReady = false;

/**
 * تهيئة FFmpeg
 */
async function initFFmpeg() {
    if (ffmpegReady) return ffmpeg;
    
    try {
        const { createFFmpeg } = FFmpeg;
        ffmpeg = createFFmpeg({ 
            log: true,
            corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
        });
        
        await ffmpeg.load();
        ffmpegReady = true;
        console.log('✅ FFmpeg جاهز للاستخدام');
        return ffmpeg;
    } catch (error) {
        console.error('❌ خطأ في تحميل FFmpeg:', error);
        throw new Error('فشل تحميل محرك الضغط. تأكد من اتصال الإنترنت.');
    }
}

/**
 * ضغط الفيديو مع الحفاظ على الجودة
 */
async function compressVideo(videoFile, onProgress = null) {
    try {
        const ffmpegInstance = await initFFmpeg();
        const { fetchFile } = FFmpeg;
        
        const inputName = 'input_' + videoFile.name.replace(/\s+/g, '_');
        const outputName = `compressed_${Date.now()}.mp4`;
        
        // إعداد تتبع التقدم
        ffmpegInstance.setProgress(({ ratio }) => {
            if (onProgress) onProgress(Math.round(ratio * 100));
        });

        // كتابة الملف
        ffmpegInstance.FS('writeFile', inputName, await fetchFile(videoFile));
        
        // تشغيل الضغط
        // -crf 28 يوفر توازن ممتاز بين الحجم والجودة
        await ffmpegInstance.run(
            '-i', inputName,
            '-vcodec', 'libx264',
            '-crf', '28',
            '-preset', 'ultrafast',
            '-acodec', 'aac',
            '-b:a', '128k',
            outputName
        );
        
        // قراءة النتيجة
        const data = ffmpegInstance.FS('readFile', outputName);
        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        
        // تنظيف
        ffmpegInstance.FS('unlink', inputName);
        ffmpegInstance.FS('unlink', outputName);
        
        return blob;
    } catch (error) {
        console.error('❌ خطأ في ضغط الفيديو:', error);
        throw error;
    }
}

/**
 * ضغط الصوت
 */
async function compressAudio(audioFile, onProgress = null) {
    try {
        const ffmpegInstance = await initFFmpeg();
        const { fetchFile } = FFmpeg;
        
        const inputName = 'input_' + audioFile.name.replace(/\s+/g, '_');
        const outputName = `compressed_${Date.now()}.mp3`;
        
        ffmpegInstance.setProgress(({ ratio }) => {
            if (onProgress) onProgress(Math.round(ratio * 100));
        });

        ffmpegInstance.FS('writeFile', inputName, await fetchFile(audioFile));
        
        await ffmpegInstance.run(
            '-i', inputName,
            '-ab', '128k',
            outputName
        );
        
        const data = ffmpegInstance.FS('readFile', outputName);
        const blob = new Blob([data.buffer], { type: 'audio/mpeg' });
        
        ffmpegInstance.FS('unlink', inputName);
        ffmpegInstance.FS('unlink', outputName);
        
        return blob;
    } catch (error) {
        console.error('❌ خطأ في ضغط الصوت:', error);
        throw error;
    }
}

function getFileInfo(file) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
        name: file.name,
        size: sizeInMB,
        type: file.type,
        lastModified: new Date(file.lastModified).toLocaleString('ar-SA')
    };
}

function blobToFile(blob, filename) {
    return new File([blob], filename, { type: blob.type });
}
