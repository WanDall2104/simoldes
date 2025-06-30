document.addEventListener('DOMContentLoaded', function() {
    verificarProjetosConcluidos();
    // Seletores dos cards
    const ativosEl = document.querySelector('.stat-card:nth-child(1) .stat-value');
    const pendentesEl = document.querySelector('.stat-card:nth-child(2) .stat-value');
    const concluidosEl = document.querySelector('.stat-card:nth-child(3) .stat-value');

    // Função para buscar todos os projetos
    function getAllProjects() {
        let localProjects = [];
        try {
            const projetosStorage = JSON.parse(localStorage.getItem('projetos')) || {};
            localProjects = Object.values(projetosStorage).map((proj, idx) => ({
                id: proj.id || (1000 + idx),
                code: proj.code || '',
                status: proj.status || 'active',
                progress: proj.progress || 0,
                programas: proj.programas || [],
                machine: proj.machine || ''
            }));
        } catch (e) {
            localProjects = [];
        }
        // Mesclar com projetos de exemplo se necessário (opcional)
        return localProjects;
    }

    // Função para buscar progresso real
    function getProgressoProjeto(code, fallback) {
        const progressoSalvo = localStorage.getItem('progresso_' + code);
        return progressoSalvo !== null ? Number(progressoSalvo) : fallback || 0;
    }

    // Função para buscar programas pendentes de um projeto
    function getPendentesProjeto(code) {
        // Buscar status dos programas do projeto
        const statusKey = 'programasStatus_' + code;
        const arr = JSON.parse(localStorage.getItem(statusKey));
        if (Array.isArray(arr)) {
            return arr.filter(p => p.status !== 'completed').length;
        }
        // Se não houver info detalhada, retorna 0
        return 0;
    }

    // Atualizar dashboard
    function atualizarDashboard() {
        const projetos = getAllProjects();
        let ativos = 0, pendentes = 0;

        // Obter máquina logada
        const maquinaSelecionada = localStorage.getItem('userMaquina');
        const mapMaquina = { '01': 'F1400', '02': 'F2000', '03': 'F3000' };
        const nomeMaquina = mapMaquina[maquinaSelecionada] || null;

        // Filtrar projetos pela máquina logada
        const projetosFiltrados = nomeMaquina ? projetos.filter(p => p.machine && p.machine.trim().toUpperCase() === nomeMaquina.toUpperCase()) : projetos;

        projetosFiltrados.forEach(proj => {
            const progresso = getProgressoProjeto(proj.code, proj.progress);
            if (progresso < 100) {
                // Buscar status dos programas do projeto
                const statusKey = 'programasStatus_' + proj.code;
                const arr = JSON.parse(localStorage.getItem(statusKey));
                if (Array.isArray(arr) && arr.length > 0) {
                    const temConcluido = arr.some(p => p.status === 'completed');
                    if (temConcluido) {
                        ativos++;
                    } else {
                        pendentes++;
                    }
                } else {
                    // Se não há programas, considerar como pendente
                    pendentes++;
                }
            }
        });

        // Projetos concluídos (apenas do histórico)
        const historico = JSON.parse(localStorage.getItem('historicoProjetos')) || [];
        const historicoFiltrado = nomeMaquina ? historico.filter(item => item.machine && item.machine.trim().toUpperCase() === nomeMaquina.toUpperCase()) : historico;
        const concluidos = historicoFiltrado.length;

        if (ativosEl) ativosEl.textContent = ativos;
        if (pendentesEl) pendentesEl.textContent = pendentes;
        if (concluidosEl) concluidosEl.textContent = concluidos;
    }

    atualizarDashboard();
});

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
