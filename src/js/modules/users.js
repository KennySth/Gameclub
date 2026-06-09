/**
 * users.js - Gestión de perfiles y roles (Alexander Smith)
 */

const Users = {
    init: () => {
        console.log("Users module initialized");
        Users.renderTable();
        Users.setupEventListeners();
    },

    renderTable: () => {
        const users = Storage.get(Storage.KEYS.USERS) || [];
        const tableBody = document.getElementById('users-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = users.map(u => {
            const roleClass = `role-${u.role.replace('_', '-')}`;
            const roleName = u.role.replace('_', ' ').toUpperCase();
            
            return `
                <tr>
                    <td class="ps-4">
                        <div class="d-flex align-items-center">
                            <div class="avatar-circle me-3 bg-light text-primary fw-bold d-flex align-items-center justify-content-center" style="width: 35px; height: 35px; border-radius: 50%; border: 1px solid #eee; font-size: 12px;">
                                ${u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div class="fw-bold text-dark">${u.name}</div>
                        </div>
                    </td>
                    <td><span class="text-muted small">${u.username}</span></td>
                    <td>
                        <span class="role-badge ${roleClass}">
                            ${roleName}
                        </span>
                    </td>
                    <td>
                        <span class="small fw-medium status-active">
                            <i class="bi bi-check-circle-fill me-1"></i> Activo
                        </span>
                    </td>
                    <td class="text-end pe-4">
                        <div class="btn-group shadow-sm rounded-2">
                            <button class="btn btn-white btn-sm border" onclick="Users.openEditModal('${u.username}')" title="Editar">
                                <i class="bi bi-pencil-square text-primary"></i>
                            </button>
                            <button class="btn btn-white btn-sm border" onclick="Users.deleteUser('${u.username}')" title="Eliminar">
                                <i class="bi bi-trash3-fill text-danger"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    setupEventListeners: () => {
        const btnAdd = document.getElementById('btn-add-user');
        const btnClose = document.getElementById('btn-close-user-modal');
        const form = document.getElementById('user-form');

        if (btnAdd) {
            btnAdd.onclick = () => Users.openAddModal();
        }

        if (btnClose) {
            btnClose.onclick = () => {
                document.getElementById('user-modal').style.display = 'none';
            };
        }

        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                Users.saveUser();
            };
        }
    },

    openAddModal: () => {
        const modal = document.getElementById('user-modal');
        document.getElementById('user-modal-title').innerText = 'Agregar Usuario';
        document.getElementById('user-form').reset();
        document.getElementById('user-username-original').value = '';
        document.getElementById('user-username').disabled = false;
        modal.style.display = 'flex';
    },

    openEditModal: (username) => {
        const users = Storage.get(Storage.KEYS.USERS);
        const user = users.find(u => u.username === username);
        if (!user) return;

        const modal = document.getElementById('user-modal');
        document.getElementById('user-modal-title').innerText = 'Editar Usuario';
        
        document.getElementById('user-fullname').value = user.name;
        document.getElementById('user-username').value = user.username;
        document.getElementById('user-username').disabled = true;
        document.getElementById('user-username-original').value = user.username;
        document.getElementById('user-password').value = user.password;
        document.getElementById('user-role').value = user.role;

        modal.style.display = 'flex';
    },

    saveUser: () => {
        const name = document.getElementById('user-fullname').value;
        const username = document.getElementById('user-username').value;
        const password = document.getElementById('user-password').value;
        const role = document.getElementById('user-role').value;
        const originalUsername = document.getElementById('user-username-original').value;

        let users = Storage.get(Storage.KEYS.USERS) || [];

        const userData = { name, username, password, role };

        if (originalUsername) {
            // Editar
            const index = users.findIndex(u => u.username === originalUsername);
            users[index] = userData;
        } else {
            // Agregar
            if (users.some(u => u.username === username)) {
                alert("El nombre de usuario ya existe");
                return;
            }
            users.push(userData);
        }

        Storage.save(Storage.KEYS.USERS, users);
        document.getElementById('user-modal').style.display = 'none';
        Users.renderTable();
    },

    deleteUser: (username) => {
        const currentUser = Storage.get(Storage.KEYS.CURRENT_USER);
        if (currentUser && currentUser.username === username) {
            alert("No puedes eliminar al usuario con el que has iniciado sesión");
            return;
        }

        if (confirm(`¿Estás seguro de eliminar al usuario ${username}?`)) {
            let users = Storage.get(Storage.KEYS.USERS);
            users = users.filter(u => u.username !== username);
            Storage.save(Storage.KEYS.USERS, users);
            Users.renderTable();
        }
    }
};

window.Users = Users;
