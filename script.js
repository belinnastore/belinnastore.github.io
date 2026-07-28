/* ========================================================
   1. GERENCIAMENTO DE ABAS (TABS)
   ======================================================== */
function openTab(event, tabId) {
    // Esconde todos os conteúdos de abas
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    // Remove a classe 'active' de todos os botões
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    // Ativa a aba e o botão correspondente
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');

    // Rola suavemente para o topo da página ao trocar de aba
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ========================================================
   2. CARROSSEL DE MINIATURAS E MODAL DE IMAGEM
   ======================================================== */
// Troca a foto principal do card ao clicar na miniatura
function changeImage(thumbElement) {
    const cardMedia = thumbElement.closest('.product-media');
    const mainImg = cardMedia.querySelector('.main-img');
    const thumbs = cardMedia.querySelectorAll('.thumb');

    // Atualiza a imagem principal
    mainImg.src = thumbElement.src;

    // Atualiza a borda da miniatura ativa
    thumbs.forEach(thumb => thumb.classList.remove('active'));
    thumbElement.classList.add('active');
}

// Abre a foto em tamanho gigante
function openModal(imageSrc) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-expanded-img');
    
    modalImg.src = imageSrc;
    modal.showModal(); // Utiliza a API nativa do elemento <dialog>
}

// Fecha o modal
function closeModal() {
    const modal = document.getElementById('image-modal');
    modal.close();
}

// Fecha o modal ao clicar fora da imagem
document.getElementById('image-modal')?.addEventListener('click', (e) => {
    const modal = document.getElementById('image-modal');
    if (e.target === modal) {
        modal.close();
    }
});

/* ========================================================
   3. GERENCIAMENTO DO CARRINHO DE COMPRAS
   ======================================================== */
let cart = [];

// Altera a quantidade no input do card antes de adicionar
function changeQty(button, delta) {
    const input = button.parentElement.querySelector('input');
    let currentVal = parseInt(input.value) || 1;
    currentVal += delta;
    if (currentVal < 1) currentVal = 1;
    input.value = currentVal;
}

// Abre/Fecha a barra lateral do carrinho
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
}

// Adiciona o produto ao carrinho
function addToCart(id, name, price, buttonElement) {
    const card = buttonElement.closest('.product-card');
    const qtyInput = card.querySelector('.quantity-selector input');
    const quantity = parseInt(qtyInput.value) || 1;

    // Verifica se o item já existe no carrinho
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: quantity
        });
    }

    // Reseta o input de quantidade para 1
    qtyInput.value = 1;

    // Atualiza a interface
    updateCartUI();
    toggleCart(); // Abre a sacola para confirmação
}

// Remove item por completo
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

// Altera quantidade direto na barra lateral
function updateCartItemQty(id, delta) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCartUI();
        }
    }
}

// Atualiza a visualização do carrinho e totais
function updateCartUI() {
    const cartContainer = document.getElementById('cart-items');
    const cartBadge = document.getElementById('cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');

    // Total de unidades
    const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartBadge.textContent = totalItemsCount;

    // Se estiver vazio
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart-text">Sua sacola está vazia no momento.</p>';
        cartTotalPrice.textContent = 'R$ 0,00';
        return;
    }

    // Constrói a lista de itens HTML
    cartContainer.innerHTML = '';
    let grandTotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>R$ ${item.price.toFixed(2).replace('.', ',')} un.</p>
                <div class="cart-item-qty-selector">
                    <button type="button" class="btn-cart-minus" onclick="updateCartItemQty('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button type="button" class="btn-cart-plus" onclick="updateCartItemQty('${item.id}', 1)">+</button>
                </div>
            </div>
            <div class="cart-item-actions">
                <p><strong>R$ ${itemTotal.toFixed(2).replace('.', ',')}</strong></p>
                <button type="button" class="btn-remove-item" onclick="removeFromCart('${item.id}')" title="Remover item">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        cartContainer.appendChild(itemElement);
    });

    cartTotalPrice.textContent = `R$ ${grandTotal.toFixed(2).replace('.', ',')}`;
}

/* ========================================================
   4. FINALIZAÇÃO DO PEDIDO (WHATSAPP)
   ======================================================== */
function sendToWhatsApp() {
    if (cart.length === 0) {
        alert('Sua sacola está vazia! Adicione alguns produtos antes de finalizar.');
        return;
    }

    // Digite aqui o número do WhatsApp da loja (com DDD, ex: 5511999999999)
    const storePhoneNumber = '5511999999999'; 

    let message = `✨ *NOVO PEDIDO - BELINNA STORE* ✨\n\n`;
    message += `Olá! Gostaria de finalizar o meu pedido:\n\n`;

    let total = 0;
    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        total += itemSubtotal;
        message += `• *${item.name}*\n  Qtd: ${item.quantity}x | R$ ${itemSubtotal.toFixed(2).replace('.', ',')}\n`;
    });

    message += `\n*TOTAL:* R$ ${total.toFixed(2).replace('.', ',')}\n`;
    message += `-----------------------------------\n`;
    message += `💳 *Formas de Pagamento:* Pix ou Link de Pagamento (Débito/Crédito).\n\n`;
    message += `Aguardo as orientações para o pagamento e dados de entrega! 🥰`;

    // Codifica o texto para URL do WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${storePhoneNumber}?text=${encodedMessage}`;

    // Abre o WhatsApp em uma nova aba
    window.open(whatsappURL, '_blank');
}
