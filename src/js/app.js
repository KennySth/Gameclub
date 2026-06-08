/**
 * app.js - Orquestador: navegación y control de acceso (RBAC)
 */

const App = {
    init: () => {
        console.log("Gameclub App Initialized");
        // Inicializar datos de storage
        if (window.Storage) {
            window.Storage.init();
        }

        App.checkSession();
        App.setupNavigation();
    },

    checkSession: () => {
        const user = Storage.get(Storage.KEYS.CURRENT_USER);
        const appWrapper = document.getElementById('app-wrapper');
        const loginContainer = document.getElementById('login-container');

        if (user) {
            // Usuario logueado
            console.log(`Session found: ${user.username} (${user.role})`);
            if (loginContainer) loginContainer.style.display = 'none';
            if (appWrapper) appWrapper.style.display = 'flex';
            
            App.applyPermissions(user.role);
            App.updateUserInfo(user);
            
            // Cargar vista inicial según rol
            const defaultView = (user.role === 'cajero') ? 'pos' : 'dashboard';
            App.loadView(defaultView);
        } else {
            // No hay sesión
            if (appWrapper) appWrapper.style.display = 'none';
            if (loginContainer) {
                loginContainer.style.display = 'block';
                App.loadLogin();
            }
        }
    },

    loadLogin: async () => {
        const loginContainer = document.getElementById('login-container');
        try {
            const response = await fetch('views/login.html');
            if (response.ok) {
                loginContainer.innerHTML = await response.text();
                if (window.Login) window.Login.init();
            }
        } catch (error) {
            console.error("Error loading login view:", error);
        }
    },

    applyPermissions: (role) => {
        const menuItems = document.querySelectorAll('#sidebar-menu li');
        menuItems.forEach(item => {
            const view = item.getAttribute('data-view');
            
            if (role === 'cajero') {
                // Cajero solo ve 'pos' y 'sales-history'
                if (view === 'pos' || view === 'sales-history') {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            } else if (role === 'admin_general' || role === 'admin_almacen') {
                // Admin ve todo excepto 'pos'
                if (view === 'pos') {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'flex';
                }
            }
        });
    },

    updateUserInfo: (user) => {
        const nameDisplay = document.getElementById('display-user-name');
        if (nameDisplay) nameDisplay.innerText = user.name;
        
        const avatarDisplay = document.getElementById('display-user-avatar');
        if (avatarDisplay) {
            avatarDisplay.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e94560&color=fff`;
        }
    },

    setupNavigation: () => {
        const navItems = document.querySelectorAll('.sidebar-nav li');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.style.display === 'none') return;
                
                const view = item.getAttribute('data-view');
                if (view) {
                    navItems.forEach(li => li.classList.remove('active'));
                    item.classList.add('active');
                    App.loadView(view);
                }
            });
        });

        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.onclick = () => {
                if (confirm("¿Cerrar sesión?")) {
                    if (window.Login) window.Login.logout();
                }
            };
        }
    },

    loadView: async (viewName) => {
        const appContainer = document.getElementById('app');
        const viewTitle = document.getElementById('view-title');
        
        const titles = {
            'dashboard': 'Panel de Control',
            'pos': 'Punto de Venta',
            'inventory': 'Inventario de Productos',
            'sales-history': 'Historial de Ventas',
            'reports': 'Reportes y Estadísticas',
            'users': 'Gestión de Usuarios'
        };

        if (viewTitle) viewTitle.innerText = titles[viewName] || 'Sistema GameLab';

        try {
            const response = await fetch(`views/${viewName}.html`);
            if (response.ok) {
                const html = await response.text();
                appContainer.innerHTML = html;
                App.initModule(viewName);
            } else {
                appContainer.innerHTML = `<div class="card"><h1>Error 404: Vista no encontrada (${viewName})</h1></div>`;
            }
        } catch (error) {
            console.error("Error loading view:", error);
            appContainer.innerHTML = `<div class="card"><h1>Error al cargar la vista</h1></div>`;
        }
    },

    initModule: (viewName) => {
        console.log(`Initializing module: ${viewName}`);
        const user = Storage.get(Storage.KEYS.CURRENT_USER);
        
        switch(viewName) {
            case 'inventory':
                if (window.Inventory) window.Inventory.init();
                break;
            case 'dashboard':
                if (window.Dashboard) window.Dashboard.init(user.role);
                break;
            case 'pos':
                if (window.POS) window.POS.init();
                break;
            case 'sales-history':
                if (window.SalesHistory) window.SalesHistory.init();
                break;
            case 'users':
                if (window.Users) window.Users.init();
                break;
            case 'reports':
                if (window.Reports) window.Reports.init();
                break;
        }
    }
};

document.addEventListener('DOMContentLoaded', App.init);
window.App = App;
export default App;
