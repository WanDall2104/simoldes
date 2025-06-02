// Variáveis globais
// Não declarar historicoData aqui, pois já está declarada em historico-data.js
let filteredItems = [];
let currentPage = 1;
const itemsPerPage = 10;

// Elementos DOM
const historicoContainer = document.getElementById('historicoContainer');
const searchBtn = document.getElementById('searchBtn');
const historicoSearch = document.getElementById('historicoSearch');
const dateFilter = document.getElementById('dateFilter');
const machineFilter = document.getElementById('machineFilter');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageEl = document.getElementById('currentPage');
const totalPagesEl = document.getElementById('totalPages');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando página de histórico");
    
    // Verificar se historicoData existe
    if (typeof historicoData === 'undefined') {
        console.error("Erro: historicoData não está definido!");
        return;
    }
    
    // Verificar nível de acesso do usuário
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('currentUser');
    
    // Verificar se o usuário está logado
    if (!userName) {
        window.location.href = 'login-page.html';
        return;
    }
    
    console.log(`Usuário logado: ${userName}, Função: ${userRole}`);
    
    // Filtrar histórico baseado no nível de acesso
    if (userRole === 'operador') {
        // Operadores só veem seus próprios projetos
        filteredItems = historicoData.filter(item => 
            item.responsible === userName || item.operator === userName
        );
    } else if (userRole === 'admin') {
        // Administradores veem todos os projetos
        filteredItems = [...historicoData];
    } else {
        // Outros usuários são redirecionados
        alert('Você não tem permissão para acessar esta página');
        window.location.href = 'index.html';
        return;
    }
    
    console.log(`Itens filtrados: ${filteredItems.length}`);
    
    // Carregar histórico inicial
    renderHistorico();
    
    // Configurar eventos
    searchBtn.addEventListener('click', applyFilters);
    historicoSearch.addEventListener('keypress', function(e) {
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
            console.log('Botão Ver Detalhes clicado');
            const projectId = parseInt(e.target.getAttribute('data-id'));
            console.log(`ID do projeto: ${projectId}`);
            
            // Encontrar o projeto pelo ID
            const project = historicoData.find(p => p.id === projectId);
            if (project) {
                console.log("Projeto encontrado:", project);
                showProjectModal(project);
            } else {
                console.error("Projeto não encontrado com ID:", projectId);
                console.log("Dados disponíveis:", historicoData);
                alert("Projeto não encontrado!");
            }
        }
    });
});

// Função para aplicar filtros
function applyFilters() {
    const searchTerm = historicoSearch.value.toLowerCase();
    const dateValue = dateFilter.value;
    const machineValue = machineFilter.value;
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('currentUser');
    
    // Filtrar por termo de busca e nível de acesso
    filteredItems = historicoData.filter(item => {
        // Verificar se o usuário tem acesso a este projeto
        const hasAccess = userRole === 'admin' || 
                         (userRole === 'operador' && (item.responsible === userName || item.operator === userName));
        
        if (!hasAccess) return false;
        
        const matchesSearch = 
            item.title.toLowerCase().includes(searchTerm) ||
            item.code.toLowerCase().includes(searchTerm) ||
            item.responsible.toLowerCase().includes(searchTerm) ||
            item.machine.toLowerCase().includes(searchTerm);
        
        // Filtrar por máquina
        const matchesMachine = 
            machineValue === 'all' || 
            item.machine.toLowerCase().includes(machineValue);
        
        // Filtrar por data
        let matchesDate = true;
        if (dateValue !== 'all') {
            const today = new Date();
            const projectDate = new Date(item.completionDate || item.lastUpdate);
            
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
        
        return matchesSearch && matchesMachine && matchesDate;
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
                <h3>Nenhum projeto encontrado</h3>
                <p>Tente ajustar os filtros para encontrar projetos no histórico.</p>
            </div>
        `;
        return;
    }
    
    // Renderizar cada item do histórico
    currentItems.forEach(item => {
        const statusClass = `status-${item.status}`;
        const statusText = getStatusText(item.status);
        
        // Verificar se o usuário é responsável por este projeto
        const userName = localStorage.getItem('currentUser');
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
                    <span>Concluído em: <strong>${item.completionDate ? formatDate(item.completionDate) : 'Em andamento'}</strong></span>
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

// Funções auxiliares
function formatDate(dateString) {
    if (!dateString) return 'N/A';
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

// Funções para verificação de datas
function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

function isThisWeek(date, today) {
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    firstDayOfWeek.setHours(0, 0, 0, 0);
    
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);
    
    return date >= firstDayOfWeek && date <= lastDayOfWeek;
}

function isThisMonth(date, today) {
    return date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function isThisYear(date, today) {
    return date.getFullYear() === today.getFullYear();
}


