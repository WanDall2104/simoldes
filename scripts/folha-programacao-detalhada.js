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
    
    // Obter código do projeto da URL
    const codigoProjeto = (() => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('codigo') || urlParams.get('id');
    })();

    // Buscar projeto no localStorage
    let todosProgramas = [];
    if (codigoProjeto) {
        const projetos = JSON.parse(localStorage.getItem('projetos')) || {};
        const projeto = projetos[codigoProjeto];
        if (projeto && projeto.programas) {
            todosProgramas = projeto.programas;
        }
    }
    
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
        todosProgramas.forEach(programa => {
            const item = document.createElement('div');
            item.className = `program-item ${programa.status}`;
            item.dataset.id = programa.id || programa.numero;
            item.innerHTML = `
                <div class="program-name">${programa.nome || programa.numero}</div>
                <div class="program-status ${programa.status === 'completed' ? 'completed' : 'pending'}">
                    ${programa.status === 'completed' ? 'Concluído' : 'Pendente'}
                </div>
            `;
            item.addEventListener('click', function() {
                selecionarPrograma(programa.id || programa.numero);
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
        const programa = todosProgramas.find(p => p.id === id || p.numero === id);
        if (programa) {
            document.getElementById('currentProgramNumber').textContent = programa.id || programa.numero;
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
            
            // Atualizar campos do programa
            const projetoAtual = JSON.parse(localStorage.getItem('projetos'))[codigoProjeto];
            preencherCamposPrograma(programa, projetoAtual);
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
                showStyledConfirm('Este programa não possui assinatura. Deseja continuar mesmo assim?', () => {
                    concluirProcessoInterno(id);
                }, () => {});
                return;
            }
            concluirProcessoInterno(id);
        }
        
        // Resetar timer
        segundosDecorridos = 0;
        atualizarDisplayTempo();
        
        iniciarBtn.disabled = false;
        pausarBtn.disabled = true;
        concluirBtn.disabled = true;
    }
    
    // Função interna para concluir processo
    function concluirProcessoInterno(id) {
        const index = todosProgramas.findIndex(p => p.id === id || p.numero === id);
        if (index !== -1) {
            todosProgramas[index].status = 'completed';
            renderizarProgramas();
            
            // Selecionar o próximo programa pendente
            const proximoPendente = todosProgramas.find(p => p.status === 'pending');
            if (proximoPendente) {
                selecionarPrograma(proximoPendente.id || proximoPendente.numero);
            }
            
            // Mostrar feedback visual
            mostrarNotificacao('Programa concluído com sucesso!');
        }
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
            let destino = 'folhaprocesso.html';
            if (codigoProjeto) destino += '?codigo=' + codigoProjeto;
            if (timerAtivo) {
                showStyledConfirm('Há um timer em andamento. Deseja realmente sair desta página?', () => {
                    window.location.href = destino;
                }, () => {});
            } else {
                window.location.href = destino;
            }
        });
    }
    
    if (voltarInicioBtn) {
        voltarInicioBtn.addEventListener('click', function() {
            if (timerAtivo) {
                showStyledConfirm('Há um timer em andamento. Deseja realmente sair desta página?', () => {
                    window.location.href = 'index.html';
                }, () => {});
            } else {
                window.location.href = 'index.html';
            }
        });
    }
    
    // Evento para finalizar projeto
    if (finalizarCheckbox) {
        finalizarCheckbox.addEventListener('change', function() {
            if (this.checked) {
                const todosConcluidos = todosProgramas.every(p => p.status === 'completed');
                
                if (!todosConcluidos) {
                    showStyledAlert('Todos os programas devem ser concluídos antes de finalizar o projeto.');
                    this.checked = false;
                } else {
                    showStyledConfirm('Tem certeza que deseja finalizar este projeto?', () => {
                        // Aqui você pode adicionar código para salvar o projeto como finalizado
                        mostrarNotificacao('Projeto finalizado com sucesso!');
                        setTimeout(() => {
                            window.location.href = 'projetos.html';
                        }, 1500);
                    }, () => { finalizarCheckbox.checked = false; });
                }
            }
        });
    }
    
    // Adicionar evento para o botão de ver folha ampla
    const verAmplaBtn = document.getElementById('verAmplaBtn');
    if (verAmplaBtn) {
        verAmplaBtn.addEventListener('click', function() {
            if (timerAtivo) {
                showStyledConfirm('Há um timer em andamento. Deseja realmente sair desta página?', () => {
                    window.location.href = 'folhaprocesso-ampla.html?codigo=' + codigoProjeto;
                }, () => {});
            } else {
                window.location.href = 'folhaprocesso-ampla.html?codigo=' + codigoProjeto;
            }
        });
    }
    
    // Inicializar a interface
    renderizarProgramas();
    
    // Selecionar o primeiro programa por padrão
    if (todosProgramas.length > 0) {
        selecionarPrograma(todosProgramas[0].id || todosProgramas[0].numero);
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
    
    // Integração localStorage para folha de programação detalhada
    function getQueryParam(...names) {
        const urlParams = new URLSearchParams(window.location.search);
        for (const name of names) {
            const val = urlParams.get(name);
            if (val) return val;
        }
        return null;
    }
    function showStyledAlert(msg) {
        const old = document.getElementById('customFolhaAlert');
        if (old) old.remove();
        const div = document.createElement('div');
        div.id = 'customFolhaAlert';
        div.style.position = 'fixed';
        div.style.top = '0';
        div.style.left = '0';
        div.style.width = '100vw';
        div.style.height = '100vh';
        div.style.background = 'rgba(0,0,0,0.25)';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'center';
        div.style.zIndex = '9999';
        div.innerHTML = `<div style=\"background:#fff;padding:32px 28px 24px 28px;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:350px;text-align:center;\"><div style='font-size:18px;font-weight:600;margin-bottom:16px;'>Atenção</div><div style='font-size:15px;margin-bottom:24px;'>${msg}</div><button style='background:#0f5132;color:#fff;padding:8px 22px;border:none;border-radius:5px;font-weight:600;cursor:pointer;' onclick='document.getElementById("customFolhaAlert").remove()'>OK</button></div>`;
        document.body.appendChild(div);
    }
    function showStyledConfirm(msg, onConfirm, onCancel) {
        const old = document.getElementById('customFolhaConfirm');
        if (old) old.remove();
        const div = document.createElement('div');
        div.id = 'customFolhaConfirm';
        div.style.position = 'fixed';
        div.style.top = '0';
        div.style.left = '0';
        div.style.width = '100vw';
        div.style.height = '100vh';
        div.style.background = 'rgba(0,0,0,0.25)';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'center';
        div.style.zIndex = '9999';
        div.innerHTML = `<div style=\"background:#fff;padding:32px 28px 24px 28px;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:350px;text-align:center;\"><div style='font-size:18px;font-weight:600;margin-bottom:16px;'>Atenção</div><div style='font-size:15px;margin-bottom:24px;'>${msg}</div><button id='confirmBtn' style='background:#0f5132;color:#fff;padding:8px 22px;border:none;border-radius:5px;font-weight:600;cursor:pointer;margin-right:10px;'>Confirmar</button><button id='cancelBtn' style='background:#b02a37;color:#fff;padding:8px 22px;border:none;border-radius:5px;font-weight:600;cursor:pointer;'>Cancelar</button></div>`;
        document.body.appendChild(div);
        document.getElementById('confirmBtn').onclick = () => {
            div.remove();
            if (onConfirm) onConfirm();
        };
        document.getElementById('cancelBtn').onclick = () => {
            div.remove();
            if (onCancel) onCancel();
        };
    }
    function preencherFolhaDetalhadaComProjeto(projeto) {
        if (!projeto || !projeto.programas || projeto.programas.length === 0) return;
        const programa = projeto.programas[0]; // Exibe o primeiro programa
        // Exemplo: preencher campos pelo id ou classe
        if (document.getElementById('currentProgramNumber')) document.getElementById('currentProgramNumber').textContent = programa.numero || '';
        if (document.getElementById('programStatus')) {
            document.getElementById('programStatus').textContent = programa.status === 'completed' ? 'Concluído' : (programa.status === 'in_progress' ? 'Em Andamento' : 'Pendente');
            document.getElementById('programStatus').className = `program-status ${programa.status}`;
        }
        // Preencher outros campos detalhados conforme o layout do HTML...
        if (document.getElementById('progPercursoDetalhe')) document.getElementById('progPercursoDetalhe').textContent = programa.percurso || '';
        if (document.getElementById('progReferenciaDetalhe')) document.getElementById('progReferenciaDetalhe').textContent = programa.referencia || '';
        if (document.getElementById('progComentarioDetalhe')) document.getElementById('progComentarioDetalhe').textContent = programa.comentario || '';
        // ... (repita para os demais campos que existirem no HTML)
    }
    function carregarFolhaDetalhada() {
        const codigoProjeto = getQueryParam('codigo', 'id');
        if (!codigoProjeto) {
            showStyledAlert('Projeto não encontrado: parâmetro ausente na URL.');
            return;
        }
        const projetos = JSON.parse(localStorage.getItem('projetos')) || {};
        const projeto = projetos[codigoProjeto];
        if (projeto) preencherFolhaDetalhadaComProjeto(projeto);
        else showStyledAlert('Projeto não encontrado no sistema.');
    }
    document.addEventListener('DOMContentLoaded', carregarFolhaDetalhada);
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
            const index = todosProgramas.findIndex(p => p.id === id || p.numero === id);
            if (index !== -1 && todosProgramas[index].status !== 'completed') {
                // Perguntar se deseja concluir o programa
                showStyledConfirm('Deseja marcar este programa como concluído?', () => {
                    concluirProcesso();
                }, () => { mostrarNotificacao('Assinatura salva com sucesso!'); });
            } else {
                mostrarNotificacao('Assinatura salva com sucesso!');
            }
        }
    } else {
        showStyledAlert('Por favor, forneça uma assinatura antes de salvar.');
    }
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

function preencherCamposPrograma(programa, projeto) {
    if (!programa || !projeto) return;
    // Dados principais do projeto
    if (document.getElementById('materialValue')) document.getElementById('materialValue').textContent = projeto.folhaProcesso?.material || projeto.title || '';
    if (document.getElementById('programPath')) document.getElementById('programPath').textContent = projeto.folhaProcesso?.pastaProgramas || projeto.machine || '';
    if (document.getElementById('programmerName')) document.getElementById('programmerName').textContent = projeto.folhaProcesso?.programador || '';
    if (document.getElementById('estimatedTime')) document.getElementById('estimatedTime').textContent = projeto.folhaProcesso?.tempoProjeto || '';
    // Dados do programa selecionado
    if (document.getElementById('currentProgramNumber')) document.getElementById('currentProgramNumber').textContent = programa.numero || programa.id || '';
    if (document.getElementById('programStatus')) {
        document.getElementById('programStatus').textContent = programa.status === 'completed' ? 'Concluído' : (programa.status === 'in_progress' ? 'Em Andamento' : 'Pendente');
        document.getElementById('programStatus').className = `program-status ${programa.status}`;
    }
    // Comentários, percurso, referência
    const descText = document.querySelector('.description-text strong');
    if (descText && programa.comentario) descText.nextSibling.textContent = ` ${programa.comentario}`;
    const descExtra = document.querySelector('.description-extra strong');
    if (descExtra && programa.percurso) descExtra.nextSibling.textContent = ` ${programa.percurso}`;
    const descRef = document.querySelector('.description-ref strong');
    if (descRef && programa.referencia) descRef.nextSibling.textContent = ` ${programa.referencia}`;
    // Ferramentas
    const ferramentas = [
        { id: 0, key: 'ferramentaO' },
        { id: 1, key: 'ferramentaRC' },
        { id: 2, key: 'ferramentaRib' },
        { id: 3, key: 'ferramentaAlt' },
        { id: 4, key: 'zMin' },
        { id: 5, key: 'lat2D' },
        { id: 6, key: 'latVert' },
        { id: 7, key: 'lat' },
        { id: 8, key: 'vert' },
        { id: 9, key: 'tol' },
        { id: 10, key: 'rot' },
        { id: 11, key: 'avAngular' },
        { id: 12, key: 'tempoTrab' },
        { id: 13, key: 'corte' },
        { id: 14, key: 'total' },
        { id: 15, key: 'posicao' }
    ];
    const toolColumns = document.querySelectorAll('.tools-grid .tool-column .tool-value');
    if (toolColumns.length) {
        toolColumns[0].textContent = programa.ferramentaO || '';
        toolColumns[1].textContent = programa.ferramentaRC || '';
        toolColumns[2].textContent = programa.ferramentaRib || '';
        toolColumns[3].textContent = programa.ferramentaAlt || '';
        toolColumns[4].textContent = programa.zMin || '';
        toolColumns[5].textContent = programa.lat2D || '';
        toolColumns[6].textContent = programa.latVert || '';
        toolColumns[7].textContent = programa.lat || '';
        toolColumns[8].textContent = programa.vert || '';
        toolColumns[9].textContent = programa.tol || '';
        toolColumns[10].textContent = programa.rot || '';
        toolColumns[11].textContent = programa.avAngular || '';
        toolColumns[12].textContent = programa.tempoTrab || '';
        toolColumns[13].textContent = programa.corte || '';
        toolColumns[14].textContent = programa.total || '';
        toolColumns[15].textContent = programa.posicao || '';
    }
    // Arquivos
    const fileRows = document.querySelectorAll('.file-section .file-row .file-value');
    const sup = programa.sup || (programa.arquivos && programa.arquivos.sup) || '';
    if (fileRows[0]) fileRows[0].textContent = sup;
    // Tempos
    if (document.getElementById('tempoCortado')) document.getElementById('tempoCortado').value = programa.tempoTrab || '';
    if (document.getElementById('tempoTotal')) document.getElementById('tempoTotal').value = programa.total || '';
}





