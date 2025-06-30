function mostrarNotificacao(mensagem, tipo = 'success') {
    // Remove qualquer alerta anterior
    const alertaAntigo = document.querySelector('.custom-alert-toast');
    if (alertaAntigo) alertaAntigo.remove();

    const alerta = document.createElement('div');
    alerta.className = 'custom-alert-toast' + (tipo === 'error' ? ' error' : '');
    alerta.innerHTML = `
        <span>${mensagem}</span>
        <button class="custom-alert-close" aria-label="Fechar alerta">&times;</button>
    `;

    document.body.appendChild(alerta);

    // Fechar ao clicar no X
    alerta.querySelector('.custom-alert-close').onclick = () => alerta.remove();

    // Fechar automaticamente após 3 segundos
    setTimeout(() => {
        if (alerta.parentNode) alerta.remove();
    }, 3000);
} 