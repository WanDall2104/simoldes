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

    // Controle do formulário manual
    const manualForm = document.getElementById('manualForm');
    manualForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const projetoData = {
            // Informações Básicas
            material: document.getElementById('materialValue').value,
            programPath: document.getElementById('programPath').value,
            programmerName: document.getElementById('programmerName').value,
            estimatedTime: document.getElementById('estimatedTime').value,

            // Detalhes do Programa
            programNumber: document.getElementById('programNumber').value,
            status: document.getElementById('programStatus').value,
            programmerComments: document.getElementById('programmerComments').value,
            pathType: document.getElementById('pathType').value,
            reference: document.getElementById('reference').value,

            // Ferramentas
            tools: {
                diameter: document.getElementById('toolDiameter').value,
                rc: document.getElementById('toolRC').value,
                bib: document.getElementById('toolBib').value,
                alt: document.getElementById('toolAlt').value,
                zMin: document.getElementById('zMin').value,
                lat3D: document.getElementById('lat3D').value,
                lat: document.getElementById('lat').value,
                vert: document.getElementById('vert').value,
                latStep: document.getElementById('latStep').value,
                vertStep: document.getElementById('vertStep').value,
                tolerance: document.getElementById('tolerance').value,
                rotation: document.getElementById('rotation').value,
                advance: document.getElementById('advance').value,
                angle: document.getElementById('angle').value,
                workPlane: document.getElementById('workPlane').value
            },

            // Arquivos do Programa
            files: {
                fresa: document.getElementById('fresaFile').value,
                sub: document.getElementById('subFile').value
            },

            // Tempos
            times: {
                cutTime: document.getElementById('cutTime').value,
                totalTime: document.getElementById('totalTime').value
            }
        };

        // Aqui você pode adicionar a lógica para salvar os dados
        console.log('Dados do projeto:', projetoData);
        
        // Exemplo de como enviar os dados para o servidor
        fetch('/api/projetos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projetoData)
        })
        .then(response => response.json())
        .then(data => {
            showCustomAlert('Projeto salvo com sucesso!');
            manualForm.reset();
        })
        .catch(error => {
            console.error('Erro ao salvar projeto:', error);
            showCustomAlert('Erro ao salvar projeto. Por favor, tente novamente.');
        });
    });

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

        handlePdfFile(file);
    });

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
        // Aqui você pode adicionar a lógica para importar os dados
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
                arquivos: {
                    fresa: document.getElementById('novoFresaFile').value,
                    sub: document.getElementById('novoSubFile').value
                }
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