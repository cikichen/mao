import { defineStore } from 'pinia';

const MAP_PROVIDER_KEY = 'mao_map_provider';

function getInitialProvider() {
    if (typeof window === 'undefined') return 'leaflet';
    const stored = window.localStorage?.getItem(MAP_PROVIDER_KEY);
    if (stored === 'leaflet' || stored === 'amap') return stored;
    return 'leaflet';
}

export const useUIStore = defineStore('ui', {
    state: () => ({
        activeModal: null,
        isSidebarOpen: true,
        mapProvider: getInitialProvider(),
        isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false
    }),
    actions: {
        openModal(name) {
            this.activeModal = name;
        },
        closeModal() {
            this.activeModal = null;
        },
        toggleSidebar() {
            this.isSidebarOpen = !this.isSidebarOpen;
        },
        setMobile(val) {
            this.isMobile = val;
        },
        setMapProvider(provider) {
            if (provider !== 'leaflet' && provider !== 'amap') return;
            this.mapProvider = provider;
            window.localStorage?.setItem(MAP_PROVIDER_KEY, provider);
        }
    }
});
