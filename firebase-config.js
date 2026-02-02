// ========================================
// FIREBASE CONFIGURAÇÃO - MODE SKETCH
// ========================================

const firebaseConfig = {
  apiKey: "AIzaSyA3p1xzpXLPOJyn8YUUvNWj8un11H6xXc4",
  authDomain: "mode-sketch.firebaseapp.com",
  databaseURL: "https://mode-sketch-default-rtdb.firebaseio.com",
  projectId: "mode-sketch",
  storageBucket: "mode-sketch.firebasestorage.app",
  messagingSenderId: "713181837286",
  appId: "1:713181837286:web:c1d1afddbef64219e94827"
};

// Função para inicializar Firebase
function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK não está carregado. Verifique se os scripts do Firebase foram incluídos antes deste arquivo.');
        return false;
    }

    try {
        // Inicializa Firebase apenas se ainda não foi inicializado
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }
        
        // Inicializa serviços
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        // Exporta para uso global
        window.firebaseAuth = auth;
        window.firebaseDb = db;
        window.firebaseApp = firebase;
        
        console.log('✓ Firebase inicializado com sucesso');
        return true;
    } catch (error) {
        console.error('Erro ao inicializar Firebase:', error);
        return false;
    }
}

// Tenta inicializar imediatamente
if (typeof firebase !== 'undefined') {
    initializeFirebase();
} else {
    // Se Firebase ainda não carregou, aguarda
    window.addEventListener('load', function() {
        if (typeof firebase !== 'undefined') {
            initializeFirebase();
        } else {
            console.error('Firebase SDK não foi carregado após o evento load');
        }
    });
    
    // Também tenta após um pequeno delay
    setTimeout(function() {
        if (typeof firebase !== 'undefined' && !window.firebaseAuth) {
            initializeFirebase();
        }
    }, 100);
}
