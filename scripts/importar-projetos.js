// Permitir acesso apenas para administradores
document.addEventListener('DOMContentLoaded', function() {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin' && userRole !== 'administrador') {
        alert('Acesso restrito! Apenas administradores podem importar projetos.');
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
            alert('Projeto salvo com sucesso!');
            manualForm.reset();
        })
        .catch(error => {
            console.error('Erro ao salvar projeto:', error);
            alert('Erro ao salvar projeto. Por favor, tente novamente.');
        });
    });

    // Controle da importação de arquivos
    const importForm = document.getElementById('importarExcelForm');
    const fileInput = document.getElementById('fileInput');
    const fileTypeRadios = document.getElementsByName('fileType');
    const previewContainer = document.getElementById('previewContainer');
    const importarBtn = document.getElementById('importarBtn');

    // Atualiza o tipo de arquivo aceito baseado na seleção
    fileTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'excel') {
                fileInput.accept = '.xlsx, .xls';
            } else {
                fileInput.accept = '.json';
            }
            fileInput.value = ''; // Limpa a seleção atual
            previewContainer.innerHTML = ''; // Limpa a prévia
        });
    });

    importForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const file = fileInput.files[0];
        if (!file) return;

        const fileType = document.querySelector('input[name="fileType"]:checked').value;
        
        if (fileType === 'excel') {
            handleExcelFile(file);
        } else {
            handleJsonFile(file);
        }
    });

    function handleExcelFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            displayPreview(jsonData);
        };
        reader.readAsArrayBuffer(file);
    }

    function handleJsonFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                displayPreview(jsonData);
            } catch (error) {
                alert('Erro ao ler o arquivo JSON: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    function displayPreview(data) {
        previewContainer.innerHTML = '<h3>Prévia dos Dados:</h3>';
        const table = document.createElement('table');
        table.className = 'preview-table';
        
        // Cria o cabeçalho da tabela
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Cria o corpo da tabela
        const tbody = document.createElement('tbody');
        data.slice(0, 5).forEach(row => {
            const tr = document.createElement('tr');
            Object.values(row).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        previewContainer.appendChild(table);
        
        if (data.length > 5) {
            const moreInfo = document.createElement('p');
            moreInfo.textContent = `... e mais ${data.length - 5} registros`;
            previewContainer.appendChild(moreInfo);
        }
    }

    importarBtn.addEventListener('click', function() {
        // Aqui você pode adicionar a lógica para importar os dados
        alert('Dados importados com sucesso!');
        previewContainer.innerHTML = '';
        fileInput.value = '';
    });
});