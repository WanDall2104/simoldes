// Dados de exemplo para projetos
const projectsData = [
    {
        id: 1,
        title: "Molde para Painel Frontal",
        code: "PF-2023-001",
        client: "",
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
        machine: "F2000",
        startDate: "2023-02-10",
        endDate: "2023-06-15",
        status: "completed",
        progress: 100,
        lastUpdate: "2023-06-12",
        image: "images/image-molde01.png"
    },
    {
        id: 7,
        title: "Molde para Peças Automotivas",
        code: "PA-2023-033",
        client: "",
        machine: "F3000",
        startDate: "2023-05-20",
        endDate: "2023-08-30",
        status: "active",
        progress: 45,
        lastUpdate: "2023-06-25",
        image: "images/image-molde01.png"
    }
];

// Configurações de paginação
const projectsPerPage = 6;
let currentPage = 1;

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

// Carregar projetos do localStorage, mesclando com os exemplos se necessário
function getAllProjects() {
    let localProjects = [];
    try {
        const projetosStorage = JSON.parse(localStorage.getItem('projetos')) || {};
        localProjects = Object.values(projetosStorage).map((proj, idx) => ({
            id: proj.id || (1000 + idx),
            title: proj.title || proj.material || 'Projeto sem nome',
            code: proj.code || '',
            client: proj.client || '',
            machine: proj.machine || '',
            startDate: proj.startDate || '',
            endDate: proj.endDate || '',
            status: proj.status || 'active',
            progress: proj.progress || 0,
            lastUpdate: proj.lastUpdate || new Date().toISOString().slice(0,10),
            image: proj.image || 'images/image-molde01.png'
        }));
    } catch (e) {
        localProjects = [];
    }
    // Mesclar projetos de exemplo com os locais, sem duplicar pelo código
    const allCodes = new Set(localProjects.map(p => p.code));
    const merged = [...localProjects];
    projectsData.forEach(exemplo => {
        if (!allCodes.has(exemplo.code)) {
            merged.push(exemplo);
        }
    });
    return merged;
}

// Substituir o array fixo por função dinâmica
let filteredProjects = getAllProjects();

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado
    if (!userName) {
        window.location.href = 'login-page.html';
        return;
    }
    // Carregar todos os projetos do localStorage (ou exemplos)
    filteredProjects = getAllProjects();
    verificarProjetosConcluidos();
    applyFilters();
    
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

    // Adicionar evento para recarregar projetos ao voltar para a página
    window.addEventListener('focus', function() {
        filteredProjects = getAllProjects();
        applyFilters();
    });
});

// Função para aplicar filtros
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const dateValue = dateFilter.value;
    const maquinaSelecionada = localStorage.getItem('userMaquina');

    const mapMaquina = { '01': 'F1400', '02': 'F2000', '03': 'F3000' };

    // Trocar para buscar todos os projetos do localStorage
    const allProjects = getAllProjects();
    filteredProjects = allProjects.filter(project => {
        // Filtro por máquina (obrigatório)
        if (maquinaSelecionada && ['01','02','03'].includes(maquinaSelecionada)) {
            if (project.machine.trim().toUpperCase() !== mapMaquina[maquinaSelecionada].toUpperCase()) {
                return false;
            }
        }

        // Filtro de busca
        const matchesSearch = 
            project.title.toLowerCase().includes(searchTerm) ||
            project.code.toLowerCase().includes(searchTerm) ||
            project.machine.toLowerCase().includes(searchTerm);

        // Filtro de status
        const matchesStatus = 
            statusValue === 'all' || 
            project.status === statusValue;

        // Filtro de data
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
        // Verificar se é admin
        const userRole = localStorage.getItem('userRole');
        let createBtnHtml = '';
        if (userRole === 'admin' || userRole === 'administrador') {
            createBtnHtml = `<button class="create-project-btn" id="createProjectBtn"><i class="fas fa-plus"></i> Criar Projeto</button>`;
        }
        projectsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>Nenhum projeto encontrado</h3>
                <p>Tente ajustar os filtros${(userRole === 'admin' || userRole === 'administrador') ? ' ou criar um novo projeto.' : '.'}</p>
                ${createBtnHtml}
            </div>
        `;
        // Adicionar evento de clique para admin
        if (userRole === 'admin' || userRole === 'administrador') {
            const btn = document.getElementById('createProjectBtn');
            if (btn) {
                btn.addEventListener('click', function() {
                    window.location.href = 'importar-projetos.html';
                });
            }
        }
        return;
    }
    
    // Obter informações do usuário
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('currentUser');
    
    // Renderizar cada projeto
    currentProjects.forEach(project => {
        // Buscar progresso real salvo no localStorage
        const progressoSalvo = localStorage.getItem('progresso_' + project.code);
        const progresso = progressoSalvo !== null ? Number(progressoSalvo) : project.progress || 0;

        // Determinar status dinâmico
        let statusDinamico = 'pending';
        if (progresso === 100) {
            statusDinamico = 'completed';
        } else if (progresso > 0) {
            statusDinamico = 'active';
        }

        const statusClass = `status-${statusDinamico}`;
        const statusText = getStatusText(statusDinamico);
        const canManipulate = userRole === 'operador' && project.machine === userName;
        const isAdmin = userRole === 'admin' || userRole === 'administrador';
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
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
                <div class="project-progress-bar">
                    <div class="progress-fill" style="width: ${progresso}%"></div>
                </div>
                <div class="progress-percentage">${progresso}% concluído</div>
                <a href="folhaprocesso.html?codigo=${project.code}" class="view-details-btn" data-id="${project.id}">
                    ${canManipulate ? 'Editar Projeto' : 'Ver Detalhes'}
                </a>
                ${isAdmin ? `<button class="delete-project-btn" data-code="${project.code}"><i class="fas fa-trash"></i> Excluir</button>` : ''}
            </div>
        `;
        projectsContainer.appendChild(projectCard);
    });
    // Adicionar eventos de exclusão
    if (localStorage.getItem('userRole') === 'admin' || localStorage.getItem('userRole') === 'administrador') {
        document.querySelectorAll('.delete-project-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const code = btn.getAttribute('data-code');
                showStyledConfirm(`Tem certeza que deseja excluir o projeto <b>${code}</b>?`, () => {
                    let projetos = JSON.parse(localStorage.getItem('projetos')) || {};
                    if (projetos[code]) {
                        delete projetos[code];
                        localStorage.setItem('projetos', JSON.stringify(projetos));
                        showCustomAlert('Projeto excluído com sucesso!', 'success');
                        filteredProjects = getAllProjects();
                        applyFilters();
                    }
                });
            });
        });
    }
}

// Função de alerta customizado (caso não exista neste arquivo)
function showCustomAlert(message, type = 'error') {
  // Remove alerta anterior se existir
  const oldAlert = document.querySelector('.custom-alert');
  if (oldAlert) oldAlert.remove();

  // Cria o alerta
  const alertDiv = document.createElement('div');
  alertDiv.className = `custom-alert ${type}`;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  // Mostra o alerta
  setTimeout(() => {
    alertDiv.classList.add('show');
  }, 10);

  // Esconde e remove depois de 3 segundos
  setTimeout(() => {
    alertDiv.classList.remove('show');
    setTimeout(() => alertDiv.remove(), 300);
  }, 3000);
}

// Função para visualizar detalhes do projeto
function viewProjectDetails(projectId) {
    const project = projectsData.find(p => p.id == projectId);
    if (!project) return;
    
    // Verificar se o usuário tem acesso a este projeto
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('currentUser');
    
    const hasAccess = (userRole === 'admin' || userRole === 'administrador') || (userRole === 'operador' && project.machine === userName);
    
    if (!hasAccess) {
        showCustomAlert('Você não tem permissão para acessar este projeto!', 'error');
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

// Alerta estilizado de confirmação
function showStyledConfirm(message, onConfirm) {
    // Remove alerta anterior se existir
    const oldModal = document.getElementById('customConfirmModal');
    if (oldModal) oldModal.remove();
    // Cria modal
    const modal = document.createElement('div');
    modal.id = 'customConfirmModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.35)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.innerHTML = `
        <div style="background:#fff;padding:32px 28px 24px 28px;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:350px;text-align:center;">
            <div style="font-size:18px;font-weight:600;margin-bottom:16px;">Confirmação</div>
            <div style="font-size:15px;margin-bottom:24px;">${message}</div>
            <button id="confirmYesBtn" style="background:#c82333;color:#fff;padding:8px 22px;border:none;border-radius:5px;font-weight:600;margin-right:10px;cursor:pointer;">Excluir</button>
            <button id="confirmNoBtn" style="background:#e0e0e0;color:#222;padding:8px 22px;border:none;border-radius:5px;font-weight:600;cursor:pointer;">Cancelar</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('confirmYesBtn').onclick = function() {
        modal.remove();
        if (onConfirm) onConfirm();
    };
    document.getElementById('confirmNoBtn').onclick = function() {
        modal.remove();
    };
}

function moverProjetoParaHistoricoDashboard(projetoAtual, projetoId) {
    let projetos = JSON.parse(localStorage.getItem('projetos')) || {};
    let historico = JSON.parse(localStorage.getItem('historicoProjetos')) || [];
    const assinaturas = JSON.parse(localStorage.getItem('programSignatures_' + projetoId)) || {};
    const programasStatus = JSON.parse(localStorage.getItem('programasStatus_' + projetoId)) || [];
    historico.push({
        ...projetoAtual,
        concluidoEm: new Date().toISOString(),
        programas: programasStatus,
        assinaturas: assinaturas
    });
    delete projetos[projetoAtual.code];
    localStorage.setItem('projetos', JSON.stringify(projetos));
    localStorage.setItem('historicoProjetos', JSON.stringify(historico));
}

function verificarProjetosConcluidos() {
    let projetos = JSON.parse(localStorage.getItem('projetos')) || {};
    Object.values(projetos).forEach(proj => {
        const progresso = localStorage.getItem('progresso_' + proj.code);
        if (Number(progresso) === 100) {
            moverProjetoParaHistoricoDashboard(proj, proj.code);
        }
    });
}



















