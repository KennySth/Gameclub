/**
 * reports.js - Generación de métricas y gráficos avanzados (Merge Version)
 */

const Reports = {
    chartInstance: null,

    init: () => {
        console.log("Iniciando Módulo de Reportes...");
        
        // Configurar fechas por defecto (Últimos 30 días)
        const hoy = new Date();
        const haceUnMes = new Date(hoy);
        haceUnMes.setDate(hoy.getDate() - 30);
        
        const dateStart = document.getElementById('dateStart');
        const dateEnd = document.getElementById('dateEnd');

        if (dateStart && dateEnd) {
            dateStart.value = haceUnMes.toISOString().split('T')[0];
            dateEnd.value = hoy.toISOString().split('T')[0];
        }

        Reports.bindEvents();
        Reports.loadData();
    },

    bindEvents: () => {
        document.getElementById('dateStart')?.addEventListener('change', Reports.loadData);
        document.getElementById('dateEnd')?.addEventListener('change', Reports.loadData);
        document.getElementById('filterCategory')?.addEventListener('change', Reports.loadData);
        document.getElementById('btnExportCSV')?.addEventListener('click', Reports.exportData);
    },

    loadData: () => {
        console.log("Cargando datos de reportes...");
        const allSales = Storage.get(Storage.KEYS.SALES) || [];
        const allProducts = Storage.get(Storage.KEYS.PRODUCTS) || [];

        // 1. Obtener valores de filtros con seguridad
        const dateStartEl = document.getElementById('dateStart');
        const dateEndEl = document.getElementById('dateEnd');
        const filterCatEl = document.getElementById('filterCategory');

        if (!dateStartEl || !dateEndEl || !filterCatEl) {
            console.warn("Elementos de filtro no encontrados en el DOM.");
            return;
        }

        const dateStartVal = dateStartEl.value;
        const dateEndVal = dateEndEl.value;
        const filterCatVal = filterCatEl.value;

        const startDate = new Date(dateStartVal);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(dateEndVal);
        endDate.setHours(23, 59, 59, 999);

        // 2. Filtrar data
        const filteredSales = allSales.filter(sale => {
            const saleDate = new Date(sale.fecha);
            const matchDate = saleDate >= startDate && saleDate <= endDate;

            let matchCat = true;
            if (filterCatVal !== 'todas') {
                // Verificar si alguno de los productos vendidos pertenece a la categoría filtrada
                matchCat = sale.productos.some(item => {
                    const prodData = allProducts.find(p => p.id === item.id);
                    return prodData && prodData.categoria === filterCatVal;
                });
            }

            return matchDate && matchCat;
        });

        // 3. Procesar Métricas
        Reports.processKPIs(filteredSales);
        Reports.renderTopProducts(filteredSales, allProducts);
        Reports.renderCategoriesChart(filteredSales, allProducts);
        Reports.renderPaymentMethods(filteredSales);
        Reports.renderTrendChart(filteredSales);
    },

    processKPIs: (sales) => {
        let totalRevenue = 0;
        let totalItems = 0;

        sales.forEach(sale => {
            totalRevenue += sale.total;
            sale.productos.forEach(p => totalItems += p.cantidad);
        });

        const ticketPromedio = sales.length > 0 ? (totalRevenue / sales.length) : 0;

        if (document.getElementById('kpiRevenue')) document.getElementById('kpiRevenue').textContent = `S/ ${totalRevenue.toFixed(2)}`;
        if (document.getElementById('kpiProducts')) document.getElementById('kpiProducts').textContent = totalItems;
        if (document.getElementById('kpiTicket')) document.getElementById('kpiTicket').textContent = `S/ ${ticketPromedio.toFixed(2)}`;
    },

    renderTopProducts: (sales, products) => {
        const tbody = document.getElementById('topProductsList');
        if (!tbody) return;

        const productStats = {};
        sales.forEach(sale => {
            sale.productos.forEach(p => {
                const prodInfo = products.find(item => item.id === p.id);
                const name = prodInfo ? prodInfo.nombre : "Producto Desconocido";
                
                if (!productStats[name]) productStats[name] = { qty: 0, revenue: 0 };
                productStats[name].qty += p.cantidad;
                productStats[name].revenue += (p.cantidad * p.precioUnit);
            });
        });

        const sorted = Object.entries(productStats)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);

        // Actualizar Producto Estrella en KPI
        const topProductNameEl = document.getElementById('top-product-name');
        if (topProductNameEl) {
            topProductNameEl.textContent = sorted.length > 0 ? sorted[0].name : "-";
        }

        if (sorted.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center">No hay datos</td></tr>`;
            return;
        }

        tbody.innerHTML = sorted.map((p, i) => `
            <tr>
                <td><strong>${i + 1}</strong></td>
                <td>${p.name}</td>
                <td>${p.qty}</td>
                <td>S/ ${p.revenue.toFixed(2)}</td>
            </tr>
        `).join('');
    },

    renderCategoriesChart: (sales, products) => {
        const list = document.getElementById('top-categories-list');
        if (!list) return;

        const catStats = {};
        sales.forEach(sale => {
            sale.productos.forEach(p => {
                const prodData = products.find(item => item.id === p.id);
                const category = prodData ? prodData.categoria : "Otros";
                catStats[category] = (catStats[category] || 0) + p.cantidad;
            });
        });

        const sorted = Object.entries(catStats).sort((a, b) => b[1] - a[1]);

        if (sorted.length === 0) {
            list.innerHTML = '<p class="text-center">Sin datos</p>';
            return;
        }

        list.innerHTML = sorted.map(([cat, qty]) => `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2" style="background: #f8f9fa; border-radius: 8px;">
                <span style="font-weight: 500;">${cat}</span>
                <span class="badge bg-primary rounded-pill">${qty} vendid.</span>
            </div>
        `).join('');
    },

    renderPaymentMethods: (sales) => {
        const container = document.getElementById('payment-stats');
        if (!container) return;

        const paymentStats = {};
        sales.forEach(sale => {
            paymentStats[sale.metodoPago] = (paymentStats[sale.metodoPago] || 0) + 1;
        });

        if (Object.keys(paymentStats).length === 0) {
            container.innerHTML = '<p>Sin datos</p>';
            return;
        }

        container.innerHTML = Object.entries(paymentStats).map(([method, count]) => `
            <div class="text-center p-3" style="border: 1px solid #eee; border-radius: 12px; min-width: 120px;">
                <div style="font-size: 1.2rem; font-weight: bold; color: var(--accent-color);">${count}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${method}</div>
            </div>
        `).join('');
    },

    renderTrendChart: (sales) => {
        const ctx = document.getElementById('ventasChart');
        if (!ctx) return;
        
        if (Reports.chartInstance) Reports.chartInstance.destroy();

        // Agrupar ventas por día
        const salesByDate = {};
        sales.forEach(sale => {
            const d = new Date(sale.fecha).toISOString().split('T')[0];
            salesByDate[d] = (salesByDate[d] || 0) + sale.total;
        });

        // Obtener los últimos 7 días con datos o ceros
        const labels = [];
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            labels.push(d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }));
            data.push(salesByDate[dateStr] || 0);
        }

        Reports.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas Diarias (S/)',
                    data: data,
                    borderColor: '#4318ff',
                    backgroundColor: 'rgba(67, 24, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#4318ff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { callback: v => 'S/ ' + v } },
                    x: { grid: { display: false } }
                }
            }
        });
    },

    exportData: () => {
        const sales = Storage.get(Storage.KEYS.SALES) || [];
        if (sales.length === 0) { alert("No hay datos para exportar."); return; }

        let csvContent = "ID,Fecha,Metodo Pago,Total (S/)\n";
        sales.forEach(sale => {
            const fecha = new Date(sale.fecha).toLocaleDateString(); 
            csvContent += `${sale.id},${fecha},${sale.metodoPago},${sale.total.toFixed(2)}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_gamelab_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

window.Reports = Reports;
