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
        const form = document.getElementById('login-form');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMsg = document.getElementById('login-error-msg');

        // Reiniciar estado visual
        form.classList.remove('was-validated');
        errorMsg.classList.add('d-none');

        // Validación nativa de campos vacíos
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // Obtener usuarios de storage
        const users = Storage.get(Storage.KEYS.USERS) || [];
        
        // Validar credenciales
        const user = users.find(u => u.username === usernameInput.value && u.password === passwordInput.value);

        if (user) {
            console.log(`Login successful for user: ${user.name}`);
            
            const sessionData = {
                username: user.username,
                name: user.name,
                role: user.role,
                loginTime: new Date().toISOString()
            };
            
            Storage.save(Storage.KEYS.CURRENT_USER, sessionData);
            
            if (window.App) {
                window.App.checkSession();
            }
        } else {
            // Mostrar error de credenciales incorrectas
            errorMsg.classList.remove('d-none');
            // Opcional: Marcar campos como inválidos manualmente para feedback visual
            usernameInput.classList.add('is-invalid');
            passwordInput.classList.add('is-invalid');
            
            // Limpiar estado de error al escribir
            const clearError = () => {
                errorMsg.classList.add('d-none');
                usernameInput.classList.remove('is-invalid');
                passwordInput.classList.remove('is-invalid');
                usernameInput.removeEventListener('input', clearError);
                passwordInput.removeEventListener('input', clearError);
            };
            
            usernameInput.addEventListener('input', clearError);
            passwordInput.addEventListener('input', clearError);
        }
    },

    logout: () => {
        Storage.delete(Storage.KEYS.CURRENT_USER);
        window.location.reload();
    }
};

window.Login = Login;
