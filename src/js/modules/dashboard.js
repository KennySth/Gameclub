/**
 * dashboard.js - KPIs y alertas de stock (Fabricio Alexander)
 */

const Dashboard = {
    init: (role) => {
        console.log(`Dashboard module initializing for role: ${role}...`);
        Dashboard.loadKPIs(role);
        Dashboard.renderRecentSales();
        Dashboard.renderAlerts();

        // Ocultar métricas financieras si es cajero (doble capa de seguridad)
        if (role === 'cajero') {
            const financialCards = document.querySelectorAll('.stat-card:nth-child(1), .stat-card:nth-child(2)');
            financialCards.forEach(card => card.style.display = 'none');
        }
    },

    loadKPIs: (role) => {
        const sales = Storage.get(Storage.KEYS.SALES) || [];
        const products = Storage.get(Storage.KEYS.PRODUCTS) || [];
        const alerts = products.filter(p => p.stock <= p.stockMinimo);

        // Ventas del día
        const today = new Date().toISOString().split('T')[0];
        const todaySales = sales.filter(s => s.fecha.startsWith(today));
        const totalToday = todaySales.reduce((acc, curr) => acc + curr.total, 0);

        const dailySalesEl = document.getElementById('stat-daily-sales');
        const transactionsEl = document.getElementById('stat-transactions');
        const totalStockEl = document.getElementById('stat-total-stock');
        const alertsEl = document.getElementById('stat-alerts');
        const categoriesEl = document.getElementById('stat-categories');

        if (dailySalesEl) dailySalesEl.innerText = `S/ ${totalToday.toFixed(2)}`;
        if (transactionsEl) transactionsEl.innerText = todaySales.length;
        if (totalStockEl) totalStockEl.innerText = products.reduce((acc, curr) => acc + curr.stock, 0);
        if (alertsEl) alertsEl.innerText = alerts.length;
        const totalCategories = new Set(
            products.map(p => p.categoria)
        ).size;

        if (categoriesEl) {
            categoriesEl.innerText =
                `En ${totalCategories} categorías`;
        }
    },

    renderRecentSales: () => {
        const sales = Storage.get(Storage.KEYS.SALES) || [];
        const tableBody = document.getElementById('recent-sales-body');
        if (!tableBody) return;

        // Mostrar las últimas 5 ventas
        const recentSales = sales.slice(-5).reverse();

        tableBody.innerHTML = recentSales.map(s => `
            <tr>
                <td><strong>${s.id}</strong></td>
                <td>${new Date(s.fecha).toLocaleDateString()}</td>
                <td>S/ ${s.total.toFixed(2)}</td>
                <td>${s.metodoPago}</td>
                <td><span class="badge-status completed">Completado</span></td>
            </tr>
        `).join('');
    },

    renderAlerts: () => {
        const products = Storage.get(Storage.KEYS.PRODUCTS) || [];
        const alertsList = document.getElementById('dashboard-alerts-list');

        if (!alertsList) return;

        const lowStockProducts = products
            .filter(p => p.stock <= p.stockMinimo)
            .slice(0, 4);

        if (lowStockProducts.length === 0) {
            alertsList.innerHTML =
                '<p style="color: var(--text-muted); padding: 10px;">No hay alertas activas.</p>';
            return;
        }

        alertsList.innerHTML = lowStockProducts.map(p => {

            let alertClass = "low";

            if (p.stock === 0) {
                alertClass = "critical";
            } else if (p.stock <= Math.ceil(p.stockMinimo / 2)) {
                alertClass = "warning";
            }

            return `
            <div class="alert-item ${alertClass}">
                <div class="info">
                    <span class="name">${p.nombre}</span>
                    <span class="stock">
                        Stock actual: ${p.stock} (Mín: ${p.stockMinimo})
                    </span>
                </div>
            </div>
        `;
        }).join('');
    }
};

window.Dashboard = Dashboard;

