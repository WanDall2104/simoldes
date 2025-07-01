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
        window.location.href = 'login-page.html';
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

// Respostas baseadas no sistema real
function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    const userRole = localStorage.getItem('userRole');
    
    // Respostas para saudações
    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia') || 
        lowerMessage.includes('boa tarde') || lowerMessage.includes('boa noite')) {
        return "Olá! Sou o assistente virtual do Sistema de Usinagem da Simoldes. Como posso te ajudar hoje? Você pode perguntar sobre projetos, histórico, programação, administração ou importação de projetos.";
    } 
    
    // Respostas para projetos
    else if (lowerMessage.includes('projeto') || lowerMessage.includes('projetos')) {
        return "Na seção 'Projetos' você pode visualizar e gerenciar todos os projetos de usinagem. Lá você encontra projetos ativos, pendentes e concluídos, com filtros por status e data. Cada projeto mostra informações como código, máquina responsável e status atual.";
    }
    
    // Respostas específicas para filtros
    else if (lowerMessage.includes('filtrar') && lowerMessage.includes('status')) {
        return "Para filtrar projetos por status: 1) Na seção 'Projetos', localize o campo 'Filtrar por status', 2) Selecione: 'Todos os status', 'Ativos', 'Concluídos' ou 'Pendentes', 3) A lista será atualizada automaticamente mostrando apenas os projetos do status selecionado.";
    } 
    
    // Respostas para histórico
    else if (lowerMessage.includes('histórico') || lowerMessage.includes('atividades') || lowerMessage.includes('concluídos')) {
        return "O 'Histórico' mostra todos os projetos concluídos. Você pode buscar por nome do projeto, código ou máquina, e filtrar por período (hoje, semana, mês, ano). Cada projeto histórico exibe detalhes como data de conclusão, máquina utilizada e responsável.";
    }
    
    // Respostas específicas para busca no histórico
    else if (lowerMessage.includes('buscar') && lowerMessage.includes('histórico')) {
        return "Para buscar no histórico: 1) Acesse a seção 'Histórico', 2) Use o campo de busca para digitar nome do projeto, código ou máquina, 3) Use o filtro de data para limitar por período (hoje, semana, mês, ano), 4) Os resultados são atualizados automaticamente conforme você digita.";
    }
    
    // Respostas para programação detalhada
    else if (lowerMessage.includes('programa') || lowerMessage.includes('programação') || lowerMessage.includes('folha detalhada')) {
        return "A 'Folha de Programação Detalhada' é onde você executa os programas de usinagem. Lá você encontra: informações do material, pasta dos programas, programador, tempo previsto, progresso do projeto, detalhes das ferramentas (diâmetro, RC, Rib., Alt.), controle de tempo (iniciar/pausar/concluir) e visualização 3D da peça.";
    }
    
    // Respostas para acesso à folha de programação
    else if (lowerMessage.includes('acessar') && lowerMessage.includes('folha')) {
        return "Para acessar a Folha de Programação Detalhada, você precisa estar em um projeto específico. Na seção 'Projetos', clique em um projeto ativo e depois selecione a opção para abrir a folha de programação detalhada. Lá você terá acesso completo aos programas de usinagem.";
    }
    
    // Respostas para ferramentas
    else if (lowerMessage.includes('ferramenta') || lowerMessage.includes('ferramentas') || lowerMessage.includes('diâmetro') || 
             lowerMessage.includes('rc') || lowerMessage.includes('rib') || lowerMessage.includes('alt')) {
        return "As informações das ferramentas estão disponíveis na Folha de Programação Detalhada. Cada programa mostra: Ø (diâmetro), RC, Rib. (Ribbon), Alt. (Altura), Z Min., Sob.Esp. (sobre-espessura), Passo, Tol. (tolerância), Rot. (rotação), Av. (avanço), Ângulo e Plano de Trabalho.";
    }
    
    // Respostas para controle de tempo
    else if (lowerMessage.includes('tempo') || lowerMessage.includes('cronômetro') || lowerMessage.includes('iniciar') || 
             lowerMessage.includes('pausar') || lowerMessage.includes('concluir')) {
        return "Na Folha de Programação Detalhada você pode controlar o tempo de execução: 'Iniciar' para começar a contagem, 'Pausar' para interromper temporariamente e 'Concluir Processo' para finalizar o programa. O sistema registra tempo de corte e tempo total automaticamente.";
    }
    
    // Respostas específicas para operações de usinagem
    else if (lowerMessage.includes('iniciar') && lowerMessage.includes('programa')) {
        return "Para iniciar um programa de usinagem: 1) Acesse a Folha de Programação Detalhada, 2) Localize o programa desejado, 3) Clique no botão 'Iniciar' (ícone de play). O cronômetro começará a contar o tempo de execução automaticamente.";
    }
    
    else if (lowerMessage.includes('pausar') && lowerMessage.includes('retomar')) {
        return "Para pausar: clique no botão 'Pausar' (ícone de pause). Para retomar: clique novamente em 'Iniciar'. O sistema mantém o tempo acumulado durante a pausa.";
    }
    
    else if (lowerMessage.includes('marcar') && lowerMessage.includes('concluído')) {
        return "Para marcar um programa como concluído: 1) Certifique-se de que o programa foi executado completamente, 2) Clique no botão 'Concluir Processo' (ícone de check verde). O programa será marcado como finalizado e o progresso do projeto será atualizado.";
    }
    
    else if (lowerMessage.includes('tempo') && lowerMessage.includes('execução')) {
        return "O tempo de execução é exibido na seção de controle de tempo da Folha de Programação Detalhada. Você verá: 'Tempo do Corte' (tempo efetivo de usinagem) e 'Tempo Total' (incluindo preparações e pausas). Os tempos são atualizados em tempo real.";
    }
    
    // Respostas para importação de projetos
    else if (lowerMessage.includes('importar') || lowerMessage.includes('importação') || lowerMessage.includes('novo projeto')) {
        if (userRole === 'admin' || userRole === 'administrador') {
            return "Na seção 'Importar Projetos' você pode: 1) Importar via arquivo Excel, 2) Entrada manual de projetos, 3) Inserir novos programas. Para entrada manual, você preenche informações básicas, folha de processo e detalhes da programação. Apenas administradores têm acesso a esta funcionalidade.";
        } else {
            return "A importação de projetos é uma funcionalidade exclusiva para administradores. Entre em contato com o administrador do sistema se precisar criar novos projetos.";
        }
    }
    
    // Respostas específicas para criação de projetos
    else if (lowerMessage.includes('criar') && lowerMessage.includes('projeto') && lowerMessage.includes('manualmente')) {
        if (userRole === 'admin' || userRole === 'administrador') {
            return "Para criar um projeto manualmente: 1) Acesse 'Importar Projetos', 2) Selecione a aba 'Entrada Manual', 3) Preencha as informações básicas (nome, código, máquina), 4) Complete a folha de processo (material, programador, tempo), 5) Adicione os detalhes do primeiro programa, 6) Clique em 'Salvar Projeto'.";
        } else {
            return "A criação de projetos é restrita a administradores. Entre em contato com o administrador do sistema.";
        }
    }
    
    else if (lowerMessage.includes('importar') && lowerMessage.includes('excel')) {
        if (userRole === 'admin' || userRole === 'administrador') {
            return "Para importar projetos via Excel: 1) Acesse 'Importar Projetos', 2) Selecione a aba 'Importar Projetos via Arquivo', 3) Clique em 'Selecionar Arquivo' e escolha seu arquivo Excel, 4) O sistema fará uma pré-visualização dos dados, 5) Clique em 'Importar' para confirmar.";
        } else {
            return "A importação via Excel é uma funcionalidade exclusiva para administradores.";
        }
    }
    
    // Respostas para administração
    else if (lowerMessage.includes('admin') || lowerMessage.includes('administração') || lowerMessage.includes('usuário') || 
             lowerMessage.includes('usuarios') || lowerMessage.includes('gerenciar')) {
        if (userRole === 'admin' || userRole === 'administrador') {
            return "Na seção 'Administração' você pode gerenciar usuários do sistema: adicionar novos usuários (nome, matrícula, tipo de acesso, senha) e gerenciar usuários existentes (editar informações, excluir). Os tipos de acesso são: Operador e Administrador.";
        } else {
            return "A administração do sistema é uma funcionalidade exclusiva para administradores. Entre em contato com o administrador se precisar de alterações em seu perfil.";
        }
    }
    
    // Respostas específicas para gerenciamento de usuários
    else if (lowerMessage.includes('adicionar') && lowerMessage.includes('usuário')) {
        if (userRole === 'admin' || userRole === 'administrador') {
            return "Para adicionar um novo usuário: 1) Acesse 'Administração', 2) Selecione a aba 'Adicionar Usuário', 3) Preencha: nome completo, matrícula, tipo de usuário (Operador/Administrador), senha e confirmação, 4) Clique em 'Adicionar'. O usuário será criado e poderá fazer login imediatamente.";
        } else {
            return "Apenas administradores podem adicionar novos usuários ao sistema.";
        }
    }
    
    else if (lowerMessage.includes('editar') && lowerMessage.includes('usuários')) {
        if (userRole === 'admin' || userRole === 'administrador') {
            return "Para editar usuários: 1) Acesse 'Administração', 2) Selecione a aba 'Gerenciar Usuários', 3) Use a busca para encontrar o usuário, 4) Clique no ícone de editar (lápis), 5) Modifique as informações necessárias, 6) Clique em 'Salvar Alterações'.";
        } else {
            return "A edição de usuários é restrita a administradores.";
        }
    }
    
    else if (lowerMessage.includes('níveis') && lowerMessage.includes('acesso')) {
        if (userRole === 'admin' || userRole === 'administrador') {
            return "Os níveis de acesso são: 'Operador' (acesso básico a projetos e histórico) e 'Administrador' (acesso completo incluindo importação de projetos e gerenciamento de usuários). Para alterar o nível de acesso de um usuário, edite suas informações na seção 'Gerenciar Usuários'.";
        } else {
            return "O gerenciamento de níveis de acesso é uma funcionalidade exclusiva para administradores.";
        }
    }
    
    // Respostas específicas para administradores
    else if (lowerMessage.includes('excluir') && lowerMessage.includes('usuários')) {
        if (userRole === 'admin' || userRole === 'administrador') {
            return "Para excluir um usuário: 1) Acesse 'Administração' > 'Gerenciar Usuários', 2) Localize o usuário na lista, 3) Clique no ícone de lixeira, 4) Confirme a exclusão. Atenção: Esta ação não pode ser desfeita e removerá todos os dados do usuário.";
        } else {
            return "A exclusão de usuários é uma funcionalidade exclusiva para administradores.";
        }
    }
    
    else if (lowerMessage.includes('monitorar') && lowerMessage.includes('atividades')) {
        if (userRole === 'admin' || userRole === 'administrador') {
            return "Para monitorar atividades dos usuários: 1) Acesse a seção 'Histórico' para ver projetos concluídos, 2) Use os filtros para acompanhar atividades por usuário, 3) Verifique tempos de execução e progresso dos projetos, 4) Para relatórios detalhados, entre em contato com o suporte técnico.";
        } else {
            return "O monitoramento de atividades é uma funcionalidade exclusiva para administradores.";
        }
    }
    
    else if (lowerMessage.includes('estatísticas') && lowerMessage.includes('sistema')) {
        if (userRole === 'admin' || userRole === 'administrador') {
            return "Para visualizar estatísticas do sistema: 1) No dashboard inicial, veja o resumo de projetos (em andamento, pendentes, concluídos), 2) Na seção 'Histórico', use filtros para análises por período, 3) Para relatórios avançados, entre em contato com o suporte técnico da Simoldes.";
        } else {
            return "As estatísticas do sistema são visíveis apenas para administradores.";
        }
    }
    
    // Respostas para login/acesso
    else if (lowerMessage.includes('login') || lowerMessage.includes('senha') || lowerMessage.includes('acesso') || 
             lowerMessage.includes('entrar') || lowerMessage.includes('matrícula')) {
        return "Para acessar o sistema, use sua matrícula e senha na tela de login. Se esqueceu sua senha ou tem problemas de acesso, entre em contato com o administrador do sistema.";
    }
    
    // Respostas para máquinas
    else if (lowerMessage.includes('máquina') || lowerMessage.includes('maquina') || lowerMessage.includes('equipamento') || 
             lowerMessage.includes('f1400') || lowerMessage.includes('f2000') || lowerMessage.includes('f3000')) {
        return "O sistema trabalha com as máquinas F1400, F2000 e F3000. Cada projeto é associado a uma máquina específica. Na folha de programação detalhada, você pode ver qual máquina está sendo utilizada para o projeto atual.";
    }
    
    // Respostas para folha de processo
    else if (lowerMessage.includes('processo') || lowerMessage.includes('folha processo') || lowerMessage.includes('material') || 
             lowerMessage.includes('programador') || lowerMessage.includes('pasta')) {
        return "A Folha de Processo contém informações como: material utilizado, pasta dos programas, pasta do projeto PowerMill, programador responsável, tempo previsto do projeto, sobre-espessura líquida, centro do bloco, referência em Z e observações.";
    }
    
    // Respostas para visualização 3D
    else if (lowerMessage.includes('3d') || lowerMessage.includes('visualização') || lowerMessage.includes('peça') || 
             lowerMessage.includes('imagem') || lowerMessage.includes('modelo')) {
        return "Na Folha de Programação Detalhada há uma visualização 3D da peça sendo usinada. Esta visualização ajuda a entender a geometria e os processos de usinagem aplicados ao projeto.";
    }
    
    // Respostas para ajuda/suporte
    else if (lowerMessage.includes('ajuda') || lowerMessage.includes('suporte') || lowerMessage.includes('problema') || 
             lowerMessage.includes('erro') || lowerMessage.includes('dúvida')) {
        return "Para ajuda técnica ou problemas com o sistema, entre em contato com o suporte da Simoldes. Você também pode consultar o administrador do sistema para questões de acesso e configuração.";
    }
    
    // Respostas específicas para operadores
    else if (lowerMessage.includes('alterar') && lowerMessage.includes('senha')) {
        return "Para alterar sua senha, entre em contato com o administrador do sistema. Apenas administradores podem modificar senhas de usuários por questões de segurança.";
    }
    
    else if (lowerMessage.includes('reportar') && lowerMessage.includes('problema')) {
        return "Para reportar um problema técnico: 1) Anote detalhes do erro (mensagem, tela onde ocorreu), 2) Entre em contato com o administrador do sistema, 3) Descreva o problema e quando ocorreu. Isso ajudará na resolução rápida.";
    }
    
    else if (lowerMessage.includes('solicitar') && lowerMessage.includes('acesso')) {
        return "Para solicitar acesso a novos projetos, entre em contato com o administrador do sistema. Informe qual projeto você precisa acessar e o motivo da solicitação.";
    }
    
    else if (lowerMessage.includes('verificar') && lowerMessage.includes('máquina')) {
        return "Sua máquina atribuída é exibida no cabeçalho do sistema. Se precisar verificar ou alterar sua máquina, entre em contato com o administrador do sistema.";
    }
    
    else if (lowerMessage.includes('histórico') && lowerMessage.includes('atividades')) {
        return "Para ver seu histórico de atividades: 1) Acesse a seção 'Histórico', 2) Use o filtro de busca para encontrar projetos onde você foi responsável, 3) Os projetos concluídos mostrarão suas atividades e tempos de execução.";
    }
    
    else if (lowerMessage.includes('verificar') && lowerMessage.includes('progresso')) {
        return "Para verificar o progresso do projeto: 1) Acesse a Folha de Programação Detalhada, 2) Observe a barra de progresso no topo da página, 3) Veja quantos programas foram concluídos vs. total de programas, 4) O percentual de conclusão é atualizado automaticamente.";
    }
    
    else if (lowerMessage.includes('programa') && lowerMessage.includes('erro')) {
        return "Se um programa apresentar erro: 1) Pause a execução imediatamente, 2) Anote a mensagem de erro exibida, 3) Verifique se as ferramentas estão corretas, 4) Entre em contato com o programador ou administrador, 5) Não force a execução sem resolver o problema.";
    }
    
    // Respostas para navegação
    else if (lowerMessage.includes('menu') || lowerMessage.includes('navegar') || lowerMessage.includes('página') || 
             lowerMessage.includes('seção') || lowerMessage.includes('onde')) {
        return "Use o menu lateral para navegar: 'Início' (dashboard), 'Projetos' (gerenciamento), 'Histórico' (projetos concluídos), 'Importar Projetos' (apenas admin) e 'Administração' (apenas admin).";
    }
    
    // Resposta padrão
    else {
        return "Desculpe, não entendi sua pergunta. Você pode perguntar sobre: projetos, histórico, programação detalhada, ferramentas, controle de tempo, importação de projetos, administração, máquinas, folha de processo, visualização 3D ou navegação no sistema.";
    }
}

// Adicionar sugestões de perguntas baseadas no sistema real
function addSuggestedQuestions() {
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'admin' || userRole === 'administrador';
    
    const chatbotMessages = document.getElementById('chatbotMessages');
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'suggested-questions';
    
    // Título principal
    const suggestionsTitle = document.createElement('div');
    suggestionsTitle.className = 'suggestions-title';
    suggestionsTitle.textContent = 'Perguntas frequentes:';
    suggestionsContainer.appendChild(suggestionsTitle);
    
    if (isAdmin) {
        // PERGUNTAS ESPECÍFICAS PARA ADMINISTRADORES
        const adminNavigationQuestions = [
            "Como acessar a folha de programação detalhada?",
            "Como filtrar projetos por status?",
            "Como buscar no histórico de projetos?",
            "Quais máquinas estão disponíveis no sistema?",
            "Como visualizar estatísticas do sistema?"
        ];
        
        const adminOperationQuestions = [
            "Como iniciar um programa de usinagem?",
            "Como pausar e retomar a execução?",
            "Como marcar um programa como concluído?",
            "Onde vejo o tempo de execução?",
            "Como visualizar a peça em 3D?"
        ];
        
        const adminManagementQuestions = [
            "Como criar um novo projeto manualmente?",
            "Como importar projetos via Excel?",
            "Como adicionar um novo usuário?",
            "Como editar informações de usuários?",
            "Como gerenciar níveis de acesso?",
            "Como excluir usuários do sistema?",
            "Como monitorar atividades dos usuários?"
        ];
        
        // Seção de navegação para admins
        const adminNavSection = document.createElement('div');
        adminNavSection.className = 'question-section';
        const adminNavTitle = document.createElement('div');
        adminNavTitle.className = 'section-title';
        adminNavTitle.textContent = '📋 Navegação e Consulta';
        adminNavSection.appendChild(adminNavTitle);
        
        adminNavigationQuestions.forEach(question => {
            const questionButton = document.createElement('button');
            questionButton.className = 'suggested-question-btn';
            questionButton.textContent = question;
            questionButton.addEventListener('click', () => {
                document.getElementById('userInput').value = question;
                sendUserMessage();
            });
            adminNavSection.appendChild(questionButton);
        });
        suggestionsContainer.appendChild(adminNavSection);
        
        // Seção de operações para admins
        const adminOpSection = document.createElement('div');
        adminOpSection.className = 'question-section';
        const adminOpTitle = document.createElement('div');
        adminOpTitle.className = 'section-title';
        adminOpTitle.textContent = '⚙️ Operações de Usinagem';
        adminOpSection.appendChild(adminOpTitle);
        
        adminOperationQuestions.forEach(question => {
            const questionButton = document.createElement('button');
            questionButton.className = 'suggested-question-btn';
            questionButton.textContent = question;
            questionButton.addEventListener('click', () => {
                document.getElementById('userInput').value = question;
                sendUserMessage();
            });
            adminOpSection.appendChild(questionButton);
        });
        suggestionsContainer.appendChild(adminOpSection);
        
        // Seção de administração exclusiva para admins
        const adminMgmtSection = document.createElement('div');
        adminMgmtSection.className = 'question-section';
        const adminMgmtTitle = document.createElement('div');
        adminMgmtTitle.className = 'section-title';
        adminMgmtTitle.textContent = '🔧 Administração do Sistema';
        adminMgmtSection.appendChild(adminMgmtTitle);
        
        adminManagementQuestions.forEach(question => {
            const questionButton = document.createElement('button');
            questionButton.className = 'suggested-question-btn';
            questionButton.textContent = question;
            questionButton.addEventListener('click', () => {
                document.getElementById('userInput').value = question;
                sendUserMessage();
            });
            adminMgmtSection.appendChild(questionButton);
        });
        suggestionsContainer.appendChild(adminMgmtSection);
        
    } else {
        // PERGUNTAS ESPECÍFICAS PARA OPERADORES
        const operatorNavigationQuestions = [
            "Como acessar a folha de programação detalhada?",
            "Como filtrar projetos por status?",
            "Como buscar no histórico de projetos?",
            "Quais máquinas estão disponíveis no sistema?",
            "Onde encontro informações sobre ferramentas?"
        ];
        
        const operatorOperationQuestions = [
            "Como iniciar um programa de usinagem?",
            "Como pausar e retomar a execução?",
            "Como marcar um programa como concluído?",
            "Onde vejo o tempo de execução?",
            "Como visualizar a peça em 3D?",
            "Como verificar o progresso do projeto?",
            "O que fazer se o programa apresentar erro?"
        ];
        
        const operatorSupportQuestions = [
            "Como alterar minha senha?",
            "Como reportar um problema técnico?",
            "Como solicitar acesso a novos projetos?",
            "Como verificar minha máquina atribuída?",
            "Como acessar o histórico de minhas atividades?"
        ];
        
        // Seção de navegação para operadores
        const operatorNavSection = document.createElement('div');
        operatorNavSection.className = 'question-section';
        const operatorNavTitle = document.createElement('div');
        operatorNavTitle.className = 'section-title';
        operatorNavTitle.textContent = '📋 Navegação e Consulta';
        operatorNavSection.appendChild(operatorNavTitle);
        
        operatorNavigationQuestions.forEach(question => {
            const questionButton = document.createElement('button');
            questionButton.className = 'suggested-question-btn';
            questionButton.textContent = question;
            questionButton.addEventListener('click', () => {
                document.getElementById('userInput').value = question;
                sendUserMessage();
            });
            operatorNavSection.appendChild(questionButton);
        });
        suggestionsContainer.appendChild(operatorNavSection);
        
        // Seção de operações para operadores
        const operatorOpSection = document.createElement('div');
        operatorOpSection.className = 'question-section';
        const operatorOpTitle = document.createElement('div');
        operatorOpTitle.className = 'section-title';
        operatorOpTitle.textContent = '⚙️ Operações de Usinagem';
        operatorOpSection.appendChild(operatorOpTitle);
        
        operatorOperationQuestions.forEach(question => {
            const questionButton = document.createElement('button');
            questionButton.className = 'suggested-question-btn';
            questionButton.textContent = question;
            questionButton.addEventListener('click', () => {
                document.getElementById('userInput').value = question;
                sendUserMessage();
            });
            operatorOpSection.appendChild(questionButton);
        });
        suggestionsContainer.appendChild(operatorOpSection);
        
        // Seção de suporte para operadores
        const operatorSupportSection = document.createElement('div');
        operatorSupportSection.className = 'question-section';
        const operatorSupportTitle = document.createElement('div');
        operatorSupportTitle.className = 'section-title';
        operatorSupportTitle.textContent = '🆘 Suporte e Ajuda';
        operatorSupportSection.appendChild(operatorSupportTitle);
        
        operatorSupportQuestions.forEach(question => {
            const questionButton = document.createElement('button');
            questionButton.className = 'suggested-question-btn';
            questionButton.textContent = question;
            questionButton.addEventListener('click', () => {
                document.getElementById('userInput').value = question;
                sendUserMessage();
            });
            operatorSupportSection.appendChild(questionButton);
        });
        suggestionsContainer.appendChild(operatorSupportSection);
    }
    
    chatbotMessages.appendChild(suggestionsContainer);
}
