/**
 * 错误处理工具类
 * 提供统一的错误处理、日志记录和用户提示
 *
 * @version 2.1.0
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100; // 最多保存100条错误记录
        this.setupGlobalHandlers();
    }

    /**
     * 设置全局错误处理器
     */
    setupGlobalHandlers() {
        // 捕获未处理的Promise拒绝
        window.addEventListener('unhandledrejection', event => {
            this.handleError(event.reason, 'Unhandled Promise Rejection');
            event.preventDefault();
        });

        // 捕获全局错误
        window.addEventListener('error', event => {
            this.handleError(event.error || event.message, 'Global Error');
        });
    }

    /**
     * 处理错误
     * @param {Error|string} error - 错误对象或消息
     * @param {string} context - 错误上下文
     * @param {Object} metadata - 额外的元数据
     */
    handleError(error, context = 'Unknown', metadata = {}) {
        const errorInfo = {
            message: error?.message || String(error),
            stack: error?.stack || new Error().stack,
            context,
            metadata,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // 保存错误记录
        this.errors.push(errorInfo);
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // 记录到控制台
        console.error(`[${context}]`, error, metadata);

        // 在开发模式下显示详细错误
        if (CONFIG?.development?.debug) {
            this.showErrorNotification(errorInfo);
        }

        // 可以在这里添加错误上报到服务器的逻辑
        // this.reportToServer(errorInfo);
    }

    /**
     * 显示错误通知
     * @param {Object} errorInfo - 错误信息
     */
    showErrorNotification(errorInfo) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="error-notification-content">
                <div class="error-notification-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${errorInfo.context}</span>
                    <button class="error-notification-close">&times;</button>
                </div>
                <div class="error-notification-body">
                    <p>${errorInfo.message}</p>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // 自动关闭
        setTimeout(() => {
            notification.remove();
        }, 5000);

        // 点击关闭
        notification.querySelector('.error-notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    /**
     * 包装异步函数以捕获错误
     * @param {Function} fn - 异步函数
     * @param {string} context - 上下文
     * @returns {Function}
     */
    wrapAsync(fn, context) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.handleError(error, context);
                throw error;
            }
        };
    }

    /**
     * 包装同步函数以捕获错误
     * @param {Function} fn - 同步函数
     * @param {string} context - 上下文
     * @returns {Function}
     */
    wrapSync(fn, context) {
        return (...args) => {
            try {
                return fn(...args);
            } catch (error) {
                this.handleError(error, context);
                throw error;
            }
        };
    }

    /**
     * 获取所有错误记录
     * @returns {Array}
     */
    getErrors() {
        return [...this.errors];
    }

    /**
     * 清除错误记录
     */
    clearErrors() {
        this.errors = [];
    }

    /**
     * 导出错误日志
     * @returns {string}
     */
    exportErrors() {
        return JSON.stringify(this.errors, null, 2);
    }
}

// 创建全局错误处理器实例
const errorHandler = new ErrorHandler();
window.errorHandler = errorHandler;
