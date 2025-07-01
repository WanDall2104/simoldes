let signaturePad = null; // Agora global para todo o arquivo
const programSignatures = {}; // Agora global para todo o arquivo

// 1. Obter o identificador do projeto da URL
const urlParams = new URLSearchParams(window.location.search);
const projetoId = urlParams.get('id') || urlParams.get('codigo') || 'default';

// 2. Usar o identificador do projeto para as chaves do localStorage
const STORAGE_KEY = 'programSignatures_' + projetoId;
const PROGRAMS_KEY = 'programasStatus_' + projetoId;

let processoIniciado = false;

// Array fixo de programas (exemplo)
const programasFixos = [
    { id: 7, nome: 'Programa: 07', status: 'pending', descricao: 'O contramolde foi aparecer aqui' },
    { id: 8, nome: 'Programa: 08', status: 'pending' },
    { id: 9, nome: 'Programa: 09', status: 'pending' },
    { id: 10, nome: 'Programa: 10', status: 'pending' },
    { id: 11, nome: 'Programa: 11', status: 'pending' },
    { id: 12, nome: 'Programa: 12', status: 'pending' },
    { id: 13, nome: 'Programa: 13', status: 'pending' },
    { id: 14, nome: 'Programa: 14', status: 'pending' },
    { id: 15, nome: 'Programa: 15', status: 'pending' }
];

// Carregar programas reais do projeto selecionado
const projetosLS = JSON.parse(localStorage.getItem('projetos')) || {};
const projetoLS = projetosLS[projetoId];
let programasProjeto = (projetoLS && Array.isArray(projetoLS.programas)) ? projetoLS.programas : [];
if (!Array.isArray(programasProjeto)) programasProjeto = [];

// Juntar os dois arrays, evitando duplicidade pelo número ou id
const todosProgramas = [
    ...programasFixos,
    ...programasProjeto.filter(
        novo => !programasFixos.some(fixo => (fixo.numero && novo.numero && fixo.numero == novo.numero) || (fixo.id && novo.id && fixo.id == novo.id))
    )
];

document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const programItemsContainer = document.getElementById('programItems');
    const iniciarBtn = document.getElementById('iniciarBtn');
    const pausarBtn = document.getElementById('pausarBtn');
    const concluirBtn = document.getElementById('concluirBtn');
    const voltarBtn = document.getElementById('voltarBtn');
    const voltarInicioBtn = document.getElementById('voltarInicioBtn');
    const finalizarCheckbox = document.getElementById('finishProject');
    const progressFill = document.getElementById('progressFill');
    const completedCount = document.getElementById('completedPrograms');
    const pendingCount = document.getElementById('pendingPrograms');
    const totalCount = document.getElementById('totalPrograms');
    const tempoCorte = document.getElementById('tempoCortado');
    const tempoTotal = document.getElementById('tempoTotal');
    const progressPercentage = document.getElementById('progressPercentage');
    
    // Variáveis para controle de tempo
    let timerInterval = null;
    let segundosDecorridos = 0;
    let timerAtivo = false;
    
    // Inicializar pad de assinatura com ajuste responsivo
    function initSignaturePad() {
        const canvas = document.getElementById('signature-pad');
        if (canvas) {
            // Ajustar tamanho do canvas para corresponder ao tamanho do contêiner
            function resizeCanvas() {
                const ratio = Math.max(window.devicePixelRatio || 1, 1);
                canvas.width = canvas.offsetWidth * ratio;
                canvas.height = canvas.offsetHeight * ratio;
                canvas.getContext("2d").scale(ratio, ratio);
            }
            
            window.addEventListener("resize", resizeCanvas);
            resizeCanvas();
            
            // Inicializar o pad de assinatura
            signaturePad = new SignaturePad(canvas, {
                backgroundColor: 'rgb(255, 255, 255)',
                penColor: 'rgb(0, 0, 0)'
            });
        }
    }
    
    // Inicializar pad de assinatura
    initSignaturePad();
    
    // Adicionar eventos para os botões de assinatura
    const clearSignatureBtn = document.getElementById('clearSignatureBtn');
    const saveSignatureBtn = document.getElementById('saveSignatureBtn');
    
    if (clearSignatureBtn) {
        clearSignatureBtn.addEventListener('click', limparAssinatura);
    }
    
    if (saveSignatureBtn) {
        saveSignatureBtn.addEventListener('click', salvarAssinatura);
    }
    
    // Renderizar lista de programas
    function renderizarProgramas() {
        programItemsContainer.innerHTML = '';
        todosProgramas.forEach((programa, idx) => {
            const item = document.createElement('div');
            item.className = `program-item ${programa.status || 'pending'}`;
            item.dataset.id = idx;
            // Adicionar assinatura, matrícula e nome se existir
            let assinaturaHTML = '';
            const assinaturaInfo = programSignatures[idx];
            if (assinaturaInfo) {
                // Verifica se o usuário é admin
                const userRole = localStorage.getItem('userRole');
                const isAdmin = userRole === 'admin' || userRole === 'administrador';
                assinaturaHTML = `
                    <div class="assinatura-info">
                        <img src="${assinaturaInfo.assinatura}" alt="Assinatura" class="assinatura-img" style="max-width:80px; max-height:40px; display:block; margin-bottom:2px; border:1px solid #ccc; background:#fff;" />
                        <div class="assinatura-dados">
                            ${isAdmin ? `<span class='assinatura-matricula'>Matrícula: ${assinaturaInfo.matricula}</span><br>` : ''}
                            <span class="assinatura-nome">${assinaturaInfo.nome}</span>
                        </div>
                    </div>
                `;
            }
            item.innerHTML = `
                <div class="program-name">Programa: ${programa.numero || programa.nome || idx + 1}</div>
                <div class="program-status ${(programa.status === 'completed') ? 'completed' : 'pending'}">
                    ${(programa.status === 'completed') ? 'Concluído' : 'Pendente'}
                </div>
                ${assinaturaHTML}
            `;
            // Adicionar evento de clique para selecionar programa
            item.addEventListener('click', function() {
                selecionarPrograma(idx);
            });
            programItemsContainer.appendChild(item);
        });
        // Atualizar contadores e barra de progresso
        const total = todosProgramas.length;
        const completed = todosProgramas.filter(p => p.status === 'completed').length;
        const pending = total - completed;
        if (completedCount) completedCount.textContent = completed;
        if (pendingCount) pendingCount.textContent = pending;
        if (totalCount) totalCount.textContent = total;
        // Atualizar barra de progresso
        if (progressFill) {
            const progressPercent = (completed / (total || 1)) * 100;
            progressFill.style.width = `${progressPercent}%`;
            if (progressPercentage) {
                progressPercentage.textContent = `${Math.round(progressPercent)}%`;
            }
        }
    }
    
    // Selecionar um programa
    function selecionarPrograma(idx) {
        // Remover classe active de todos os itens
        document.querySelectorAll('.program-item').forEach(item => {
            item.classList.remove('active');
        });
        // Adicionar classe active ao item selecionado
        const itemSelecionado = document.querySelector(`.program-item[data-id="${idx}"]`);
        if (itemSelecionado) {
            itemSelecionado.classList.add('active');
            if (window.innerWidth < 768) {
                itemSelecionado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        // Atualizar detalhes do programa selecionado
        const programa = todosProgramas[idx];
        if (programa) {
            document.getElementById('currentProgramNumber').textContent = programa.numero || programa.nome || idx + 1;
            const programStatus = document.getElementById('programStatus');
            if (programStatus) {
                programStatus.textContent = (programa.status === 'completed') ? 'Concluído' : 'Pendente';
                programStatus.className = `program-status ${programa.status || 'pending'}`;
            }
            // Atualizar descrição se existir
            const descriptionText = document.querySelector('.description-text strong');
            if (descriptionText && programa.descricao) {
                descriptionText.nextSibling.textContent = ` ${programa.descricao}`;
            }
        }
        // Atualizar número do programa na área de assinatura
        const signatureProgramNumber = document.getElementById('signatureProgramNumber');
        if (signatureProgramNumber) {
            signatureProgramNumber.textContent = programa ? (programa.numero || programa.nome || idx + 1) : '-';
        }
        // Limpar assinatura atual e carregar assinatura salva (se existir)
        if (signaturePad) {
            signaturePad.clear();
            if (programSignatures[idx]) {
                signaturePad.fromDataURL(programSignatures[idx].assinatura);
            }
        }
        processoIniciado = false;
        atualizarEstadoSalvarAssinaturaBtn();
        atualizarEstadoConcluirBtn();
    }
    
    // Iniciar timer
    function iniciarTimer() {
        if (timerAtivo) return;
        processoIniciado = true;
        atualizarEstadoSalvarAssinaturaBtn();
        atualizarEstadoConcluirBtn();
        timerAtivo = true;
        iniciarBtn.disabled = true;
        pausarBtn.disabled = false;
        concluirBtn.disabled = false;
        
        timerInterval = setInterval(function() {
            segundosDecorridos++;
            atualizarDisplayTempo();
        }, 1000);
    }
    
    // Pausar timer
    function pausarTimer() {
        if (!timerAtivo) return;
        
        timerAtivo = false;
        iniciarBtn.disabled = false;
        pausarBtn.disabled = true;
        
        clearInterval(timerInterval);
    }
    
    // Concluir processo
    function concluirProcesso() {
        // Obter o índice do programa ativo
        const itemAtivo = document.querySelector('.program-item.active');
        if (itemAtivo) {
            const idx = parseInt(itemAtivo.dataset.id);
            // Verificar se existe assinatura salva para este programa
            if (!programSignatures[idx]) {
                mostrarNotificacao('A assinatura é obrigatória para concluir o processo!', 'error');
                return;
            }
            pausarTimer();
            if (todosProgramas[idx]) {
                todosProgramas[idx].status = 'completed';
                salvarProgramasLS(); // Salvar status ao concluir
                atualizarProgressoProjeto(); // Atualizar progresso ao concluir
                renderizarProgramas();
                // Selecionar o próximo programa pendente
                const proximoPendente = todosProgramas.find(p => p.status === 'pending');
                if (proximoPendente) {
                    selecionarPrograma(todosProgramas.indexOf(proximoPendente));
                }
                // Mostrar feedback visual
                mostrarNotificacao('Programa concluído com sucesso!');
            }
            // Resetar timer
            segundosDecorridos = 0;
            atualizarDisplayTempo();
            iniciarBtn.disabled = false;
            pausarBtn.disabled = true;
            concluirBtn.disabled = true;
        }
    }
    
    // Função para mostrar notificação
    function mostrarNotificacao(mensagem, tipo = 'success') {
        // Remove qualquer alerta anterior
        const alertaAntigo = document.querySelector('.custom-alert-toast');
        if (alertaAntigo) alertaAntigo.remove();

        const alerta = document.createElement('div');
        alerta.className = 'custom-alert-toast' + (tipo === 'error' ? ' error' : '');
        alerta.innerHTML = `
            <span>${mensagem}</span>
            <button class="custom-alert-close" aria-label="Fechar alerta">&times;</button>
        `;

        document.body.appendChild(alerta);

        // Fechar ao clicar no X
        alerta.querySelector('.custom-alert-close').onclick = () => alerta.remove();

        // Fechar automaticamente após 3 segundos
        setTimeout(() => {
            if (alerta.parentNode) alerta.remove();
        }, 3000);
    }
    
    // Atualizar display de tempo
    function atualizarDisplayTempo() {
        const horas = Math.floor(segundosDecorridos / 3600);
        const minutos = Math.floor((segundosDecorridos % 3600) / 60);
        const segundos = segundosDecorridos % 60;
        
        const tempoFormatado = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        
        if (tempoCorte) tempoCorte.value = tempoFormatado;
    }
    
    // Eventos dos botões
    if (iniciarBtn) iniciarBtn.addEventListener('click', iniciarTimer);
    if (pausarBtn) pausarBtn.addEventListener('click', pausarTimer);
    if (concluirBtn) concluirBtn.addEventListener('click', concluirProcesso);
    
    // Eventos de navegação
    if (voltarBtn) {
        voltarBtn.addEventListener('click', function() {
            const codigoProjeto = getQueryParam('codigo');
            if (timerAtivo) {
                Swal.fire({
                    title: 'Atenção!',
                    text: 'Há um timer em andamento. Deseja realmente sair desta página?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sim, sair',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom'
                    },
                    buttonsStyling: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'folhaprocesso.html' + (codigoProjeto ? ('?codigo=' + codigoProjeto) : '');
                    }
                });
            } else {
                window.location.href = 'folhaprocesso.html' + (codigoProjeto ? ('?codigo=' + codigoProjeto) : '');
            }
        });
    }
    
    if (voltarInicioBtn) {
        voltarInicioBtn.addEventListener('click', function() {
            if (timerAtivo) {
                Swal.fire({
                    title: 'Atenção!',
                    text: 'Há um timer em andamento. Deseja realmente sair desta página?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sim, sair',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom'
                    },
                    buttonsStyling: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'index.html';
                    }
                });
            } else {
                window.location.href = 'index.html';
            }
        });
    }
    
    // Evento para finalizar projeto
    if (finalizarCheckbox) {
        finalizarCheckbox.addEventListener('change', function() {
            console.log("Checkbox de finalizar projeto alterado");
            if (this.checked) {
                const todosConcluidos = todosProgramas.every(p => p.status === 'completed');
                if (!todosConcluidos) {
                    mostrarNotificacao('Todos os programas devem ser concluídos antes de finalizar o projeto.', 'error');
                    this.checked = false;
                } else {
                    Swal.fire({
                        title: 'Finalizar Projeto',
                        text: 'Tem certeza que deseja finalizar este projeto?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Sim, finalizar',
                        cancelButtonText: 'Cancelar',
                        customClass: {
                            confirmButton: 'swal2-confirm-custom',
                            cancelButton: 'swal2-cancel-custom'
                        },
                        buttonsStyling: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            moverProjetoParaHistorico();
                            mostrarNotificacao('Projeto finalizado com sucesso!');
                            setTimeout(() => {
                                window.location.href = 'projetos.html';
                            }, 1500);
                        } else {
                            this.checked = false;
                        }
                    });
                }
            }
        });
    }
    
    // Adicionar evento para o botão de ver folha ampla
    const verAmplaBtn = document.getElementById('verAmplaBtn');
    if (verAmplaBtn) {
        verAmplaBtn.addEventListener('click', function() {
            const codigoProjeto = getQueryParam('codigo');
            if (timerAtivo) {
                Swal.fire({
                    title: 'Atenção!',
                    text: 'Há um timer em andamento. Deseja realmente sair desta página?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sim, sair',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom'
                    },
                    buttonsStyling: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'folhaprocesso-ampla.html' + (codigoProjeto ? ('?codigo=' + codigoProjeto) : '');
                    }
                });
            } else {
                window.location.href = 'folhaprocesso-ampla.html' + (codigoProjeto ? ('?codigo=' + codigoProjeto) : '');
            }
        });
    }
    
    // Inicializar a interface
    carregarAssinaturas();
    carregarProgramasLS();
    renderizarProgramas();
    
    // Selecionar o primeiro programa por padrão
    if (todosProgramas.length > 0) {
        selecionarPrograma(0);
    }
    
    // Adicionar listener para redimensionamento da janela
    window.addEventListener('resize', function() {
        if (signaturePad) {
            const canvas = document.getElementById('signature-pad');
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
            
            // Restaurar assinatura se existir
            const itemAtivo = document.querySelector('.program-item.active');
            if (itemAtivo) {
                const id = parseInt(itemAtivo.dataset.id);
                if (programSignatures[id]) {
                    signaturePad.fromDataURL(programSignatures[id].assinatura);
                }
            }
        }
    });
    
    atualizarEstadoSalvarAssinaturaBtn();
    atualizarEstadoConcluirBtn();
});

// Funções para gerenciar assinaturas
function limparAssinatura() {
    if (signaturePad) {
        signaturePad.clear();
    }
}

function salvarAssinatura() {
    if (!processoIniciado) {
        mostrarNotificacao('Você deve clicar em Iniciar antes de assinar!', 'error');
        return;
    }
    if (signaturePad && !signaturePad.isEmpty()) {
        // Obter o ID do programa ativo
        const itemAtivo = document.querySelector('.program-item.active');
        if (itemAtivo) {
            const idx = parseInt(itemAtivo.dataset.id);
            // Buscar matrícula e nome do operador automaticamente
            const matricula = localStorage.getItem('userMatricula');
            const nome = localStorage.getItem('currentUser');
            if (!matricula || !nome) {
                mostrarNotificacao('Usuário não identificado! Faça login novamente.', 'error');
                return;
            }
            // Salvar assinatura, matrícula e nome para este programa
            programSignatures[idx] = {
                assinatura: signaturePad.toDataURL(),
                matricula,
                nome
            };
            salvarAssinaturasLS(); // Salvar no Local Storage
            renderizarProgramas(); // Atualizar lista para mostrar assinatura
            atualizarEstadoConcluirBtn(); // Habilitar botão se necessário
            mostrarNotificacao('Assinatura salva com sucesso!');
        }
    } else {
        mostrarNotificacao('Por favor, forneça uma assinatura antes de salvar.', 'error');
    }
}

// Função para obter parâmetro da URL
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Função para carregar assinaturas do Local Storage
function carregarAssinaturas() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            const obj = JSON.parse(data);
            Object.assign(programSignatures, obj);
        } catch (e) {
            console.warn('Erro ao carregar assinaturas do localStorage:', e);
        }
    }
}

// Função para salvar assinaturas no Local Storage
function salvarAssinaturasLS() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(programSignatures));
}

function atualizarEstadoConcluirBtn() {
    const concluirBtn = document.getElementById('concluirBtn');
    const itemAtivo = document.querySelector('.program-item.active');
    if (concluirBtn && itemAtivo) {
        const idx = parseInt(itemAtivo.dataset.id);
        const programa = todosProgramas[idx];
        if (programa && programa.status === 'completed') {
            concluirBtn.disabled = true;
        } else {
            concluirBtn.disabled = !(processoIniciado && programSignatures[idx]);
        }
    }
}

function atualizarEstadoSalvarAssinaturaBtn() {
    const salvarBtn = document.getElementById('saveSignatureBtn');
    const itemAtivo = document.querySelector('.program-item.active');
    if (salvarBtn && itemAtivo) {
        const idx = parseInt(itemAtivo.dataset.id);
        const programa = todosProgramas[idx];
        if (programa && programa.status === 'completed') {
            salvarBtn.disabled = true;
        } else {
            salvarBtn.disabled = !processoIniciado;
        }
    }
}

function salvarProgramasLS() {
    localStorage.setItem(PROGRAMS_KEY, JSON.stringify(todosProgramas));
}

function carregarProgramasLS() {
    const data = localStorage.getItem(PROGRAMS_KEY);
    if (data) {
        try {
            const arr = JSON.parse(data);
            // Atualiza apenas o status dos programas existentes
            arr.forEach(savedProg => {
                const prog = todosProgramas.find(p => p.id === savedProg.id);
                if (prog) prog.status = savedProg.status;
            });
        } catch (e) {
            console.warn('Erro ao carregar status dos programas:', e);
        }
    }
}

function moverProjetoParaHistorico() {
    console.log("Chamando moverProjetoParaHistorico");
    // Buscar projetos ativos
    let projetos = JSON.parse(localStorage.getItem('projetos')) || {};
    console.log("Projetos ativos:", projetos);
    console.log("projetoId:", projetoId);
    // Buscar histórico
    let historico = JSON.parse(localStorage.getItem('historicoProjetos')) || [];
    // Encontrar o projeto atual pela chave
    const projetoAtual = projetos[projetoId];
    console.log("Projeto encontrado:", projetoAtual);
    if (projetoAtual) {
        // Garantir que title e code estejam preenchidos
        if (!projetoAtual.title) {
            projetoAtual.title = projetoAtual.nome || projetoAtual.code || projetoId || 'Projeto sem nome';
        }
        if (!projetoAtual.code) {
            projetoAtual.code = projetoId;
        }
        // Normalizar o campo machine
        const mapMaquina = { '01': 'F1400', '02': 'F2000', '03': 'F3000' };
        const userMaquina = localStorage.getItem('userMaquina');
        projetoAtual.machine = mapMaquina[userMaquina] || projetoAtual.machine;
        // Definir status como completed
        projetoAtual.status = "completed";
        // Buscar assinaturas dos programas
        const assinaturas = JSON.parse(localStorage.getItem('programSignatures_' + projetoId)) || {};
        // Buscar status dos programas
        const programasStatus = JSON.parse(localStorage.getItem('programasStatus_' + projetoId)) || [];
        // Forçar todos os programas como concluídos ao finalizar o projeto
        if (Array.isArray(programasStatus)) {
            programasStatus.forEach(p => p.status = 'completed');
        }
        // Adicionar ao histórico
        historico.push({
            ...projetoAtual,
            completionDate: new Date().toISOString(),
            programas: programasStatus,
            assinaturas: assinaturas
        });
        // Remover dos projetos ativos
        delete projetos[projetoId];
        // Salvar
        localStorage.setItem('projetos', JSON.stringify(projetos));
        localStorage.setItem('historicoProjetos', JSON.stringify(historico));
        console.log("Projeto salvo no historicoProjetos:", historico);
    } else {
        console.log("Nenhum projeto encontrado para transferir para o histórico.");
    }
}

// Chame moverProjetoParaHistorico() quando o progresso chegar a 100%
function atualizarProgressoProjeto() {
    const total = todosProgramas.length;
    const concluidos = todosProgramas.filter(p => p.status === 'completed').length;
    const progresso = Math.round((concluidos / total) * 100);
    localStorage.setItem('progresso_' + projetoId, progresso);
    if (progresso === 100) {
        moverProjetoParaHistorico();
    }
}

// Função para buscar detalhes do projeto com fallback
function getDetalhesProjeto(projetoId) {
    // 1. Tenta buscar no localStorage
    let detalhes = JSON.parse(localStorage.getItem('detalhesProjeto_' + projetoId));
    if (detalhes) return detalhes;

    // 2. Tenta buscar no array de exemplos (projectsData)
    if (typeof projectsData !== 'undefined') {
        const projetoExemplo = projectsData.find(p => p.id == projetoId || p.code == projetoId);
        if (projetoExemplo) return projetoExemplo;
    }

    // 3. Se não encontrar, retorna null
    return null;
}





