// ========================================
// SISTEMA DE AUTENTICAÇÃO - MODE SKETCH
// Integrado com Firebase Authentication e Firestore
// ========================================

class AuthSystem {
    constructor() {
        // Verifica se Firebase está disponível
        if (typeof window.firebaseAuth === 'undefined' || typeof window.firebaseDb === 'undefined') {
            console.warn('Firebase não está inicializado ainda. Aguardando...');
            // Retorna uma instância vazia temporariamente
            this.auth = null;
            this.db = null;
            this.initialized = false;
            this.initializeWhenReady();
            return;
        }
        
        this.auth = window.firebaseAuth;
        this.db = window.firebaseDb;
        this.usersCollection = 'users';
        this.adminCollection = 'admins';
        this.initialized = true;
        this.initializeAdmin();
    }

    // Inicializa quando Firebase estiver pronto
    initializeWhenReady() {
        const maxAttempts = 20;
        let attempts = 0;
        
        const checkFirebase = setInterval(() => {
            attempts++;
            
            if (typeof window.firebaseAuth !== 'undefined' && typeof window.firebaseDb !== 'undefined') {
                this.auth = window.firebaseAuth;
                this.db = window.firebaseDb;
                this.initialized = true;
                this.initializeAdmin();
                clearInterval(checkFirebase);
                console.log('✓ Auth inicializado após Firebase estar pronto');
            } else if (attempts >= maxAttempts) {
                clearInterval(checkFirebase);
                console.error('Firebase não foi inicializado após múltiplas tentativas');
            }
        }, 200);
    }

    // Inicializa usuário admin padrão no Firestore
    async initializeAdmin() {
        if (!this.initialized) return;
        
        try {
            const adminDoc = await this.db.collection(this.adminCollection).doc('admin').get();
            
            if (!adminDoc.exists) {
                // Cria o primeiro admin no Firestore (apenas estrutura)
                await this.db.collection(this.adminCollection).doc('admin').set({
                    username: 'admin',
                    email: 'admin@mode-sketch.com',
                    createdAt: window.firebaseApp.firestore.FieldValue.serverTimestamp(),
                    isActive: true
                });
                
                console.log('✓ Sistema de admin inicializado no Firestore');
            }
        } catch (error) {
            console.error('Erro ao inicializar admin:', error);
        }
    }

    // Cria usuário no Firebase Authentication e Firestore
    async createUser(username, password, isAdmin = false) {
        if (!this.initialized) {
            throw new Error('Sistema ainda não está inicializado. Aguarde alguns instantes.');
        }

        if (!(await this.isAdmin())) {
            throw new Error('Apenas administradores podem criar usuários');
        }

        if (username.length < 3) {
            throw new Error('Usuário deve ter no mínimo 3 caracteres');
        }

        if (password.length < 6) {
            throw new Error('Senha deve ter no mínimo 6 caracteres');
        }

        try {
            // Verifica se usuário já existe no Firestore
            const userDoc = await this.db.collection(this.usersCollection).doc(username).get();
            if (userDoc.exists) {
                throw new Error('Usuário já existe');
            }

            // Cria email único baseado no username
            const email = `${username}@mode-sketch.local`;

            // Salva o usuário atual antes de criar novo
            const currentUser = this.auth.currentUser;
            const currentUserEmail = currentUser ? currentUser.email : null;

            // Cria usuário no Firebase Authentication
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            
            // Atualiza o displayName
            await userCredential.user.updateProfile({
                displayName: username
            });

            // Salva informações adicionais no Firestore
            await this.db.collection(this.usersCollection).doc(username).set({
                username: username,
                email: email,
                isAdmin: isAdmin,
                createdAt: window.firebaseApp.firestore.FieldValue.serverTimestamp(),
                uid: userCredential.user.uid
            });

            // Se for admin, adiciona à coleção de admins
            if (isAdmin) {
                await this.db.collection(this.adminCollection).doc(username).set({
                    username: username,
                    createdAt: window.firebaseApp.firestore.FieldValue.serverTimestamp()
                });
            }

            // Faz logout do usuário criado
            await this.auth.signOut();
            
            // Tenta restaurar sessão do admin
            if (currentUserEmail) {
                // O admin precisará fazer login novamente após criar usuário
                // Por segurança, não armazenamos senhas
                return { success: true, requiresReauth: true };
            }

            return { success: true, requiresReauth: false };

        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            
            // Tenta fazer logout para limpar estado
            try {
                if (this.auth.currentUser) {
                    await this.auth.signOut();
                }
            } catch (e) {
                // Ignora erros de logout
            }
            
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('Usuário já existe');
            }
            throw new Error(error.message || 'Erro ao criar usuário');
        }
    }

    // Login com Firebase Authentication
    async login(username, password) {
        if (!this.initialized) {
            throw new Error('Sistema ainda não está inicializado. Aguarde alguns instantes.');
        }

        try {
            const email = `${username}@mode-sketch.local`;
            
            // Autentica com Firebase
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            
            // Busca informações do usuário no Firestore
            const userDoc = await this.db.collection(this.usersCollection).doc(username).get();
            
            if (!userDoc.exists) {
                await this.auth.signOut();
                throw new Error('Usuário não encontrado no sistema');
            }

            const userData = userDoc.data();
            
            // Salva sessão no localStorage para compatibilidade
            const session = {
                username: username,
                isAdmin: userData.isAdmin || false,
                loginTime: new Date().toISOString(),
                uid: userCredential.user.uid
            };
            
            localStorage.setItem('mode_session', JSON.stringify(session));
            
            return true;
        } catch (error) {
            console.error('Erro no login:', error);
            
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-email') {
                return false;
            }
            
            throw new Error(error.message || 'Erro ao fazer login');
        }
    }

    // Logout
    async logout() {
        try {
            if (this.initialized && this.auth) {
                await this.auth.signOut();
            }
            localStorage.removeItem('mode_session');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Erro no logout:', error);
            localStorage.removeItem('mode_session');
            window.location.href = 'login.html';
        }
    }

    // Verifica se está autenticado
    isAuthenticated() {
        const session = localStorage.getItem('mode_session');
        const currentUser = this.initialized && this.auth ? this.auth.currentUser : null;
        return (session !== null && currentUser !== null);
    }

    // Verifica se é admin
    async isAdmin() {
        if (!this.initialized) return false;

        const session = this.getSession();
        if (!session) return false;

        try {
            const userDoc = await this.db.collection(this.usersCollection).doc(session.username).get();
            if (!userDoc.exists) return false;
            
            return userDoc.data().isAdmin || false;
        } catch (error) {
            console.error('Erro ao verificar admin:', error);
            return session.isAdmin || false;
        }
    }

    // Obtém sessão atual
    getSession() {
        const data = localStorage.getItem('mode_session');
        return data ? JSON.parse(data) : null;
    }

    // Protege página (redireciona se não autenticado)
    async requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Protege página admin (redireciona se não for admin)
    async requireAdmin() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        
        const isAdmin = await this.isAdmin();
        if (!isAdmin) {
            window.location.href = 'protected.html';
            return false;
        }
        return true;
    }

    // Deleta usuário
    async deleteUser(username) {
        if (!this.initialized) {
            throw new Error('Sistema ainda não está inicializado.');
        }

        if (!(await this.isAdmin())) {
            throw new Error('Apenas administradores podem deletar usuários');
        }

        const session = this.getSession();
        if (session && session.username === username) {
            throw new Error('Você não pode deletar sua própria conta');
        }

        try {
            // Busca o usuário no Firestore
            const userDoc = await this.db.collection(this.usersCollection).doc(username).get();
            
            if (!userDoc.exists) {
                throw new Error('Usuário não encontrado');
            }

            const userData = userDoc.data();

            // Deleta do Firestore
            await this.db.collection(this.usersCollection).doc(username).delete();
            
            // Remove da coleção de admins se for admin
            if (userData.isAdmin) {
                await this.db.collection(this.adminCollection).doc(username).delete();
            }

            // Nota: O usuário permanece no Firebase Authentication por segurança
            // Mas não poderá mais fazer login pois não existe no Firestore

            return true;
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            throw new Error(error.message || 'Erro ao deletar usuário');
        }
    }

    // Altera senha
    async changePassword(username, newPassword) {
        if (!this.initialized) {
            throw new Error('Sistema ainda não está inicializado.');
        }

        const session = this.getSession();
        const isAdmin = await this.isAdmin();

        if (!isAdmin && session.username !== username) {
            throw new Error('Você só pode alterar sua própria senha');
        }

        if (newPassword.length < 6) {
            throw new Error('Nova senha deve ter no mínimo 6 caracteres');
        }

        try {
            const userDoc = await this.db.collection(this.usersCollection).doc(username).get();
            
            if (!userDoc.exists) {
                throw new Error('Usuário não encontrado');
            }

            const userData = userDoc.data();
            const email = userData.email || `${username}@mode-sketch.local`;

            // Atualiza a senha do usuário atual
            const user = this.auth.currentUser;
            if (user && user.email === email) {
                await user.updatePassword(newPassword);
            } else {
                // Se não for o usuário atual, apenas admin pode fazer isso
                if (!isAdmin) {
                    throw new Error('Apenas o próprio usuário pode alterar sua senha');
                }
                throw new Error('Para alterar senha de outro usuário, é necessário que ele faça login primeiro');
            }

            // Atualiza timestamp no Firestore
            await this.db.collection(this.usersCollection).doc(username).update({
                passwordChangedAt: window.firebaseApp.firestore.FieldValue.serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            throw new Error(error.message || 'Erro ao alterar senha');
        }
    }

    // Lista todos os usuários
    async listUsers() {
        if (!this.initialized) {
            throw new Error('Sistema ainda não está inicializado.');
        }

        if (!(await this.isAdmin())) {
            throw new Error('Apenas administradores podem listar usuários');
        }

        try {
            const snapshot = await this.db.collection(this.usersCollection).get();
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    username: data.username,
                    isAdmin: data.isAdmin || false,
                    createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
                };
            });
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            throw new Error('Erro ao listar usuários');
        }
    }

    // Obtém informações do usuário atual
    getCurrentUser() {
        const session = this.getSession();
        if (!session) return null;

        return {
            username: session.username,
            isAdmin: session.isAdmin,
            loginTime: session.loginTime
        };
    }
}

// Função para inicializar Auth após Firebase estar pronto
function initializeAuth() {
    if (typeof window.firebaseAuth === 'undefined' || typeof window.firebaseDb === 'undefined') {
        return false;
    }

    try {
        if (!window.Auth) {
            window.Auth = new AuthSystem();
            console.log('✓ Auth inicializado com sucesso');
        }
        return true;
    } catch (error) {
        console.error('Erro ao inicializar Auth:', error);
        return false;
    }
}

// Tenta inicializar quando o script carregar
if (typeof window !== 'undefined') {
    // Aguarda DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initializeAuth, 300);
        });
    } else {
        setTimeout(initializeAuth, 300);
    }
    
    // Também tenta após delays progressivos
    const delays = [500, 1000, 2000];
    delays.forEach((delay) => {
        setTimeout(function() {
            if (!window.Auth) {
                initializeAuth();
            }
        }, delay);
    });
}
