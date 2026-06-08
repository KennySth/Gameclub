/**
 * pos.js - Ventas, carrito y pagos (Katherine Patricia)
 */

const POS = {
    cart: [],
    selectedCategory: 'all',
    generatedPin: null,

    init: () => {
        console.log("POS module initializing...");
        POS.renderCatalog();
        POS.setupEventListeners();
        POS.updateCartUI();
    },

    showAlert: (message, title = 'Atención') => {
        const titleEl = document.getElementById('alert-modal-title');
        const msgEl = document.getElementById('alert-modal-message');
        if (titleEl) titleEl.innerText = title;
        if (msgEl) msgEl.innerText = message;

        const modalEl = document.getElementById('alert-modal');
        let modal = bootstrap.Modal.getInstance(modalEl);
        if (!modal) modal = new bootstrap.Modal(modalEl);
        modal.show();
    },

    renderCatalog: (filterText = '') => {
        const products = Storage.get(Storage.KEYS.PRODUCTS) || [];
        const catalogGrid = document.getElementById('pos-catalog-grid');
        if (!catalogGrid) return;

        const filtered = products.filter(p => {
            const matchesText = p.nombre.toLowerCase().includes(filterText.toLowerCase()) || 
                                p.id.toLowerCase().includes(filterText.toLowerCase());
            const matchesCategory = POS.selectedCategory === 'all' || p.categoria === POS.selectedCategory;
            return matchesText && matchesCategory;
        });

        catalogGrid.innerHTML = filtered.map(p => `
            <div class="col">
                <div class="card h-100 border-light-subtle product-card shadow-sm rounded-4 p-2 text-center" onclick="POS.addToCart('${p.id}')">
                    <div class="d-flex align-items-center justify-content-center mb-2" style="height: 100px;">
                        <img src="${p.imagen || 'assets/Default.png'}" alt="${p.nombre}" class="img-fluid" style="max-height: 100%; object-fit: contain;">
                    </div>
                    <div class="card-body p-1">
                        <h6 class="card-title fw-bold text-dark small mb-1 text-truncate" title="${p.nombre}">${p.nombre}</h6>
                        <p class="text-primary fw-bold mb-1">S/ ${p.precio.toFixed(2)}</p>
                        <span class="badge ${p.stock <= 5 ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} border-0 small">
                            Stock: ${p.stock}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    addToCart: (productId) => {
        const products = Storage.get(Storage.KEYS.PRODUCTS);
        const product = products.find(p => p.id === productId);

        if (!product || product.stock <= 0) {
            POS.showAlert("Producto sin stock disponible");
            return;
        }

        const cartItem = POS.cart.find(item => item.id === productId);
        if (cartItem) {
            if (cartItem.cantidad < product.stock) {
                cartItem.cantidad++;
            } else {
                POS.showAlert("No hay más stock disponible");
            }
        } else {
            POS.cart.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                cantidad: 1
            });
        }

        POS.updateCartUI();
    },

    removeFromCart: (productId) => {
        POS.cart = POS.cart.filter(item => item.id !== productId);
        POS.updateCartUI();
    },

    updateQuantity: (productId, delta) => {
        const item = POS.cart.find(i => i.id === productId);
        const products = Storage.get(Storage.KEYS.PRODUCTS);
        const product = products.find(p => p.id === productId);

        if (item) {
            const newQty = item.cantidad + delta;
            if (newQty > 0 && newQty <= product.stock) {
                item.cantidad = newQty;
            } else if (newQty === 0) {
                POS.removeFromCart(productId);
            }
        }
        POS.updateCartUI();
    },

    updateCartUI: () => {
        const cartBody = document.getElementById('cart-body');
        if (!cartBody) return;

        cartBody.innerHTML = POS.cart.map(item => `
            <tr>
                <td class="ps-0">
                    <span class="d-block fw-bold text-dark small">${item.nombre}</span>
                    <span class="text-muted extra-small">S/ ${item.precio.toFixed(2)} c/u</span>
                </td>
                <td>
                    <div class="d-flex align-items-center justify-content-center gap-2">
                        <button class="btn btn-sm btn-light border p-0 rounded-circle" style="width:24px; height:24px;" onclick="POS.updateQuantity('${item.id}', -1)">-</button>
                        <span class="small fw-bold">${item.cantidad}</span>
                        <button class="btn btn-sm btn-light border p-0 rounded-circle" style="width:24px; height:24px;" onclick="POS.updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </td>
                <td class="text-end fw-bold text-dark small">S/ ${(item.precio * item.cantidad).toFixed(2)}</td>
                <td class="text-end pe-0">
                    <button class="btn btn-sm btn-link text-danger p-0" onclick="POS.removeFromCart('${item.id}')">
                        <i class="bi bi-x-circle fs-6"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        const subtotal = POS.cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        const igvRate = 0.18;
        
        const subtotalSinIgv = subtotal / (1 + igvRate);
        const igv = subtotal - subtotalSinIgv;

        document.getElementById('cart-subtotal').innerText = `S/ ${subtotalSinIgv.toFixed(2)}`;
        document.getElementById('cart-igv').innerText = `S/ ${igv.toFixed(2)}`;
        document.getElementById('cart-total').innerText = `S/ ${subtotal.toFixed(2)}`;
    },

    setupEventListeners: () => {
        const searchInput = document.getElementById('pos-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                POS.renderCatalog(e.target.value);
            });

            // Lógica de "Escaneo de Barras" (Presionar Enter)
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const code = e.target.value.trim();
                    if (code) {
                        const products = Storage.get(Storage.KEYS.PRODUCTS);
                        const product = products.find(p => p.id.toLowerCase() === code.toLowerCase());
                        
                        if (product) {
                            POS.addToCart(product.id);
                            e.target.value = ''; // Limpiar tras "escaneo" exitoso
                            POS.renderCatalog(''); // Resetear grid
                        } else {
                            POS.showAlert("Producto no encontrado por código de barras.", "Busqueda Fallida");
                        }
                    }
                }
            });
        }

        const categoryBtns = document.querySelectorAll('.cat-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                POS.selectedCategory = btn.getAttribute('data-category');
                POS.renderCatalog(searchInput ? searchInput.value : '');
            });
        });

        const btnClear = document.getElementById('btn-clear-cart');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                POS.cart = [];
                POS.updateCartUI();
            });
        }

        const btnCheckout = document.getElementById('btn-checkout');
        if (btnCheckout) {
            btnCheckout.addEventListener('click', () => {
                const method = document.getElementById('payment-method').value;
                if (method === 'Tarjeta' || method === 'Yape/POS') {
                    POS.showConfirmModal(method);
                } else {
                    POS.processPayment();
                }
            });
        }

        const btnConfirmPin = document.getElementById('btn-confirm-pin');
        if (btnConfirmPin) {
            btnConfirmPin.addEventListener('click', () => {
                const pinInput = document.getElementById('payment-pin').value;
                if (pinInput === POS.generatedPin) {
                    const modalEl = document.getElementById('payment-confirm-modal');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                    POS.processPayment();
                } else {
                    POS.showAlert("Código incorrecto. Inténtelo de nuevo.", "Error de Validación");
                    document.getElementById('payment-pin').value = '';
                    document.getElementById('payment-pin').focus();
                }
            });
        }
    },

    showConfirmModal: (method) => {
        if (POS.cart.length === 0) {
            POS.showAlert("El carrito está vacío", "Carrito Vacío");
            return;
        }

        // Generar PIN aleatorio
        POS.generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Actualizar UI del modal
        document.getElementById('confirm-method').innerText = method;
        const total = POS.cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        document.getElementById('confirm-amount').innerText = `S/ ${total.toFixed(2)}`;
        document.getElementById('confirm-generated-code').innerText = POS.generatedPin;
        
        document.getElementById('payment-pin').value = '';
        
        const modalEl = document.getElementById('payment-confirm-modal');
        let modal = bootstrap.Modal.getInstance(modalEl);
        if (!modal) modal = new bootstrap.Modal(modalEl);
        modal.show();
        
        modalEl.addEventListener('shown.bs.modal', () => {
            document.getElementById('payment-pin').focus();
        }, { once: true });
    },

    processPayment: () => {
        if (POS.cart.length === 0) {
            POS.showAlert("El carrito está vacío", "Carrito Vacío");
            return;
        }

        const method = document.getElementById('payment-method').value;
        const total = POS.cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        const igvRate = 0.18;

        const sale = {
            id: `TRX-${Date.now().toString().slice(-4)}`,
            productos: [...POS.cart],
            total: total,
            subtotal: total / (1 + igvRate),
            igv: total - (total / (1 + igvRate)),
            metodoPago: method,
            fecha: new Date().toISOString()
        };

        const sales = Storage.get(Storage.KEYS.SALES) || [];
        sales.push(sale);
        Storage.save(Storage.KEYS.SALES, sales);

        let products = Storage.get(Storage.KEYS.PRODUCTS);
        POS.cart.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                product.stock -= item.cantidad;
                if (product.stock === 0) product.estado = "Agotado";
                else if (product.stock <= product.stockMinimo) product.estado = "Stock Bajo";
            }
        });
        Storage.save(Storage.KEYS.PRODUCTS, products);

        // Mostrar Ticket
        POS.showTicket(sale);

        POS.cart = [];
        POS.updateCartUI();
        POS.renderCatalog();
    },

    showTicket: (sale) => {
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

window.POS = POS;
