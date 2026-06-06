/**
 * app.js - Orquestador: navegación y carga de módulos
 */

const App = {
    init: () => {
        console.log("Gameclub App Initialized");
        // Por defecto cargar dashboard o login
        App.loadView('dashboard');
    },

    loadView: async (viewName) => {
        const appContainer = document.getElementById('app');
        try {
            const response = await fetch(`views/${viewName}.html`);
            if (response.ok) {
                const html = await response.text();
                appContainer.innerHTML = html;
                App.initModule(viewName);
            } else {
                appContainer.innerHTML = `<h1>Error 404: Vista no encontrada</h1>`;
            }
        } catch (error) {
            console.error("Error loading view:", error);
            appContainer.innerHTML = `<h1>Error al cargar la vista</h1>`;
        }
    },

    initModule: (viewName) => {
        console.log(`Initializing module: ${viewName}`);
        // Aquí se podría cargar dinámicamente el JS del módulo
    }
};

document.addEventListener('DOMContentLoaded', App.init);

export default App;
