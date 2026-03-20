/**
 * 性能优化工具类
 * 提供性能监控、优化和调试功能
 *
 * @version 2.1.0
 */

const Performance = {
    /**
     * 性能标记
     */
    marks: new Map(),

    /**
     * 开始性能测量
     * @param {string} name - 测量名称
     */
    mark(name) {
        this.marks.set(name, performance.now());
    },

    /**
     * 结束性能测量并输出结果
     * @param {string} name - 测量名称
     * @returns {number} 耗时（毫秒）
     */
    measure(name) {
        const startTime = this.marks.get(name);
        if (!startTime) {
            console.warn(`Performance mark '${name}' not found`);
            return 0;
        }

        const duration = performance.now() - startTime;
        this.marks.delete(name);

        if (CONFIG?.development?.debug) {
            console.log(`⏱️ [Performance] ${name}: ${duration.toFixed(2)}ms`);
        }

        return duration;
    },

    /**
     * 请求空闲回调
     * @param {Function} callback - 回调函数
     * @param {Object} options - 选项
     */
    requestIdleCallback(callback, options = {}) {
        if ('requestIdleCallback' in window) {
            return window.requestIdleCallback(callback, options);
        } else {
            // 降级方案
            return setTimeout(
                () =>
                    callback({
                        didTimeout: false,
                        timeRemaining: () => 50
                    }),
                1
            );
        }
    },

    /**
     * 取消空闲回调
     * @param {number} id - 回调ID
     */
    cancelIdleCallback(id) {
        if ('cancelIdleCallback' in window) {
            window.cancelIdleCallback(id);
        } else {
            clearTimeout(id);
        }
    },

    /**
     * 图片懒加载
     * @param {HTMLElement} container - 容器元素
     */
    lazyLoadImages(container = document) {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            const src = img.dataset.src;

                            if (src) {
                                img.src = src;
                                img.removeAttribute('data-src');
                                observer.unobserve(img);
                            }
                        }
                    });
                },
                {
                    rootMargin: '50px 0px',
                    threshold: 0.01
                }
            );

            container.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // 降级方案：直接加载所有图片
            container.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    },

    /**
     * 防抖函数（增强版）
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间
     * @param {boolean} immediate - 是否立即执行
     * @returns {Function}
     */
    debounce(func, wait = 300, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const context = this;
            const later = () => {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    },

    /**
     * 节流函数（增强版）
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 限制时间
     * @param {Object} options - 选项
     * @returns {Function}
     */
    throttle(func, limit = 100, options = {}) {
        let inThrottle, lastFunc, lastRan;
        const { leading = true, trailing = true } = options;

        return function (...args) {
            const context = this;
            if (!inThrottle) {
                if (leading) {
                    func.apply(context, args);
                }
                lastRan = Date.now();
                inThrottle = true;
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(
                    () => {
                        if (Date.now() - lastRan >= limit) {
                            if (trailing) {
                                func.apply(context, args);
                            }
                            lastRan = Date.now();
                        }
                    },
                    Math.max(limit - (Date.now() - lastRan), 0)
                );
            }
        };
    }
};

window.Performance = Performance;
