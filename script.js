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

// 4. Remover ou decrementar item
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCartUI();
}

// 5. Atualizar a visualização da Sacola
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
                    <p>Qty: ${item.quantity} x R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                </div>
                <button onclick="removeFromCart('${item.name}')">&times;</button>
            `;
            cartContainer.appendChild(itemElement);
        });
    }

    cartCount.innerText = totalItems;
    cartTotal.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// 6. Enviar Pedido via WhatsApp
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
