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

    // 三幕式电影镜头动画
    animateFootprint(startEvent, endEvent, baseDuration = 2000) {
        return new Promise(async resolve => {
            if (!startEvent || !endEvent || !startEvent.coordinates || !endEvent.coordinates) {
                resolve();
                return;
            }

            const startPos = new AMap.LngLat(startEvent.coordinates.lng, startEvent.coordinates.lat);
            const endPos = new AMap.LngLat(endEvent.coordinates.lng, endEvent.coordinates.lat);
            const distance = startPos.distance(endPos);

            if (!this.movingFootprintMarker) {
                this.movingFootprintMarker = new AMap.Marker({
                    position: startPos,
                    content: `
                        <div class="mao-footprint-container"></div>
                    `,
                    offset: new AMap.Pixel(-18, -18),
                    map: this.map
                });
            } else {
                this.movingFootprintMarker.setPosition(startPos);
            }

            const params = this._getAnimParams(distance);

            // ── 第一幕：镜头拉远 ── 平滑缩放到鸟瞰视野
            const centerLng = (startPos.getLng() + endPos.getLng()) / 2;
            const centerLat = (startPos.getLat() + endPos.getLat()) / 2;
            await this._smoothSetView(params.overviewZoom, [centerLng, centerLat], params.overviewDurMs);

            // ── 第二幕：足迹行进 ── 在稳定视口上 Marker 滑动画线
            await this._traverseMarker(startPos, endPos, endEvent, params.markerDur, distance);

            // ── 第三幕：镜头推近 ── 平滑聚焦到目的地近景
            await this._smoothSetView(params.destZoom, [endPos.getLng(), endPos.getLat()], params.zoomInDurMs);

            resolve();
        });
    }

    _getAnimParams(distance) {
        if (distance < 1500)   return { overviewZoom: 16, overviewDurMs: 500,  markerDur: 1500, destZoom: 15, zoomInDurMs: 400 };
        if (distance < 10000)  return { overviewZoom: 14, overviewDurMs: 600,  markerDur: 1800, destZoom: 14, zoomInDurMs: 500 };
        if (distance < 50000)  return { overviewZoom: 12, overviewDurMs: 700,  markerDur: 2000, destZoom: 13, zoomInDurMs: 600 };
        if (distance < 200000) return { overviewZoom: 10, overviewDurMs: 800,  markerDur: 2200, destZoom: 13, zoomInDurMs: 800 };
        if (distance < 600000) return { overviewZoom: 8,  overviewDurMs: 800,  markerDur: 2500, destZoom: 12, zoomInDurMs: 800 };
        return                        { overviewZoom: 6,  overviewDurMs: 1000, markerDur: 3000, destZoom: 12, zoomInDurMs: 1000 };
    }

    // 高德地图平滑视角过渡辅助
    _smoothSetView(zoom, center, durationMs) {
        return new Promise(resolve => {
            const timeout = setTimeout(resolve, durationMs + 500);
            this.map.on('moveend', function handler() {
                clearTimeout(timeout);
                // AMap 没有 once，需要手动 off
                this.off('moveend', handler);
                resolve();
            });
            this.map.setZoomAndCenter(zoom, center, false, durationMs);
        });
    }

    // Marker 行进动画（第二幕核心）—— 地图完全静止
    _traverseMarker(startPos, endPos, endEvent, durationMs, distance) {
        return new Promise(resolve => {
            // 远距离添加视觉效果
            let previewLine = null;
            let glowLine = null;
            if (distance >= 200000) {
                previewLine = new AMap.Polyline({
                    path: [startPos, endPos],
                    strokeColor: '#ff4444', strokeWeight: 1.5, strokeOpacity: 0.25,
                    strokeStyle: 'dashed', strokeDasharray: [8, 6]
                });
                this.map.add(previewLine);
                glowLine = new AMap.Polyline({
                    path: [startPos],
                    strokeColor: '#ff6644', strokeWeight: 10, strokeOpacity: 0.15
                });
                this.map.add(glowLine);
            }

            let startTime = null;
            let eventTriggered = false;
            let frameCount = 0;
            const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            const animate = (currentTime) => {
                if (!startTime) startTime = currentTime;
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / durationMs, 1);
                const easedProgress = easeInOutCubic(progress);
                frameCount++;

                if (progress > 0.1 && !eventTriggered) {
                    this.emit('eventReached', endEvent);
                    eventTriggered = true;
                }

                const currentLng = startPos.getLng() + (endPos.getLng() - startPos.getLng()) * easedProgress;
                const currentLat = startPos.getLat() + (endPos.getLat() - startPos.getLat()) * easedProgress;
                const currentPos = new AMap.LngLat(currentLng, currentLat);

                this.movingFootprintMarker.setPosition(currentPos);

                if (frameCount % 3 === 0 || progress >= 1) {
                    const animatedPath = this.animatedTrajectory.getPath();
                    animatedPath.push(currentPos);
                    this.animatedTrajectory.setPath(animatedPath);
                }

                if (glowLine) glowLine.setPath([startPos, currentPos]);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    if (previewLine) this.map.remove(previewLine);
                    if (glowLine) this.map.remove(glowLine);
                    resolve();
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
