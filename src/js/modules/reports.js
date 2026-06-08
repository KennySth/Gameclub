/**
 * Lógica del Módulo de Reportes - GameLab (Filtros Reales)
 */
const ReportsModule = {
    chartInstance: null,

    init: () => {
        console.log("Iniciando Módulo de Reportes GameLab...");
        ReportsModule.seedMockData(); 
        
        // Poner por defecto las fechas de filtro (Desde hace 30 días hasta hoy)
        const hoy = new Date();
        const haceUnMes = new Date(hoy);
        haceUnMes.setDate(hoy.getDate() - 30);
        
        if (document.getElementById('dateStart')) {
            document.getElementById('dateStart').value = haceUnMes.toISOString().split('T')[0];
            document.getElementById('dateEnd').value = hoy.toISOString().split('T')[0];
        }

        ReportsModule.bindEvents();   
        ReportsModule.loadData();     
    },

    seedMockData: () => {
        const existingData = window.Storage.get('gamelab_sales');
        
        // Si hay menos de 5 ventas, inyectamos un montón de data nueva para probar los filtros
        if (!existingData || existingData.length < 5) {
            console.log("Inyectando data masiva para probar filtros...");
            
            // Función para restar días fácilmente
            const restarDias = (dias) => {
                const d = new Date();
                d.setDate(d.getDate() - dias);
                return d.toISOString();
            };

            const mockSales = [
                { id: 1, date: restarDias(0), total: 259.90, items: [{ product: 'The Legend of Zelda: TOTK', category: 'hardware' }] },
                { id: 2, date: restarDias(0), total: 15.50, items: [{ product: 'Gaseosa 500ml', category: 'snacks' }, { product: 'Galletas', category: 'snacks' }] },
                { id: 3, date: restarDias(1), total: 280.00, items: [{ product: 'Mando PS5 DualSense', category: 'hardware' }] },
                { id: 4, date: restarDias(2), total: 220.00, items: [{ product: 'Super Mario Bros. Wonder', category: 'hardware' }] },
                { id: 5, date: restarDias(5), total: 8.50, items: [{ product: 'Gaseosa 500ml', category: 'snacks' }] },
                { id: 6, date: restarDias(10), total: 2499.00, items: [{ product: 'PlayStation 5 Slim', category: 'hardware' }] },
                { id: 7, date: restarDias(15), total: 1350.00, items: [{ product: 'Nintendo Switch OLED', category: 'hardware' }] },
                { id: 8, date: restarDias(20), total: 35.00, items: [{ product: 'Pase 5 Horas PC', category: 'hardware' }] },
                { id: 9, date: restarDias(35), total: 259.90, items: [{ product: 'The Legend of Zelda: TOTK', category: 'hardware' }] },
                { id: 10, date: restarDias(40), total: 12.00, items: [{ product: 'Snack Salado', category: 'snacks' }] }
            ];
            window.Storage.save('gamelab_sales', mockSales);
        }
    },

    bindEvents: () => {
        document.getElementById('dateStart')?.addEventListener('change', ReportsModule.loadData);
        document.getElementById('dateEnd')?.addEventListener('change', ReportsModule.loadData);
        document.getElementById('filterCategory')?.addEventListener('change', ReportsModule.loadData);
        document.getElementById('btnExportExcel')?.addEventListener('click', () => ReportsModule.exportData('CSV'));
    },

    loadData: () => {
        const allSales = window.Storage.get('gamelab_sales') || [];
        
        // 1. LEER LAS FECHAS DEL HTML
        const dateStartVal = document.getElementById('dateStart').value;
        const dateEndVal = document.getElementById('dateEnd').value;
        const filterCatVal = document.getElementById('filterCategory').value;

        // Convertir strings a Date para comparar correctamente
        const startDate = new Date(dateStartVal);
        startDate.setHours(0, 0, 0, 0); // Desde las 00:00 del día inicial
        const endDate = new Date(dateEndVal);
        endDate.setHours(23, 59, 59, 999); // Hasta las 23:59 del día final

        // 2. FILTRAR LA DATA
        const filteredSales = allSales.filter(sale => {
            const saleDate = new Date(sale.date);
            
            // Ver si la fecha cuadra
            const matchDate = saleDate >= startDate && saleDate <= endDate;

            // Ver si la categoría cuadra
            let matchCat = true;
            if (filterCatVal !== 'todas') {
                matchCat = sale.items.some(item => item.category === filterCatVal);
            }

            return matchDate && matchCat;
        });

        // 3. CALCULAR KPIs CON DATA FILTRADA
        let totalRevenue = 0; 
        let totalItems = 0;

        filteredSales.forEach(sale => {
            totalRevenue += sale.total;
            totalItems += sale.items.length;
        });
        
        const ticketPromedio = filteredSales.length > 0 ? (totalRevenue / filteredSales.length) : 0;

        if (document.getElementById('kpiRevenue')) document.getElementById('kpiRevenue').textContent = `S/ ${totalRevenue.toFixed(2)}`;
        if (document.getElementById('kpiProducts')) document.getElementById('kpiProducts').textContent = totalItems;
        if (document.getElementById('kpiTicket')) document.getElementById('kpiTicket').textContent = `S/ ${ticketPromedio.toFixed(2)}`;
        if (document.getElementById('kpiReturns')) document.getElementById('kpiReturns').textContent = "2"; 

        // 4. ACTUALIZAR TABLA Y GRÁFICO
        ReportsModule.renderTopProducts(filteredSales);
        ReportsModule.renderChart(filteredSales);
    },

    renderTopProducts: (filteredSales) => {
        const tbody = document.getElementById('topProductsList');
        if (!tbody) return;

        // Contar qué productos se repiten más en las ventas filtradas
        const productCount = {};
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productCount[item.product]) productCount[item.product] = { qty: 0, revenue: 0 };
                productCount[item.product].qty += 1;
                productCount[item.product].revenue += (sale.total / sale.items.length); // Ingreso aproximado
            });
        });

        // Ordenar del más vendido al menos vendido (Top 5)
        const sortedProducts = Object.entries(productCount)
            .map(([name, data]) => ({ name, qty: data.qty, revenue: data.revenue }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);

        if (sortedProducts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: #9ca3af;">No hay ventas en este periodo</td></tr>`;
            return;
        }

        tbody.innerHTML = sortedProducts.map((p, index) => `
            <tr>
                <td><span class="rank-circle">${index + 1}</span></td>
                <td>${p.name}</td>
                <td>${p.qty}</td>
                <td>${p.revenue.toFixed(2)}</td>
            </tr>
        `).join('');
    },

    renderChart: (filteredSales) => {
        const ctx = document.getElementById('ventasChart');
        if (!ctx) return;
        if (ReportsModule.chartInstance) ReportsModule.chartInstance.destroy();

        // Calcular ventas por día de la semana [Dom, Lun, Mar, Mie, Jue, Vie, Sab]
        const salesByDay = [0, 0, 0, 0, 0, 0, 0];
        filteredSales.forEach(sale => {
            const date = new Date(sale.date);
            salesByDay[date.getDay()] += sale.total;
        });

        // Ordenar para el gráfico: Lun(1) a Dom(0)
        const chartData = [ salesByDay[1], salesByDay[2], salesByDay[3], salesByDay[4], salesByDay[5], salesByDay[6], salesByDay[0] ];

        ReportsModule.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Ventas (S/)',
                    data: chartData,
                    backgroundColor: (context) => context.dataIndex === 5 ? '#10b981' : '#8b5cf6',
                    borderRadius: 4, barThickness: 30
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: '#2d3748', drawBorder: false }, ticks: { color: '#9ca3af', callback: v => 'S/ ' + v } },
                    x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
                }
            }
        });
    },

    exportData: (format) => {
        if (format === 'CSV') {
            const allSales = window.Storage.get('gamelab_sales') || [];
            if (allSales.length === 0) { alert("No hay datos para exportar."); return; }

            let csvContent = "ID,Fecha,Total (S/),Productos\n";
            allSales.forEach(sale => {
                const fecha = new Date(sale.date).toLocaleDateString(); 
                const productos = sale.items.map(item => item.product).join(" - ");
                csvContent += `${sale.id},${fecha},${sale.total.toFixed(2)},${productos}\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "reporte_ventas_gamelab.csv"; 
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
        }
    }
};

window.ReportsModule = ReportsModule;