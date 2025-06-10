// Função para carregar os dados dos usuários
async function carregarUsuarios() {
    try {
        // Primeiro, tenta carregar do localStorage
        const dadosLocalStorage = localStorage.getItem('usuarios');
        if (dadosLocalStorage) {
            return JSON.parse(dadosLocalStorage);
        }
        
        // Se não existir no localStorage, carrega do arquivo JSON
        const response = await fetch('scripts/users-login.json');
        if (!response.ok) {
            throw new Error('Não foi possível carregar os dados de usuários');
        }
        const data = await response.json();
        
        // Salva no localStorage para uso futuro
        localStorage.setItem('usuarios', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        // Retorna dados de exemplo caso ocorra algum erro
        return {
            usuarios: [
                {
                    matricula: "12345",
                    senha: "senha123",
                    nome: "Leonardo",
                    nivelAcesso: "Operador"
                },
                {
                    matricula: "54321",
                    senha: "senha456",
                    nome: "Gabriel",
                    nivelAcesso: "Administrador"
                },
                {
                    matricula: "67890",
                    senha: "senha789",
                    nome: "Vinicius",
                    nivelAcesso: "Operador"
                }
            ]
        };
    }
}

// Função para adicionar um novo usuário
async function adicionarUsuario(event) {
    event.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const matricula = document.getElementById('matricula').value.trim();
    const tipoUsuario = document.querySelector('input[name="tipoUsuario"]:checked').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    
    // Validações
    if (!nome || !matricula || !senha) {
        mostrarMensagem('error', 'Todos os campos são obrigatórios');
        return;
    }
    
    if (senha !== confirmarSenha) {
        mostrarMensagem('error', 'As senhas não coincidem');
        return;
    }
    
    // Verificar se a matrícula já existe
    const dados = await carregarUsuarios();
    if (dados.usuarios.some(user => user.matricula === matricula)) {
        mostrarMensagem('error', 'Esta matrícula já está cadastrada');
        return;
    }
    
    // Adicionar novo usuário
    const novoUsuario = {
        matricula,
        senha,
        nome,
        nivelAcesso: tipoUsuario === 'administrador' ? 'admin' : 'operador'
    };
    
    dados.usuarios.push(novoUsuario);
    
    // Salvar os dados atualizados
    const sucesso = await salvarUsuarios(dados);
    
    if (sucesso) {
        mostrarMensagem('success', 'Usuário adicionado com sucesso!');
        document.getElementById('addUserForm').reset();
        carregarUsuarios(); // Recarregar a lista de usuários
    }
}

// Função para preencher a tabela de usuários
async function preencherTabelaUsuarios(usuarios) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    if (!usuarios || usuarios.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="4" style="text-align: center;">Nenhum usuário encontrado</td>';
        tbody.appendChild(tr);
        return;
    }
    
    usuarios.forEach(usuario => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${usuario.nome}</td>
            <td>${usuario.matricula}</td>
            <td>${usuario.nivelAcesso === 'admin' ? 'Administrador' : 'Operador'}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="abrirModalEdicao('${usuario.matricula}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="delete-btn" onclick="excluirUsuario('${usuario.matricula}')">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Função para buscar usuários
async function buscarUsuarios(termo) {
    const dados = await carregarUsuarios();
    let usuarios = dados.usuarios || [];
    
    if (termo) {
        usuarios = usuarios.filter(usuario => 
            usuario.nome.toLowerCase().includes(termo.toLowerCase()) || 
            usuario.matricula.includes(termo) ||
            (usuario.nivelAcesso === 'admin' ? 'administrador' : 'operador').includes(termo.toLowerCase())
        );
    }
    
    preencherTabelaUsuarios(usuarios);
}

// Função para abrir o modal de edição
async function abrirModalEdicao(matricula) {
    const dados = await carregarUsuarios();
    const usuario = dados.usuarios.find(user => user.matricula === matricula);
    
    if (!usuario) {
        mostrarMensagem('error', 'Usuário não encontrado');
        return;
    }
    
    // Preencher o formulário de edição
    document.getElementById('editUserId').value = matricula;
    document.getElementById('editNome').value = usuario.nome;
    document.getElementById('editMatricula').value = usuario.matricula;
    
    // Selecionar o tipo de usuário correto
    const tipoOperador = document.querySelector('input[name="editTipoUsuario"][value="operador"]');
    const tipoAdmin = document.querySelector('input[name="editTipoUsuario"][value="administrador"]');
    
    if (usuario.nivelAcesso === 'admin') {
        tipoAdmin.checked = true;
    } else {
        tipoOperador.checked = true;
    }
    
    // Exibir o modal
    document.getElementById('editModal').style.display = 'block';
}

// Função para salvar as alterações de um usuário
async function salvarEdicaoUsuario(event) {
    event.preventDefault();
    
    const idOriginal = document.getElementById('editUserId').value;
    const nome = document.getElementById('editNome').value.trim();
    const matricula = document.getElementById('editMatricula').value.trim();
    const tipoUsuario = document.querySelector('input[name="editTipoUsuario"]:checked').value;
    
    // Validações
    if (!nome || !matricula) {
        mostrarMensagem('error', 'Nome e matrícula são obrigatórios');
        return;
    }
    
    // Carregar dados atuais
    const dados = await carregarUsuarios();
    
    // Verificar se a nova matrícula já existe (se for diferente da original)
    if (matricula !== idOriginal && dados.usuarios.some(user => user.matricula === matricula)) {
        mostrarMensagem('error', 'Esta matrícula já está cadastrada para outro usuário');
        return;
    }
    
    // Encontrar o índice do usuário a ser editado
    const index = dados.usuarios.findIndex(user => user.matricula === idOriginal);
    
    if (index === -1) {
        mostrarMensagem('error', 'Usuário não encontrado');
        return;
    }
    
    // Atualizar os dados do usuário
    dados.usuarios[index].nome = nome;
    dados.usuarios[index].matricula = matricula;
    dados.usuarios[index].nivelAcesso = tipoUsuario === 'administrador' ? 'admin' : 'operador';
    
    // Salvar os dados atualizados
    const sucesso = await salvarUsuarios(dados);
    
    if (sucesso) {
        mostrarMensagem('success', 'Usuário atualizado com sucesso!');
        document.getElementById('editModal').style.display = 'none';
        buscarUsuarios(''); // Recarregar a lista de usuários
    }
}

// Função para excluir um usuário
async function excluirUsuario(matricula) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
        return;
    }
    
    // Carregar dados atuais
    const dados = await carregarUsuarios();
    
    // Filtrar o usuário a ser excluído
    dados.usuarios = dados.usuarios.filter(user => user.matricula !== matricula);
    
    // Salvar os dados atualizados
    const sucesso = await salvarUsuarios(dados);
    
    if (sucesso) {
        mostrarMensagem('success', 'Usuário excluído com sucesso!');
        buscarUsuarios(''); // Recarregar a lista de usuários
    }
}

// Função para salvar os dados dos usuários
async function salvarUsuarios(dados) {
    try {
        // Salvar no localStorage
        localStorage.setItem('usuarios', JSON.stringify(dados));
        return true;
    } catch (error) {
        console.error('Erro ao salvar usuários:', error);
        mostrarMensagem('error', 'Erro ao salvar os dados dos usuários');
        return false;
    }
}

// Função para mostrar mensagens de notificação
function mostrarMensagem(tipo, texto) {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipo}`;
    notificacao.textContent = texto;
    
    // Adicionar ao corpo do documento
    document.body.appendChild(notificacao);
    
    // Remover após alguns segundos
    setTimeout(() => {
        notificacao.classList.add('fadeOut');
        setTimeout(() => {
            document.body.removeChild(notificacao);
        }, 300);
    }, 3000);
}

// Adicionar estilos para as notificações se ainda não existirem
if (!document.getElementById('notificacao-styles')) {
    const style = document.createElement('style');
    style.id = 'notificacao-styles';
    style.textContent = `
        .notificacao {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            animation: slideIn 0.3s ease;
        }
        
        .notificacao.success {
            background-color: #4caf50;
        }
        
        .notificacao.error {
            background-color: #f44336;
        }
        
        .notificacao.warning {
            background-color: #ff9800;
        }
        
        .notificacao.fadeOut {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Inicialização da página
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar se o usuário está logado e tem permissão de administrador
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
        alert('Você não tem permissão para acessar esta página');
        window.location.href = 'index.html';
        return;
    }
    
    // Carregar nome do usuário
    const userName = localStorage.getItem('currentUser');
    if (userName) {
        document.getElementById('userName').textContent = userName;
    }
    
    // Configurar abas
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remover classe active de todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Adicionar classe active ao botão e conteúdo clicado
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Se a aba for "manage-users", carregar a lista de usuários
            if (tabId === 'manage-users') {
                buscarUsuarios('');
            }
        });
    });
    
    // Configurar formulário de adição de usuário
    document.getElementById('addUserForm').addEventListener('submit', adicionarUsuario);
    
    // Configurar formulário de edição de usuário
    document.getElementById('editUserForm').addEventListener('submit', salvarEdicaoUsuario);
    
    // Configurar botão de fechar modal
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            document.getElementById('editModal').style.display = 'none';
        });
    }
    
    // Fechar modal quando clicar fora dele
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Configurar busca de usuários
    document.getElementById('searchBtn').addEventListener('click', () => {
        const termo = document.getElementById('searchUser').value.trim();
        buscarUsuarios(termo);
    });
    
    document.getElementById('searchUser').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const termo = e.target.value.toLowerCase().trim();
            buscarUsuarios(termo);
        }
    });
    
    // Se a aba "manage-users" estiver ativa, carregar a lista de usuários
    if (document.querySelector('.tab-button[data-tab="manage-users"]').classList.contains('active')) {
        buscarUsuarios('');
    }
});




