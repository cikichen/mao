export default class AMapManager {
    constructor() {
        this.map = null;
        this.markers = new Map();
        this.trajectory = null;
        this.currentMarker = null;
        this.movingFootprintMarker = null;
        this.animatedTrajectory = null; // For the growing path during animation
        this.staticTrajectory = null;   // For the full path when not animating
        this.isInitialized = false;
        this.eventListeners = new Map();
        this.selectedMarkerId = null;
    }

    async initMap(containerOrId) {
        if (typeof AMap === 'undefined') throw new Error('高德地图API未加载');

        // Resolve container
        let container = containerOrId;
        if (typeof containerOrId === 'string') {
            container = document.getElementById(containerOrId);
            if (!container) throw new Error(`Map container '${containerOrId}' not found`);
        }

        // 使用韶山（出生点）作为初始中心点
        this.map = new AMap.Map(container, {
            center: [112.527621, 27.915456], // 韶山坐标
            zoom: 8, // 使用较高的缩放级别显示更多细节
            mapStyle: 'amap://styles/dark',
        });
        this.map.on('complete', () => {
            this.isInitialized = true;
            this.emit('mapReady');

            // Initialize animated and static trajectories
            this.animatedTrajectory = new AMap.Polyline({
                path: [],
                strokeColor: '#ff4444', // Red for animated path
                strokeWeight: 4,
                strokeOpacity: 0.8,
                map: this.map,
                zIndex: 90 // Higher zIndex for animated path
            });
            this.staticTrajectory = new AMap.Polyline({
                path: [],
                strokeColor: '#d32f2f', // Theme red for static path
                strokeWeight: 4,
                strokeOpacity: 0.5,
                map: this.map,
                zIndex: 80 // Lower zIndex for static path
            });
        });
        return new Promise(resolve => this.map.on('complete', resolve));
    }

    _createMarkerContent(type, isSelected = false) {
        const colors = {
            historical: '#d32f2f',
            article: '#ffd700',
            poem: '#ff8a65'
        };
        const color = colors[type] || colors.historical;
        const size = isSelected ? 18 : 12;
        const border = isSelected ? 3 : 2;
        const shadow = isSelected
            ? `0 0 12px ${color}, 0 0 24px ${color}40`
            : `0 0 6px ${color}80`;

        return `<div style="
            width: ${size}px; height: ${size}px;
            background: ${color};
            border-radius: 50%;
            border: ${border}px solid #fff;
            box-shadow: ${shadow};
            transition: all 0.25s ease;
            cursor: pointer;
        "></div>`;
    }

    _getMarkerOffset(isSelected = false) {
        const size = isSelected ? 18 : 12;
        return new AMap.Pixel(-size / 2, -size / 2);
    }

    addEventMarkers(events) {
        this.clearMarkers();
        events.forEach(event => {
            if (!event.coordinates || isNaN(event.coordinates.lng) || isNaN(event.coordinates.lat)) return;
            
            const isSelected = event.id === this.selectedMarkerId;
            const marker = new AMap.Marker({
                position: [event.coordinates.lng, event.coordinates.lat],
                title: event.title,
                content: this._createMarkerContent(event.type, isSelected),
                offset: this._getMarkerOffset(isSelected),
                extData: event
            });
            
            marker.on('click', () => {
                this.highlightMarker(event.id);
                this.emit('markerClick', event);
            });
            
            this.map.add(marker);
            this.markers.set(event.id, { marker, event });
        });
        
        // 自动适配视野
        if (this.markers.size > 1) {
            this.map.setFitView();
        }
    }

    clearMarkers() {
        if (!this.markers.size) return;
        this.markers.forEach(({ marker }) => {
            if (marker && typeof marker.setMap === 'function') {
                marker.setMap(null);
            }
        });
        this.markers.clear();
        this.selectedMarkerId = null;
    }

    highlightMarker(eventId) {
        // 恢复上一个选中的 marker
        if (this.selectedMarkerId && this.markers.has(this.selectedMarkerId)) {
            const prev = this.markers.get(this.selectedMarkerId);
            if (prev && prev.marker) {
                prev.marker.setContent(this._createMarkerContent(prev.event.type, false));
                prev.marker.setOffset(this._getMarkerOffset(false));
            }
        }

        // 高亮新选中的 marker
        if (this.markers.has(eventId)) {
            const curr = this.markers.get(eventId);
            if (curr && curr.marker) {
                curr.marker.setContent(this._createMarkerContent(curr.event.type, true));
                curr.marker.setOffset(this._getMarkerOffset(true));
                this.selectedMarkerId = eventId;
            }
        }
    }

    centerToEvent(event) {
        if (!event.coordinates || isNaN(event.coordinates.lng) || isNaN(event.coordinates.lat)) return;
        const item = this.markers.get(event.id);
        if (!item || !item.marker) return;

        this.map.panTo(item.marker.getPosition());
        this.map.setZoom(12);

        this.highlightMarker(event.id);
    }

    drawStaticTrajectory(eventsArray) {
        // Hide animated trajectory
        if (this.animatedTrajectory) {
            this.animatedTrajectory.setPath([]);
        }

        if (!eventsArray || eventsArray.length < 1) {
            if (this.staticTrajectory) this.staticTrajectory.setPath([]);
            return;
        }

        const pathPoints = eventsArray.map(event => {
            if (event.coordinates && !isNaN(event.coordinates.lng) && !isNaN(event.coordinates.lat)) {
                return [event.coordinates.lng, event.coordinates.lat];
            }
            return null;
        }).filter(point => point !== null);

        if (pathPoints.length < 1) {
            if (this.staticTrajectory) this.staticTrajectory.setPath([]);
            return;
        }

        if (this.staticTrajectory) {
            this.staticTrajectory.setPath(pathPoints);
        }
    }

    // New: Animate a footprint marker along a path with smart zoom and speed control
    animateFootprint(startEvent, endEvent, baseDuration = 2000) {
        return new Promise(resolve => {
            if (!startEvent || !endEvent || !startEvent.coordinates || !endEvent.coordinates) {
                resolve();
                return;
            }

            const startPos = new AMap.LngLat(startEvent.coordinates.lng, startEvent.coordinates.lat);
            const endPos = new AMap.LngLat(endEvent.coordinates.lng, endEvent.coordinates.lat);

            // Calculate distance and determine animation strategy
            const distance = startPos.distance(endPos);
            // 阶梯式距离-变焦与时间自适应法则（让同城微距事件聚焦街区，长途跃迁展示宏观，且保证短途也有平移动效）
            let zoomInLevel, duration;
            if (distance < 1500) {          // < 1.5km - 极近距离
                zoomInLevel = 15;
                duration = 2000;            // 保证至少有2秒看清位移与连线
            } else if (distance < 10000) {  // 1.5km - 10km
                zoomInLevel = 13;
                duration = 2200;
            } else if (distance < 50000) {  // 10km - 50km
                zoomInLevel = 11;
                duration = 2500;
            } else if (distance < 200000) { // 50km - 200km
                zoomInLevel = 9;
                duration = 2800;
            } else if (distance < 600000) { // 200km - 600km
                zoomInLevel = 7;
                duration = 3300;
            } else {                        // >= 600km - 跨大半个中国
                zoomInLevel = 5;
                duration = 4000;
            }

            console.log(`AMap Distance: ${distance}m, duration: ${duration}ms, zoom: ${zoomInLevel}`);

            if (!this.movingFootprintMarker) {
                this.movingFootprintMarker = new AMap.Marker({
                    position: startPos,
                    content: `
                        <div class="mao-footprint-container">
                            <svg viewBox="0 0 100 100" width="32" height="32" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                                <circle cx="50" cy="50" r="46" fill="#d32f2f" stroke="#ffd700" stroke-width="4"/>
                                <ellipse cx="50" cy="65" rx="30" ry="12" fill="rgba(0,0,0,0.25)"/>
                                <path d="M 24,55 C 24,35 34,26 50,26 C 66,26 76,35 76,55 Z" fill="#8ca0ba" stroke="#2c3e50" stroke-width="3"/>
                                <path d="M 50,26 L 50,55 M 34,36 L 50,55 M 66,36 L 50,55" stroke="#2c3e50" stroke-width="2" stroke-linecap="round"/>
                                <path d="M 18,54 C 18,54 28,62 50,62 C 72,62 82,54 82,54 C 82,54 74,68 50,68 C 26,68 18,54 18,54 Z" fill="#2c3e50"/>
                                <polygon points="50,33 53,40 60,40 55,44 57,51 50,47 43,51 45,44 40,40 47,40" fill="#ff1744"/>
                            </svg>
                        </div>
                    `,
                    offset: new AMap.Pixel(-16, -16),
                    map: this.map
                });
            }

            let startTime = null;
            let eventTriggered = false;
            let frameCount = 0; // 轨迹更新节流计数器

            // 1. 触发高德原生的变焦与位移飞越动画（硬件加速，平滑过渡，持续时间严格等于我们计算的 duration）
            this.map.setZoomAndCenter(zoomInLevel, endPos, false, duration);

            // 缓动函数
            const easeInOutCubic = (t) => {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            };

            // 2. 通过 requestAnimationFrame 仅负责更新行进 Marker 坐标与动感轨迹线
            const animate = (currentTime) => {
                if (!startTime) startTime = currentTime;
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeInOutCubic(progress);
                frameCount++;

                if (progress > 0.1 && !eventTriggered) {
                    this.emit('eventReached', endEvent);
                    eventTriggered = true;
                }

                const currentLng = startPos.getLng() + (endPos.getLng() - startPos.getLng()) * easedProgress;
                const currentLat = startPos.getLat() + (endPos.getLat() - startPos.getLat()) * easedProgress;
                const currentPos = new AMap.LngLat(currentLng, currentLat);

                // 更新 Marker 位置（AMap setPosition 极轻量，每帧执行确保头像运动极致丝滑）
                this.movingFootprintMarker.setPosition(currentPos);

                // 3. 节流绘制行动轨迹线（每 5 帧或到达终点时才更新一次 Polyline，避免每帧高频重绘折线导致的 CPU/GPU 渲染线程卡死）
                if (frameCount % 5 === 0 || progress >= 1) {
                    const animatedPath = this.animatedTrajectory.getPath();
                    if (animatedPath.length === 0 || animatedPath[animatedPath.length - 1].toString() !== currentPos.toString()) {
                        animatedPath.push(currentPos);
                        this.animatedTrajectory.setPath(animatedPath);
                    }
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // 到达目的地，稍微留白缓冲
                    setTimeout(() => {
                        resolve();
                    }, 200);
                }
            };

            requestAnimationFrame(animate);
        });
    }

    on(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(callback);
    }

    emit(eventName, ...args) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName).forEach(cb => cb(...args));
        }
    }

    showAnimatedTrajectory() {
        if (this.animatedTrajectory && this.animatedTrajectory.show) {
            this.animatedTrajectory.show();
        }
        if (this.staticTrajectory && this.staticTrajectory.hide) {
            this.staticTrajectory.hide();
        }
    }

    hideAnimatedTrajectory() {
        if (this.animatedTrajectory && this.animatedTrajectory.hide) {
            this.animatedTrajectory.hide();
            this.animatedTrajectory.setPath([]); // Clear path when hidden
        }
        if (this.staticTrajectory && this.staticTrajectory.show) {
            this.staticTrajectory.show();
        }
    }

    clearAnimatedTrajectory() {
        console.log("AMapManager: clearAnimatedTrajectory called");
        if (this.animatedTrajectory) {
            this.animatedTrajectory.setPath([]); // 清空路径
            if (this.animatedTrajectory.hide) {
                this.animatedTrajectory.hide();
            }
        }
        if (this.movingFootprintMarker) {
            this.movingFootprintMarker.setMap(null); // 移除移动标记
            this.movingFootprintMarker = null;
        }
    }

    destroy() {
        this.clearAnimatedTrajectory();
        this.clearMarkers();
        if (this.map) {
            if (typeof this.map.destroy === 'function') {
                this.map.destroy();
            }
            this.map = null;
        }
        this.isInitialized = false;
    }
}
