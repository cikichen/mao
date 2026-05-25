import { defineStore } from 'pinia';
import { eventsData } from '../../js/events-data.js';

const EVENTS_DATA_URL = 'data/events.json';

export const useEventsStore = defineStore('events', {
  state: () => ({
    events: [],
    status: 'idle',
    error: null,
    selectedEventId: null,
    searchQuery: '',
    filters: {
      types: [],
      yearRange: { start: 1893, end: 1976 }
    }
  }),
  getters: {
    currentEvent(state) {
      if (state.selectedEventId) {
        const selected = state.events.find(e => e.id === state.selectedEventId);
        if (selected) return selected;
      }
      return this.filteredEvents[0] || null;
    },
    filteredEvents(state) {
      return state.events.filter(event => {
        if (state.filters.types.length > 0 && !state.filters.types.includes(event.type)) return false;
        if (event.year < state.filters.yearRange.start || event.year > state.filters.yearRange.end) return false;
        return true;
      });
    },
    searchResults(state) {
      const q = state.searchQuery.trim().toLowerCase();
      if (!q) return [];
      return state.events.filter(event => {
        const text = [
          event.title,
          event.description,
          event.significance,
          event.location?.province,
          event.location?.city,
          event.location?.detail,
          ...(event.tags || [])
        ].filter(Boolean).join(' ').toLowerCase();
        return text.includes(q);
      }).slice(0, 20);
    },
    typeStats(state) {
      const stats = { historical: 0, article: 0, poem: 0 };
      state.events.forEach(e => { if (stats[e.type] !== undefined) stats[e.type]++; });
      return stats;
    },
    yearRange(state) {
      if (!state.events.length) return { min: 1893, max: 1976 };
      const years = state.events.map(e => e.year).filter(Boolean);
      return { min: Math.min(...years), max: Math.max(...years) };
    }
  },
  actions: {
    async loadEvents(force = false) {
      if (this.status === 'loading' && !force) return;
      if (this.events.length && !force) return;

      this.status = 'loading';
      this.error = null;

      try {
        const response = await fetch(`${EVENTS_DATA_URL}?t=${Date.now()}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        this.hydrate(await response.json());
      } catch (err) {
        console.warn('Fetch failed, using embedded data:', err.message);
        this.hydrate(eventsData);
      }
    },
    hydrate(events = []) {
      this.events = Array.isArray(events) ? events.map(event => {
        if (event.location?.coordinates && Array.isArray(event.location.coordinates)) {
          return {
            ...event,
            coordinates: {
              lng: event.location.coordinates[0],
              lat: event.location.coordinates[1]
            }
          };
        }
        return event;
      }) : [];
      this.status = this.events.length ? 'ready' : 'empty';
      this.error = null;
      if (!this.selectedEventId || !this.events.find(e => e.id === this.selectedEventId)) {
        this.selectedEventId = this.filteredEvents[0]?.id || this.events[0]?.id || null;
      }
    },
    selectEvent(eventId) {
      this.selectedEventId = eventId;
    },
    setSearchQuery(query) {
      this.searchQuery = query || '';
    },
    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
      const filtered = this.filteredEvents;
      if (!filtered.find(e => e.id === this.selectedEventId)) {
        this.selectedEventId = filtered[0]?.id || null;
      }
    },
    resetFilters() {
      this.filters = { types: [], yearRange: { start: 1893, end: 1976 } };
      this.selectedEventId = this.filteredEvents[0]?.id || null;
    }
  }
});
