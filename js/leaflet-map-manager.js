export default class LeafletMapManager {
    constructor() {
        this.map = null;
        this.markers = new Map();
        this.movingFootprintMarker = null;
        this.animatedTrajectory = null;
        this.staticTrajectory = null;
        this.isInitialized = false;
        this.eventListeners = new Map();
        this.activeInfoWindow = null;
        this.selectedMarkerId = null;
    }

    async initMap(containerOrId) {
        if (this.map) return;

        let container;
        if (typeof containerOrId === 'string') {
            container = document.getElementById(containerOrId);
            if (!container) {
                throw new Error(`Map container with id '${containerOrId}' not found`);
            }
        } else if (containerOrId instanceof HTMLElement) {
            container = containerOrId;
        } else {
            throw new Error('Invalid map container: must be a string ID or HTMLElement');
        }

        if (container._leaflet_id) {
            container._leaflet_id = null;
            container.innerHTML = '';
        }

        const birthPlaceCenter = [27.915456, 112.527621];
        this.map = L.map(container, {
            center: birthPlaceCenter,
            zoom: 8,
            zoomControl: false,
            attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            minZoom: 3
        }).addTo(this.map);

        setTimeout(() => this.map.invalidateSize(), 100);

        this.isInitialized = true;
        this.emit('mapReady');
    }

    // --- Marker 图标工厂 ---
    _createIcon(type, isSelected = false) {
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

        return L.divIcon({
            className: 'mao-marker-icon',
            html: `<div style="
                width: ${size}px; height: ${size}px;
                background: ${color};
                border-radius: 50%;
                border: ${border}px solid #fff;
                box-shadow: ${shadow};
                transition: all 0.25s ease;
                cursor: pointer;
            "></div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });
    }

    // --- 信息窗内容 ---
    _createPopupContent(event) {
        const typeLabels = { historical: '历史事件', article: '重要文章', poem: '诗词作品' };
        const typeClass = event.type || 'historical';
        const dateStr = event.date || '';
        const location = event.location?.detail || event.location?.city || '';
        const desc = event.description || '';

        return `
            <div style="min-width:200px;max-width:280px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <span class="tag tag-${typeClass}" style="font-size:11px;padding:1px 8px;">${typeLabels[typeClass] || '历史事件'}</span>
                    <span style="font-size:12px;color:#a0a0a0;">${dateStr}</span>
                </div>
                <div style="font-weight:700;font-size:15px;margin-bottom:4px;font-family:var(--font-heading);">${event.title}</div>
                ${location ? `<div style="font-size:12px;color:#a0a0a0;margin-bottom:6px;">${location}</div>` : ''}
                ${desc ? `<div style="font-size:13px;color:#ccc;line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${desc}</div>` : ''}
            </div>
        `;
    }

    addEventMarkers(events) {
        this.clearMarkers();
        if (!events || !events.length) return;

        events.forEach(event => {
            if (!event.coordinates || isNaN(event.coordinates.lng) || isNaN(event.coordinates.lat)) return;

            const marker = L.marker([event.coordinates.lat, event.coordinates.lng], {
                icon: this._createIcon(event.type, false),
                riseOnHover: true
            }).addTo(this.map);

            marker.bindPopup(this._createPopupContent(event), {
                maxWidth: 300,
                closeButton: true,
                className: 'mao-popup'
            });

            marker.on('click', () => {
                this.highlightMarker(event.id);
                this.emit('markerClick', event);
            });

            this.markers.set(event.id, { marker, event });
        });

        // 自动适配视野
        const allLatLngs = [];
        this.markers.forEach(({ marker }) => allLatLngs.push(marker.getLatLng()));
        if (allLatLngs.length > 1) {
            this.map.fitBounds(L.latLngBounds(allLatLngs).pad(0.1));
        }
    }

    clearMarkers() {
        if (!this.map) { this.markers.clear(); return; }
        this.markers.forEach(({ marker }) => {
            if (marker) this.map.removeLayer(marker);
        });
        this.markers.clear();
        this.selectedMarkerId = null;
    }

    highlightMarker(eventId) {
        // 恢复上一个选中的 marker
        if (this.selectedMarkerId && this.markers.has(this.selectedMarkerId)) {
            const prev = this.markers.get(this.selectedMarkerId);
            prev.marker.setIcon(this._createIcon(prev.event.type, false));
        }

        // 高亮新选中的 marker
        if (this.markers.has(eventId)) {
            const curr = this.markers.get(eventId);
            curr.marker.setIcon(this._createIcon(curr.event.type, true));
            curr.marker.openPopup();
            this.selectedMarkerId = eventId;
        }
    }

    centerToEvent(event, targetZoom = 12, options = {}) {
        if (!event?.coordinates || isNaN(event.coordinates.lng) || isNaN(event.coordinates.lat)) return;
        const latlng = [event.coordinates.lat, event.coordinates.lng];

        if (options.animate !== false) {
            this.map.flyTo(latlng, targetZoom, { duration: options.duration || 0.8 });
        } else {
            this.map.setView(latlng, targetZoom);
        }

        this.highlightMarker(event.id);
    }

    drawStaticTrajectory(eventsArray) {
        if (this.staticTrajectory) {
            this.map.removeLayer(this.staticTrajectory);
            this.staticTrajectory = null;
        }
        if (!eventsArray || eventsArray.length < 2) return;

        const pathPoints = eventsArray
            .filter(e => e.coordinates && !isNaN(e.coordinates.lng) && !isNaN(e.coordinates.lat))
            .map(e => [e.coordinates.lat, e.coordinates.lng]);

        if (pathPoints.length < 2) return;

        this.staticTrajectory = L.polyline(pathPoints, {
            color: '#d32f2f',
            weight: 3,
            opacity: 0.5,
            dashArray: '8, 6'
        }).addTo(this.map);
    }

    animateFootprint(startEvent, endEvent) {
        return new Promise(async (resolve) => {
            if (!startEvent || !endEvent || !startEvent.coordinates || !endEvent.coordinates) {
                resolve();
                return;
            }

            const startPos = L.latLng(startEvent.coordinates.lat, startEvent.coordinates.lng);
            const endPos = L.latLng(endEvent.coordinates.lat, endEvent.coordinates.lng);
            const distance = startPos.distanceTo(endPos);

            if (distance < 100) {
                setTimeout(() => {
                    this.emit('eventReached', endEvent);
                    resolve();
                }, 800);
                return;
            }

            // 确保足迹 Marker 存在
            if (!this.movingFootprintMarker) {
                this.movingFootprintMarker = L.marker(startPos, {
                    icon: L.divIcon({
                        className: 'mao-footprint-icon',
                        html: `
                            <div class="mao-footprint-container"></div>
                        `,
                        iconSize: [36, 36],
                        iconAnchor: [18, 18]
                    })
                }).addTo(this.map);
            } else {
                this.movingFootprintMarker.setLatLng(startPos);
            }

            // 取消正在进行的地图动画
            this.map.stop();

            // 获取动画参数
            const params = this._getAnimParams(distance);

            // ── 第一幕：镜头拉远 ── 平滑缩放到鸟瞰视野（同时看见起点和终点）
            // 缩放期间从地图移除轨迹线，彻底防止 SVG 缩放导致线条变粗
            if (this.animatedTrajectory) this.animatedTrajectory.removeFrom(this.map);
            if (this.completedTrajectory) this.completedTrajectory.removeFrom(this.map);
            const bounds = L.latLngBounds([startPos, endPos]);
            await this._smoothFlyToBounds(bounds.pad(0.3), params.overviewDur, params.maxOverviewZoom);
            if (this.animatedTrajectory) this.animatedTrajectory.addTo(this.map);
            if (this.completedTrajectory) this.completedTrajectory.addTo(this.map);

            // ── 第二幕：足迹行进 ── 在完全稳定的视口上，Marker 滑动 + 画轨迹线
            await this._traverseMarker(startPos, endPos, endEvent, params.markerDur, distance);

            // ── 第三幕：镜头推近 ── 平滑聚焦到目的地近景
            if (this.animatedTrajectory) this.animatedTrajectory.removeFrom(this.map);
            if (this.completedTrajectory) this.completedTrajectory.removeFrom(this.map);
            await this._smoothFlyTo(endPos, params.destZoom, params.zoomInDur);
            if (this.animatedTrajectory) this.animatedTrajectory.addTo(this.map);
            if (this.completedTrajectory) this.completedTrajectory.addTo(this.map);

            resolve();
        });
    }

    // 根据距离返回三幕各阶段的时间参数
    _getAnimParams(distance) {
        if (distance < 1500)   return { overviewDur: 0.5, markerDur: 1500, destZoom: 15, zoomInDur: 0.4, maxOverviewZoom: 16 };
        if (distance < 10000)  return { overviewDur: 0.6, markerDur: 1800, destZoom: 14, zoomInDur: 0.5, maxOverviewZoom: 15 };
        if (distance < 50000)  return { overviewDur: 0.7, markerDur: 2000, destZoom: 13, zoomInDur: 0.6, maxOverviewZoom: 13 };
        if (distance < 200000) return { overviewDur: 0.8, markerDur: 2200, destZoom: 13, zoomInDur: 0.8, maxOverviewZoom: 11 };
        if (distance < 600000) return { overviewDur: 0.8, markerDur: 2500, destZoom: 12, zoomInDur: 0.8, maxOverviewZoom: 9 };
        return                        { overviewDur: 1.0, markerDur: 3000, destZoom: 12, zoomInDur: 1.0, maxOverviewZoom: 7 };
    }

    // 平滑缩放到指定边界（第一幕辅助）
    _smoothFlyToBounds(bounds, durationSec, maxZoom) {
        return new Promise(resolve => {
            const timeout = setTimeout(resolve, durationSec * 1000 + 500);
            this.map.once('moveend', () => { clearTimeout(timeout); resolve(); });
            this.map.flyToBounds(bounds, {
                duration: durationSec,
                maxZoom: maxZoom,
                padding: [50, 50]
            });
        });
    }

    // 平滑飞到指定位置和缩放（第三幕辅助）
    _smoothFlyTo(pos, zoom, durationSec) {
        return new Promise(resolve => {
            const timeout = setTimeout(resolve, durationSec * 1000 + 500);
            this.map.once('moveend', () => { clearTimeout(timeout); resolve(); });
            this.map.flyTo(pos, zoom, { duration: durationSec });
        });
    }

    // Marker 行进动画（第二幕核心）—— 地图完全静止，零缩放变化
    _traverseMarker(startPos, endPos, endEvent, durationMs, distance) {
        return new Promise(resolve => {
            // 远距离（≥200km）添加预览航线和发光效果
            let previewLine = null;
            let glowLine = null;
            if (distance >= 200000) {
                previewLine = L.polyline([startPos, endPos], {
                    color: '#ff4444', weight: 1.5, opacity: 0.25, dashArray: '8 6'
                }).addTo(this.map);
                glowLine = L.polyline([startPos], {
                    color: '#ff6644', weight: 10, opacity: 0.15
                }).addTo(this.map);
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

                const lat = startPos.lat + (endPos.lat - startPos.lat) * easedProgress;
                const lng = startPos.lng + (endPos.lng - startPos.lng) * easedProgress;
                const currentPos = L.latLng(lat, lng);

                this.movingFootprintMarker.setLatLng(currentPos);

                // 每 3 帧绘制当前段的动画轨迹线
                if (frameCount % 3 === 0 || progress >= 1) {
                    if (!this.animatedTrajectory) {
                        this.animatedTrajectory = L.polyline([startPos], {
                            color: '#ff4444', weight: 3, opacity: 0.8
                        }).addTo(this.map);
                    }
                    const path = this.animatedTrajectory.getLatLngs();
                    path.push(currentPos);
                    this.animatedTrajectory.setLatLngs(path);
                }

                // 更新发光层
                if (glowLine) glowLine.setLatLngs([startPos, currentPos]);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // 动画结束：将当前段推入 completedTrajectory，并清空 animatedTrajectory
                    if (!this.completedTrajectory) {
                        this.completedTrajectory = L.polyline([startPos, endPos], {
                            color: '#d32f2f', weight: 3, opacity: 0.8
                        }).addTo(this.map);
                    } else {
                        const compPath = this.completedTrajectory.getLatLngs();
                        if (compPath.length === 0) compPath.push(startPos, endPos);
                        else compPath.push(endPos);
                        this.completedTrajectory.setLatLngs(compPath);
                    }
                    
                    if (this.animatedTrajectory) {
                        this.animatedTrajectory.setLatLngs([endPos]);
                    }

                    // 清理临时效果
                    if (previewLine) this.map.removeLayer(previewLine);
                    if (glowLine) this.map.removeLayer(glowLine);
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    showAnimatedTrajectory() {
        if (this.animatedTrajectory) this.animatedTrajectory.addTo(this.map);
        if (this.completedTrajectory) this.completedTrajectory.addTo(this.map);
        if (this.staticTrajectory) { this.map.removeLayer(this.staticTrajectory); this.staticTrajectory = null; }
    }

    hideAnimatedTrajectory() {
        if (this.animatedTrajectory) { this.map.removeLayer(this.animatedTrajectory); }
        if (this.completedTrajectory) { this.map.removeLayer(this.completedTrajectory); }
    }

    clearAnimatedTrajectory() {
        if (this.movingFootprintMarker) {
            this.map.removeLayer(this.movingFootprintMarker);
            this.movingFootprintMarker = null;
        }
        if (this.animatedTrajectory) {
            this.map.removeLayer(this.animatedTrajectory);
            this.animatedTrajectory = null;
        }
        if (this.completedTrajectory) {
            this.map.removeLayer(this.completedTrajectory);
            this.completedTrajectory = null;
        }
        if (this.staticTrajectory) {
            this.map.removeLayer(this.staticTrajectory);
            this.staticTrajectory = null;
        }
    }

    // --- Camera helpers (for CameraDirector) ---
    flyTo(latlng, zoom, options = {}) {
        this.map.flyTo(latlng, zoom, { duration: options.duration || 1 });
    }

    flyToBounds(bounds, options = {}) {
        this.map.flyToBounds(bounds, { padding: [30, 30], duration: options.duration || 1 });
    }

    resetView() {
        const allLatLngs = [];
        this.markers.forEach(({ marker }) => allLatLngs.push(marker.getLatLng()));
        if (allLatLngs.length) {
            this.map.fitBounds(L.latLngBounds(allLatLngs).pad(0.1));
        }
    }

    zoomIn() { this.map.zoomIn(); }
    zoomOut() { this.map.zoomOut(); }

    toggleFullscreen(containerEl) {
        if (!document.fullscreenElement) {
            containerEl?.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }

    on(eventName, callback) {
        if (!this.eventListeners.has(eventName)) this.eventListeners.set(eventName, []);
        this.eventListeners.get(eventName).push(callback);
    }

    emit(eventName, ...args) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName).forEach(cb => cb(...args));
        }
    }

    destroy() {
        this.clearAnimatedTrajectory();
        this.clearMarkers();
        if (this.map) { this.map.remove(); this.map = null; }
        this.isInitialized = false;
    }
}
