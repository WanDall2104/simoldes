// Script para exibir informações do usuário em todas as páginas
document.addEventListener('DOMContentLoaded', function() {
    // Exibir nome e papel do usuário
    const userName = localStorage.getItem('currentUser');
    const userRole = localStorage.getItem('userRole');
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    if (userName && userNameElement) userNameElement.textContent = userName;
    if (userRole && userRoleElement) {
        const displayRole = (userRole === 'admin' || userRole === 'administrador') ? 'Administrador' : 'Operador';
        userRoleElement.textContent = displayRole;
    }

    // Esconder todos os menus Administração para operadores
    document.querySelectorAll('.sidebar a[href="admin.html"]').forEach(function(link) {
        if (userRole !== 'admin' && userRole !== 'administrador') {
            link.parentElement.style.display = 'none';
        }
    });

    // Exibir menu de importação só para admin
    if (userRole === 'admin' || userRole === 'administrador') {
        const importarMenu = document.getElementById('importarProjetosMenu');
        if(importarMenu) importarMenu.style.display = '';
    }
    // Alternar entre dashboard e importação
    const importarLink = document.getElementById('importarProjetosLink');
    const importarSection = document.getElementById('importarProjetosSection');
    const dashboardContent = document.querySelector('.dashboard-content');
    if(importarLink && importarSection) {
        importarLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Esconde dashboard, mostra importação
            dashboardContent.querySelectorAll('> *:not(#importarProjetosSection)').forEach(el => el.style.display = 'none');
            importarSection.style.display = '';
        });
    }
    // Voltar para dashboard ao recarregar
    if(importarSection) importarSection.style.display = 'none';
    // Lógica de upload e pré-visualização
    const excelForm = document.getElementById('importarExcelForm');
    const excelInput = document.getElementById('excelFileInput');
    const previewContainer = document.getElementById('previewContainer');
    const importarBtn = document.getElementById('importarBtn');
    let previewData = [];
    if(excelForm && excelInput && previewContainer && importarBtn) {
        excelForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const file = excelInput.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(firstSheet, {header:1});
                previewData = json;
                // Montar tabela de pré-visualização
                let html = '<table border="1" style="width:100%;border-collapse:collapse;">';
                json.forEach((row, idx) => {
                    html += '<tr>' + row.map(cell => `<td>${cell ?? ''}</td>`).join('') + '</tr>';
                });
                html += '</table>';
                previewContainer.innerHTML = html;
                importarBtn.style.display = json.length > 1 ? '' : 'none';
            };
            reader.readAsArrayBuffer(file);
        });
        importarBtn.addEventListener('click', function() {
            if(previewData.length > 1) {
                mostrarNotificacao('Importação simulada! (Aqui você pode enviar para o backend ou atualizar a lista de projetos)', 'success');
                // Aqui você pode adicionar lógica para realmente importar os dados
            }
        });
    }

    // Botão de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userMatricula');
            window.location.href = 'login-page.html';
        });
    }

    // Redirecionar para login se não estiver logado
    const currentPage = window.location.pathname.split('/').pop();
    if (!userName && !currentPage.includes('login')) {
        window.location.href = 'login-page.html';
    }
});

