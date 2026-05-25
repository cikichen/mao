class CameraDirector {
    constructor(mapManager) {
        this.mapManager = mapManager;
        this.lastZoom = null;
        this.lastCenter = null;
    }

    registerMapManager(mapManager) {
        this.mapManager = mapManager;
    }

    updateState(center, zoom) {
        this.lastCenter = center;
        this.lastZoom = zoom;
    }

    async prepareSegment(startEvent, endEvent, distance) {
        if (!this.mapManager?.map) return;

        const startPos = L.latLng(startEvent.coordinates.lat, startEvent.coordinates.lng);
        const endPos = L.latLng(endEvent.coordinates.lat, endEvent.coordinates.lng);

        if (!this.lastCenter || distance > 300000) {
            this.mapManager.flyToBounds(L.latLngBounds(startPos, endPos), { duration: 1.2 });
            await this._waitForMoveEnd();
            this.updateState(this.mapManager.map.getCenter(), this.mapManager.map.getZoom());
            return;
        }

        if (distance > 80000) {
            this.mapManager.flyToBounds(L.latLngBounds(startPos, endPos), { duration: 0.9 });
            await this._waitForMoveEnd();
            this.updateState(this.mapManager.map.getCenter(), this.mapManager.map.getZoom());
            return;
        }

        const targetZoom = Math.max(12, Math.min(15, this.mapManager.map.getZoom()));
        this.mapManager.flyTo(startPos, targetZoom, { duration: 0.5 });
        await this._waitForMoveEnd();
        this.updateState(startPos, targetZoom);
    }

    async focusOnEnd(endEvent) {
        if (!this.mapManager?.map) return;
        const endPos = L.latLng(endEvent.coordinates.lat, endEvent.coordinates.lng);
        this.mapManager.flyTo(endPos, 13, { duration: 0.7 });
        await this._waitForMoveEnd();
        this.updateState(endPos, 13);
    }

    _waitForMoveEnd() {
        return new Promise(resolve => {
            if (!this.mapManager?.map) { resolve(); return; }
            const map = this.mapManager.map;
            const onEnd = () => { map.off('moveend', onEnd); resolve(); };
            map.on('moveend', onEnd);
            // 超时兜底
            setTimeout(resolve, 2000);
        });
    }
}

window.CameraDirector = CameraDirector;
