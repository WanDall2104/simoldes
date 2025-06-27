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
    
    // Objeto para armazenar assinaturas
    const programSignatures = {};
    let signaturePad = null;
    
    // Dados de exemplo - programas
    const programas = [
        { id: 7, nome: 'Programa: 07', status: 'completed', descricao: 'O contramolde foi aparecer aqui' },
        { id: 8, nome: 'Programa: 08', status: 'pending' },
        { id: 9, nome: 'Programa: 09', status: 'pending' },
        { id: 10, nome: 'Programa: 10', status: 'pending' },
        { id: 11, nome: 'Programa: 11', status: 'pending' },
        { id: 12, nome: 'Programa: 12', status: 'pending' },
        { id: 13, nome: 'Programa: 13', status: 'pending' },
        { id: 14, nome: 'Programa: 14', status: 'pending' },
        { id: 15, nome: 'Programa: 15', status: 'pending' }
    ];
    
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
        
        programas.forEach(programa => {
            const item = document.createElement('div');
            item.className = `program-item ${programa.status}`;
            item.dataset.id = programa.id;
            
            // Simplificado para mostrar apenas o nome do programa e status como na imagem
            item.innerHTML = `
                <div class="program-name">${programa.nome}</div>
                <div class="program-status ${programa.status === 'completed' ? 'completed' : 'pending'}">
                    ${programa.status === 'completed' ? 'Concluído' : 'Pendente'}
                </div>
            `;
            
            // Adicionar evento de clique para selecionar programa
            item.addEventListener('click', function() {
                selecionarPrograma(programa.id);
            });
            
            programItemsContainer.appendChild(item);
        });
        
        // Atualizar contadores e barra de progresso
        const total = programas.length;
        const completed = programas.filter(p => p.status === 'completed').length;
        const pending = total - completed;
        
        if (completedCount) completedCount.textContent = completed;
        if (pendingCount) pendingCount.textContent = pending;
        if (totalCount) totalCount.textContent = total;
        
        // Atualizar barra de progresso
        if (progressFill) {
            const progressPercent = (completed / total) * 100;
            progressFill.style.width = `${progressPercent}%`;
            if (progressPercentage) {
                progressPercentage.textContent = `${Math.round(progressPercent)}%`;
            }
        }
    }
    
    // Selecionar um programa
    function selecionarPrograma(id) {
        // Remover classe active de todos os itens
        document.querySelectorAll('.program-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Adicionar classe active ao item selecionado
        const itemSelecionado = document.querySelector(`.program-item[data-id="${id}"]`);
        if (itemSelecionado) {
            itemSelecionado.classList.add('active');
            
            // Rolar para o item selecionado em dispositivos móveis
            if (window.innerWidth < 768) {
                itemSelecionado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        
        // Atualizar detalhes do programa selecionado
        const programa = programas.find(p => p.id === id);
        if (programa) {
            document.getElementById('currentProgramNumber').textContent = programa.id;
            const programStatus = document.getElementById('programStatus');
            if (programStatus) {
                programStatus.textContent = programa.status === 'completed' ? 'Concluído' : 'Pendente';
                programStatus.className = `program-status ${programa.status}`;
            }
            
            // Atualizar descrição se existir
            const descriptionText = document.querySelector('.description-text strong');
            if (descriptionText && programa.descricao) {
                descriptionText.nextSibling.textContent = ` ${programa.descricao}`;
            }
            
            // Habilitar/desabilitar botões conforme o status
            if (programa.status === 'completed') {
                iniciarBtn.disabled = true;
                pausarBtn.disabled = true;
                concluirBtn.disabled = true;
            } else {
                iniciarBtn.disabled = false;
                pausarBtn.disabled = true;
                concluirBtn.disabled = true;
            }
        }
        
        // Atualizar número do programa na área de assinatura
        const signatureProgramNumber = document.getElementById('signatureProgramNumber');
        if (signatureProgramNumber) {
            signatureProgramNumber.textContent = id;
        }
        
        // Limpar assinatura atual e carregar assinatura salva (se existir)
        if (signaturePad) {
            signaturePad.clear();
            if (programSignatures[id]) {
                signaturePad.fromDataURL(programSignatures[id]);
            }
        }
    }
    
    // Iniciar timer
    function iniciarTimer() {
        if (timerAtivo) return;
        
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
        pausarTimer();
        
        // Obter o ID do programa ativo
        const itemAtivo = document.querySelector('.program-item.active');
        if (itemAtivo) {
            const id = parseInt(itemAtivo.dataset.id);
            
            // Verificar se há assinatura para este programa
            if (!programSignatures[id]) {
                if (!confirm('Este programa não possui assinatura. Deseja continuar mesmo assim?')) {
                    return;
                }
            }
            
            const index = programas.findIndex(p => p.id === id);
            
            if (index !== -1) {
                programas[index].status = 'completed';
                renderizarProgramas();
                
                // Selecionar o próximo programa pendente
                const proximoPendente = programas.find(p => p.status === 'pending');
                if (proximoPendente) {
                    selecionarPrograma(proximoPendente.id);
                }
                
                // Mostrar feedback visual
                mostrarNotificacao('Programa concluído com sucesso!');
            }
        }
        
        // Resetar timer
        segundosDecorridos = 0;
        atualizarDisplayTempo();
        
        iniciarBtn.disabled = false;
        pausarBtn.disabled = true;
        concluirBtn.disabled = true;
    }
    
    // Função para mostrar notificação
    function mostrarNotificacao(mensagem, tipo = 'success') {
        // Verificar se já existe uma notificação
        let notificacao = document.querySelector('.notificacao');
        if (notificacao) {
            notificacao.remove();
        }
        
        // Criar nova notificação
        notificacao = document.createElement('div');
        notificacao.className = `notificacao ${tipo}`;
        notificacao.textContent = mensagem;
        
        // Adicionar ao corpo do documento
        document.body.appendChild(notificacao);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notificacao.classList.add('fadeOut');
            setTimeout(() => {
                notificacao.remove();
            }, 500);
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
                if (confirm('Há um timer em andamento. Deseja realmente sair desta página?')) {
                    window.location.href = 'folhaprocesso.html' + (codigoProjeto ? ('?codigo=' + codigoProjeto) : '');
                }
            } else {
                window.location.href = 'folhaprocesso.html' + (codigoProjeto ? ('?codigo=' + codigoProjeto) : '');
            }
        });
    }
    
    if (voltarInicioBtn) {
        voltarInicioBtn.addEventListener('click', function() {
            if (timerAtivo) {
                if (confirm('Há um timer em andamento. Deseja realmente sair desta página?')) {
                    window.location.href = 'index.html';
                }
            } else {
                window.location.href = 'index.html';
            }
        });
    }
    
    // Evento para finalizar projeto
    if (finalizarCheckbox) {
        finalizarCheckbox.addEventListener('change', function() {
            if (this.checked) {
                const todosConcluidos = programas.every(p => p.status === 'completed');
                
                if (!todosConcluidos) {
                    alert('Todos os programas devem ser concluídos antes de finalizar o projeto.');
                    this.checked = false;
                } else {
                    if (confirm('Tem certeza que deseja finalizar este projeto?')) {
                        // Aqui você pode adicionar código para salvar o projeto como finalizado
                        mostrarNotificacao('Projeto finalizado com sucesso!');
                        setTimeout(() => {
                            window.location.href = 'projetos.html';
                        }, 1500);
                    } else {
                        this.checked = false;
                    }
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
                if (confirm('Há um timer em andamento. Deseja realmente sair desta página?')) {
                    window.location.href = 'folhaprocesso-ampla.html' + (codigoProjeto ? ('?codigo=' + codigoProjeto) : '');
                }
            } else {
                window.location.href = 'folhaprocesso-ampla.html' + (codigoProjeto ? ('?codigo=' + codigoProjeto) : '');
            }
        });
    }
    
    // Inicializar a interface
    renderizarProgramas();
    
    // Selecionar o primeiro programa por padrão
    if (programas.length > 0) {
        selecionarPrograma(programas[0].id);
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
                    signaturePad.fromDataURL(programSignatures[id]);
                }
            }
        }
    });
});

// Funções para gerenciar assinaturas
function limparAssinatura() {
    if (signaturePad) {
        signaturePad.clear();
    }
}

function salvarAssinatura() {
    if (signaturePad && !signaturePad.isEmpty()) {
        // Obter o ID do programa ativo
        const itemAtivo = document.querySelector('.program-item.active');
        if (itemAtivo) {
            const id = parseInt(itemAtivo.dataset.id);
            // Salvar assinatura para este programa
            programSignatures[id] = signaturePad.toDataURL();
            
            // Verificar se o programa já está marcado como concluído
            const index = programas.findIndex(p => p.id === id);
            if (index !== -1 && programas[index].status !== 'completed') {
                // Perguntar se deseja concluir o programa
                if (confirm('Deseja marcar este programa como concluído?')) {
                    concluirProcesso();
                } else {
                    mostrarNotificacao('Assinatura salva com sucesso!');
                }
            } else {
                mostrarNotificacao('Assinatura salva com sucesso!');
            }
        }
    } else {
        alert('Por favor, forneça uma assinatura antes de salvar.');
    }
}

// Função para obter parâmetro da URL
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}





