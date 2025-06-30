// login.js - Script para autenticação e cadastro de usuários

// Função para carregar os dados do JSON
async function carregarUsuarios() {
    try {
        const response = await fetch('users-login.json');
        if (!response.ok) {
            throw new Error('Não foi possível carregar os dados de usuários');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        return { usuarios: [] };
    }
}

// Função para salvar os dados no JSON
async function salvarUsuarios(dados) {
    try {
        // Em um ambiente real, isso seria uma chamada para uma API backend
        // que salvaria os dados no servidor
        console.log('Dados que seriam salvos:', JSON.stringify(dados, null, 2));
        
        // Aqui você teria que implementar uma API no backend para realmente 
        // salvar os dados no arquivo JSON
        mostrarMensagem('success', 'Usuário cadastrado com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao salvar usuários:', error);
        return false;
    }
}

// Função para mostrar mensagens estilizadas
function mostrarMensagem(tipo, texto) {
    // Remove qualquer mensagem anterior
    const mensagemAnterior = document.querySelector('.mensagem-feedback');
    if (mensagemAnterior) {
        mensagemAnterior.remove();
    }
    
    // Cria o elemento de mensagem
    const mensagem = document.createElement('div');
    mensagem.className = `mensagem-feedback ${tipo}`;
    mensagem.textContent = texto;
    
    // Estiliza a mensagem
    mensagem.style.padding = '10px 15px';
    mensagem.style.borderRadius = '4px';
    mensagem.style.marginTop = '15px';
    mensagem.style.textAlign = 'center';
    mensagem.style.fontWeight = 'bold';
    mensagem.style.fontSize = '14px';
    
    // Aplica cores conforme o tipo de mensagem
    if (tipo === 'error') {
        mensagem.style.backgroundColor = '#fff0f0';
        mensagem.style.color = '#a83232';
        mensagem.style.border = '1px solid #ffd2d2';
    } else if (tipo === 'success') {
        mensagem.style.backgroundColor = '#f0fff4';
        mensagem.style.color = '#0f5132';
        mensagem.style.border = '1px solid #d1e7dd';
    } else if (tipo === 'warning') {
        mensagem.style.backgroundColor = '#fff8e1';
        mensagem.style.color = '#856404';
        mensagem.style.border = '1px solid #ffeeba';
    }
    
    // Adiciona a mensagem abaixo do formulário
    const form = document.querySelector('form');
    form.parentNode.insertBefore(mensagem, form.nextSibling);
    
    // Configura remoção automática após alguns segundos (opcional)
    if (tipo === 'success') {
        setTimeout(() => {
            mensagem.remove();
        }, 3000);
    }
}

// Função de login
async function fazerLogin(event) {
    event.preventDefault();
    
    const maquina = document.getElementById('maquina').value;
    const matricula = document.getElementById('matricula').value;
    const senha = document.getElementById('senha').value;
    
    if (!maquina || !matricula || !senha) {
        mostrarMensagem('error', 'Por favor, preencha todos os campos!');
        return;
    }
    
    const maquinasValidas = ['01', '02', '03']; // Adapte conforme necessário
    if (!maquinasValidas.includes(maquina)) {
        mostrarMensagem('error', 'Número de máquina inválido!');
        return;
    }
    
    try {
        // Envia para a API do backend
        const resposta = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula, senha })
        });
        const resultado = await resposta.json();
        
        if (resultado.sucesso) {
            // Salvar informações do usuário no localStorage
            localStorage.setItem('currentUser', resultado.usuario.nome);
            localStorage.setItem('userRole', resultado.usuario.tipoUsuario || resultado.usuario.nivelAcesso);
            localStorage.setItem('userMatricula', resultado.usuario.matricula);
            localStorage.setItem('userMaquina', maquina);
            mostrarMensagem('success', `Bem-vindo(a), ${resultado.usuario.nome}!`);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            mostrarMensagem('error', resultado.mensagem || 'Matrícula ou senha incorretos!');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        mostrarMensagem('error', 'Erro ao processar o login. Tente novamente.');
    }
}

// Função para cadastro de novos usuários
async function cadastrarUsuario(event) {
    event.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const matricula = document.getElementById('matricula').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    
    // Validações básicas
    if (!nome || !matricula || !senha || !confirmarSenha) {
        mostrarMensagem('error', 'Por favor, preencha todos os campos!');
        return;
    }
    
    if (senha !== confirmarSenha) {
        mostrarMensagem('error', 'As senhas não coincidem!');
        return;
    }
    
    // Carrega usuários existentes
    const dados = await carregarUsuarios();
    
    // Verifica se a matrícula já existe
    if (dados.usuarios.some(user => user.matricula === matricula)) {
        mostrarMensagem('warning', 'Esta matrícula já está cadastrada!');
        return;
    }
    
    // Adiciona novo usuário
    const novoUsuario = {
        matricula,
        senha,
        nome,
        nivelAcesso: "operador" // Nível padrão para novos usuários
    };
    
    dados.usuarios.push(novoUsuario);
    
    // Salva os dados atualizados
    const sucesso = await salvarUsuarios(dados);
    
    if (sucesso) {
        mostrarMensagem('success', 'Cadastro realizado com sucesso! Redirecionando para o login...');
        // Redireciona para a página de login após um breve delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

// Inicializa os eventos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar em qual página estamos
    const paginaAtual = window.location.pathname.split('/').pop();
    
    if (paginaAtual === 'login-page.html' || paginaAtual === '' || paginaAtual === 'index.html') {
        // Página de login
        const formLogin = document.querySelector('form');
        if (formLogin) {
            formLogin.addEventListener('submit', fazerLogin);
        }
    }
});
