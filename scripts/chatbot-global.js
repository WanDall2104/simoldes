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
    
    // Simple response logic
    function getBotResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('projeto') || lowerMessage.includes('projetos')) {
            return "Você pode gerenciar seus projetos na seção 'Projetos'. Lá você pode criar novos projetos, adicionar tarefas e acompanhar o progresso.";
        } 
        else if (lowerMessage.includes('tarefa') || lowerMessage.includes('tarefas')) {
            return "As tarefas pendentes aparecem no resumo do dashboard. Para ver detalhes, acesse o projeto específico onde a tarefa está cadastrada.";
        }
        else if (lowerMessage.includes('histórico') || lowerMessage.includes('atividades')) {
            return "O histórico de atividades mostra todas as ações realizadas no sistema. Você pode acessá-lo através do menu 'Histórico'.";
        }
        else if (lowerMessage.includes('ajuda') || lowerMessage.includes('suporte')) {
            return "Para mais ajuda, você pode consultar nosso FAQ ou entrar em contato com o suporte pelo email suporte@simoldes.com";
        }
        else if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia') || lowerMessage.includes('boa tarde') || lowerMessage.includes('boa noite')) {
            return "Olá! Como posso te ajudar hoje?";
        }
        else if (lowerMessage.includes('programa') || lowerMessage.includes('programação')) {
            return "Na folha de programação detalhada, você pode ver todos os programas disponíveis, iniciar a contagem de tempo e marcar como concluído quando terminar.";
        }
        else if (lowerMessage.includes('ferramenta') || lowerMessage.includes('ferramentas')) {
            return "As informações sobre ferramentas, como diâmetro, RC, Rib. e Alt. estão disponíveis nos detalhes de cada programa.";
        }
        else {
            return "Desculpe, não entendi sua pergunta. Você pode reformular ou perguntar sobre projetos, tarefas, programas ou histórico de atividades.";
        }
    }
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



