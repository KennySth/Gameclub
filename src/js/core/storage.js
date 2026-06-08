/**
 * storage.js - CRUD de localStorage (Alexander Smith)
 */
const Storage = {
    KEYS: {
        PRODUCTS: 'gamelab_productos',
        SALES: 'gamelab_ventas',
        USERS: 'gamelab_usuarios',
        ALERTS: 'gamelab_alertas',
        CURRENT_USER: 'gamelab_session'
    },

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

    init: () => {
        console.log("Initializing GameLab Storage...");

        // 1. Usuarios
        if (!Storage.get(Storage.KEYS.USERS)) {
            Storage.save(Storage.KEYS.USERS, [
                { username: "admin", password: "123", role: "admin_general", name: "Alexander Smith" },
                { username: "cajero", password: "123", role: "cajero", name: "Keny Andre" }
            ]);
        }

        // 2. Productos Iniciales (Catálogo)
        const existingProducts = Storage.get(Storage.KEYS.PRODUCTS);
        const initialProducts = [
            { id: "PROD-001", nombre: "PlayStation 5 Slim (Disco)", categoria: "Consolas", precio: 2499.00, stock: 12, stockMinimo: 5, estado: "Optimo", imagen: "assets/PlayStation5Slime.png" },
            { id: "PROD-002", nombre: "The Legend of Zelda: TotK", categoria: "Videojuegos", precio: 289.00, stock: 4, stockMinimo: 5, estado: "Stock Bajo", imagen: "assets/TLOZTOTK.png" },
            { id: "PROD-003", nombre: "Control DualSense White", categoria: "Accesorios", precio: 299.00, stock: 0, stockMinimo: 3, estado: "Agotado", imagen: "assets/DualSense.png" },
            { id: "PROD-004", nombre: "Xbox Series X", categoria: "Consolas", precio: 2399.00, stock: 8, stockMinimo: 2, estado: "Optimo", imagen: "assets/XboxSeriesX.png" },
            { id: "PROD-005", nombre: "Elden Ring (PS5)", categoria: "Videojuegos", precio: 249.00, stock: 15, stockMinimo: 5, estado: "Optimo", imagen: "assets/Elden Ring.png" }
        ];

        if (!existingProducts) {
            Storage.save(Storage.KEYS.PRODUCTS, initialProducts);
        } else {
            // MIGRACIÓN: Si existen productos pero no tienen el campo 'imagen', los actualizamos
            let updated = false;
            const migratedProducts = existingProducts.map(p => {
                const initial = initialProducts.find(initP => initP.id === p.id);
                if (initial && !p.imagen) {
                    p.imagen = initial.imagen;
                    updated = true;
                }
                return p;
            });
            
            if (updated) {
                console.log("Migrating products to include images...");
                Storage.save(Storage.KEYS.PRODUCTS, migratedProducts);
            }
        }

        // 3. Ventas
        if (!Storage.get(Storage.KEYS.SALES)) {
            Storage.save(Storage.KEYS.SALES, [
                {
                    id: "TRX-0001",
                    productos: [{ id: "PROD-005", cantidad: 1, precioUnit: 249.00 }],
                    subtotal: 211.02,
                    igv: 37.98,
                    total: 249.00,
                    metodoPago: "Tarjeta",
                    fecha: new Date().toISOString()
                }
            ]);
        }

        // 4. Alertas
        if (!Storage.get(Storage.KEYS.ALERTS)) {
            Storage.save(Storage.KEYS.ALERTS, [
                { id_producto: "PROD-003", nombre: "Control DualSense White", stock_actual: 0, fecha_alerta: new Date().toISOString(), prioridad: "Alta" }
            ]);
        }
        
        console.log("Initialization Complete.");
    }
};

window.Storage = Storage;
