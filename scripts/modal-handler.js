// Função para criar e mostrar um modal com os detalhes do projeto
function showProjectModal(project) {
    console.log("Mostrando modal para o projeto:", project);
    
    // Remover qualquer modal existente
    const existingModal = document.getElementById('projectModalContainer');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Criar o container do modal
    const modalContainer = document.createElement('div');
    modalContainer.id = 'projectModalContainer';
    
    // Criar o conteúdo do modal
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Cabeçalho do modal
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('h2');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = project.title;
    
    const closeButton = document.createElement('span');
    closeButton.className = 'close-modal';
    closeButton.textContent = '×';
    closeButton.onclick = function() {
        modalContainer.remove();
    };
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    // Corpo do modal
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    // Informações do projeto
    const infoSection = document.createElement('div');
    infoSection.className = 'info-section';
    
    infoSection.innerHTML = `
        <div class="info-row"><span class="info-label">Código:</span> ${project.code}</div>
        <div class="info-row"><span class="info-label">Máquina:</span> ${project.machine}</div>
        <div class="info-row"><span class="info-label">Concluído em:</span> ${project.completionDate ? formatDate(project.completionDate) : 'Em andamento'}</div>
    `;
    
    // Seção de progresso
    const progressSection = document.createElement('div');
    progressSection.className = 'progress-section';
    
    const progressTitle = document.createElement('h3');
    progressTitle.className = 'progress-title';
    progressTitle.textContent = 'Progresso do Projeto';
    
    const progressBarContainer = document.createElement('div');
    progressBarContainer.className = 'progress-bar-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    // Calcular progresso real
    let total = 0, concluidos = 0;
    if (Array.isArray(project.programas)) {
        total = project.programas.length;
        concluidos = project.programas.filter(p => p.status === 'completed').length;
    }
    const progress = total > 0 ? Math.round((concluidos / total) * 100) : 0;
    progressBar.style.width = progress + '%';
    
    const progressText = document.createElement('div');
    progressText.textContent = `${progress}% concluído`;
    
    progressBarContainer.appendChild(progressBar);
    progressSection.appendChild(progressTitle);
    progressSection.appendChild(progressBarContainer);
    progressSection.appendChild(progressText);
    
    // Seção de programas
    const programsSection = document.createElement('div');
    programsSection.className = 'programs-section';
    
    const programsTitle = document.createElement('h3');
    programsTitle.className = 'programs-title';
    programsTitle.textContent = 'Programas';
    
    const programsList = document.createElement('div');
    programsList.className = 'programs-list';
    
    if (Array.isArray(project.programas) && project.programas.length > 0) {
        project.programas.forEach(program => {
            const programItem = document.createElement('div');
            programItem.className = 'program-item';
            
            const programName = document.createElement('div');
            programName.textContent = program.nome || program.title || program.code || '-';
            
            const programStatus = document.createElement('div');
            programStatus.className = `program-status ${program.status}`;
            programStatus.textContent = program.status === 'completed' ? 'Concluído' : 'Pendente';
            
            programItem.appendChild(programName);
            programItem.appendChild(programStatus);
            
            // Se concluído, mostrar assinatura e matrícula se existirem
            if (program.status === 'completed' && project.assinaturas && project.assinaturas[program.id]) {
                const assinaturaInfo = project.assinaturas[program.id];
                const assinaturaDiv = document.createElement('div');
                assinaturaDiv.className = 'assinatura-info';
                if (assinaturaInfo.assinatura) {
                    const img = document.createElement('img');
                    img.src = assinaturaInfo.assinatura;
                    img.alt = 'Assinatura';
                    img.style.maxWidth = '80px';
                    img.style.maxHeight = '40px';
                    img.style.display = 'block';
                    img.style.marginBottom = '2px';
                    img.style.border = '1px solid #ccc';
                    img.style.background = '#fff';
                    assinaturaDiv.appendChild(img);
                }
                if (assinaturaInfo.matricula) {
                    const matSpan = document.createElement('span');
                    matSpan.textContent = `Matrícula: ${assinaturaInfo.matricula}`;
                    assinaturaDiv.appendChild(matSpan);
                }
                programItem.appendChild(assinaturaDiv);
            }
            
            programsList.appendChild(programItem);
        });
    } else {
        const noPrograms = document.createElement('p');
        noPrograms.textContent = 'Nenhum programa encontrado para este projeto.';
        programsList.appendChild(noPrograms);
    }
    
    programsSection.appendChild(programsTitle);
    programsSection.appendChild(programsList);
    
    // Adicionar seções ao corpo do modal
    modalBody.appendChild(infoSection);
    modalBody.appendChild(progressSection);
    modalBody.appendChild(programsSection);
    
    // Montar o modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContainer.appendChild(modalContent);
    
    // Adicionar o modal ao documento
    document.body.appendChild(modalContainer);
    
    // Fechar o modal ao clicar fora dele
    modalContainer.addEventListener('click', function(e) {
        if (e.target === modalContainer) {
            modalContainer.remove();
        }
    });
}

// Função auxiliar para formatar datas
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}
