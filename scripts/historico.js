// Dados de exemplo para o histórico de projetos
const historicoData = [
    {
        id: 1,
        title: "Molde para Painel Frontal",
        code: "PF-2023-001",
        machine: "M1-2023",
        responsible: "Leonardo",
        completionDate: "2023-08-15",
        status: "completed"
    },
    {
        id: 2,
        title: "Molde para Carcaça de Motor",
        code: "CM-2023-042",
        machine: "M2-2023",
        responsible: "Vinicius",
        completionDate: "2023-07-20",
        status: "completed"
    },
    {
        id: 3,
        title: "Molde para Peças Plásticas",
        code: "PP-2023-018",
        machine: "M3-2023",
        responsible: "Leonardo",
        completionDate: "2023-05-30",
        status: "completed"
    },
    {
        id: 4,
        title: "Molde para Componentes Eletrônicos",
        code: "CE-2023-027",
        machine: "M1-2023",
        responsible: "Vinicius",
        completionDate: "2023-09-15",
        status: "completed"
    },
    {
        id: 5,
        title: "Molde para Peças Automotivas",
        code: "PA-2023-033",
        machine: "M2-2023",
        responsible: "Leonardo",
        completionDate: "2023-08-30",
        status: "completed"
    },
    {
        id: 6,
        title: "Molde para Equipamentos Médicos",
        code: "EM-2023-009",
        machine: "M3-2023",
        responsible: "Vinicius",
        completionDate: "2023-06-15",
        status: "completed"
    }
];

// Configurações de paginação
const itemsPerPage = 6;
let currentPage = 1;
let filteredItems = [...historicoData];

// Elementos DOM
const historicoContainer = document.getElementById('historicoContainer');
const searchInput = document.getElementById('historicoSearch');
const searchBtn = document.getElementById('searchBtn');
const dateFilter = document.getElementById('dateFilter');
const machineFilter = document.getElementById('machineFilter');
const currentPageEl = document.getElementById('currentPage');
const totalPagesEl = document.getElementById('totalPages');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');

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
    
    // Filtrar histórico baseado no nível de acesso
    if (userRole === 'operador') {
        // Operadores só veem seus próprios projetos históricos
        filteredItems = historicoData.filter(item => 
            item.responsible === userName
        );
    } else if (userRole === 'admin') {
        // Administradores veem todo o histórico
        filteredItems = [...historicoData];
    } else {
        // Outros usuários são redirecionados
        alert('Você não tem permissão para acessar esta página');
        window.location.href = 'index.html';
        return;
    }
    
    // Carregar histórico inicial
    renderHistorico();
    
    // Configurar eventos
    searchBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    dateFilter.addEventListener('change', applyFilters);
    machineFilter.addEventListener('change', applyFilters);
    
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
    const dateValue = dateFilter.value;
    const machineValue = machineFilter.value;
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('currentUser');
    
    // Filtrar por termo de busca e nível de acesso
    filteredItems = historicoData.filter(item => {
        // Verificar se o usuário tem acesso a este item do histórico
        const hasAccess = userRole === 'admin' || (userRole === 'operador' && item.responsible === userName);
        
        if (!hasAccess) return false;
        
        const matchesSearch = 
            item.title.toLowerCase().includes(searchTerm) ||
            item.code.toLowerCase().includes(searchTerm) ||
            item.responsible.toLowerCase().includes(searchTerm) ||
            item.machine.toLowerCase().includes(searchTerm);
        
        // Filtrar por data
        let matchesDate = true;
        if (dateValue !== 'all') {
            const today = new Date();
            const itemDate = new Date(item.completionDate);
            
            if (dateValue === 'today') {
                matchesDate = isSameDay(today, itemDate);
            } else if (dateValue === 'week') {
                matchesDate = isThisWeek(itemDate, today);
            } else if (dateValue === 'month') {
                matchesDate = isThisMonth(itemDate, today);
            } else if (dateValue === 'year') {
                matchesDate = isThisYear(itemDate, today);
            }
        }
        
        // Filtrar por máquina
        let matchesMachine = true;
        if (machineValue !== 'all') {
            const machineCode = machineValue.toUpperCase();
            matchesMachine = item.machine.includes(machineCode);
        }
        
        return matchesSearch && matchesDate && matchesMachine;
    });
    
    // Resetar para a primeira página e renderizar
    currentPage = 1;
    renderHistorico();
}

// Funções de navegação de página
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderHistorico();
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderHistorico();
    }
}

// Função para renderizar histórico
function renderHistorico() {
    // Calcular total de páginas
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    totalPagesEl.textContent = totalPages || 1;
    currentPageEl.textContent = currentPage > totalPages ? 1 : currentPage;
    
    // Ajustar página atual se necessário
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    
    // Calcular índices de início e fim
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Obter itens da página atual
    const currentItems = filteredItems.slice(startIndex, endIndex);
    
    // Limpar container
    historicoContainer.innerHTML = '';
    
    // Verificar se há itens para mostrar
    if (currentItems.length === 0) {
        historicoContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>Nenhum registro encontrado</h3>
                <p>Tente ajustar os filtros para encontrar o que procura.</p>
            </div>
        `;
        return;
    }
    
    // Obter informações do usuário
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('currentUser');
    
    // Renderizar cada item do histórico
    currentItems.forEach(item => {
        const statusClass = `status-${item.status}`;
        const statusText = getStatusText(item.status);
        
        // Verificar se o usuário é responsável por este projeto
        const isResponsible = item.responsible === userName;
        
        const itemCard = document.createElement('div');
        itemCard.className = 'projeto-card';
        
        // Adicionar classe especial se o usuário for responsável
        if (isResponsible) {
            itemCard.classList.add('is-responsible');
        }
        
        itemCard.innerHTML = `
            <div class="projeto-header">
                <h3 class="projeto-title">${item.title}</h3>
                <span class="projeto-code">${item.code}</span>
            </div>
            <div class="projeto-details">
                <div class="detail-item">
                    <i class="fas fa-cog"></i>
                    <span>Máquina: <strong>${item.machine}</strong></span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-user"></i>
                    <span>Responsável: <strong>${item.responsible}</strong></span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-calendar-check"></i>
                    <span>Concluído em: <strong>${formatDate(item.completionDate)}</strong></span>
                </div>
            </div>
            <div class="projeto-footer">
                <span class="status-badge ${statusClass}">${statusText}</span>
                <button class="view-details-btn" data-id="${item.id}">Ver Detalhes</button>
            </div>
        `;
        
        historicoContainer.appendChild(itemCard);
    });
}

// Função para visualizar detalhes do projeto
function viewProjectDetails(projectId) {
    const project = historicoData.find(p => p.id == projectId);
    if (!project) return;
    
    // Verificar se o usuário tem acesso a este projeto
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('currentUser');
    
    const hasAccess = userRole === 'admin' || (userRole === 'operador' && project.responsible === userName);
    
    if (!hasAccess) {
        alert('Você não tem permissão para acessar este projeto');
        return;
    }
    
    alert(`Detalhes do projeto "${project.title}" serão exibidos em uma página ou modal.`);
    // Aqui você pode implementar a navegação para uma página de detalhes
    // ou abrir um modal com os detalhes completos
    console.log('Projeto selecionado:', project);
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





