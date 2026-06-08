/**
 * sales-history.js - Historial de transacciones (Alexander Smith)
 */

const SalesHistory = {
    init: () => {
        console.log("Sales History module initializing...");
        
        // 1. Renderizar la tabla primero
        SalesHistory.renderTable();

        // 2. Control de visibilidad del botón de exportar
        const user = Storage.get(Storage.KEYS.CURRENT_USER);
        const btnExport = document.getElementById('btn-export-excel');

        if (btnExport) {
            if (user && user.role === 'cajero') {
                btnExport.style.setProperty('display', 'none', 'important');
            } else {
                // Solo añadir el event listener si NO es cajero
                btnExport.style.display = 'block';
                btnExport.onclick = () => {
                    alert("Funcionalidad de exportación a Excel (Próximamente)");
                };
            }
        }
    },

    renderTable: () => {
        const sales = Storage.get(Storage.KEYS.SALES) || [];
        const tableBody = document.getElementById('history-body');
        if (!tableBody) return;

        if (sales.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-muted);">No hay ventas registradas.</td></tr>';
            return;
        }

        // Ordenar por fecha (más reciente primero)
        const sortedSales = [...sales].reverse();

        tableBody.innerHTML = sortedSales.map(s => {
            const date = new Date(s.fecha);
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const prodList = s.productos.map(p => `<li>${p.nombre} (x${p.cantidad})</li>`).join('');

            return `
                <tr>
                    <td><strong>${s.id}</strong></td>
                    <td>${dateStr} ${timeStr}</td>
                    <td>
                        <ul class="prod-list-mini">
                            ${prodList}
                        </ul>
                    </td>
                    <td>S/ ${s.subtotal.toFixed(2)}</td>
                    <td>S/ ${s.igv.toFixed(2)}</td>
                    <td>S/ ${s.total.toFixed(2)}</td>
                    <td>
                        <span class="badge-status pending" style="background-color: #f0f2f5; color: var(--text-main);">
                            ${s.metodoPago}
                        </span>
                    </td>
                    <td>
                        <button class="btn-action" onclick="SalesHistory.showTicket('${s.id}')">🖨️</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    showTicket: (saleId) => {
        const sales = Storage.get(Storage.KEYS.SALES);
        const sale = sales.find(s => s.id === saleId);
        if (!sale) return;

        document.getElementById('ticket-id').innerText = sale.id;
        document.getElementById('ticket-date').innerText = new Date(sale.fecha).toLocaleString();
        
        const itemsHtml = sale.productos.map(p => `
            <tr>
                <td style="padding: 5px 0;">${p.cantidad}</td>
                <td style="padding: 5px 0;">${p.nombre}</td>
                <td style="text-align: right; padding: 5px 0;">S/ ${(p.precio * p.cantidad).toFixed(2)}</td>
            </tr>
        `).join('');
        
        document.getElementById('ticket-items').innerHTML = itemsHtml;
        document.getElementById('ticket-subtotal').innerText = `S/ ${sale.subtotal.toFixed(2)}`;
        document.getElementById('ticket-igv').innerText = `S/ ${sale.igv.toFixed(2)}`;
        document.getElementById('ticket-total').innerText = `S/ ${sale.total.toFixed(2)}`;
        document.getElementById('ticket-payment-method').innerText = `PAGO: ${sale.metodoPago.toUpperCase()}`;

        document.getElementById('ticket-modal').style.display = 'flex';
    }
};

window.SalesHistory = SalesHistory;
