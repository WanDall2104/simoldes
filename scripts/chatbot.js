// Gerenciamento de usuário
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('currentUser');
    const savedRole = localStorage.getItem('userRole');
    
    if (savedUser) {
        document.getElementById('userName').textContent = savedUser;
        document.getElementById('userRole').textContent = savedRole || 'Operador';
    }
    
    // Configurar botão de logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
    });
    
    // Inicializar chatbot
    initChatbot();
});

// Funções do Chatbot
function initChatbot() {
    const chatbotButton = document.getElementById('chatbotButton');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const closeChatbot = document.getElementById('closeChatbot');
    const sendMessage = document.getElementById('sendMessage');
    const userInput = document.getElementById('userInput');
    const chatbotMessages = document.getElementById('chatbotMessages');
    
    // Toggle chatbot window
    chatbotButton.addEventListener('click', () => {
        chatbotWindow.style.display = chatbotWindow.style.display === 'flex' ? 'none' : 'flex';
    });
    
    // Close chatbot
    closeChatbot.addEventListener('click', () => {
        chatbotWindow.style.display = 'none';
    });
    
    // Send message
    sendMessage.addEventListener('click', sendUserMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendUserMessage();
        }
    });
    
    // Adicionar sugestões de perguntas
    addSuggestedQuestions();
    
    // Função para enviar mensagem do usuário
    function sendUserMessage() {
        const message = userInput.value.trim();
        if (message) {
            // Add user message
            const userMessage = document.createElement('div');
            userMessage.className = 'message user-message';
            userMessage.textContent = message;
            chatbotMessages.appendChild(userMessage);
            
            // Clear input
            userInput.value = '';
            
            // Scroll to bottom
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            
            // Simulate bot response after a short delay
            setTimeout(() => {
                const botResponse = getBotResponse(message);
                const botMessage = document.createElement('div');
                botMessage.className = 'message bot-message';
                botMessage.textContent = botResponse;
                chatbotMessages.appendChild(botMessage);
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            }, 800);
        }
    }
}

// Simple response logic
function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Respostas para saudações
    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia') || 
        lowerMessage.includes('boa tarde') || lowerMessage.includes('boa noite')) {
        return "Olá! Como posso te ajudar hoje? Você pode perguntar sobre projetos, tarefas, ferramentas, programação ou histórico.";
    } 
    // Respostas para projetos
    else if (lowerMessage.includes('projeto') || lowerMessage.includes('projetos')) {
        return "Você pode gerenciar seus projetos na seção 'Projetos'. Lá você pode criar novos projetos, adicionar tarefas e acompanhar o progresso.";
    } 
    // Respostas para tarefas
    else if (lowerMessage.includes('tarefa') || lowerMessage.includes('tarefas')) {
        return "As tarefas pendentes aparecem no resumo do dashboard. Para ver detalhes, acesse o projeto específico onde a tarefa está cadastrada.";
    }
    // Respostas para histórico
    else if (lowerMessage.includes('histórico') || lowerMessage.includes('atividades')) {
        return "O histórico de atividades mostra todas as ações realizadas no sistema. Você pode acessá-lo através do menu 'Histórico'.";
    }
    // Respostas para ajuda/suporte
    else if (lowerMessage.includes('ajuda') || lowerMessage.includes('suporte')) {
        return "Para mais ajuda, você pode consultar nosso FAQ ou entrar em contato com o suporte pelo email suporte@simoldes.com";
    }
    // Respostas para programação
    else if (lowerMessage.includes('programa') || lowerMessage.includes('programação')) {
        return "Na folha de programação detalhada, você pode ver todos os programas disponíveis, iniciar a contagem de tempo e marcar como concluído quando terminar.";
    }
    // Respostas para ferramentas
    else if (lowerMessage.includes('ferramenta') || lowerMessage.includes('ferramentas')) {
        return "As informações sobre ferramentas, como diâmetro, RC, Rib. e Alt. estão disponíveis nos detalhes de cada programa.";
    }
    // Respostas para login/acesso
    else if (lowerMessage.includes('login') || lowerMessage.includes('senha') || lowerMessage.includes('acesso')) {
        return "Para acessar o sistema, use sua matrícula e senha. Se esqueceu sua senha, entre em contato com o administrador do sistema.";
    }
    // Respostas para máquinas
    else if (lowerMessage.includes('máquina') || lowerMessage.includes('maquina') || lowerMessage.includes('equipamento')) {
        return "Você pode verificar a disponibilidade das máquinas no dashboard. Para mais detalhes sobre uma máquina específica, acesse a seção 'Equipamentos'.";
    }
    // Respostas para relatórios
    else if (lowerMessage.includes('relatório') || lowerMessage.includes('relatorio') || lowerMessage.includes('report')) {
        return "Os relatórios de produção podem ser gerados na seção 'Relatórios'. Você pode filtrar por período, projeto ou operador.";
    }
    // Respostas para usuários/perfil
    else if (lowerMessage.includes('usuário') || lowerMessage.includes('usuario') || lowerMessage.includes('perfil')) {
        return "Você pode editar seu perfil clicando no seu nome no canto superior direito. Administradores podem gerenciar usuários na seção 'Administração'.";
    }
    // Resposta padrão
    else {
        return "Desculpe, não entendi sua pergunta. Você pode perguntar sobre: projetos, tarefas, ferramentas, programação, máquinas, relatórios ou histórico de atividades.";
    }
}

// Adicionar sugestões de perguntas
function addSuggestedQuestions() {
    const suggestedQuestions = [
        "Como criar um novo projeto?",
        "Onde vejo minhas tarefas pendentes?",
        "Como acessar o histórico de atividades?",
        "Quais ferramentas estão disponíveis?",
        "Como gerar relatórios de produção?"
    ];
    
    const chatbotMessages = document.getElementById('chatbotMessages');
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'suggested-questions';
    
    const suggestionsTitle = document.createElement('div');
    suggestionsTitle.className = 'suggestions-title';
    suggestionsTitle.textContent = 'Perguntas sugeridas:';
    suggestionsContainer.appendChild(suggestionsTitle);
    
    suggestedQuestions.forEach(question => {
        const questionButton = document.createElement('button');
        questionButton.className = 'suggested-question-btn';
        questionButton.textContent = question;
        questionButton.addEventListener('click', () => {
            document.getElementById('userInput').value = question;
            sendUserMessage();
        });
        suggestionsContainer.appendChild(questionButton);
    });
    
    chatbotMessages.appendChild(suggestionsContainer);
}
