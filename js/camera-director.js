class CameraDirector {
    constructor(mapManager) {
        this.mapManager = mapManager;
        this.lastZoom = null;
        this.lastCenter = null;
        this.isLeaflet = mapManager.constructor.name === 'LeafletMapManager';
        this.events = [];
        this.currentSegment = 0;
    }

    registerMapManager(mapManager) {
        this.mapManager = mapManager;
        this.isLeaflet = mapManager.constructor.name === 'LeafletMapManager';
    }

    registerEvents(events) {
        this.events = events || [];
    }

    updateState(center, zoom) {
        this.lastCenter = center;
        this.lastZoom = zoom;
    }

    async prepareSegment(startEvent, endEvent, distance) {
        if (!this.isLeaflet || !this.mapManager?.map) {
            return;
        }
        const map = this.mapManager.map;
        const startPos = L.latLng(startEvent.coordinates.lat, startEvent.coordinates.lng);
        const endPos = L.latLng(endEvent.coordinates.lat, endEvent.coordinates.lng);

        // 首段或者极远距离：先俯瞰全局
        if (!this.lastCenter || distance > 300000) {
            await this.mapManager.fitBoundsAsync(L.latLngBounds(startPos, endPos), 1200, [120, 120]);
            this.updateState(map.getCenter(), map.getZoom());
            return;
        }

        // 中距离：轻微放远，保证上下文
        if (distance > 80000) {
            await this.mapManager.fitBoundsAsync(L.latLngBounds(startPos, endPos), 900, [90, 90]);
            this.updateState(map.getCenter(), map.getZoom());
            return;
        }

        // 短距离：保持当前镜头，仅微调中心
        const targetZoom = Math.max(12, Math.min(15, map.getZoom()));
        await this.mapManager.flyToAsync(startPos, targetZoom, 500);
        this.updateState(startPos, targetZoom);
    }

    async focusOnEnd(endEvent) {
        if (!this.isLeaflet || !this.mapManager?.map) {
            return;
        }
        const endPos = L.latLng(endEvent.coordinates.lat, endEvent.coordinates.lng);
        const comfortableZoom = 13;
        await this.mapManager.flyToAsync(endPos, comfortableZoom, 700);
        this.updateState(endPos, comfortableZoom);
    }
}

window.CameraDirector = CameraDirector;
