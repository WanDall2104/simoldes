// Variáveis globais
// Não declarar historicoData aqui, pois já está declarada em historico-data.js
let filteredItems = [];
let currentPage = 1;
const itemsPerPage = 10;
let historico = JSON.parse(localStorage.getItem('historicoProjetos')) || [];

// Elementos DOM
const historicoContainer = document.getElementById('historicoContainer');
const searchBtn = document.getElementById('searchBtn');
const historicoSearch = document.getElementById('historicoSearch');
const dateFilter = document.getElementById('dateFilter');
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
    
    // Inicializar com todos os itens do histórico
    filteredItems = [...historico];
    
    // Carregar histórico inicial
    applyFilters();
    
    // Configurar eventos
    searchBtn.addEventListener('click', applyFilters);
    historicoSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    // Busca dinâmica enquanto digita
    historicoSearch.addEventListener('input', function() {
        applyFilters();
    });
    
    dateFilter.addEventListener('change', applyFilters);
    
    prevPageBtn.addEventListener('click', goToPrevPage);
    nextPageBtn.addEventListener('click', goToNextPage);
    
    // Adicionar evento para botões de detalhes
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-details-btn')) {
            console.log('Botão Ver Detalhes clicado');
            const projectId = e.target.getAttribute('data-id');
            console.log(`ID do projeto: ${projectId}`);
            // Encontrar o projeto pelo ID ou code
            const project = historico.find(p => (p.id && p.id.toString() === projectId) || (p.code && p.code === projectId));
            if (project) {
                console.log("Projeto encontrado:", project);
                showProjectModal(project);
            } else {
                console.error("Projeto não encontrado com ID:", projectId);
                console.log("Dados disponíveis:", historico);
                mostrarNotificacao("Projeto não encontrado!", 'error');
            }
        }
    });

    // Exibir menu de importação só para admin
    if (userRole === 'admin' || userRole === 'administrador') {
        const importarMenu = document.getElementById('importarProjetosMenu');
        if(importarMenu) importarMenu.style.display = '';
    }
    // Alternar entre histórico e importação
    const importarLink = document.getElementById('importarProjetosLink');
    const importarSection = document.getElementById('importarProjetosSection');
    const dashboardContent = document.querySelector('.dashboard-content');
    if(importarLink && importarSection) {
        importarLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Esconde histórico, mostra importação
            dashboardContent.querySelectorAll('> *:not(#importarProjetosSection)').forEach(el => el.style.display = 'none');
            importarSection.style.display = '';
        });
    }
    // Voltar para histórico ao recarregar
    if(importarSection) importarSection.style.display = 'none';
    // Lógica de upload e pré-visualização
    const excelForm = document.getElementById('importarExcelForm');
    const excelInput = document.getElementById('excelFileInput');
    const previewContainer = document.getElementById('previewContainer');
    const importarBtn = document.getElementById('importarBtn');
    let previewData = [];
    if(excelForm && excelInput && previewContainer && importarBtn) {
        excelForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const file = excelInput.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(firstSheet, {header:1});
                previewData = json;
                // Montar tabela de pré-visualização
                let html = '<table border="1" style="width:100%;border-collapse:collapse;">';
                json.forEach((row, idx) => {
                    html += '<tr>' + row.map(cell => `<td>${cell ?? ''}</td>`).join('') + '</tr>';
                });
                html += '</table>';
                previewContainer.innerHTML = html;
                importarBtn.style.display = json.length > 1 ? '' : 'none';
            };
            reader.readAsArrayBuffer(file);
        });
        importarBtn.addEventListener('click', function() {
            if(previewData.length > 1) {
                mostrarNotificacao('Importação simulada! (Aqui você pode enviar para o backend ou atualizar a lista de projetos)', 'success');
                // Aqui você pode adicionar lógica para realmente importar os dados
            }
        });
    }
});

// Função para aplicar filtros
function applyFilters() {
    const searchTerm = historicoSearch.value.toLowerCase();
    const dateValue = dateFilter.value;

    filteredItems = historico.filter(item => {
        // Filtro por status: apenas projetos finalizados
        if (item.status !== 'completed') return false;
        
        // Filtro de busca
        const matchesSearch =
            (item.title && item.title.toLowerCase().includes(searchTerm)) ||
            (item.code && item.code.toLowerCase().includes(searchTerm)) ||
            (item.machine && item.machine.toLowerCase().includes(searchTerm));
        
        // Filtro de data
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
        return matchesSearch && matchesDate;
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
        
        const itemCard = document.createElement('div');
        itemCard.className = 'projeto-card';
        
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
                    <i class="fas fa-calendar-check"></i>
                    <span>Concluído em: <strong>${item.completionDate ? formatDate(item.completionDate) : 'Em andamento'}${item.completionTime ? ' às ' + item.completionTime : ''}</strong></span>
                </div>
            </div>
            <div class="projeto-footer">
                <span class="status-badge ${statusClass}">${statusText}</span>
                <button class="view-details-btn" data-id="${item.id || item.code}">Ver Detalhes</button>
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

function renderizarProgramasHistorico(programas, assinaturas) {
    const lista = document.getElementById('modalProgramsList');
    lista.innerHTML = '';
    programas.forEach(prog => {
        const li = document.createElement('div');
        li.className = 'programa-item';
        let assinaturaHTML = '';
        if (assinaturas && assinaturas[prog.id]) {
            const info = assinaturas[prog.id];
            assinaturaHTML = `
                <div class="assinatura-info" style="display:inline-flex;align-items:center;gap:8px;margin-left:10px;">
                    <img src="${info.assinatura}" alt="Assinatura" style="max-width:60px;max-height:30px;border:1px solid #ccc;background:#fff;" />
                    <span style="font-size:0.9em;">${info.matricula}</span>
                </div>
            `;
        }
        li.innerHTML = `<span>${prog.nome} (${prog.status === 'completed' ? 'Concluído' : 'Pendente'})</span>${assinaturaHTML}`;
        lista.appendChild(li);
    });
}


