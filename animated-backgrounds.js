/**
 * نظام الخلفيات المتحركة (Animated Fluid Gradients)
 * خلفيات ملونة متحركة بطريقة عصرية وحديثة
 */

class AnimatedBackground {
    constructor(containerElement) {
        this.container = containerElement;
        this.colors = ['#00ff88', '#ff00ff', '#00ffff'];
        this.animationSpeed = 8;
        this.style = 'gradient'; // gradient, fluid, wave, pulse
    }

    /**
     * تعيين الألوان
     */
    setColors(colors) {
        this.colors = colors;
        this.update();
    }

    /**
     * تعيين سرعة الحركة
     */
    setSpeed(speed) {
        this.animationSpeed = speed;
        this.update();
    }

    /**
     * تعيين نمط الحركة
     */
    setStyle(style) {
        this.style = style;
        this.update();
    }

    /**
     * تحديث الخلفية
     */
    update() {
        if (!this.container) return;

        const colorString = this.colors.join(', ');
        let css = '';

        switch (this.style) {
            case 'gradient':
                css = this.createGradientAnimation(colorString);
                break;
            case 'fluid':
                css = this.createFluidAnimation(colorString);
                break;
            case 'wave':
                css = this.createWaveAnimation(colorString);
                break;
            case 'pulse':
                css = this.createPulseAnimation(colorString);
                break;
            default:
                css = this.createGradientAnimation(colorString);
        }

        this.container.style.cssText = css;
    }

    /**
     * إنشاء حركة تدرج متحرك
     */
    createGradientAnimation(colors) {
        const gradient = `linear-gradient(-45deg, ${colors})`;
        return `
            background: ${gradient};
            background-size: 400% 400%;
            animation: gradient-animation ${this.animationSpeed}s ease infinite;
            position: relative;
            overflow: hidden;
        `;
    }

    /**
     * إنشاء حركة سائلة (Fluid)
     */
    createFluidAnimation(colors) {
        return `
            background: radial-gradient(circle at 20% 50%, ${colors});
            background-size: 200% 200%;
            animation: fluid-animation ${this.animationSpeed}s ease infinite;
            position: relative;
            overflow: hidden;
        `;
    }

    /**
     * إنشاء حركة موجية
     */
    createWaveAnimation(colors) {
        const gradient = `linear-gradient(90deg, ${colors})`;
        return `
            background: ${gradient};
            background-size: 200% 100%;
            animation: wave-animation ${this.animationSpeed}s ease-in-out infinite;
            position: relative;
            overflow: hidden;
        `;
    }

    /**
     * إنشاء حركة نبضية
     */
    createPulseAnimation(colors) {
        const gradient = `radial-gradient(circle, ${colors})`;
        return `
            background: ${gradient};
            background-size: 200% 200%;
            animation: pulse-animation ${this.animationSpeed}s ease-in-out infinite;
            position: relative;
            overflow: hidden;
        `;
    }

    /**
     * إضافة أنماط CSS للحركات
     */
    static injectStyles() {
        if (document.getElementById('animated-bg-styles')) return;

        const style = document.createElement('style');
        style.id = 'animated-bg-styles';
        style.innerHTML = `
            @keyframes gradient-animation {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            @keyframes fluid-animation {
                0% { background-position: 0% 0%; }
                25% { background-position: 100% 0%; }
                50% { background-position: 100% 100%; }
                75% { background-position: 0% 100%; }
                100% { background-position: 0% 0%; }
            }

            @keyframes wave-animation {
                0% { background-position: 0% center; }
                50% { background-position: 100% center; }
                100% { background-position: 0% center; }
            }

            @keyframes pulse-animation {
                0%, 100% { background-position: 0% 0%; }
                50% { background-position: 100% 100%; }
            }

            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(20px); }
            }

            @keyframes morph {
                0%, 100% { border-radius: 40% 60% 70% 30%; }
                50% { border-radius: 70% 30% 40% 60%; }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * الحصول على HTML للخلفية المتحركة
     */
    getHTML() {
        const colorString = this.colors.join(', ');
        let html = '';

        switch (this.style) {
            case 'gradient':
                html = `
                    <div style="width: 100%; height: 100%; background: linear-gradient(-45deg, ${colorString}); background-size: 400% 400%; animation: gradient-animation ${this.animationSpeed}s ease infinite;"></div>
                `;
                break;
            case 'fluid':
                html = `
                    <div style="width: 100%; height: 100%; background: radial-gradient(circle at 20% 50%, ${colorString}); background-size: 200% 200%; animation: fluid-animation ${this.animationSpeed}s ease infinite;"></div>
                `;
                break;
            case 'wave':
                html = `
                    <div style="width: 100%; height: 100%; background: linear-gradient(90deg, ${colorString}); background-size: 200% 100%; animation: wave-animation ${this.animationSpeed}s ease-in-out infinite;"></div>
                `;
                break;
            case 'pulse':
                html = `
                    <div style="width: 100%; height: 100%; background: radial-gradient(circle, ${colorString}); background-size: 200% 200%; animation: pulse-animation ${this.animationSpeed}s ease-in-out infinite;"></div>
                `;
                break;
        }

        return html;
    }
}

// حقن الأنماط عند التحميل
AnimatedBackground.injectStyles();

/**
 * مجموعة من الخلفيات المعرفة مسبقاً
 */
const predefinedBackgrounds = {
    'neon': {
        colors: ['#00ff88', '#ff00ff', '#00ffff'],
        style: 'gradient',
        speed: 8
    },
    'sunset': {
        colors: ['#ff6b6b', '#ffa500', '#ffff00'],
        style: 'gradient',
        speed: 6
    },
    'ocean': {
        colors: ['#0066cc', '#00ccff', '#00ff88'],
        style: 'fluid',
        speed: 10
    },
    'fire': {
        colors: ['#ff0000', '#ff6600', '#ffff00'],
        style: 'wave',
        speed: 4
    },
    'galaxy': {
        colors: ['#1a0033', '#330066', '#0066ff'],
        style: 'pulse',
        speed: 12
    },
    'forest': {
        colors: ['#006600', '#00cc00', '#00ff88'],
        style: 'gradient',
        speed: 8
    }
};

/**
 * الحصول على خلفية معرفة مسبقاً
 */
function getPredefinedBackground(name) {
    return predefinedBackgrounds[name] || predefinedBackgrounds['neon'];
}
