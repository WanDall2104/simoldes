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
    progressBar.style.width = `${project.progress}%`;
    
    const progressText = document.createElement('div');
    progressText.textContent = `${project.progress}% concluído`;
    
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
    
    if (project.programs && project.programs.length > 0) {
        project.programs.forEach(program => {
            const programItem = document.createElement('div');
            programItem.className = 'program-item';
            
            const programName = document.createElement('div');
            programName.textContent = program.nome;
            
            const programStatus = document.createElement('div');
            programStatus.className = `program-status ${program.status}`;
            programStatus.textContent = program.status === 'completed' ? 'Concluído' : 'Pendente';
            
            programItem.appendChild(programName);
            programItem.appendChild(programStatus);
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
