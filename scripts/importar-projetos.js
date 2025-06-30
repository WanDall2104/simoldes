// Função global para mostrar alerta customizado
window.showCustomAlert = function(message) {
    const modal = document.getElementById('customAlertModal');
    const msgSpan = document.getElementById('customAlertMessage');
    const okBtn = document.getElementById('customAlertOkBtn');
    msgSpan.textContent = message;
    modal.style.display = 'flex';
    okBtn.focus();
    function closeModal() {
        modal.style.display = 'none';
        okBtn.removeEventListener('click', closeModal);
        document.removeEventListener('keydown', escListener);
    }
    function escListener(e) {
        if (e.key === 'Escape') closeModal();
    }
    okBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', escListener);
};

// Permitir acesso apenas para administradores
document.addEventListener('DOMContentLoaded', function() {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin' && userRole !== 'administrador') {
        showCustomAlert('Acesso restrito! Apenas administradores podem importar projetos.');
        window.location.href = 'index.html';
        return;
    }
    // Controle das abas
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Controle do formulário único de cadastro completo
    const formProjetoCompleto = document.getElementById('formProjetoCompleto');
    if (formProjetoCompleto) {
        const programNumberInput = document.getElementById('programNumber');
        if (programNumberInput) {
            programNumberInput.value = gerarCodigoProjeto();
            programNumberInput.addEventListener('focus', function() {
                if (!programNumberInput.value) {
                    programNumberInput.value = gerarCodigoProjeto();
                }
            });
        }
        formProjetoCompleto.addEventListener('submit', function(e) {
            e.preventDefault();
            // Dados do card
            const maquinaSelecionada = localStorage.getItem('userMaquina');
            const mapMaquina = { '01': 'F1400', '02': 'F2000', '03': 'F3000' };
            const machine = mapMaquina[maquinaSelecionada] || '';
            let codigoProjeto = document.getElementById('programNumber').value.trim();
            if (!codigoProjeto) {
                codigoProjeto = gerarCodigoProjeto();
            }
            const title = document.getElementById('materialValue').value;
            // Folha de processo
            const folhaProcesso = {
                material: document.getElementById('folhaMaterial').value,
                pastaProgramas: document.getElementById('folhaPastaProgramas').value,
                pastaPowerMill: document.getElementById('folhaPastaPowerMill').value,
                programador: document.getElementById('folhaProgramador').value,
                tempoProjeto: document.getElementById('folhaTempoProjeto').value,
                sobLiq: document.getElementById('folhaSobLiq').value,
                centroBloco: document.getElementById('folhaCentroBloco').value,
                refZ: document.getElementById('folhaRefZ').value,
                observacao: document.getElementById('folhaObservacao').value,
                imagem: document.getElementById('folhaImagem').value,
                dataImpressao: document.getElementById('folhaData').value
            };
            // Primeiro programa detalhado
            const programaDetalhado = {
                numero: document.getElementById('progNumero').value,
                percurso: document.getElementById('progPercurso').value,
                referencia: document.getElementById('progReferencia').value,
                comentario: document.getElementById('progComentario').value,
                ferramentaO: document.getElementById('progFerramentaO').value,
                ferramentaRC: document.getElementById('progFerramentaRC').value,
                ferramentaRib: document.getElementById('progFerramentaRib').value,
                ferramentaAlt: document.getElementById('progFerramentaAlt').value,
                zMin: document.getElementById('progZMin').value,
                lat2D: document.getElementById('progLat2D').value,
                latVert: document.getElementById('progLatVert').value,
                lat: document.getElementById('progLat').value,
                vert: document.getElementById('progVert').value,
                tol: document.getElementById('progTol').value,
                rot: document.getElementById('progRot').value,
                avAngular: document.getElementById('progAvAngular').value,
                tempoTrab: document.getElementById('progTempoTrab').value,
                corte: document.getElementById('progCorte').value,
                total: document.getElementById('progTotal').value,
                posicao: document.getElementById('progPosicao').value,
                fresa: document.getElementById('progFresa').value,
                sup: document.getElementById('progSup').value,
                status: document.getElementById('progStatus').value
            };
            // Monta objeto do projeto completo
            const projetoData = {
                title: title,
                code: codigoProjeto,
                machine: machine,
                status: 'active',
                startDate: new Date().toISOString().slice(0,10),
                progress: 0,
                image: 'images/image-molde01.png',
                folhaProcesso: folhaProcesso,
                programas: [programaDetalhado]
            };
            // Salva no localStorage
            let projetos = JSON.parse(localStorage.getItem('projetos')) || {};
            projetos[codigoProjeto] = projetoData;
            localStorage.setItem('projetos', JSON.stringify(projetos));
            showCustomAlert('Projeto completo salvo com sucesso!');
            formProjetoCompleto.reset();
            if (programNumberInput) programNumberInput.value = gerarCodigoProjeto();
        });
    }

    // Controle da importação de arquivos
    const importForm = document.getElementById('importarExcelForm');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const importarBtn = document.getElementById('importarBtn');

    // Configurar PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    importForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const file = fileInput.files[0];
        if (!file) return;

        // Salvar informações básicas do projeto ao importar
        const nomeProjeto = document.getElementById('importProjectName').value.trim();
        const codigoProjeto = document.getElementById('importProjectCode').value.trim();
        const maquinaSelecionada = localStorage.getItem('userMaquina');
        const mapMaquina = { '01': 'F1400', '02': 'F2000', '03': 'F3000' };
        const machine = mapMaquina[maquinaSelecionada] || '';
        // Salvar no localStorage (projeto básico, sem programas detalhados)
        if (nomeProjeto && codigoProjeto && machine) {
            let projetos = JSON.parse(localStorage.getItem('projetos')) || {};
            if (!projetos[codigoProjeto]) {
                projetos[codigoProjeto] = {
                    title: nomeProjeto,
                    code: codigoProjeto,
                    machine: machine,
                    status: 'active',
                    startDate: new Date().toISOString().slice(0,10),
                    progress: 0,
                    image: 'images/image-molde01.png',
                    origemArquivo: true // marca que veio do arquivo
                };
                localStorage.setItem('projetos', JSON.stringify(projetos));
            }
        }

        handlePdfFile(file);
    });

    // Preencher campo máquina automaticamente
    const manualProjectMachineInput = document.getElementById('manualProjectMachine');
    if (manualProjectMachineInput) {
        const maquinaSelecionada = localStorage.getItem('userMaquina');
        const mapMaquina = { '01': 'F1400', '02': 'F2000', '03': 'F3000' };
        manualProjectMachineInput.value = mapMaquina[maquinaSelecionada] || '';
    }
    const fileProjectMachineInput = document.getElementById('fileProjectMachine');
    if (fileProjectMachineInput) {
        const maquinaSelecionada = localStorage.getItem('userMaquina');
        const mapMaquina = { '01': 'F1400', '02': 'F2000', '03': 'F3000' };
        fileProjectMachineInput.value = mapMaquina[maquinaSelecionada] || '';
    }

    // Preencher campo código do projeto automaticamente na aba de importação via arquivo
    const importProjectCodeInput = document.getElementById('importProjectCode');
    if (importProjectCodeInput && typeof gerarCodigoProjeto === 'function') {
        importProjectCodeInput.value = gerarCodigoProjeto();
        // Atualizar ao trocar de aba
        const tabArquivoBtn = document.querySelector('.tab-button[data-tab="arquivo"]');
        if (tabArquivoBtn) {
            tabArquivoBtn.addEventListener('click', function() {
                importProjectCodeInput.value = gerarCodigoProjeto();
            });
        }
    }

    function handlePdfFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const typedarray = new Uint8Array(e.target.result);
            
            pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
                // Processar todas as páginas do PDF
                const numPages = pdf.numPages;
                let allText = '';
                
                const processPage = function(pageNum) {
                    return pdf.getPage(pageNum).then(function(page) {
                        return page.getTextContent();
                    }).then(function(textContent) {
                        let pageText = '';
                        for (let i = 0; i < textContent.items.length; i++) {
                            pageText += textContent.items[i].str + ' ';
                        }
                        return pageText;
                    });
                };

                // Processar todas as páginas
                const promises = [];
                for (let i = 1; i <= numPages; i++) {
                    promises.push(processPage(i));
                }

                Promise.all(promises).then(function(pages) {
                    allText = pages.join('\n');
                    displayPdfPreview(allText);
                });
            }).catch(function(error) {
                showCustomAlert('Erro ao ler o arquivo PDF: ' + error.message);
            });
        };
        reader.readAsArrayBuffer(file);
    }

    function displayPdfPreview(text) {
        // Remove múltiplos espaços e linhas em branco extras
        let cleanedText = text.replace(/ +/g, ' ').replace(/\n{2,}/g, '\n');
        previewContainer.innerHTML = '<h3>Prévia do Conteúdo PDF:</h3>';
        
        // Criar um container para o texto
        const textContainer = document.createElement('div');
        textContainer.className = 'pdf-preview';
        
        // Mostrar apenas os primeiros 2000 caracteres para prévia
        const previewText = cleanedText.length > 2000 ? cleanedText.substring(0, 2000) + '...' : cleanedText;
        textContainer.textContent = previewText;
        
        previewContainer.appendChild(textContainer);
        
        if (cleanedText.length > 2000) {
            const moreInfo = document.createElement('p');
            moreInfo.textContent = `... e mais ${cleanedText.length - 2000} caracteres`;
            previewContainer.appendChild(moreInfo);
        }
    }

    importarBtn.addEventListener('click', function() {
        // Pega a máquina do login
        const maquinaSelecionada = localStorage.getItem('userMaquina');
        const mapMaquina = { '01': 'F1400', '02': 'F2000', '03': 'F3000' };
        const machine = mapMaquina[maquinaSelecionada] || '';
        // Aqui você pode adicionar a lógica para importar os dados
        // Exemplo: ao montar o objeto do projeto, inclua o campo machine
        // Exemplo fictício:
        // const projetoImportado = { ...dadosExtraidos, machine };
        showCustomAlert('Dados importados com sucesso!');
        previewContainer.innerHTML = '';
        fileInput.value = '';
    });

    // --- LÓGICA PARA A ABA DE INSERIR PROGRAMAS ---
    // Elementos da aba de programas
    const selecionarProjetoForm = document.getElementById('selecionarProjetoForm');
    const opcoesInsercao = document.getElementById('opcoesInsercao');
    const btnManual = document.getElementById('btnManual');
    const btnArquivo = document.getElementById('btnArquivo');
    const adicionarProgramaForm = document.getElementById('adicionarProgramaForm');
    const importarProgramaArquivoForm = document.getElementById('importarProgramaArquivoForm');
    const projetoInfoContainer = document.getElementById('projetoInfoContainer');
    const buscarProjetoBtn = document.getElementById('buscarProjetoBtn');
    
    // Esconde tudo ao carregar
    if(opcoesInsercao) opcoesInsercao.style.display = 'none';
    if(adicionarProgramaForm) adicionarProgramaForm.style.display = 'none';
    if(importarProgramaArquivoForm) importarProgramaArquivoForm.style.display = 'none';

    // Ao buscar projeto, mostra opções de inserção
    if(buscarProjetoBtn) {
        buscarProjetoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const projectNumber = document.getElementById('projectNumber').value.trim();
            if(!projectNumber) {
                showCustomAlert('Informe o número do projeto!');
                return;
            }
            // Aqui você pode buscar informações do projeto no backend, se desejar
            projetoInfoContainer.innerHTML = `<p>Projeto selecionado: <strong>${projectNumber}</strong></p>`;
            opcoesInsercao.style.display = 'block';
            adicionarProgramaForm.style.display = 'none';
            importarProgramaArquivoForm.style.display = 'none';
        });
    }

    // Alterna para formulário manual
    if(btnManual) {
        btnManual.addEventListener('click', function() {
            adicionarProgramaForm.style.display = 'block';
            importarProgramaArquivoForm.style.display = 'none';
        });
    }
    // Alterna para formulário de arquivo
    if(btnArquivo) {
        btnArquivo.addEventListener('click', function() {
            adicionarProgramaForm.style.display = 'none';
            importarProgramaArquivoForm.style.display = 'block';
        });
    }

    // Exemplo de submit do formulário manual de programa
    if(adicionarProgramaForm) {
        adicionarProgramaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Pega o número do projeto selecionado
            const projectNumber = document.getElementById('projectNumber').value.trim();
            if (!projectNumber) {
                showCustomAlert('Informe o número do projeto antes de adicionar um programa!');
                return;
            }
            // Coleta os dados do formulário manual
            const novoPrograma = {
                numero: document.getElementById('novoProgramNumber').value,
                ferramentas: {
                    diameter: document.getElementById('novoToolDiameter').value,
                    rc: document.getElementById('novoToolRC').value,
                    bib: document.getElementById('novoToolBib').value,
                    alt: document.getElementById('novoToolAlt').value,
                    zMin: document.getElementById('novoZMin').value,
                    lat3D: document.getElementById('novoLat3D').value,
                    lat: document.getElementById('novoLat').value,
                    vert: document.getElementById('novoVert').value,
                    latStep: document.getElementById('novoLatStep').value,
                    vertStep: document.getElementById('novoVertStep').value,
                    tolerance: document.getElementById('novoTolerance').value,
                    rotation: document.getElementById('novoRotation').value,
                    advance: document.getElementById('novoAdvance').value,
                    angle: document.getElementById('novoAngle').value,
                    workPlane: document.getElementById('novoWorkPlane').value
                },
                fresa: document.getElementById('novoFresaFile').value,
                sub: document.getElementById('novoSubFile').value
            };
            // Salva no localStorage
            let projetos = JSON.parse(localStorage.getItem('projetos')) || {};
            if (!projetos[projectNumber]) {
                projetos[projectNumber] = { programas: [] };
            }
            projetos[projectNumber].programas.push(novoPrograma);
            localStorage.setItem('projetos', JSON.stringify(projetos));
            showCustomAlert('Programa adicionado manualmente ao projeto!');
            adicionarProgramaForm.reset();
        });
    }

    // Exemplo de submit do formulário de importação de programa
    if(importarProgramaArquivoForm) {
        importarProgramaArquivoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fileInput = importarProgramaArquivoForm.querySelector('#fileInput');
            const file = fileInput.files[0];
            if (!file) {
                showCustomAlert('Selecione um arquivo PDF!');
                return;
            }
            handlePdfFile(file);
        });
    }
});

// Função para gerar código aleatório de projeto
function gerarCodigoProjeto() {
    return 'PRJ-' + Math.floor(100000 + Math.random() * 900000);
}