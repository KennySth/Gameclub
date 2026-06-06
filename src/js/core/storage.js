/**
 * storage.js - CRUD de localStorage (Alexander Smith)
 */
const Storage = {
    save: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error("Error saving to localStorage", e);
            return false;
        }
    },

    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error("Error reading from localStorage", e);
            return null;
        }
    },

    delete: (key) => {
        localStorage.removeItem(key);
    },

    clear: () => {
        localStorage.clear();
    }
};

window.Storage = Storage;
