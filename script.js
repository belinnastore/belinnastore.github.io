// ========================================================
// FUNÇÃO PARA NAVEGAR ENTRE AS ABAS / SEÇÕES (UNIFICADA)
// ========================================================
function switchTab(tabId) {
    if (!tabId) return;

    // 1. Tratamento e limpeza do ID (Remove acentos, espaços e deixa minúsculo)
    const cleanId = String(tabId)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    // 2. Oculta TODAS as seções/abas do site
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        tab.style.setProperty('display', 'none', 'important');
    });

    // 3. Remove o destaque de todos os botões do menu
    const navButtons = document.querySelectorAll('.tab-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));

    // 4. Procura a aba pelo ID limpo
    let targetTab = document.getElementById(cleanId);

    // Mapeamento de segurança para nomes com hífens ou nomes compostos
    if (!targetTab) {
        if (cleanId.includes('bemestar') || cleanId.includes('intimidade')) {
            targetTab = document.getElementById('bem-estar') || document.getElementById('intimidade');
        } else if (cleanId.includes('-')) {
            targetTab = document.getElementById(cleanId.replace(/-/g, ''));
        }
    }

    // 5. Exibe a aba encontrada
    if (targetTab) {
        targetTab.classList.add('active');
        targetTab.style.setProperty('display', 'block', 'important');

        // Destaca o botão ativado no menu
        navButtons.forEach(btn => {
            const onClickAttr = btn.getAttribute('onclick') || '';
            const btnCleanAttr = onClickAttr
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();

            if (btnCleanAttr.includes(`'${cleanId}'`) || btnCleanAttr.includes(`"${cleanId}"`)) {
                btn.classList.add('active');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.error("Aba não encontrada no HTML com o ID:", cleanId);
    }

    // Garante que o botão flutuante do carrinho continue visível
    const cartBtn = document.getElementById('cart-floating-btn');
    if (cartBtn) cartBtn.style.display = 'flex';
}

// ========================================================
// LÓGICA DO CARRINHO E INTERAÇÕES (DOM LOADED)
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
    let cart = [];

    const cartFloatingBtn = document.getElementById("cart-floating-btn");
    const cartSidebar = document.getElementById("cart-sidebar");
    const modal = document.getElementById("janela-modal");

    if (cartFloatingBtn) document.body.appendChild(cartFloatingBtn);
    if (cartSidebar) document.body.appendChild(cartSidebar);
    if (modal) document.body.appendChild(modal);

    const closeCartBtn = document.getElementById("close-cart-btn");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartTotalValue = document.getElementById("cart-total-value");
    const cartBadge = document.getElementById("cart-badge");
    const btnCheckoutWhatsapp = document.getElementById("btn-checkout-whatsapp");

    const imgAmpliada = document.getElementById("imagem-ampliada");
    const botaoFechar = document.querySelector(".fechar-modal");

    // Exibe a aba Home por padrão ao carregar a página
    switchTab('home');

    // Delegador de Eventos de Clique
    document.addEventListener("click", (e) => {
        // Quantidade (-)
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

        // Quantidade (+)
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

        // Adicionar ao Carrinho
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

        // Zoom Imagem
        if (e.target.tagName === "IMG" && e.target.closest(".product-card")) {
            if (e.target.classList.contains("thumb")) return;

            if (modal && imgAmpliada) {
                modal.style.display = "flex";
                imgAmpliada.src = e.target.src;
            }
            return;
        }
    });

    if (cartFloatingBtn && cartSidebar) {
        cartFloatingBtn.addEventListener("click", () => cartSidebar.classList.add("open"));
    }

    if (closeCartBtn && cartSidebar) {
        closeCartBtn.addEventListener("click", () => cartSidebar.classList.remove("open"));
    }

    if (modal) {
        if (botaoFechar) {
            botaoFechar.addEventListener("click", () => modal.style.display = "none");
        }
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.style.display = "none";
        });
    }

    // Função interna para atualizar dados do carrinho
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

    // Checkout para o WhatsApp
    if (btnCheckoutWhatsapp) {
        btnCheckoutWhatsapp.addEventListener("click", () => {
            if (cart.length === 0) {
                alert("Seu carrinho está vazio!");
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

// Troca de imagem miniatura (Thumb)
function changeProductImage(thumbElement) {
    const container = thumbElement.closest('.product-image-container');
    if (!container) return;
    const mainImg = container.querySelector('.main-product-img');
    const allThumbs = container.querySelectorAll('.thumb');

    if (mainImg) mainImg.src = thumbElement.src;
    allThumbs.forEach(thumb => thumb.classList.remove('active'));
    thumbElement.classList.add('active');
}
