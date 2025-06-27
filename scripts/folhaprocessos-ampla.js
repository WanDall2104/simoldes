document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const voltarBtn = document.getElementById('voltarBtn');
    const imprimirBtn = document.getElementById('imprimirBtn');
    
    // Função para obter parâmetro da URL
    function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    // Obter código do projeto da URL
    const codigoProjeto = getQueryParam('codigo') || getQueryParam('id');
    
    // Evento para botão voltar
    voltarBtn.addEventListener('click', function() {
        // Voltar para a página anterior
        window.location.href = 'folhaprogramacao-detalhada.html?codigo=' + codigoProjeto;
    });
    
    // Evento para botão imprimir
    imprimirBtn.addEventListener('click', function() {
        window.print();
    });
    
    // Função para preencher os dados da folha de processo
    function preencherFolhaComProjeto(projeto) {
        if (!projeto || !projeto.folhaProcesso) return;
        const folha = projeto.folhaProcesso;
        // Material
        const materialEl = document.querySelector('.material-info .info-value, .material-info .span-info-material');
        if (materialEl) materialEl.textContent = folha.material || '';
        // Pasta dos Programas
        const pastaProgEl = document.querySelector('.project-info .info-row:nth-child(1) .info-value');
        if (pastaProgEl) pastaProgEl.textContent = folha.pastaProgramas || '';
        // Pasta PowerMill
        const pastaPMEl = document.querySelector('.project-info .info-row:nth-child(2) .info-value');
        if (pastaPMEl) pastaPMEl.textContent = folha.pastaPowerMill || '';
        // Programador
        const progEl = document.querySelector('.project-info .info-row:nth-child(3) .info-value');
        if (progEl) progEl.textContent = folha.programador || '';
        // Tempo Projeto
        const tempoEl = document.querySelector('.project-info .info-row:nth-child(4) .info-value');
        if (tempoEl) tempoEl.textContent = folha.tempoProjeto || '';
        // Sob Liq
        const sobLiqEl = document.querySelector('.project-info .info-row:nth-child(4) .info-value:last-child');
        if (sobLiqEl) sobLiqEl.textContent = folha.sobLiq || '';
        // Centro do Bloco
        const centroBlocoEl = document.querySelector('.footer-left .span-info');
        if (centroBlocoEl) centroBlocoEl.textContent = folha.centroBloco || '';
        // Ref em Z
        const refZEl = document.querySelector('.footer-right .span-info');
        if (refZEl) refZEl.textContent = folha.refZ || '';
        // Observação
        const obsEl = document.querySelector('.description-row .red-text');
        if (obsEl) obsEl.textContent = folha.observacao || '';
        // Imagem
        const imgEl = document.querySelector('.image-container img, .piece-image img');
        if (imgEl) imgEl.src = folha.imagem || projeto.image || 'images/image-molde01.png';
        // Data Impressão (opcional)
        // ...
        // Preencher tabela de programas
        if (projeto.programas && projeto.programas.length > 0) {
            preencherTabelaProgramas(projeto.programas);
        }
    }
    
    // Função para carregar dados da folha de processos
    function carregarDadosFolhaProcessos() {
        // Obter código do projeto da URL
        const codigoProjeto = getQueryParam('codigo');
        if (!codigoProjeto) return;
        const projetos = JSON.parse(localStorage.getItem('projetos')) || {};
        const projeto = projetos[codigoProjeto];
        if (projeto) {
            preencherFolhaComProjeto(projeto);
        }
    }
    
    // Inicializar a página
    carregarDadosFolhaProcessos();

    function preencherTabelaProgramas(programas) {
        const tbody = document.querySelector('.process-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (!Array.isArray(programas)) return;
        programas.forEach(programa => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${programa.numero || ''}</td>
                <td>${programa.percurso || ''}</td>
                <td class="center-text">${programa.referencia || ''}</td>
                <td>${programa.comentario || ''}</td>
                <td class="red-text">${programa.ferramentaO || ''}</td>
                <td class="red-text">${programa.ferramentaRC || ''}</td>
                <td>${programa.ferramentaRib || ''}</td>
                <td>${programa.ferramentaAlt || ''}</td>
                <td>${programa.zMin || ''}</td>
                <td>${programa.lat2D || ''}</td>
                <td>${programa.latVert || ''}</td>
                <td>${programa.lat || ''}</td>
                <td>${programa.vert || ''}</td>
                <td>${programa.tol || ''}</td>
                <td>${programa.rot || ''}</td>
                <td>${programa.avAngular || ''}</td>
                <td>${programa.tempoTrab || ''}</td>
                <td>${programa.corte || ''}</td>
                <td>${programa.total || ''}</td>
                <td>${programa.posicao || ''}</td>
                <td></td>
            `;
            tbody.appendChild(tr);
            // Linha de ferramentas/arquivos
            const trTool = document.createElement('tr');
            trTool.innerHTML = `<td colspan="21" class="tool-row"><div class="tool-info"><span>Fresa:</span> <span class="green-text">${programa.fresa || ''}</span> <span>Sup.:</span> <span>${programa.sup || ''}</span></div></td>`;
            tbody.appendChild(trTool);
        });
    }
});