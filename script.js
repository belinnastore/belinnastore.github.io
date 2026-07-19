let carrinho = [];
let qtys = { batom: 0 };

function toggleCart() { document.body.classList.toggle('cart-open'); }

function updateQty(id, delta) {
    qtys[id] = Math.max(0, qtys[id] + delta);
    document.getElementById('qty-'+id).innerText = qtys[id];
}

function addToCart(nome, preco, id) {
    if (qtys[id] === 0) return alert("Escolha uma quantidade!");
    let item = carrinho.find(i => i.nome === nome);
    if (item) item.qtd += qtys[id];
    else carrinho.push({ nome, preco, qtd: qtys[id] });
    renderCart();
    toggleCart();
}

function renderCart() {
    let container = document.getElementById('cart-items');
    container.innerHTML = '';
    let total = 0;
    carrinho.forEach((item, index) => {
        total += item.preco * item.qtd;
        container.innerHTML += `<div class="cart-item">${item.qtd}x ${item.nome} <button onclick="carrinho.splice(${index},1); renderCart()">🗑️</button></div>`;
    });
    document.getElementById('cart-total').innerText = 'R$ ' + total.toFixed(2);
}

function finalizar() {
    let msg = "Olá! Gostaria de finalizar: " + carrinho.map(i => i.qtd + "x " + i.nome).join(", ");
    window.open(`https://api.whatsapp.com/send?phone=5511993610210&text=${encodeURIComponent(msg)}`);
}
