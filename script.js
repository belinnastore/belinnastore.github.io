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
    });

    // ========================================================
    // ABRIR E FECHAR O CARRINHO
    // ========================================================
    cartFloatingBtn.addEventListener("click", () => {
        cartSidebar.classList.add("open");
    });

    closeCartBtn.addEventListener("click", () => {
        cartSidebar.classList.remove("open");
    });

    // ========================================================
    // ADICIONAR AO CARRINHO
    // ========================================================
    document.querySelectorAll(".btn-add-to-cart").forEach(button => {
        button.addEventListener("click", (e) => {
            // Encontra o card do produto mais próximo para pegar os dados
            const productCard = e.target.closest(".product-card");
            const id = productCard.getAttribute("data-id");
            const name = productCard.getAttribute("data-name");
            const price = parseFloat(productCard.getAttribute("data-price"));
            
            // Pega a quantidade selecionada naquele card específico
            const qtyInput = productCard.querySelector(".qty-input");
            const quantity = parseInt(qtyInput.value) || 1;

            // Verifica se o produto já está no carrinho
            const existingProduct = cart.find(item => item.id === id);

            if (existingProduct) {
                // Se já existir, soma a nova quantidade
                existingProduct.quantity += quantity;
            } else {
                // Se não existir, adiciona como um novo item
                cart.push({ id, name, price, quantity });
            }

            // Reseta o seletor de quantidade do card de volta para 1
            qtyInput.value = 1;

            // Atualiza a tela do carrinho e abre ele automaticamente para o cliente ver
            updateCart();
            cartSidebar.classList.add("open");
        });
    });

    // ========================================================
    // ATUALIZAR INTERFACE DO CARRINHO
    // ========================================================
    function updateCart() {
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

                // Cria o HTML de cada item dentro do carrinho lateral
                const itemElement = document.createElement("div");
                itemElement.classList.add("cart-item");
                itemElement.innerHTML = `
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <span>${item.quantity}x - R$ ${item.price.toFixed(2).replace(".", ",")}</span>
                    </div>
                    <button class="btn-remove-item" data-id="${item.id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }

        // Atualiza o valor total formatado em Reais
        cartTotalValue.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
        // Atualiza a bolinha vermelha com o número de itens
        cartBadge.textContent = totalItems;

        // Adiciona evento de clique para remover itens individuais
        document.querySelectorAll(".btn-remove-item").forEach(button => {
            button.addEventListener("click", (e) => {
                const idToRemove = e.target.closest(".btn-remove-item").getAttribute("data-id");
                cart = cart.filter(item => item.id !== idToRemove);
                updateCart();
            });
        });
    }

    // ========================================================
    // ENVIAR PEDIDO PARA O WHATSAPP
    // ========================================================
    btnCheckoutWhatsapp.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Seu carrinho está vazio! Adicione produtos antes de enviar.");
            return;
        }

        // Monta o texto da mensagem formatado
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

        // Codifica o texto para o formato que o link do WhatsApp aceita
        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = "5511993610210"; // Número que já estava no seu HTML

        // Abre a janela do WhatsApp com a mensagem pronta
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
    });
});
