import { defineStore } from 'pinia';
import { config as staticConfig } from '../config/index';

export const useConfigStore = defineStore('config', {
    state: () => ({
        app: { ...staticConfig.app },
        amap: { ...staticConfig.amap },
        theme: { ...staticConfig.theme }
    }),
    getters: {
        mapProvider: (state) => state.app.defaultProvider,
        amapKey: (state) => state.amap.key,
        isDebug: (state) => state.app.debug
    },
    actions: {
        setMapProvider(provider) {
            this.app.defaultProvider = provider;
        },
        updateConfig(newConfig) {
            // 深度合并配置 (简化版)
            if (newConfig.app) Object.assign(this.app, newConfig.app);
            if (newConfig.amap) Object.assign(this.amap, newConfig.amap);
            if (newConfig.theme) Object.assign(this.theme, newConfig.theme);
        }
    }
});
