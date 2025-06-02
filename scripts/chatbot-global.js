// Chatbot Global - Para ser incluído em todas as páginas exceto login
document.addEventListener('DOMContentLoaded', function() {
    console.log('Chatbot global carregado');
    
    // Verificar se estamos na página de login
    const currentPage = window.location.pathname.split('/').pop();
    console.log('Página atual:', currentPage);
    
    if (currentPage === 'login-page.html' || currentPage === 'login.html') {
        console.log('Página de login detectada, não inicializando chatbot');
        return;
    }
    
    // Remover qualquer chatbot existente para evitar duplicação
    const existingChatbot = document.querySelector('.chatbot-container');
    if (existingChatbot) {
        console.log('Removendo chatbot existente');
        existingChatbot.remove();
    }
    
    // Criar os elementos do chatbot
    console.log('Criando elementos do chatbot');
    createChatbotElements();
    
    // Inicializar o chatbot
    console.log('Inicializando chatbot');
    initChatbot();
});

// Função para criar os elementos do chatbot dinamicamente
function createChatbotElements() {
    // Criar container do chatbot
    const chatbotContainer = document.createElement('div');
    chatbotContainer.className = 'chatbot-container';
    
    // HTML do chatbot
    chatbotContainer.innerHTML = `
        <div class="chatbot-window" id="chatbotWindow">
            <div class="chatbot-header">
                <span>Assistente Virtual</span>
                <button id="closeChatbot" aria-label="Fechar chat">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="chatbot-messages" id="chatbotMessages">
                <div class="message bot-message">
                    Olá! Sou o assistente virtual do Sistema de Usinagem. Como posso te ajudar hoje?
                </div>
            </div>
            <div class="chatbot-input">
                <input type="text" id="userInput" placeholder="Digite sua mensagem..." aria-label="Digite sua mensagem">
                <button id="sendMessage" aria-label="Enviar mensagem"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
        <button class="chatbot-button" id="chatbotButton" aria-label="Abrir assistente virtual">
            <i class="fas fa-robot"></i>
        </button>
    `;
    
    // Adicionar ao final do body
    document.body.appendChild(chatbotContainer);
}

// Funções do Chatbot
function initChatbot() {
    const chatbotButton = document.getElementById('chatbotButton');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const closeChatbot = document.getElementById('closeChatbot');
    const sendMessage = document.getElementById('sendMessage');
    const userInput = document.getElementById('userInput');
    const chatbotMessages = document.getElementById('chatbotMessages');
    
    if (!chatbotButton || !chatbotWindow) return;
    
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
            document.getElementById('sendMessage').click();
        });
        suggestionsContainer.appendChild(questionButton);
    });
    
    chatbotMessages.appendChild(suggestionsContainer);
}

// Adicionar verificação de nível de acesso para exibir o menu de administração
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário é administrador para mostrar o menu de administração
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') {
        // Verificar se o menu lateral existe
        const sidebar = document.querySelector('.sidebar ul');
        if (sidebar) {
            // Verificar se o item de administração já existe
            const adminMenuItem = Array.from(sidebar.querySelectorAll('li a')).find(a => 
                a.getAttribute('href') === 'admin.html'
            );
            
            // Adicionar item de menu de administração se não existir
            if (!adminMenuItem) {
                const adminItem = document.createElement('li');
                adminItem.innerHTML = `<a href="admin.html"><i class="fas fa-users-cog"></i> Administração</a>`;
                sidebar.appendChild(adminItem);
            }
        }
    }
});




