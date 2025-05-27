// Dados de exemplo para projetos
const projectsData = [
    {
        id: 1,
        title: "Molde para Painel Frontal",
        code: "PF-2023-001",
        client: "",
        responsible: "Carlos Silva",
        operator: "Leonardo",
        machine: "F1400",
        startDate: "2023-05-10",
        endDate: "2023-08-15",
        status: "active",
        progress: 65,
        lastUpdate: "2023-06-28",
        image: "images/image-molde01.png"
    },
    {
        id: 2,
        title: "Molde para Carcaça de Motor",
        code: "CM-2023-042",
        client: "",
        responsible: "Ana Oliveira",
        operator: "Vinicius",
        machine: "F2000",
        startDate: "2023-04-05",
        endDate: "2023-07-20",
        status: "active",
        progress: 80,
        lastUpdate: "2023-06-30",
        image: "images/image-molde01.png"
    },
    {
        id: 3,
        title: "Molde para Peças Plásticas",
        code: "PP-2023-018",
        client: "",
        responsible: "Roberto Almeida",
        operator: "Leonardo",
        machine: "F1400",
        startDate: "2023-03-15",
        endDate: "2023-05-30",
        status: "completed",
        progress: 100,
        lastUpdate: "2023-05-28",
        image: "images/image-molde01.png"
    },
    {
        id: 4,
        title: "Molde para Componentes Eletrônicos",
        code: "CE-2023-027",
        client: "",
        responsible: "Juliana Costa",
        operator: "Vinicius",
        machine: "F2000",
        startDate: "2023-06-01",
        endDate: "2023-09-15",
        status: "pending",
        progress: 10,
        lastUpdate: "2023-06-10",
        image: "images/image-molde01.png"
    },
    {
        id: 5,
        title: "Molde para Peças Automotivas",
        code: "PA-2023-033",
        client: "",
        responsible: "Carlos Silva",
        operator: "Vinicius",
        machine: "F1400",
        startDate: "2023-05-20",
        endDate: "2023-08-30",
        status: "active",
        progress: 45,
        lastUpdate: "2023-06-25",
        image: "images/image-molde01.png"
    },
    {
        id: 6,
        title: "Molde para Equipamentos Médicos",
        code: "EM-2023-009",
        client: "",
        responsible: "Mariana Santos",
        operator: "Leonardo",
        machine: "F2000",
        startDate: "2023-02-10",
        endDate: "2023-06-15",
        status: "completed",
        progress: 100,
        lastUpdate: "2023-06-12",
        image: "images/image-molde01.png"
    }
];

// Configurações de paginação
const projectsPerPage = 6;
let currentPage = 1;
let filteredProjects = [...projectsData];

// Elementos DOM
const projectsContainer = document.getElementById('projectsContainer');
const searchInput = document.getElementById('projectSearch');
const searchBtn = document.getElementById('searchBtn');
const statusFilter = document.getElementById('statusFilter');
const dateFilter = document.getElementById('dateFilter');
const currentPageEl = document.getElementById('currentPage');
const totalPagesEl = document.getElementById('totalPages');
const prevPageBtn = document.querySelector('.pagination-btn:first-child');
const nextPageBtn = document.querySelector('.pagination-btn:last-child');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Verificar nível de acesso do usuário
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('currentUser');
    
    // Verificar se o usuário está logado
    if (!userName) {
        window.location.href = 'login-page.html';
        return;
    }
    
    // Filtrar projetos baseado no nível de acesso
    if (userRole === 'operador') {
        // Operadores só veem seus próprios projetos
        filteredProjects = projectsData.filter(project => 
            project.operator === userName
        );
    } else if (userRole === 'admin') {
        // Administradores veem todos os projetos
        filteredProjects = [...projectsData];
    } else {
        // Outros usuários são redirecionados
        alert('Você não tem permissão para acessar esta página');
        window.location.href = 'index.html';
        return;
    }
    
    // Carregar projetos iniciais
    renderProjects();
    
    // Configurar eventos
    searchBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    statusFilter.addEventListener('change', applyFilters);
    dateFilter.addEventListener('change', applyFilters);
    
    prevPageBtn.addEventListener('click', goToPrevPage);
    nextPageBtn.addEventListener('click', goToNextPage);
    
    // Adicionar evento para botões de detalhes
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-details-btn')) {
            const projectId = e.target.getAttribute('data-id');
            viewProjectDetails(projectId);
        }
    });
});

// Função para aplicar filtros
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const dateValue = dateFilter.value;
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('currentUser');
    
    // Filtrar por termo de busca e nível de acesso
    filteredProjects = projectsData.filter(project => {
        // Verificar se o usuário tem acesso a este projeto
        const hasAccess = userRole === 'admin' || (userRole === 'operador' && project.operator === userName);
        
        if (!hasAccess) return false;
        
        const matchesSearch = 
            project.title.toLowerCase().includes(searchTerm) ||
            project.code.toLowerCase().includes(searchTerm) ||
            project.operator.toLowerCase().includes(searchTerm) ||
            project.machine.toLowerCase().includes(searchTerm);
        
        // Filtrar por status
        const matchesStatus = 
            statusValue === 'all' || 
            project.status === statusValue;
        
        // Filtrar por data
        let matchesDate = true;
        if (dateValue !== 'all') {
            const today = new Date();
            const projectDate = new Date(project.lastUpdate);
            
            if (dateValue === 'today') {
                matchesDate = isSameDay(today, projectDate);
            } else if (dateValue === 'week') {
                matchesDate = isThisWeek(projectDate, today);
            } else if (dateValue === 'month') {
                matchesDate = isThisMonth(projectDate, today);
            } else if (dateValue === 'year') {
                matchesDate = isThisYear(projectDate, today);
            }
        }
        
        return matchesSearch && matchesStatus && matchesDate;
    });
    
    // Resetar para a primeira página e renderizar
    currentPage = 1;
    renderProjects();
}

// Funções de navegação de página
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderProjects();
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderProjects();
    }
}

// Função para renderizar projetos
function renderProjects() {
    // Calcular total de páginas
    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
    totalPagesEl.textContent = totalPages || 1;
    currentPageEl.textContent = currentPage > totalPages ? 1 : currentPage;
    
    // Ajustar página atual se necessário
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    
    // Calcular índices de início e fim
    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    
    // Obter projetos da página atual
    const currentProjects = filteredProjects.slice(startIndex, endIndex);
    
    // Limpar container
    projectsContainer.innerHTML = '';
    
    // Verificar se há projetos para mostrar
    if (currentProjects.length === 0) {
        projectsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>Nenhum projeto encontrado</h3>
                <p>Tente ajustar os filtros ou criar um novo projeto.</p>
                <button class="create-project-btn">
                    <i class="fas fa-plus"></i> Criar Projeto
                </button>
            </div>
        `;
        return;
    }
    
    // Obter informações do usuário
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('currentUser');
    
    // Renderizar cada projeto
    currentProjects.forEach(project => {
        const statusClass = `status-${project.status}`;
        const statusText = getStatusText(project.status);
        
        // Verificar se o usuário pode manipular este projeto
        const canManipulate = userRole === 'operador' && project.operator === userName;
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        
        // Adicionar classe especial se o usuário puder manipular
        if (canManipulate) {
            projectCard.classList.add('can-manipulate');
        }
        
        projectCard.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" alt="${project.title}">
                <div class="project-status-badge ${statusClass}">${statusText}</div>
                <div class="machine-badge">${project.machine}</div>
                ${canManipulate ? '<div class="edit-badge"><i class="fas fa-edit"></i></div>' : ''}
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-code">${project.code}</p>
                
                <div class="project-info">
                    <div class="info-item">
                        <span class="info-label">Responsável:</span>
                        <span class="info-value">${project.operator}</span>
                    </div>
                </div>
                
                <div class="project-progress-bar">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
                <div class="progress-percentage">${project.progress}% concluído</div>
                
                <a href="folhaprocesso.html?id=${project.id}" class="view-details-btn" data-id="${project.id}">
                    ${canManipulate ? 'Editar Projeto' : 'Ver Detalhes'}
                </a>
            </div>
        `;
        
        projectsContainer.appendChild(projectCard);
    });
}

// Função para visualizar detalhes do projeto
function viewProjectDetails(projectId) {
    const project = projectsData.find(p => p.id == projectId);
    if (!project) return;
    
    // Verificar se o usuário tem acesso a este projeto
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('currentUser');
    
    const hasAccess = userRole === 'admin' || (userRole === 'operador' && project.operator === userName);
    
    if (!hasAccess) {
        alert('Você não tem permissão para acessar este projeto');
        return;
    }
    
    // Redirecionar para a página de folha de processo
    window.location.href = `folhaprocesso.html?id=${projectId}`;
}

// Funções auxiliares
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function getStatusText(status) {
    switch(status) {
        case 'active': return 'Em Andamento';
        case 'pending': return 'Pendente';
        case 'completed': return 'Concluído';
        default: return 'Desconhecido';
    }
}

// Funções auxiliares para filtro de data
function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

function isThisWeek(date, today) {
    const todayDate = today.getDate();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(todayDate - dayOfWeek);
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(todayDate + (6 - dayOfWeek));
    
    return date >= startOfWeek && date <= endOfWeek;
}

function isThisMonth(date, today) {
    return date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function isThisYear(date, today) {
    return date.getFullYear() === today.getFullYear();
}



















