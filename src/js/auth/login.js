/**
 * login.js - Validación de credenciales (Keny Andre)
 */

const Login = {
    init: () => {
        console.log("Login module initialized");
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                Login.handleLogin();
            });
        }
    },

    handleLogin: () => {
        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');

        // Obtener usuarios de storage
        const users = Storage.get(Storage.KEYS.USERS) || [];
        
        // Validar credenciales
        const user = users.find(u => u.username === usernameInput && u.password === passwordInput);

        if (user) {
            console.log(`Login successful for user: ${user.name} with role: ${user.role}`);
            
            // Guardar sesión (sin password)
            const sessionData = {
                username: user.username,
                name: user.name,
                role: user.role,
                loginTime: new Date().toISOString()
            };
            
            Storage.save(Storage.KEYS.CURRENT_USER, sessionData);
            
            // Notificar a App para que recargue y muestre el wrapper
            if (window.App) {
                window.App.checkSession();
            }
        } else {
            if (errorDiv) {
                errorDiv.style.display = 'block';
                setTimeout(() => {
                    errorDiv.style.display = 'none';
                }, 3000);
            }
        }
    },

    logout: () => {
        Storage.delete(Storage.KEYS.CURRENT_USER);
        window.location.reload();
    }
};

window.Login = Login;
