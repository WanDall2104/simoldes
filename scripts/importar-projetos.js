// Permitir acesso apenas para administradores
document.addEventListener('DOMContentLoaded', function() {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin' && userRole !== 'administrador') {
        alert('Acesso restrito! Apenas administradores podem importar projetos.');
        window.location.href = 'index.html';
        return;
    }
    // Lógica de importação
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
                alert('Importação simulada! (Aqui você pode enviar para o backend ou atualizar a lista de projetos)');
                // Aqui você pode adicionar lógica para realmente importar os dados
            }
        });
    }
});