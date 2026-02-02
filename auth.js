// ========================================
// SISTEMA DE AUTENTICAÇÃO - MODE SKETCH
// ========================================

class AuthSystem {
    constructor() {
        this.storageKey = 'mode_users';
        this.sessionKey = 'mode_session';
        this.adminUsername = 'admin'; // Usuário admin padrão
        this.initializeStorage();
    }

    // Inicializa o storage com usuário admin padrão
    initializeStorage() {
        const users = this.getUsers();
        
        // Cria admin padrão se não existir
        if (!users[this.adminUsername]) {
            users[this.adminUsername] = {
                password: this.hashPassword('admin123'), // Senha padrão: admin123
                isAdmin: true,
                createdAt: new Date().toISOString()
            };
            this.saveUsers(users);
            console.log('✓ Usuário admin criado com sucesso');
            console.log('  Usuário: admin');
            console.log('  Senha: admin123');
            console.log('  IMPORTANTE: Altere a senha após o primeiro login!');
        }
    }

    // Hash simples de senha (para produção, use bcrypt ou similar)
    hashPassword(password) {
        // Implementação básica
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    // Obtém todos os usuários
    getUsers() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
    }

    // Salva usuários
    saveUsers(users) {
        localStorage.setItem(this.storageKey, JSON.stringify(users));
    }

    // Login
    login(username, password) {
        const users = this.getUsers();
        const user = users[username];

        if (!user) {
            return false;
        }

        const hashedPassword = this.hashPassword(password);
        
        if (user.password === hashedPassword) {
            // Cria sessão
            const session = {
                username: username,
                isAdmin: user.isAdmin || false,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
            return true;
        }

        return false;
    }

    // Logout
    logout() {
        localStorage.removeItem(this.sessionKey);
        window.location.href = 'login.html';
    }

    // Verifica se está autenticado
    isAuthenticated() {
        const session = localStorage.getItem(this.sessionKey);
        return session !== null;
    }

    // Verifica se é admin
    isAdmin() {
        const session = this.getSession();
        return session && session.isAdmin === true;
    }

    // Obtém sessão atual
    getSession() {
        const data = localStorage.getItem(this.sessionKey);
        return data ? JSON.parse(data) : null;
    }

    // Protege página (redireciona se não autenticado)
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Protege página admin (redireciona se não for admin)
    requireAdmin() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        if (!this.isAdmin()) {
            window.location.href = 'protected.html';
            return false;
        }
        return true;
    }

    // Cria novo usuário (apenas admin)
    createUser(username, password, isAdmin = false) {
        if (!this.isAdmin()) {
            throw new Error('Apenas administradores podem criar usuários');
        }

        const users = this.getUsers();

        if (users[username]) {
            throw new Error('Usuário já existe');
        }

        if (username.length < 3) {
            throw new Error('Usuário deve ter no mínimo 3 caracteres');
        }

        if (password.length < 6) {
            throw new Error('Senha deve ter no mínimo 6 caracteres');
        }

        users[username] = {
            password: this.hashPassword(password),
            isAdmin: isAdmin,
            createdAt: new Date().toISOString()
        };

        this.saveUsers(users);
        return true;
    }

    // Deleta usuário (apenas admin, não pode deletar a si mesmo)
    deleteUser(username) {
        if (!this.isAdmin()) {
            throw new Error('Apenas administradores podem deletar usuários');
        }

        const session = this.getSession();
        if (session.username === username) {
            throw new Error('Você não pode deletar sua própria conta');
        }

        const users = this.getUsers();

        if (!users[username]) {
            throw new Error('Usuário não encontrado');
        }

        delete users[username];
        this.saveUsers(users);
        return true;
    }

    // Altera senha (usuário pode alterar sua própria senha, admin pode alterar qualquer senha)
    changePassword(username, newPassword, oldPassword = null) {
        const users = this.getUsers();
        const session = this.getSession();

        if (!users[username]) {
            throw new Error('Usuário não encontrado');
        }

        // Se não for admin, só pode alterar sua própria senha
        if (!this.isAdmin() && session.username !== username) {
            throw new Error('Você só pode alterar sua própria senha');
        }

        // Se não for admin, precisa informar senha antiga
        if (!this.isAdmin() && oldPassword) {
            const hashedOldPassword = this.hashPassword(oldPassword);
            if (users[username].password !== hashedOldPassword) {
                throw new Error('Senha antiga incorreta');
            }
        }

        if (newPassword.length < 6) {
            throw new Error('Nova senha deve ter no mínimo 6 caracteres');
        }

        users[username].password = this.hashPassword(newPassword);
        users[username].passwordChangedAt = new Date().toISOString();
        
        this.saveUsers(users);
        return true;
    }

    // Lista todos os usuários (apenas admin)
    listUsers() {
        if (!this.isAdmin()) {
            throw new Error('Apenas administradores podem listar usuários');
        }

        const users = this.getUsers();
        return Object.keys(users).map(username => ({
            username: username,
            isAdmin: users[username].isAdmin || false,
            createdAt: users[username].createdAt
        }));
    }

    // Obtém informações do usuário atual
    getCurrentUser() {
        const session = this.getSession();
        if (!session) return null;

        const users = this.getUsers();
        const user = users[session.username];

        return {
            username: session.username,
            isAdmin: session.isAdmin,
            loginTime: session.loginTime,
            createdAt: user ? user.createdAt : null
        };
    }
}

// Instância global
const Auth = new AuthSystem();

// Exporta para uso global
if (typeof window !== 'undefined') {
    window.Auth = Auth;
}