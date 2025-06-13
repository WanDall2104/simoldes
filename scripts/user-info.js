// Script para exibir informações do usuário em todas as páginas
document.addEventListener('DOMContentLoaded', function() {
    // Obter informações do usuário do localStorage
    const userName = localStorage.getItem('currentUser');
    const userRole = localStorage.getItem('userRole');
    
    // Atualizar elementos na página
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    
    if (userName && userNameElement) {
        userNameElement.textContent = userName;
    }
    
    if (userRole && userRoleElement) {
        // Converter o valor do nível de acesso para exibição
        const displayRole = (userRole === 'admin' || userRole === 'administrador') ? 'Administrador' : 'Operador';
        userRoleElement.textContent = displayRole;
        
        // Garantir que o texto seja exibido corretamente
        console.log('Nível de acesso:', userRole);
        console.log('Exibindo como:', displayRole);
    }
    
    // Verificar se o usuário é administrador para mostrar o menu de administração
    if (userRole === 'admin' || userRole === 'administrador') {
        // Verificar se o menu lateral existe
        const sidebar = document.querySelector('.sidebar ul');
        if (sidebar) {
            // Verificar se o item de administração já existe
            const adminMenuItem = Array.from(sidebar.querySelectorAll('li a')).find(a => 
                a.getAttribute('href') === 'admin.html'
            );
            
            // Adicionar item de menu de administração se não existir
            if (!adminMenuItem) {
                const adminItem = document.createElement('li');
                adminItem.innerHTML = `<a href="admin.html"><i class="fas fa-users-cog"></i> Administração</a>`;
                sidebar.appendChild(adminItem);
            }
        }
    }
    
    // Configurar botão de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevenir comportamento padrão do link
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userMatricula');
            window.location.href = 'login-page.html';
        });
    }
    
    // Verificar se o usuário está logado, se não, redirecionar para a página de login
    // Exceto se já estiver na página de login
    const currentPage = window.location.pathname.split('/').pop();
    if (!userName && !currentPage.includes('login')) {
        window.location.href = 'login-page.html';
    }
});

