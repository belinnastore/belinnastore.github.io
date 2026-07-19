// Estado Global do Carrinho
let cart = [];

// Função para abrir/fechar carrinho lateral
function toggleCart() {
    document.body.classList.toggle('cart-open');
}

// Alterar quantidade no card do produto
function changeQty(button, delta) {
    const input = button.parentElement.querySelector('input');
    let newVal = parseInt(input.value) + delta;
    if (newVal < 1) newVal = 1;
    input.value = newVal;
}

// Adicionar item ao carrinho
function addToCart(name, price, button) {
    const card = button.closest('.product-card');
    const qtyInput = card.querySelector('.quantity-selector input');
    const quantity = parseInt(qtyInput.value);

    // Verificar se já existe no carrinho
    const existingIndex = cart.findIndex(item => item.name === name);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({ name, price, quantity });
    }

    // Resetar seletor do card para 1
    qtyInput.value = 1;

    // Atualizar UI
    updateCartUI();
    
    // Abrir o carrinho automaticamente para dar feedback visual
    document.body.classList.add('cart-open');
}

// Remover item do carrinho
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// Atualizar a interface do carrinho
function updateCartUI() {
    const itemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const totalVal = document.getElementById('cart-total-val');

    // Atualizar contador de bolinha
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="empty-msg">Seu carrinho está vazio.</p>';
        totalVal.textContent = 'R$ 0,00';
        return;
    }

    itemsContainer.innerHTML = '';
    let totalPrice = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;

        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.quantity}x - R$ ${item.price.toFixed(2).replace('.', ',')}</p>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})">Remover</button>
        `;
        itemsContainer.appendChild(row);
    });

    totalVal.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
}

// Finalizar pedido e montar link do WhatsApp
function sendWhatsApp() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    let text = '✨ *Novo Pedido - Belinna Store* ✨\n\n';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        text += `🛍️ *${item.quantity}x* ${item.name} - R$ ${itemTotal.toFixed(2).replace('.', ',')}\n`;
    });

    text += `\n💰 *Total do Pedido:* R$ ${total.toFixed(2).replace('.', ',')}\n\n`;
    text += 'Gostaria de confirmar o meu pedido e combinar a entrega! 💕';

    // Formata o texto para URL
    const encodedText = encodeURIComponent(text);
    
    // Insira o número oficial da loja aqui (exemplo: 5511999999999)
    const phoneNumber = '5511999999999'; 
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
}
