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
                btnExport.classList.add('d-none');
            } else {
                btnExport.classList.remove('d-none');
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
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted"><i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>No hay ventas registradas.</td></tr>';
            return;
        }

        // Ordenar por fecha (más reciente primero)
        const sortedSales = [...sales].reverse();

        tableBody.innerHTML = sortedSales.map(s => {
            const date = new Date(s.fecha);
            const dateStr = date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const prodList = s.productos.map(p => `<li>${p.nombre} <span class="text-primary fw-bold">x${p.cantidad}</span></li>`).join('');

            // Contextual badges for payment methods
            let badgeClass = 'bg-secondary-subtle text-secondary';
            if (s.metodoPago === 'Efectivo') badgeClass = 'bg-success-subtle text-success';
            if (s.metodoPago === 'Tarjeta') badgeClass = 'bg-info-subtle text-info';
            if (s.metodoPago === 'Yape/POS') badgeClass = 'bg-primary-subtle text-primary';

            return `
                <tr>
                    <td class="px-4"><span class="fw-bold text-dark">${s.id}</span></td>
                    <td class="small text-muted">${dateStr}<br>${timeStr}</td>
                    <td>
                        <ul class="prod-list-inline mb-0">
                            ${prodList}
                        </ul>
                    </td>
                    <td><span class="fw-bold text-primary">S/ ${s.total.toFixed(2)}</span></td>
                    <td>
                        <span class="badge ${badgeClass} border-0 rounded-pill px-3 py-2 small fw-bold">
                            ${s.metodoPago}
                        </span>
                    </td>
                    <td class="px-4 text-end">
                        <button class="btn btn-sm btn-outline-primary border-0 rounded-circle p-2" onclick="SalesHistory.showTicket('${s.id}')" title="Ver Ticket">
                            <i class="bi bi-printer fs-5"></i>
                        </button>
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
                <td class="ps-0">${p.cantidad}</td>
                <td>${p.nombre}</td>
                <td class="text-end pe-0">S/ ${(p.precio * p.cantidad).toFixed(2)}</td>
            </tr>
        `).join('');
        
        document.getElementById('ticket-items').innerHTML = itemsHtml;
        document.getElementById('ticket-subtotal').innerText = `S/ ${sale.subtotal.toFixed(2)}`;
        document.getElementById('ticket-igv').innerText = `S/ ${sale.igv.toFixed(2)}`;
        document.getElementById('ticket-total').innerText = `S/ ${sale.total.toFixed(2)}`;
        document.getElementById('ticket-payment-method').innerText = `PAGO: ${sale.metodoPago.toUpperCase()}`;

        const modalEl = document.getElementById('ticket-modal');
        let modal = bootstrap.Modal.getInstance(modalEl);
        if (!modal) modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
};

window.SalesHistory = SalesHistory;
