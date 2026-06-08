/**
 * reports.js - Generación de métricas y gráficos (Alexander Smith)
 */

const Reports = {
    init: () => {
        console.log("Reports module initialized");
        Reports.calculateStats();
    },

    calculateStats: () => {
        const sales = Storage.get(Storage.KEYS.SALES) || [];
        const products = Storage.get(Storage.KEYS.PRODUCTS) || [];
        
        if (sales.length === 0) {
            const list = document.getElementById('top-categories-list');
            if (list) list.innerHTML = '<p style="padding:20px; color:var(--text-muted);">Sin datos de ventas.</p>';
            return;
        }

        // 1. Producto Estrella (más vendido por cantidad)
        const productCounts = {};
        const categoryCounts = {};

        sales.forEach(sale => {
            sale.productos.forEach(p => {
                // Conteo de productos
                productCounts[p.nombre] = (productCounts[p.nombre] || 0) + p.cantidad;

                // Conteo de categorías (buscando la categoría en el inventario actual)
                const prodData = products.find(item => item.id === p.id);
                const category = prodData ? prodData.categoria : "Otros";
                categoryCounts[category] = (categoryCounts[category] || 0) + p.cantidad;
            });
        });

        // Renderizar Producto Estrella
        let topProduct = "-";
        let maxQty = 0;
        for (const [name, qty] of Object.entries(productCounts)) {
            if (qty > maxQty) {
                maxQty = qty;
                topProduct = name;
            }
        }
        
        const topProductEl = document.getElementById('top-product-name');
        if (topProductEl) topProductEl.innerText = topProduct;

        // 2. Renderizar Top Categorías
        const topCategoriesList = document.getElementById('top-categories-list');
        if (topCategoriesList) {
            const sortedCategories = Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            topCategoriesList.innerHTML = sortedCategories.map(([cat, count]) => `
                <div style="display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid #f0f2f5;">
                    <span style="font-weight:600;">${cat}</span>
                    <span class="badge-status completed" style="background: rgba(67, 24, 255, 0.1); color: var(--info);">
                        ${count} vendidos
                    </span>
                </div>
            `).join('');
        }

        // 3. Métodos de Pago
        const paymentStats = {};
        sales.forEach(sale => {
            paymentStats[sale.metodoPago] = (paymentStats[sale.metodoPago] || 0) + 1;
        });

        const paymentList = document.getElementById('payment-stats');
        if (paymentList) {
            paymentList.innerHTML = Object.entries(paymentStats).map(([method, count]) => `
                <div style="display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid #f0f2f5;">
                    <span>${method}</span>
                    <span class="badge-status completed">${count} uso(s)</span>
                </div>
            `).join('');
        }
    }
};

window.Reports = Reports;
