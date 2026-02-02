# Instruções de Configuração - Mode Sketch

## 🔥 Configuração do Firebase

### 1. Habilitar Authentication
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto **mode-sketch**
3. Vá em **Authentication** > **Sign-in method**
4. Clique em **Email/Password** e habilite
5. Salve

### 2. Criar Firestore Database
1. No Firebase Console, vá em **Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha **Modo de teste** (para desenvolvimento)
4. Selecione uma localização (ex: `us-central1`)
5. Clique em **Habilitar**

### 3. Configurar Regras de Segurança do Firestore

Vá em **Firestore Database** > **Regras** e cole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para usuários
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.token.name));
    }
    
    // Regras para admins
    match /admins/{adminId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.token.name));
    }
    
    // Regras para chat
    match /chat/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

## 👤 Criar o Primeiro Admin

### Opção 1: Via Firebase Console (Recomendado)

1. **Criar usuário no Authentication:**
   - Vá em **Authentication** > **Users**
   - Clique em **Add user**
   - Email: `admin@mode-sketch.local`
   - Senha: (escolha uma senha segura)
   - Clique em **Add user**
   - Anote o **UID** do usuário criado

2. **Criar documento no Firestore:**
   - Vá em **Firestore Database** > **Data**
   - Clique em **Start collection**
   - Collection ID: `users`
   - Document ID: `admin`
   - Adicione os campos:
     ```
     username: admin
     email: admin@mode-sketch.local
     isAdmin: true
     createdAt: (selecione timestamp e use "now")
     uid: (cole o UID do usuário criado)
     ```
   - Clique em **Save**

3. **Criar documento de admin:**
   - Clique em **Start collection**
   - Collection ID: `admins`
   - Document ID: `admin`
   - Adicione os campos:
     ```
     username: admin
     createdAt: (selecione timestamp e use "now")
     ```
   - Clique em **Save**

### Opção 2: Via Código (Temporário)

Crie um arquivo `setup-admin.html` temporário:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Setup Admin</title>
</head>
<body>
    <h1>Criar Primeiro Admin</h1>
    <form id="setupForm">
        <input type="text" id="username" placeholder="Username" value="admin" required>
        <input type="password" id="password" placeholder="Senha" required>
        <button type="submit">Criar Admin</button>
    </form>

    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"></script>
    <script src="firebase-config.js"></script>
    <script>
        document.getElementById('setupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const email = `${username}@mode-sketch.local`;

            try {
                const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
                await userCredential.user.updateProfile({ displayName: username });

                await window.firebaseDb.collection('users').doc(username).set({
                    username: username,
                    email: email,
                    isAdmin: true,
                    createdAt: window.firebaseApp.firestore.FieldValue.serverTimestamp(),
                    uid: userCredential.user.uid
                });

                await window.firebaseDb.collection('admins').doc(username).set({
                    username: username,
                    createdAt: window.firebaseApp.firestore.FieldValue.serverTimestamp()
                });

                alert('Admin criado com sucesso!');
                window.location.href = 'login.html';
            } catch (error) {
                alert('Erro: ' + error.message);
            }
        });
    </script>
</body>
</html>
```

**⚠️ IMPORTANTE:** Delete este arquivo após criar o admin!

## 📝 Como Usar

1. **Fazer Login:**
   - Abra `login.html`
   - Use o usuário e senha do admin criado
   - Você será redirecionado para `admin.html`

2. **Criar Novos Usuários:**
   - No painel admin (`admin.html`)
   - Preencha o formulário "Criar Novo Usuário"
   - Escolha se será admin ou usuário comum
   - Clique em "Criar Usuário"
   - ⚠️ Após criar, você precisará fazer login novamente

3. **Gerenciar Usuários:**
   - Veja todos os usuários na tabela
   - Altere senhas
   - Delete usuários (exceto você mesmo)

## 🔒 Estrutura do Firestore

### Coleção: `users`
Armazena informações dos usuários:
- `username` (string)
- `email` (string)
- `isAdmin` (boolean)
- `createdAt` (timestamp)
- `uid` (string) - UID do Firebase Authentication

### Coleção: `admins`
Lista de administradores:
- `username` (string)
- `createdAt` (timestamp)

### Coleção: `chat`
Mensagens do chat em tempo real:
- `username` (string)
- `text` (string)
- `timestamp` (timestamp)
- `userId` (string)

## ⚠️ Notas Importantes

- **Segurança:** As regras do Firestore acima são básicas. Para produção, ajuste conforme necessário.
- **Senhas:** Use senhas fortes. Nunca compartilhe.
- **Backup:** Faça backup regular do Firestore.
- **Limites:** O Firebase tem limites de uso gratuito. Monitore o uso.

## 🐛 Solução de Problemas

### "Auth não foi inicializado"
- Verifique se os scripts do Firebase estão carregando
- Abra o Console (F12) e verifique erros
- Limpe o cache do navegador (Ctrl+Shift+Delete)

### "Usuário não encontrado"
- Verifique se o usuário existe no Firestore
- Verifique se o email está no formato `username@mode-sketch.local`

### "Erro ao criar usuário"
- Verifique se você está logado como admin
- Verifique se o Firebase Authentication está habilitado
- Verifique as regras do Firestore
