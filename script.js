// Armazenamento dos produtos adicionados
let carrinho = [];

// Abre ou fecha a barra lateral
function toggleCarrinho() {
    document.body.classList.toggle('cart-open');
}

// Injeta o produto no array e renderiza
function adicionarAoCarrinho(nome, preco) {
    carrinho.push({ nome, preco });
    
    // Atualiza a interface visual
    atualizarInterfaceCarrinho();
    
    // Força o carrinho a abrir na lateral para mostrar o produto entrando
    document.body.classList.add('cart-open');
}

// Recarrega os elementos dentro do carrinho
function atualizarInterfaceCarrinho() {
    const contador = document.getElementById('cart-count');
    const containerItens = document.getElementById('cart-items');
    const valorTotalElemento = document.getElementById('cart-total-value');

    // Atualiza a bolinha rosa de quantidade
    if (contador) {
        contador.innerText = carrinho.length;
    }

    if (!containerItens) return;
    containerItens.innerHTML = ''; 

    if (carrinho.length === 0) {
        containerItens.innerHTML = '<p class="empty-message" style="color: #999; text-align: center; padding-top: 20px;">Seu carrinho está vazio.</p>';
        if (valorTotalElemento) valorTotalElemento.innerText = 'R$ 0,00';
        return;
    }

    let totalAcumulado = 0;

    carrinho.forEach(item => {
        totalAcumulado += item.preco;
        
        const linha = document.createElement('div');
        linha.className = 'cart-item-row';
        linha.style.display = 'flex';
        linha.style.justifyContent = 'space-between';
        linha.style.marginBottom = '12px';
        linha.style.borderBottom = '1px solid #F6ECE7';
        linha.style.paddingBottom = '8px';
        
        linha.innerHTML = `
            <span style="font-weight: 400; color: #1A1A1A;">${item.nome}</span>
            <strong style="color: #B76E79;">R$ ${item.preco.toFixed(2).replace('.', ',')}</strong>
        `;
        containerItens.appendChild(linha);
    });

    if (valorTotalElemento) {
        valorTotalElemento.innerText = `R$ ${totalAcumulado.toFixed(2).replace('.', ',')}`;
    }
}

// Prepara o texto formatado profissional e dispara o WhatsApp
function enviarPedidoWhatsApp() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio! Adicione produtos primeiro.");
        return;
    }

    let mensagem = "✨ *Novo Pedido - Belinna Store* ✨\n\n";
    let total = 0;

    carrinho.forEach((item, index) => {
        mensagem += `*${index + 1}.* ${item.nome} - R$ ${item.preco.toFixed(2).replace('.', ',')}\n`;
        total += item.preco;
    });

    mensagem += `\n💰 *Total do Pedido:* R$ ${total.toFixed(2).replace('.', ',')}`;
    mensagem += "\n\nQuero combinar a forma de pagamento e entrega! 💕";

    const mensagemFormatada = encodeURIComponent(mensagem);
    
    // Insira seu número de teste aqui (com DDD)
    const telefoneLoja = "5511999999999"; 
    
    window.open(`https://api.whatsapp.com/send?phone=${telefoneLoja}&text=${mensagemFormatada}`, '_blank');
}
