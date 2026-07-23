// ========================================================
// FUNÇÃO PARA NAVEGAR ENTRE AS ABAS / SEÇÕES
// ========================================================
function switchTab(tabId) {
    // 1. Oculta todas as seções/abas
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
    });

    // 2. Procura a aba de destino pelo ID
    const targetTab = document.getElementById(tabId);
    
    if (targetTab) {
        // Exibe a aba encontrada
        targetTab.style.display = 'block';
        targetTab.classList.add('active');
        
        // Rola a tela suavemente para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.error("Aba não encontrada com o ID:", tabId);
    }
}

// ========================================================
// LÓGICA DO CARRINHO E INTERAÇÕES (Após carregar o DOM)
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
    // Array que vai guardar os itens que o usuário adicionar no carrinho
    let cart = [];

    // Elementos do Carrinho Lateral (Sidebar)
    const cartSidebar = document.getElementById("cart-sidebar");
    const cartFloatingBtn = document.getElementById("cart-floating-btn");
    const closeCartBtn = document.getElementById("close-cart-btn");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartTotalValue = document.getElementById("cart-total-value");
    const cartBadge = document.getElementById("cart-badge");
    const btnCheckoutWhatsapp = document.getElementById("btn-checkout-whatsapp");

    // ========================================================
    // CONTROLE DE QUANTIDADE nos cards de produtos (+ e -)
    // ========================================================
    document.querySelectorAll(".quantity-selector").forEach(selector => {
        const minusBtn = selector.querySelector(".minus");
        const plusBtn = selector.querySelector(".plus");
        const qtyInput = selector.querySelector(".qty-input");

        if (minusBtn && plusBtn && qtyInput) {
            minusBtn.addEventListener("click", () => {
                let currentValue = parseInt(qtyInput.value) || 1;
                if (currentValue > 1) {
                    qtyInput.value = currentValue - 1;
                }
            });

            plusBtn.addEventListener("click", () => {
                let currentValue = parseInt(qtyInput.value) || 1;
                qtyInput.value = currentValue + 1;
            });
        }
    });

    // ========================================================
    // ABRIR E FECHAR O CARRINHO
    // ========================================================
    if (cartFloatingBtn && cartSidebar) {
        cartFloatingBtn.addEventListener("click", () => {
            cartSidebar.classList.add("open");
        });
    }

    if (closeCartBtn && cartSidebar) {
        closeCartBtn.addEventListener("click", () => {
            cartSidebar.classList.remove("open");
        });
    }

    // ========================================================
    // ADICIONAR AO CARRINHO
    // ========================================================
    document.querySelectorAll(".btn-add-to-cart").forEach(button => {
        button.addEventListener("click", (e) => {
            const productCard = e.target.closest(".product-card");
            if (!productCard) return;

            const id = productCard.getAttribute("data-id");
            const name = productCard.getAttribute("data-name");
            const price = parseFloat(productCard.getAttribute("data-price"));
            
            const qtyInput = productCard.querySelector(".qty-input");
            const quantity = parseInt(qtyInput.value) || 1;

            const existingProduct = cart.find(item => item.id === id);

            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.push({ id, name, price, quantity });
            }

            if (qtyInput) qtyInput.value = 1;

            updateCart();
            if (cartSidebar) cartSidebar.classList.add("open");
        });
    });

    // ========================================================
    // ATUALIZAR INTERFACE DO CARRINHO
    // ========================================================
    function updateCart() {
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = "";
        let total = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-text">Seu carrinho está vazio.</p>';
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                totalItems += item.quantity;

                const itemElement = document.createElement("div");
                itemElement.classList.add("cart-item");
                itemElement.innerHTML = `
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <div class="cart-item-qty-selector">
                            <button class="btn-cart-minus" data-id="${item.id}">-</button>
                            <span class="cart-item-qty">${item.quantity}</span>
                            <button class="btn-cart-plus" data-id="${item.id}">+</button>
                            <span class="cart-item-price-unit">x R$ ${item.price.toFixed(2).replace(".", ",")}</span>
                        </div>
                    </div>
                    <button class="btn-remove-item" data-id="${item.id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }

        if (cartTotalValue) cartTotalValue.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
        if (cartBadge) cartBadge.textContent = totalItems;

        // EVENTOS DOS BOTÕES DENTRO DO CARRINHO
        document.querySelectorAll(".btn-cart-minus").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                const product = cart.find(item => item.id === id);
                
                if (product) {
                    if (product.quantity > 1) {
                        product.quantity -= 1;
                    } else {
                        cart = cart.filter(item => item.id !== id);
                    }
                    updateCart();
                }
            });
        });

        document.querySelectorAll(".btn-cart-plus").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                const product = cart.find(item => item.id === id);
                
                if (product) {
                    product.quantity += 1;
                    updateCart();
                }
            });
        });

        document.querySelectorAll(".btn-remove-item").forEach(button => {
            button.addEventListener("click", (e) => {
                const btn = e.target.closest(".btn-remove-item");
                const idToRemove = btn.getAttribute("data-id");
                cart = cart.filter(item => item.id !== idToRemove);
                updateCart();
            });
        });
    }

    // ========================================================
    // ENVIAR PEDIDO PARA O WHATSAPP
    // ========================================================
    if (btnCheckoutWhatsapp) {
        btnCheckoutWhatsapp.addEventListener("click", () => {
            if (cart.length === 0) {
                alert("Seu carrinho está vazio! Adicione produtos antes de enviar.");
                return;
            }

            let message = "🛍️ *Novo Pedido - Belinna Store* 🛍️\n\n";
            let total = 0;

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                message += `• *${item.name}*\n  Qtd: ${item.quantity} x R$ ${item.price.toFixed(2).replace(".", ",")} = *R$ ${itemTotal.toFixed(2).replace(".", ",")}*\n\n`;
            });

            message += `=========================\n`;
            message += `💰 *Total do Pedido: R$ ${total.toFixed(2).replace(".", ",")}*\n\n`;
            message += `Gostaria de prosseguir com o pagamento e combinar a entrega! ✨`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappNumber = "5511993610210"; 

            window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
        });
    }
});
