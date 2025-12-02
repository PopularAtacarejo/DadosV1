<!-- auth-check.js - Script de verificação de autenticação com informações do usuário -->
<script>
// ===================================================================
// 🔑 CONFIGURAÇÃO SUPABASE (Credenciais Fornecidas)
// ===================================================================
const SUPABASE_URL = "https://tmgglppfobyoosfiewoa.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZ2dscHBmb2J5b29zZmlld29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3Mjg4NTEsImV4cCI6MjA3OTMwNDg1MX0.DH3IyjnE7zztySzyckKREy5Zlgmg2aJe4TEXIbmFmkA";

// Inicializar o cliente Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Informações do usuário (serão preenchidas após autenticação)
let currentUser = {
    id: null,
    email: null,
    nome: null,
    funcao: null,
    avatar: null
};

// Função para verificar se o usuário está autenticado
async function checkAuthentication() {
    try {
        // Verificar se há uma sessão ativa
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
            console.error('Erro ao verificar sessão:', error);
            redirectToLogin();
            return false;
        }
        
        // Se não há sessão, redirecionar para login
        if (!session) {
            console.log('Nenhuma sessão ativa encontrada. Redirecionando para login...');
            redirectToLogin();
            return false;
        }
        
        console.log('Usuário autenticado:', session.user.email);
        
        // Buscar informações adicionais do usuário
        await loadUserProfile(session.user.id);
        
        return true;
        
    } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        redirectToLogin();
        return false;
    }
}

// Função para carregar o perfil do usuário
async function loadUserProfile(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('nome, funcao, avatar_url')
            .eq('id', userId)
            .single();
            
        if (error) {
            console.error('Erro ao carregar perfil do usuário:', error);
            // Usar informações básicas do auth
            currentUser = {
                id: userId,
                email: (await supabaseClient.auth.getUser()).data.user?.email || 'Usuário',
                nome: (await supabaseClient.auth.getUser()).data.user?.email?.split('@')[0] || 'Usuário',
                funcao: 'Usuário',
                avatar: null
            };
        } else {
            // Preencher com dados do perfil
            currentUser = {
                id: userId,
                email: (await supabaseClient.auth.getUser()).data.user?.email || 'Usuário',
                nome: data.nome || (await supabaseClient.auth.getUser()).data.user?.email?.split('@')[0] || 'Usuário',
                funcao: data.funcao || 'Usuário',
                avatar: data.avatar_url
            };
        }
        
        // Atualizar a interface com as informações do usuário
        updateUserInterface();
        
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
    }
}

// Função para atualizar a interface com as informações do usuário
function updateUserInterface() {
    // Criar ou atualizar o menu do usuário
    let userMenu = document.getElementById('user-menu');
    
    if (!userMenu) {
        // Criar o menu do usuário se não existir
        userMenu = document.createElement('div');
        userMenu.id = 'user-menu';
        userMenu.className = 'user-menu';
        
        // Adicionar estilos para o menu do usuário
        const style = document.createElement('style');
        style.textContent = `
            .user-menu {
                position: relative;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 15px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.1);
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .user-menu:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .user-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
            }
            
            .user-avatar img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
            }
            
            .user-info {
                display: flex;
                flex-direction: column;
            }
            
            .user-name {
                font-weight: 600;
                font-size: 14px;
                color: white;
            }
            
            .user-role {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.8);
            }
            
            .user-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                min-width: 200px;
                z-index: 1000;
                display: none;
                overflow: hidden;
            }
            
            .user-menu.active .user-dropdown {
                display: block;
            }
            
            .dropdown-item {
                padding: 12px 15px;
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--text-dark);
                text-decoration: none;
                transition: all 0.3s;
                border-bottom: 1px solid var(--gray-light);
            }
            
            .dropdown-item:last-child {
                border-bottom: none;
            }
            
            .dropdown-item:hover {
                background: var(--light-color);
                color: var(--primary-color);
            }
            
            .dropdown-item i {
                width: 16px;
                text-align: center;
            }
            
            @media (max-width: 768px) {
                .user-info {
                    display: none;
                }
                
                .user-menu {
                    padding: 8px;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Adicionar o menu ao header
        const header = document.querySelector('.header');
        if (header) {
            header.appendChild(userMenu);
        } else {
            // Se não encontrar o header, criar um na parte superior
            const newHeader = document.createElement('div');
            newHeader.className = 'user-header';
            newHeader.style.cssText = `
                background: var(--dark-color);
                color: white;
                padding: 10px 20px;
                display: flex;
                justify-content: flex-end;
                align-items: center;
            `;
            newHeader.appendChild(userMenu);
            document.body.insertBefore(newHeader, document.body.firstChild);
        }
    }
    
    // Atualizar o conteúdo do menu
    const initials = currentUser.nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    userMenu.innerHTML = `
        <div class="user-avatar">
            ${currentUser.avatar ? 
                `<img src="${currentUser.avatar}" alt="${currentUser.nome}">` : 
                initials
            }
        </div>
        <div class="user-info">
            <div class="user-name">${currentUser.nome}</div>
            <div class="user-role">${currentUser.funcao}</div>
        </div>
        <div class="user-dropdown">
            <div class="dropdown-item user-profile">
                <i class="fas fa-user"></i>
                <span>Meu Perfil</span>
            </div>
            <div class="dropdown-item user-settings">
                <i class="fas fa-cog"></i>
                <span>Configurações</span>
            </div>
            <div class="dropdown-item" id="logout-btn">
                <i class="fas fa-sign-out-alt"></i>
                <span>Sair</span>
            </div>
        </div>
    `;
    
    // Adicionar eventos para o menu dropdown
    userMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
    });
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', function() {
        userMenu.classList.remove('active');
    });
    
    // Adicionar eventos para os itens do dropdown
    const logoutBtn = userMenu.querySelector('#logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    const profileBtn = userMenu.querySelector('.user-profile');
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            alert('Funcionalidade de perfil em desenvolvimento');
        });
    }
    
    const settingsBtn = userMenu.querySelector('.user-settings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            alert('Funcionalidade de configurações em desenvolvimento');
        });
    }
}

// Função para redirecionar para a página de login
function redirectToLogin() {
    // Salvar a página atual para redirecionar após o login
    const currentPath = window.location.pathname + window.location.search;
    sessionStorage.setItem('redirectAfterLogin', currentPath);
    
    // Redirecionar para a página de login
    window.location.href = 'index.html';
}

// Função para fazer logout
async function logout() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error('Erro ao fazer logout:', error);
            showNotification('Erro ao fazer logout. Tente novamente.', 'error');
        } else {
            console.log('Logout realizado com sucesso');
            showNotification('Logout realizado com sucesso!', 'success');
            setTimeout(() => {
                redirectToLogin();
            }, 1000);
        }
    } catch (error) {
        console.error('Erro no logout:', error);
        showNotification('Erro ao fazer logout. Tente novamente.', 'error');
    }
}

// Função para exibir notificações
function showNotification(message, type = 'info') {
    // Remover notificações anteriores
    const existingNotifications = document.querySelectorAll('.global-notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `global-notification alert alert-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Estilos para a notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
    `;
    
    // Adicionar estilos de animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .global-notification {
            animation: slideIn 0.3s ease-out;
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Inicializar a verificação de autenticação quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
});

// Exportar funções para uso em outros scripts (se necessário)
window.authModule = {
    checkAuthentication,
    getCurrentUser: () => currentUser,
    logout,
    supabaseClient
};
</script>