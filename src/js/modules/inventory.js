/**
 * inventory.js - CRUD de productos (Kenny Sthiven)
 */

const Inventory = {
    init: () => {
        console.log("Inventory module initializing...");
        Inventory.renderTable();
        Inventory.setupEventListeners();
    },

    renderTable: (filterText = '', filterCategory = 'all') => {
        const products = Storage.get(Storage.KEYS.PRODUCTS) || [];
        const tableBody = document.getElementById('inventory-body');
        
        if (!tableBody) return;

        let filteredProducts = products.filter(p => {
            const matchesText = p.nombre.toLowerCase().includes(filterText.toLowerCase()) || 
                              p.id.toLowerCase().includes(filterText.toLowerCase());
            const matchesCategory = filterCategory === 'all' || p.categoria === filterCategory;
            return matchesText && matchesCategory;
        });

        tableBody.innerHTML = filteredProducts.map(p => `
            <tr>
                <td class="ps-4">
                    <img src="${p.imagen || 'assets/Default.png'}" alt="${p.nombre}" 
                         class="rounded-3 shadow-sm" style="width: 45px; height: 45px; object-fit: cover;">
                </td>
                <td><span class="text-primary fw-bold small">${p.id}</span></td>
                <td>
                    <div class="fw-semibold text-dark">${p.nombre}</div>
                </td>
                <td><span class="badge bg-light text-muted border fw-normal">${p.categoria}</span></td>
                <td><span class="fw-bold text-dark">S/ ${p.precio.toFixed(2)}</span></td>
                <td>
                    <span class="text-dark fw-medium">${p.stock}</span>
                </td>
                <td>
                    <span class="badge-pill-status status-${p.estado.toLowerCase().replace(' ', '-')}">
                        ${p.estado}
                    </span>
                </td>
                <td class="text-end pe-4">
                    <div class="btn-group">
                        <button class="btn btn-outline-secondary btn-sm rounded-start-2" onclick="Inventory.openEditModal('${p.id}')" title="Editar">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm rounded-end-2" onclick="Inventory.deleteProduct('${p.id}')" title="Eliminar">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    setupEventListeners: () => {
        const searchInput = document.getElementById('inventory-search');
        const categoryFilter = document.getElementById('filter-category');
        const btnAdd = document.getElementById('btn-add-product');
        const btnScan = document.getElementById('btn-scan-barcode-inv');
        const btnCloseModal = document.getElementById('btn-close-modal');
        const btnCloseScanner = document.getElementById('btn-close-scanner');
        const productForm = document.getElementById('product-form');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                Inventory.renderTable(e.target.value, categoryFilter ? categoryFilter.value : 'all');
            });
        }

        if (btnScan) {
            btnScan.onclick = () => Inventory.startVisualScanner();
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                Inventory.renderTable(searchInput ? searchInput.value : '', e.target.value);
            });
        }

        if (btnAdd) {
            btnAdd.onclick = () => {
                Inventory.openAddModal();
            };
        }

        if (btnCloseModal) {
            btnCloseModal.onclick = () => {
                document.getElementById('product-modal').style.display = 'none';
            };
        }

        if (btnCloseScanner) {
            btnCloseScanner.onclick = () => {
                document.getElementById('scanner-visual-modal').style.display = 'none';
            };
        }

        if (productForm) {
            productForm.onsubmit = (e) => {
                e.preventDefault();
                Inventory.saveProduct();
            };
        }
    },

    startVisualScanner: () => {
        const modal = document.getElementById('scanner-visual-modal');
        const progress = document.getElementById('scanner-progress');
        const status = document.getElementById('scanner-status');
        
        if (!modal) return;

        modal.style.display = 'flex';
        progress.style.width = '0%';
        status.innerText = "BUSCANDO CÓDIGO DE BARRAS...";
        status.style.color = "#0f0";

        // Iniciar animación de progreso
        setTimeout(() => {
            progress.style.width = '100%';
        }, 100);

        // Simular tiempo de detección
        setTimeout(() => {
            Inventory.playBeep();
            status.innerText = "¡CÓDIGO DETECTADO!";
            status.style.color = "var(--accent-color)";
            
            setTimeout(() => {
                modal.style.display = 'none';
                
                // Generar un ID nuevo correlativo para la simulación
                const products = Storage.get(Storage.KEYS.PRODUCTS) || [];
                const nextIdNumber = products.length + 1;
                const nextId = `PROD-00${nextIdNumber}`;
                
                Inventory.openAddModal();
                document.getElementById('prod-id').value = nextId;
                document.getElementById('prod-id').disabled = false;
                document.getElementById('prod-name').focus();
            }, 800);
        }, 2000);
    },

    playBeep: () => {
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, context.currentTime);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start();
            gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.1);
            oscillator.stop(context.currentTime + 0.1);
        } catch (e) {
            console.log("Beep!");
        }
    },

    openAddModal: () => {
        const modal = document.getElementById('product-modal');
        if (!modal) return;
        document.getElementById('modal-title').innerText = 'Agregar Producto';
        document.getElementById('product-form').reset();
        document.getElementById('prod-id-original').value = '';
        document.getElementById('prod-id').disabled = false;
        modal.style.display = 'flex';
    },

    openEditModal: (id) => {
        const products = Storage.get(Storage.KEYS.PRODUCTS);
        const product = products.find(p => p.id === id);
        if (!product) return;

        const modal = document.getElementById('product-modal');
        if (!modal) return;
        document.getElementById('modal-title').innerText = 'Editar Producto';
        
        document.getElementById('prod-id').value = product.id;
        document.getElementById('prod-id').disabled = true; 
        document.getElementById('prod-id-original').value = product.id;
        document.getElementById('prod-name').value = product.nombre;
        document.getElementById('prod-category').value = product.categoria;
        document.getElementById('prod-price').value = product.precio;
        document.getElementById('prod-stock').value = product.stock;
        document.getElementById('prod-min').value = product.stockMinimo;

        modal.style.display = 'flex';
    },

    saveProduct: () => {
        const id = document.getElementById('prod-id').value;
        const name = document.getElementById('prod-name').value;
        const category = document.getElementById('prod-category').value;
        const price = parseFloat(document.getElementById('prod-price').value);
        const stock = parseInt(document.getElementById('prod-stock').value);
        const min = parseInt(document.getElementById('prod-min').value);
        const idOriginal = document.getElementById('prod-id-original').value;

        let products = Storage.get(Storage.KEYS.PRODUCTS) || [];

        let estado = "Optimo";
        if (stock === 0) estado = "Agotado";
        else if (stock <= min) estado = "Stock Bajo";

        const productData = {
            id,
            nombre: name,
            categoria: category,
            precio: price,
            stock,
            stockMinimo: min,
            estado
        };

        if (idOriginal) {
            const index = products.findIndex(p => p.id === idOriginal);
            if (index !== -1) products[index] = productData;
        } else {
            if (products.some(p => p.id === id)) {
                alert("El ID del producto ya existe");
                return;
            }
            products.push(productData);
        }

        Storage.save(Storage.KEYS.PRODUCTS, products);
        document.getElementById('product-modal').style.display = 'none';
        Inventory.renderTable();
    },

    deleteProduct: (id) => {
        if (confirm(`¿Estás seguro de eliminar el producto ${id}?`)) {
            let products = Storage.get(Storage.KEYS.PRODUCTS) || [];
            products = products.filter(p => p.id !== id);
            Storage.save(Storage.KEYS.PRODUCTS, products);
            Inventory.renderTable();
        }
    }
};

window.Inventory = Inventory;
