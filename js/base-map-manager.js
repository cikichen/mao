/**
 * 基础地图管理器抽象类
 * 定义地图管理器的通用接口和共享功能
 *
 * @abstract
 * @version 2.1.0
 */

class BaseMapManager {
    constructor() {
        if (new.target === BaseMapManager) {
            throw new TypeError('Cannot construct BaseMapManager instances directly');
        }

        this.map = null;
        this.markers = new Map();
        this.movingFootprintMarker = null;
        this.animatedTrajectory = null;
        this.staticTrajectory = null;
        this.isInitialized = false;
        this.eventListeners = new Map();
    }

    /**
     * 初始化地图 (抽象方法)
     * @abstract
     * @param {string} containerId - 地图容器ID
     * @returns {Promise<void>}
     */
    async initMap(_containerId) {
        throw new Error("Method 'initMap()' must be implemented.");
    }

    /**
     * 添加事件标记点 (抽象方法)
     * @abstract
     * @param {Array} events - 事件数组
     */
    addEventMarkers(_events) {
        throw new Error("Method 'addEventMarkers()' must be implemented.");
    }

    /**
     * 将地图中心移动到指定事件 (抽象方法)
     * @abstract
     * @param {Object} event - 事件对象
     * @param {number} targetZoom - 目标缩放级别 (默认12)
     * @param {Object} options - 定位选项
     * @param {boolean} options.animate - 是否使用动画 (默认true)
     * @param {number} options.duration - 动画持续时间(ms) (默认800)
     * @param {boolean} options.highlight - 是否高亮标记 (默认true)
     * @param {Array<number>} options.offset - 中心点偏移[x, y] (默认[0, 0])
     */
    centerToEvent(_event, _targetZoom = 12, _options = {}) {
        throw new Error("Method 'centerToEvent()' must be implemented.");
    }

    /**
     * 绘制静态轨迹 (抽象方法)
     * @abstract
     * @param {Array} eventsArray - 事件数组
     */
    drawStaticTrajectory(_eventsArray) {
        throw new Error("Method 'drawStaticTrajectory()' must be implemented.");
    }

    /**
     * 动画移动足迹 (抽象方法)
     * @abstract
     * @param {Object} startEvent - 起始事件
     * @param {Object} endEvent - 结束事件
     * @param {number} baseDuration - 基础持续时间
     * @returns {Promise<void>}
     */
    async animateFootprint(_startEvent, _endEvent, _baseDuration = 2000) {
        throw new Error("Method 'animateFootprint()' must be implemented.");
    }

    /**
     * 显示动画轨迹
     */
    showAnimatedTrajectory() {
        // 默认实现，子类可以覆盖
        console.log(`${this.constructor.name}: showAnimatedTrajectory called`);
    }

    /**
     * 隐藏动画轨迹
     */
    hideAnimatedTrajectory() {
        // 默认实现，子类可以覆盖
        console.log(`${this.constructor.name}: hideAnimatedTrajectory called`);
    }

    /**
     * 清除动画轨迹
     */
    clearAnimatedTrajectory() {
        // 默认实现，子类可以覆盖
        console.log(`${this.constructor.name}: clearAnimatedTrajectory called`);
    }

    /**
     * 事件监听器管理
     */
    on(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(callback);
    }

    off(eventName, callback) {
        if (this.eventListeners.has(eventName)) {
            const listeners = this.eventListeners.get(eventName);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(eventName, ...args) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName).forEach(cb => {
                try {
                    cb(...args);
                } catch (error) {
                    console.error(`Error in event listener for '${eventName}':`, error);
                }
            });
        }
    }

    /**
     * 验证坐标有效性
     * @param {Object} coordinates - 坐标对象 {lng, lat}
     * @returns {boolean}
     */
    validateCoordinates(coordinates) {
        return (
            coordinates &&
            !isNaN(coordinates.lng) &&
            !isNaN(coordinates.lat) &&
            coordinates.lng >= -180 &&
            coordinates.lng <= 180 &&
            coordinates.lat >= -90 &&
            coordinates.lat <= 90
        );
    }

    /**
     * 销毁地图实例
     */
    destroy() {
        this.eventListeners.clear();
        this.markers.clear();
        this.map = null;
        this.isInitialized = false;
    }
}

window.BaseMapManager = BaseMapManager;
