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
        else {
            return "Desculpe, não entendi sua pergunta. Você pode reformular ou perguntar sobre projetos, tarefas ou histórico de atividades.";
        }
    }
}