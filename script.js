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

    // 2. Remove o destaque ativo de todos os botões do menu superior
    const navButtons = document.querySelectorAll('.tab-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));

    // 3. Procura a aba de destino pelo ID
    const targetTab = document.getElementById(tabId);
    
    if (targetTab) {
        // Exibe a aba encontrada
        targetTab.style.display = 'block';
        targetTab.classList.add('active');
        
        // Destaca o botão correspondente no menu superior
        navButtons.forEach(btn => {
            const onClickAttr = btn.getAttribute('onclick');
            if (onClickAttr && onClickAttr.includes(`'${tabId}'`)) {
                btn.classList.add('active');
            }
        });

        // Rola a tela suavemente para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.error("Aba não encontrada com o ID:", tabId);
    }

    // Garante que o botão do carrinho continue visível ao alternar abas
    const cartBtn = document.getElementById('cart-floating-btn');
    if (cartBtn) {
        cartBtn.style.display = 'flex';
    }
}

// ========================================================
// LÓGICA DO CARRINHO E INTERAÇÕES
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
    let cart = [];

    // Mover os elementos flutuantes para a raiz do BODY (evita sobreposição por abas)
    const cartFloatingBtn = document.getElementById("cart-floating-btn");
    const cartSidebar = document.getElementById("cart-sidebar");
    const modal = document.getElementById("janela-modal");

    if (cartFloatingBtn) document.body.appendChild(cartFloatingBtn);
    if (cartSidebar) document.body.appendChild(cartSidebar);
    if (modal) document.body.appendChild(modal);

    // Elementos do Carrinho Lateral
    const closeCartBtn = document.getElementById("close-cart-btn");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartTotalValue = document.getElementById("cart-total-value");
    const cartBadge = document.getElementById("cart-badge");
    const btnCheckoutWhatsapp = document.getElementById("btn-checkout-whatsapp");

    // Elementos do Modal de Imagem
    const imgAmpliada = document.getElementById("imagem-ampliada");
    const botaoFechar = document.querySelector(".fechar-modal");

    // ========================================================
    // DELEGAÇÃO GLOBAL DE CLIQUE (Funciona em todas as abas!)
    // ========================================================
    document.addEventListener("click", (e) => {

        // 1. DIMINUIR QUANTIDADE (-)
        if (e.target.matches(".minus") || e.target.closest(".minus")) {
            const btn = e.target.matches(".minus") ? e.target : e.target.closest(".minus");
            if (btn.hasAttribute("disabled")) return;
            const qtyInput = btn.parentElement.querySelector(".qty-input");
            if (qtyInput) {
                let currentValue = parseInt(qtyInput.value) || 1;
                if (currentValue > 1) qtyInput.value = currentValue - 1;
            }
            return;
        }

        // 2. AUMENTAR QUANTIDADE (+)
        if (e.target.matches(".plus") || e.target.closest(".plus")) {
            const btn = e.target.matches(".plus") ? e.target : e.target.closest(".plus");
            if (btn.hasAttribute("disabled")) return;
            const qtyInput = btn.parentElement.querySelector(".qty-input");
            if (qtyInput) {
                let currentValue = parseInt(qtyInput.value) || 1;
                qtyInput.value = currentValue + 1;
            }
            return;
        }

        // 3. ADICIONAR AO CARRINHO
        const btnAdd = e.target.closest(".btn-add-to-cart");
        if (btnAdd) {
            if (btnAdd.hasAttribute("disabled") || btnAdd.classList.contains("btn-disabled")) return;

            const productCard = btnAdd.closest(".product-card");
            if (!productCard) return;

            const id = productCard.getAttribute("data-id");
            const name = productCard.getAttribute("data-name");
            const price = parseFloat(productCard.getAttribute("data-price")) || 0;
            
            const qtyInput = productCard.querySelector(".qty-input");
            const quantity = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

            const existingProduct = cart.find(item => item.id === id);

            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.push({ id, name, price, quantity });
            }

            if (qtyInput) qtyInput.value = 1;

            updateCart();
            if (cartSidebar) cartSidebar.classList.add("open");
            return;
        }

        // 4. AMPLIAÇÃO DA FOTO (Abrangente para todas as abas)
        if (e.target.tagName === "IMG" && e.target.closest(".product-card")) {
            if (modal && imgAmpliada) {
                modal.style.display = "flex";
                imgAmpliada.src = e.target.src;
            }
            return;
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

    // FECHAR MODAL DE IMAGEM
    if (modal) {
        if (botaoFechar) {
            botaoFechar.addEventListener("click", () => {
                modal.style.display = "none";
            });
        }
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    }

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

        // BOTOES DENTRO DO CARRINHO
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
