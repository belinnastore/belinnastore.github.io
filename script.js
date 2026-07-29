// NUMERO DO SEU WHATSAPP (Coloque o DDI + DDD + Número. Ex: 5511999999999)
const PHONE_NUMBER = "5511999999999";

let cart = [];

// 1. Troca entre as 3 Páginas (Início, Catálogo, Sobre Nós)
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`page-${pageId}`).classList.add('active');
    
    // Rola para o topo ao trocar de página
    window.scrollTo(0, 0);
}

// 2. Abrir/Fechar Sacola
function toggleCart() {
    document.getElementById('cart-modal').classList.toggle('open');
}

// 3. Adicionar produto à Sacola
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    updateCartUI();
    toggleCart(); // Abre a sacola para confirmação
}

// 4. Aumentar quantidade de um item específico
function increaseQuantity(name) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += 1;
        updateCartUI();
    }
}

// 5. Diminuir quantidade (se chegar a 0, remove o item)
function decreaseQuantity(name) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            removeFromCartCompletely(name);
        } else {
            updateCartUI();
        }
    }
}

// 6. Remover item completamente da sacola
function removeFromCartCompletely(name) {
    cart = cart.filter(item => item.name !== name);
    updateCartUI();
}

// 7. Atualizar a visualização da Sacola com os controles interativos
function updateCartUI() {
    const cartContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');

    cartContainer.innerHTML = '';
    let total = 0;
    let totalItems = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart">Sua sacola está vazia.</p>';
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
            totalItems += item.quantity;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div>
                    <strong>${item.name}</strong>
                    <p>R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                    <div class="cart-item-controls">
                        <button onclick="decreaseQuantity('${item.name}')">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="increaseQuantity('${item.name}')">+</button>
                    </div>
                </div>
                <button onclick="removeFromCartCompletely('${item.name}')" title="Excluir item" style="background:none; border:none; cursor:pointer; font-size: 1.1rem; color: #d9534f;">🗑️</button>
            `;
            cartContainer.appendChild(itemElement);
        });
    }

    cartCount.innerText = totalItems;
    cartTotal.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// 8. Enviar Pedido via WhatsApp
function sendToWhatsApp() {
    if (cart.length === 0) {
        alert("Sua sacola está vazia!");
        return;
    }

    let message = "Olá, Belinna Store! Gostaria de fazer o seguinte pedido:\n\n";
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        message += `• ${item.quantity}x ${item.name} - R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    });

    message += `\n*Total:* R$ ${total.toFixed(2).replace('.', ',')}\n\n`;
    message += "Como posso prosseguir com o pagamento e entrega?";

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`, '_blank');
}

// Função para abrir o zoom da imagem
function abrirZoom(srcImagem) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    
    modalImg.src = srcImagem;
    modal.classList.add('active');
}

// Função para fechar o zoom da imagem
function fecharZoom() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('active');
}
