/**
 * نظام إدارة النسخ والجدولة الزمنية
 * يدير النسخ المتعددة (Edit 1, Edit 2...) والجدولة الزمنية بتوقيت مصر
 */

class VersionsManager {
    constructor() {
        this.versions = [];
        this.activeVersion = null;
        this.egyptTimezone = 'Africa/Cairo';
        this.initSupabase();
    }

    initSupabase() {
        // تهيئة Supabase
        if (typeof supabase !== 'undefined') {
            this.supabase = supabase;
        }
    }

    /**
     * حفظ نسخة جديدة من التصميم
     */
    async saveVersion(htmlContent, customName = null) {
        try {
            const versionNumber = this.versions.length + 1;
            const versionName = customName || `Edit ${versionNumber}`;
            const timestamp = new Date().toISOString();

            const versionData = {
                name: versionName,
                content: htmlContent,
                number: versionNumber,
                createdAt: timestamp,
                updatedAt: timestamp,
                isActive: false,
                schedule: {
                    enabled: false,
                    startTime: null,
                    endTime: null,
                    timezone: this.egyptTimezone
                }
            };

            // حفظ في Supabase
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('design_versions')
                    .insert([versionData]);

                if (error) {
                    console.error('خطأ في حفظ النسخة:', error);
                    return null;
                }

                this.versions.push(versionData);
                return versionData;
            } else {
                // حفظ محلي (localStorage) كبديل
                this.versions.push(versionData);
                localStorage.setItem('design_versions', JSON.stringify(this.versions));
                return versionData;
            }
        } catch (error) {
            console.error('خطأ:', error);
            return null;
        }
    }

    /**
     * تحديث اسم النسخة
     */
    async renameVersion(versionId, newName) {
        try {
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('design_versions')
                    .update({ name: newName })
                    .eq('id', versionId);

                if (error) throw error;
            }

            const version = this.versions.find(v => v.id === versionId);
            if (version) {
                version.name = newName;
            }

            return true;
        } catch (error) {
            console.error('خطأ في تحديث الاسم:', error);
            return false;
        }
    }

    /**
     * تحديد النسخة النشطة
     */
    async setActiveVersion(versionId) {
        try {
            // إلغاء تفعيل جميع النسخ
            this.versions.forEach(v => v.isActive = false);

            // تفعيل النسخة المختارة
            const version = this.versions.find(v => v.id === versionId);
            if (version) {
                version.isActive = true;
                this.activeVersion = version;

                if (this.supabase) {
                    await this.supabase
                        .from('design_versions')
                        .update({ isActive: true })
                        .eq('id', versionId);

                    // إلغاء تفعيل الباقي
                    await this.supabase
                        .from('design_versions')
                        .update({ isActive: false })
                        .neq('id', versionId);
                }

                return version;
            }
        } catch (error) {
            console.error('خطأ في تفعيل النسخة:', error);
        }
    }

    /**
     * جدولة النسخة لتعمل في وقت محدد
     */
    async scheduleVersion(versionId, startTime, endTime) {
        try {
            const version = this.versions.find(v => v.id === versionId);
            if (version) {
                version.schedule = {
                    enabled: true,
                    startTime: startTime,
                    endTime: endTime,
                    timezone: this.egyptTimezone
                };

                if (this.supabase) {
                    await this.supabase
                        .from('design_versions')
                        .update({ schedule: version.schedule })
                        .eq('id', versionId);
                }

                return true;
            }
        } catch (error) {
            console.error('خطأ في الجدولة:', error);
            return false;
        }
    }

    /**
     * الحصول على النسخة المناسبة بناءً على الوقت الحالي
     */
    getScheduledVersion() {
        const egyptTime = new Date().toLocaleString('en-US', { timeZone: this.egyptTimezone });
        const currentTime = new Date(egyptTime);
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();

        for (const version of this.versions) {
            if (version.schedule && version.schedule.enabled) {
                const [startHour, startMin] = version.schedule.startTime.split(':').map(Number);
                const [endHour, endMin] = version.schedule.endTime.split(':').map(Number);

                const startTotalMin = startHour * 60 + startMin;
                const endTotalMin = endHour * 60 + endMin;
                const currentTotalMin = currentHour * 60 + currentMinute;

                if (currentTotalMin >= startTotalMin && currentTotalMin <= endTotalMin) {
                    return version;
                }
            }
        }

        // إذا لم توجد نسخة مجدولة، أرجع النسخة النشطة
        return this.activeVersion;
    }

    /**
     * حذف نسخة
     */
    async deleteVersion(versionId) {
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('design_versions')
                    .delete()
                    .eq('id', versionId);

                if (error) throw error;
            }

            this.versions = this.versions.filter(v => v.id !== versionId);
            return true;
        } catch (error) {
            console.error('خطأ في حذف النسخة:', error);
            return false;
        }
    }

    /**
     * الحصول على جميع النسخ
     */
    getAllVersions() {
        return this.versions;
    }

    /**
     * تحميل النسخ من قاعدة البيانات
     */
    async loadVersions() {
        try {
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('design_versions')
                    .select('*');

                if (error) throw error;

                this.versions = data || [];
            } else {
                const stored = localStorage.getItem('design_versions');
                this.versions = stored ? JSON.parse(stored) : [];
            }

            return this.versions;
        } catch (error) {
            console.error('خطأ في تحميل النسخ:', error);
            return [];
        }
    }
}

// إنشاء مثيل عام
const versionsManager = new VersionsManager();
