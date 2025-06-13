// Função para carregar usuários na tabela (com botões de ação)
async function carregarUsuarios() {
  const resposta = await fetch('http://localhost:3000/api/usuarios');
  const usuarios = await resposta.json();
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = '';
  usuarios.forEach(usuario => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${usuario.nome}</td>
      <td>${usuario.matricula}</td>
      <td>${usuario.tipoUsuario}</td>
      <td>
        <button class="edit-btn" onclick="abrirModalEdicao('${usuario.matricula}')">Editar</button>
        <button class="delete-btn" onclick="excluirUsuario('${usuario.matricula}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Função para adicionar usuário
document.getElementById('addUserForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const nome = document.getElementById('nome').value;
  const matricula = document.getElementById('matricula').value;
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;
  const tipoUsuario = document.querySelector('input[name="tipoUsuario"]:checked').value;

  if (senha !== confirmarSenha) {
    showCustomAlert('As senhas não coincidem!', 'error');
    return;
  }

  await fetch('http://localhost:3000/api/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, matricula, senha, tipoUsuario })
  });

  showCustomAlert('Usuário adicionado com sucesso!', 'success');
  document.getElementById('addUserForm').reset();
  carregarUsuarios();
});

// Alternância de abas e carregamento de usuários

document.addEventListener('DOMContentLoaded', function () {
  const userRole = localStorage.getItem('userRole');
  if (userRole !== 'admin' && userRole !== 'administrador') {
    showCustomAlert('Você não tem permissão para acessar esta página!', 'error');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
    return;
  }
  // Alternância de abas
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', function () {
      // Remove 'active' de todas as abas e conteúdos
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Adiciona 'active' na aba e conteúdo clicados
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');

      // Se for a aba de gerenciar usuários, carrega os usuários do banco
      if (tabId === 'manage-users') {
        carregarUsuarios();
      }
    });
  });

  // Carrega usuários ao abrir a página, se a aba estiver ativa
  if (document.querySelector('.tab-button[data-tab="manage-users"]').classList.contains('active')) {
    carregarUsuarios();
  }
});

// Função para excluir usuário
function showConfirmModal(message, onConfirm) {
  const modal = document.getElementById('confirmModal');
  document.getElementById('confirmModalMessage').textContent = message;
  modal.style.display = 'flex';

  const okBtn = document.getElementById('confirmModalOk');
  const cancelBtn = document.getElementById('confirmModalCancel');

  // Remove event listeners antigos
  okBtn.onclick = null;
  cancelBtn.onclick = null;

  okBtn.onclick = () => {
    modal.style.display = 'none';
    onConfirm();
  };
  cancelBtn.onclick = () => {
    modal.style.display = 'none';
  };
}

function excluirUsuario(matricula) {
  showConfirmModal('Tem certeza que deseja excluir este usuário?', async () => {
    await fetch(`http://localhost:3000/api/usuarios?matricula=${encodeURIComponent(matricula)}`, {
      method: 'DELETE'
    });
    showCustomAlert('Usuário excluído com sucesso!', 'success');
    carregarUsuarios();
  });
}

// Função para abrir o modal de edição
function abrirModalEdicao(matricula) {
  fetch(`http://localhost:3000/api/usuarios?matricula=${encodeURIComponent(matricula)}`)
    .then(r => r.json())
    .then(usuario => {
      if (!usuario || usuario.erro) {
        showCustomAlert('Usuário não encontrado!', 'error');
        return;
      }
      document.getElementById('editUserId').value = usuario.matricula;
      document.getElementById('editNome').value = usuario.nome;
      document.getElementById('editMatricula').value = usuario.matricula;
      let tipo = usuario.tipoUsuario;
      if (tipo === 'admin') tipo = 'administrador';
      const radio = document.querySelector(`input[name="editTipoUsuario"][value="${tipo}"]`);
      if (radio) radio.checked = true;
      document.getElementById('editModal').style.display = 'block';
    });
}

// Fechar modal
if (document.querySelector('.close-modal')) {
  document.querySelector('.close-modal').onclick = function() {
    document.getElementById('editModal').style.display = 'none';
  };
}
window.onclick = function(event) {
  if (event.target == document.getElementById('editModal')) {
    document.getElementById('editModal').style.display = 'none';
  }
};

// Salvar edição
if (document.getElementById('editUserForm')) {
  document.getElementById('editUserForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const matriculaOriginal = document.getElementById('editUserId').value;
    const nome = document.getElementById('editNome').value;
    const matricula = document.getElementById('editMatricula').value;
    const tipoUsuario = document.querySelector('input[name="editTipoUsuario"]:checked').value;

    await fetch('http://localhost:3000/api/usuarios', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matriculaOriginal, nome, matricula, tipoUsuario })
    });

    showCustomAlert('Usuário atualizado com sucesso!', 'success');
    document.getElementById('editModal').style.display = 'none';
    carregarUsuarios();
  });
}

// Função de alerta customizado
function showCustomAlert(message, type = 'success') {
  // Remove alerta anterior se existir
  const oldAlert = document.querySelector('.custom-alert');
  if (oldAlert) oldAlert.remove();

  // Cria o alerta
  const alertDiv = document.createElement('div');
  alertDiv.className = `custom-alert ${type}`;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  // Mostra o alerta
  setTimeout(() => {
    alertDiv.classList.add('show');
  }, 10);

  // Esconde e remove depois de 3 segundos
  setTimeout(() => {
    alertDiv.classList.remove('show');
    setTimeout(() => alertDiv.remove(), 300);
  }, 3000);
}




