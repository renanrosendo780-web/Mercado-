
/* =========================================================
   MERCADO CONFIANÇA — SMART MARKET
   SCRIPT PRINCIPAL 2.1
   Funcionalidades, animações e interatividade
========================================================= */


/* =========================================================
   1. CONFIGURAÇÕES
========================================================= */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

const STORAGE = {
    cart: "mercadoConfiancaCart",
    favorites: "mercadoConfiancaFavorites",
    history: "mercadoConfiancaHistory",
    prePurchases: "mercadoConfiancaPrePurchases"
};

const catalogSearch = $("#catalogSearch");
const headerSearch = $("#searchInput");

const categoryFilter = $("#categoryFilter");
const letterFilter = $("#letterFilter");
const clearFilters = $("#clearFilters");
const filterResults = $("#filterResults");

const filterToggle = $("#toggleCatalogFilters");
const catalogFilters = $("#catalogFilters");

const openCartButton = $("#openCart");

const detailsPanel = $("#productDetailsPanel");
const detailsOverlay = $("#detailsOverlay");

const menuButton = $("#openMarketMenu");
const menuOverlay = $("#marketMenuOverlay");
const menuPanel = $("#marketMenuPanel");

let selectedGridColumns = 4;


/* =========================================================
   2. ARMAZENAMENTO
========================================================= */

function loadStorage(key, fallback) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return data ?? fallback;
    } catch (error) {
        console.warn("Erro ao carregar armazenamento:", error);
        return fallback;
    }
}

function saveStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("Erro ao salvar dados:", error);
        showNotification("Não foi possível salvar os dados.", "error");
    }
}

let cart = loadStorage(STORAGE.cart, {});
let favorites = loadStorage(STORAGE.favorites, []);
let purchaseHistory = loadStorage(STORAGE.history, []);
let prePurchases = loadStorage(STORAGE.prePurchases, []);

// Garante que os dados carregados tenham o formato esperado.
if (!cart || typeof cart !== "object" || Array.isArray(cart)) {
    cart = {};
}

if (!Array.isArray(favorites)) favorites = [];
if (!Array.isArray(purchaseHistory)) purchaseHistory = [];
if (!Array.isArray(prePurchases)) prePurchases = [];


/* =========================================================
   3. FUNÇÕES AUXILIARES
========================================================= */

function formatPrice(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function getProductData(card) {
    const name =
        card.dataset.name ||
        $("h3", card)?.textContent.trim() ||
        "Produto";

    const category =
        card.dataset.category ||
        $(".product-category", card)?.textContent.trim() ||
        "Outros";

    const priceText =
        card.dataset.price ||
        $(".product-price", card)?.textContent ||
        "0";

    let normalized = String(priceText)
        .replace(/[^\d,.-]/g, "")
        .trim();

    if (normalized.includes(",")) {
        normalized = normalized
            .replace(/\./g, "")
            .replace(",", ".");
    }

    const price = Number(normalized) || 0;

    const image =
        card.dataset.image ||
        $("img", card)?.src ||
        "";

    const description =
        card.dataset.description ||
        $(".product-description", card)?.textContent.trim() ||
        "Produto disponível no Mercado Confiança.";

    const id = `${name}|${category}|${price}`;

    return {
        id,
        name,
        category,
        price,
        image,
        description
    };
}

function getAllProductCards() {
    return $$(".product-card");
}


/* =========================================================
   4. NOTIFICAÇÕES ANIMADAS
========================================================= */

let notificationTimer;

function showNotification(message, type = "success") {
    let notification = $(".market-notification");

    if (!notification) {
        notification = document.createElement("div");
        notification.className = "market-notification";
        notification.setAttribute("role", "status");
        notification.setAttribute("aria-live", "polite");

        document.body.appendChild(notification);
    }

    notification.textContent = message;

    notification.classList.remove("success", "error", "show");
    notification.classList.add(type);

    requestAnimationFrame(() => {
        notification.classList.add("show");
    });

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(() => {
        notification.classList.remove("show");
    }, 1500);
}


/* =========================================================
   5. CONTROLE DE ROLAGEM
========================================================= */

function lockPage() {
    document.body.classList.add("panel-open");
    document.body.style.overflow = "hidden";
}

function unlockPageIfPossible() {
    const cartOpen = $("#cartPanel")?.classList.contains("open");
    const detailsOpen = detailsPanel?.classList.contains("open");
    const menuOpen = menuOverlay?.classList.contains("open");
    const informationOpen = $("#informationPanel")?.classList.contains("open");

    if (!cartOpen && !detailsOpen && !menuOpen && !informationOpen) {
        document.body.classList.remove("panel-open");
        document.body.style.overflow = "";
    }
}


/* =========================================================
   6. MENU LATERAL
========================================================= */

function openMarketMenu() {
    if (!menuOverlay) {
        showNotification("Menu lateral não encontrado no HTML.", "error");
        return;
    }

    menuOverlay.classList.add("open");
    menuOverlay.setAttribute("aria-hidden", "false");

    menuPanel?.classList.add("open");

    lockPage();
}

function closeMarketMenu() {
    menuOverlay?.classList.remove("open", "active", "show");
    menuOverlay?.setAttribute("aria-hidden", "true");

    menuPanel?.classList.remove("open", "active", "show");

    unlockPageIfPossible();
}

menuButton?.addEventListener("click", openMarketMenu);

$("#closeMarketMenu")?.addEventListener("click", closeMarketMenu);

menuOverlay?.addEventListener("click", event => {
    if (event.target === menuOverlay) {
        closeMarketMenu();
    }
});

$$(".market-menu-item", menuPanel || document).forEach(item => {
    item.addEventListener("click", () => {
        if (item.tagName === "A") {
            closeMarketMenu();
        }
    });
});


/* =========================================================
   7. FILTROS — ABRIR E FECHAR
========================================================= */

function toggleCatalogFilters() {
    if (!catalogFilters) return;

    const isHidden = catalogFilters.hidden;

    catalogFilters.hidden = !isHidden;

    if (filterToggle) {
        filterToggle.setAttribute("aria-expanded", String(isHidden));

        filterToggle.textContent = isHidden
            ? "✕ Fechar filtros"
            : "☷ Filtrar produtos";
    }

    if (isHidden) {
        setTimeout(() => {
            catalogFilters.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }, 100);
    }
}

filterToggle?.addEventListener("click", toggleCatalogFilters);


/* =========================================================
   8. FAVORITOS — CORRIGIDO
========================================================= */

// Atualiza os corações de todos os produtos.
function updateFavoriteButtons() {
    getAllProductCards().forEach(card => {
        const button = $(".favorite-button", card);

        if (!button) return;

        const product = getProductData(card);
        const active = favorites.includes(product.id);

        button.classList.toggle("active", active);
        button.textContent = active ? "♥" : "♡";

        button.setAttribute(
            "aria-label",
            active
                ? "Remover dos favoritos"
                : "Adicionar aos favoritos"
        );

        button.setAttribute("aria-pressed", String(active));
    });
}

// Atualiza o coração do painel de detalhes.
function updateDetailsFavoriteButton(product) {
    const button = $("#detailsFavorite");

    if (!button || !product) return;

    const active = favorites.includes(product.id);

    button.classList.toggle("active", active);
    button.textContent = active ? "♥" : "♡";

    button.setAttribute(
        "aria-label",
        active
            ? "Remover dos favoritos"
            : "Adicionar aos favoritos"
    );

    button.setAttribute("aria-pressed", String(active));
}

// Adiciona ou remove um produto dos favoritos.
function toggleFavorite(product) {
    if (!product || !product.id) return;

    const index = favorites.indexOf(product.id);

    if (index !== -1) {
        favorites.splice(index, 1);

        showNotification(
            `${product.name} removido dos favoritos.`
        );
    } else {
        favorites.push(product.id);

        showNotification(
            `${product.name} adicionado aos favoritos!`
        );
    }

    saveStorage(STORAGE.favorites, favorites);

    updateFavoriteButtons();

    if (
        detailsPanel?.classList.contains("open") &&
        String(detailsPanel.dataset.productId) === String(product.id)
    ) {
        updateDetailsFavoriteButton(product);
    }
}

// Favorito dentro do painel de detalhes.
$("#detailsFavorite")?.addEventListener("click", () => {
    const id = detailsPanel?.dataset.productId;

    if (!id) {
        showNotification("Produto não encontrado.", "error");
        return;
    }

    const card = getAllProductCards().find(item =>
        String(getProductData(item).id) === String(id)
    );

    if (!card) {
        showNotification(
            "Não foi possível localizar o produto.",
            "error"
        );
        return;
    }

    toggleFavorite(getProductData(card));
});


/* =========================================================
   9. CRIAÇÃO DO CARRINHO
========================================================= */

function createCartPanel() {
    if ($("#cartPanel")) return;

    const overlay = document.createElement("div");

    overlay.id = "cartOverlay";
    overlay.className = "panel-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const panel = document.createElement("aside");

    panel.id = "cartPanel";
    panel.className = "cart-panel";
    panel.setAttribute("aria-label", "Meu carrinho");

    panel.innerHTML = `
        <div class="panel-header">
            <h2>Meu carrinho</h2>

            <button
                class="panel-close"
                id="closeCart"
                aria-label="Fechar carrinho"
            >
                ×
            </button>
        </div>

        <div class="cart-content" id="cartItems"></div>

        <div class="cart-footer">
            <p>
                Subtotal
                <strong id="cartSubtotal">R$ 0,00</strong>
            </p>

            <button class="checkout-button" id="checkoutButton">
                Finalizar compra
            </button>
        </div>
    `;

    document.body.append(overlay, panel);

    overlay.addEventListener("click", closeCart);

    $("#closeCart", panel).addEventListener("click", closeCart);

    $("#checkoutButton", panel).addEventListener("click", checkout);

    panel.addEventListener("click", handleCartClick);
}


/* =========================================================
   10. ABRIR E FECHAR CARRINHO
========================================================= */

function openCart() {
    createCartPanel();

    const panel = $("#cartPanel");
    const overlay = $("#cartOverlay");

    closeDetailsPanel();
    closeMarketMenu();

    panel.classList.add("open");
    overlay.classList.add("show");

    overlay.setAttribute("aria-hidden", "false");

    lockPage();

    renderCart();

    setTimeout(() => {
        $("#closeCart")?.focus();
    }, 200);
}

function closeCart() {
    $("#cartPanel")?.classList.remove("open");
    $("#cartOverlay")?.classList.remove("show");

    $("#cartOverlay")?.setAttribute("aria-hidden", "true");

    unlockPageIfPossible();
}

openCartButton?.addEventListener("click", openCart);

$("#menuOpenCart")?.addEventListener("click", () => {
    closeMarketMenu();
    openCart();
});


/* =========================================================
   11. ADICIONAR PRODUTOS AO CARRINHO
========================================================= */

function addToCart(product, quantity = 1) {
    if (!product || product.price <= 0) {
        showNotification(
            "Não foi possível adicionar esse produto.",
            "error"
        );
        return;
    }

    const safeQuantity = Math.max(
        1,
        Math.min(99, Math.floor(Number(quantity) || 1))
    );

    if (cart[product.id]) {
        cart[product.id].quantity += safeQuantity;
    } else {
        cart[product.id] = {
            ...product,
            quantity: safeQuantity
        };
    }

    saveStorage(STORAGE.cart, cart);

    updateCartCount();
    renderCart();

    const unitLabel = safeQuantity === 1 ? "unidade" : "unidades";

    showNotification(
        `${safeQuantity} ${unitLabel} de ${product.name} adicionado(s) ao carrinho!`
    );
}


/* =========================================================
   12. RENDERIZAR CARRINHO
========================================================= */

// Atualiza a quantidade exibida no ícone do carrinho.
function updateCartCount() {
    const total = Object.values(cart).reduce(
        (sum, item) => sum + Math.max(0, Number(item.quantity) || 0),
        0
    );

    $$(".cart-count").forEach(element => {
        element.textContent = total;
        element.setAttribute("aria-label", `${total} itens no carrinho`);
        element.hidden = total === 0;
    });
}

function renderCart() {
    const container = $("#cartItems");
    const subtotalElement = $("#cartSubtotal");

    if (!container || !subtotalElement) return;

    const items = Object.values(cart);

    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <h3>Seu carrinho está vazio</h3>

                <p>
                    Adicione produtos para começar suas compras!
                </p>
            </div>
        `;

        subtotalElement.textContent = formatPrice(0);

        return;
    }

    let subtotal = 0;

    container.innerHTML = items.map(item => {
        const itemTotal = item.price * item.quantity;

        subtotal += itemTotal;

        return `
            <div class="cart-item" data-id="${escapeHTML(item.id)}">

                <img
                    src="${escapeHTML(item.image)}"
                    alt="${escapeHTML(item.name)}"
                >

                <div class="cart-item-info">

                    <h3>${escapeHTML(item.name)}</h3>

                    <p>${formatPrice(item.price)}</p>

                    <div class="quantity-controls">

                        <button
                            data-action="decrease"
                            aria-label="Diminuir quantidade"
                        >−</button>

                        <span>${item.quantity}</span>

                        <button
                            data-action="increase"
                            aria-label="Aumentar quantidade"
                        >+</button>

                        <button
                            class="remove-cart-item"
                            data-action="remove"
                        >
                            Remover
                        </button>

                    </div>

                </div>
            </div>
        `;
    }).join("");

    subtotalElement.textContent = formatPrice(subtotal);
}


/* =========================================================
   13. ALTERAR QUANTIDADE E REMOVER PRODUTOS
========================================================= */

function handleCartClick(event) {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const itemElement = button.closest(".cart-item");

    if (!itemElement) return;

    const id = itemElement.dataset.id;
    const action = button.dataset.action;

    if (!cart[id]) return;

    if (action === "increase") {
        cart[id].quantity++;
    }

    if (action === "decrease") {
        cart[id].quantity--;

        if (cart[id].quantity <= 0) {
            delete cart[id];
        }
    }

    if (action === "remove") {
        delete cart[id];

        showNotification("Produto removido do carrinho.");
    }

    saveStorage(STORAGE.cart, cart);

    updateCartCount();
    renderCart();
}


/* =========================================================
   14. FINALIZAÇÃO E HISTÓRICO
========================================================= */

function checkout() {
    const items = Object.values(cart);

    if (items.length === 0) {
        showNotification("Seu carrinho está vazio.", "error");
        return;
    }

    const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const purchase = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: items.map(item => ({ ...item })),
        total
    };

    purchaseHistory.unshift(purchase);

    saveStorage(STORAGE.history, purchaseHistory);

    showNotification(
        "Resumo salvo! O pagamento ainda precisa ser integrado."
    );
}


/* =========================================================
   15. PAINEL DE DETALHES
========================================================= */

function openDetailsPanel(card) {
    if (!detailsPanel) {
        showNotification("Painel de detalhes não encontrado.", "error");
        return;
    }

    const product = getProductData(card);

    closeCart();
    closeMarketMenu();

    detailsPanel.dataset.productId = product.id;

    const image = $("#detailsImage");
    const category = $("#detailsCategory");
    const name = $("#detailsName");
    const description = $("#detailsDescription");
    const price = $("#detailsPrice");

    if (image) {
        image.src = product.image;
        image.alt = product.name;
    }

    if (category) category.textContent = product.category;
    if (name) name.textContent = product.name;
    if (description) description.textContent = product.description;
    if (price) price.textContent = formatPrice(product.price);

    setDetailsQuantity(1);

    detailsPanel.classList.add("open");

    if (detailsOverlay) {
        detailsOverlay.classList.add("show");
        detailsOverlay.setAttribute("aria-hidden", "false");
    }

    lockPage();

    updateDetailsFavoriteButton(product);
}

function closeDetailsPanel() {
    detailsPanel?.classList.remove("open");

    detailsOverlay?.classList.remove("show", "active", "open");

    detailsOverlay?.setAttribute("aria-hidden", "true");

    unlockPageIfPossible();
}

$("#closeDetails")?.addEventListener("click", closeDetailsPanel);

detailsOverlay?.addEventListener("click", event => {
    if (event.target === detailsOverlay) {
        closeDetailsPanel();
    }
});


/* =========================================================
   16. QUANTIDADE NOS DETALHES
========================================================= */

const decreaseDetails = $("#decreaseDetailsQuantity");
const increaseDetails = $("#increaseDetailsQuantity");
const detailsQuantity = $("#detailsQuantity");

function getDetailsQuantity() {
    const value = detailsQuantity?.tagName === "INPUT"
        ? detailsQuantity.value
        : detailsQuantity?.textContent;

    return Math.max(1, Math.min(99, Math.floor(Number(value) || 1)));
}

function setDetailsQuantity(value) {
    if (!detailsQuantity) return;

    const quantity = Math.max(
        1,
        Math.min(99, Math.floor(Number(value) || 1))
    );

    if (detailsQuantity.tagName === "INPUT") {
        detailsQuantity.value = quantity;
    } else {
        detailsQuantity.textContent = quantity;
    }
}

decreaseDetails?.addEventListener("click", () => {
    setDetailsQuantity(getDetailsQuantity() - 1);
});

increaseDetails?.addEventListener("click", () => {
    setDetailsQuantity(getDetailsQuantity() + 1);
});

detailsQuantity?.addEventListener("change", () => {
    setDetailsQuantity(getDetailsQuantity());
});


/* =========================================================
   17. ADICIONAR A PARTIR DOS DETALHES
========================================================= */

$("#detailsAddCart")?.addEventListener("click", () => {
    const id = detailsPanel?.dataset.productId;

    const card = getAllProductCards().find(
        item => String(getProductData(item).id) === String(id)
    );

    if (!card) {
        showNotification("Produto não encontrado.", "error");
        return;
    }

    const product = getProductData(card);
    const quantity = getDetailsQuantity();

    closeDetailsPanel();

    addToCart(product, quantity);
});


/* =========================================================
   18. BOTÕES DOS PRODUTOS
========================================================= */

document.addEventListener("click", event => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const addButton = target.closest(
        ".add-cart, .add-cart-button, .add-button"
    );

    const favoriteButton = target.closest(".favorite-button");

    const detailsButton = target.closest(".details-button");

    if (!addButton && !favoriteButton && !detailsButton) return;

    const card = target.closest(".product-card");

    if (!card) return;

    const product = getProductData(card);

    if (addButton) {
        addToCart(product);
    }

    if (favoriteButton) {
        toggleFavorite(product);
    }

    if (detailsButton) {
        openDetailsPanel(card);
    }
});


/* =========================================================
   19. FILTROS DO CATÁLOGO
========================================================= */

function filterProducts() {
    const search = (catalogSearch?.value || "")
        .trim()
        .toLocaleLowerCase("pt-BR");

    const category = categoryFilter?.value || "";
    const letter = letterFilter?.value || "";

    let visible = 0;

    getAllProductCards().forEach(card => {
        const product = getProductData(card);

        const name = product.name.toLocaleLowerCase("pt-BR");
        const productCategory = product.category.toLocaleLowerCase("pt-BR");

        const matchesSearch =
            name.includes(search) ||
            productCategory.includes(search);

        const matchesCategory =
            !category ||
            product.category === category;

        const matchesLetter =
            !letter ||
            name.startsWith(letter.toLocaleLowerCase("pt-BR"));

        const show =
            matchesSearch &&
            matchesCategory &&
            matchesLetter;

        card.hidden = !show;
        card.style.display = show ? "" : "none";

        if (show) visible++;
    });

    if (filterResults) {
        filterResults.textContent =
            `${visible} produto(s) encontrado(s)`;
    }
}

catalogSearch?.addEventListener("input", () => {
    if (headerSearch) {
        headerSearch.value = catalogSearch.value;
    }

    filterProducts();
});

headerSearch?.addEventListener("input", () => {
    if (catalogSearch) {
        catalogSearch.value = headerSearch.value;
    }

    filterProducts();
});

$("#searchForm")?.addEventListener("submit", event => {
    event.preventDefault();

    if (catalogSearch && headerSearch) {
        catalogSearch.value = headerSearch.value;
    }

    filterProducts();

    $("#produtos")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

categoryFilter?.addEventListener("change", filterProducts);
letterFilter?.addEventListener("change", filterProducts);

clearFilters?.addEventListener("click", () => {
    if (catalogSearch) catalogSearch.value = "";
    if (headerSearch) headerSearch.value = "";

    if (categoryFilter) categoryFilter.value = "";
    if (letterFilter) letterFilter.value = "";

    $$(".category-card").forEach(card => {
        card.classList.remove("active");
    });

    filterProducts();

    showNotification("Filtros limpos!");
});


/* =========================================================
   20. CATEGORIAS
========================================================= */

$$(".category-card[data-category]").forEach(card => {
    card.addEventListener("click", () => {
        const category = card.dataset.category;

        if (categoryFilter) {
            categoryFilter.value = category;
        }

        $$(".category-card").forEach(item => {
            item.classList.remove("active");
        });

        card.classList.add("active");

        filterProducts();

        $("#produtos")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});


/* =========================================================
   21. VISUALIZAÇÃO 2X, 4X E 5X
========================================================= */

function applyGridColumns(columns) {
    selectedGridColumns = columns;

    $$(".products-grid").forEach(grid => {
        grid.style.gridTemplateColumns =
            `repeat(${columns}, minmax(0, 1fr))`;
    });

    $$(".grid-option").forEach(button => {
        const active =
            Number(button.dataset.columns) === columns;

        button.classList.toggle("active", active);

        button.setAttribute("aria-pressed", String(active));
    });
}

$$(".grid-option").forEach(button => {
    button.addEventListener("click", () => {
        const columns = Number(button.dataset.columns);

        if (![2, 4, 5].includes(columns)) return;

        applyGridColumns(columns);
    });
});

applyGridColumns(
    window.innerWidth <= 700 ? 2 : 4
);


/* =========================================================
   22. HISTÓRICO DE COMPRAS
========================================================= */

function openHistory() {
    closeMarketMenu();

    const historyHTML = purchaseHistory.length
        ? purchaseHistory.map(purchase => `
            <div class="history-item">
                <div>
                    <h3>Compra #${purchase.id}</h3>
                    <p>${new Date(purchase.date).toLocaleString("pt-BR")}</p>
                    <p>${purchase.items.length} tipo(s) de produto</p>
                </div>

                <strong>${formatPrice(purchase.total)}</strong>
            </div>
        `).join("")
        : `
            <div class="empty-state">
                <h3>Nenhuma compra registrada</h3>
                <p>Suas compras concluídas aparecerão aqui.</p>
            </div>
        `;

    openInformationPanel("Histórico de compras", historyHTML);
}


/* =========================================================
   23. PRÉ-COMPRAS
========================================================= */

function openPrePurchases() {
    closeMarketMenu();

    const content = prePurchases.length
        ? prePurchases.map(item => `
            <div class="pre-purchase-item">
                <div>
                    <h3>${escapeHTML(item.name)}</h3>
                    <p>${formatPrice(item.price)}</p>
                </div>

                <button
                    class="primary-button"
                    data-prepurchase-add="${escapeHTML(item.id)}"
                >
                    Adicionar
                </button>
            </div>
        `).join("")
        : `
            <div class="empty-state">
                <h3>Nenhuma pré-compra salva</h3>
                <p>Você poderá organizar produtos para suas próximas compras aqui.</p>
            </div>
        `;

    openInformationPanel("Minhas pré-compras", content);
}

function openInformationPanel(title, content) {
    let overlay = $("#informationOverlay");
    let panel = $("#informationPanel");

    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "informationOverlay";
        overlay.className = "panel-overlay";

        panel = document.createElement("aside");
        panel.id = "informationPanel";
        panel.className = "market-panel";

        document.body.append(overlay, panel);

        overlay.addEventListener("click", closeInformationPanel);
    }

    panel.innerHTML = `
        <div class="panel-header">
            <h2>${escapeHTML(title)}</h2>
            <button id="closeInformationPanel" aria-label="Fechar">×</button>
        </div>

        <div class="information-content">
            ${content}
        </div>
    `;

    panel.classList.add("open");
    overlay.classList.add("show");

    lockPage();

    $("#closeInformationPanel").addEventListener(
        "click",
        closeInformationPanel
    );

    panel.querySelectorAll("[data-prepurchase-add]").forEach(button => {
        button.addEventListener("click", () => {
            const item = prePurchases.find(
                product => String(product.id) === String(button.dataset.prepurchaseAdd)
            );

            if (!item) return;

            addToCart(item);
            closeInformationPanel();
        });
    });
}

function closeInformationPanel() {
    $("#informationPanel")?.classList.remove("open");
    $("#informationOverlay")?.classList.remove("show");

    unlockPageIfPossible();
}

$("#menuPurchaseHistory")?.addEventListener("click", openHistory);

$("#menuPrePurchases")?.addEventListener("click", openPrePurchases);


/* =========================================================
   24. ANIMAÇÕES DE ENTRADA DAS SEÇÕES
========================================================= */

function initializeRevealAnimations() {
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    const elements = $$(
        ".section-heading, .benefit-card, .category-card, .product-card, " +
        ".smart-shopping-card, .pantry-card, .about-content"
    );

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.animate(
                [
                    {
                        opacity: 0,
                        transform: "translateY(22px)"
                    },
                    {
                        opacity: 1,
                        transform: "translateY(0)"
                    }
                ],
                {
                    duration: 550,
                    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                    fill: "both"
                }
            );

            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12
    });

    elements.forEach(element => {
        observer.observe(element);
    });
}


/* =========================================================
   25. INDICADOR DE SEÇÃO
========================================================= */

function updateSectionTracker() {
    const currentName = $("#currentSectionName");
    const nextName = $("#nextSectionName");

    if (!currentName || !nextName) return;

    const sections = [
        ...$$("main section[id]"),
        ...$$("footer[id]")
    ];

    if (!sections.length) return;

    let currentIndex = 0;

    sections.forEach((section, index) => {
        if (section.getBoundingClientRect().top <= 180) {
            currentIndex = index;
        }
    });

    const current = sections[currentIndex];
    const next = sections[currentIndex + 1];

    currentName.textContent =
        current.dataset.sectionName ||
        $("h1, h2", current)?.textContent.trim() ||
        current.id;

    nextName.textContent = next
        ? "Próxima: " + (
            next.dataset.sectionName ||
            $("h1, h2", next)?.textContent.trim() ||
            next.id
        )
        : "Última seção";
}

let scrollTicking = false;

window.addEventListener("scroll", () => {
    if (scrollTicking) return;

    scrollTicking = true;

    requestAnimationFrame(() => {
        updateSectionTracker();
        scrollTicking = false;
    });
});


/* =========================================================
   26. NAVEGAÇÃO — FECHAR MENU AO CLICAR
========================================================= */

$$(".main-navigation a").forEach(link => {
    link.addEventListener("click", () => {
        closeMarketMenu();
    });
});


/* =========================================================
   27. TECLADO — ESCAPE
========================================================= */

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeCart();
        closeDetailsPanel();
        closeMarketMenu();
        closeInformationPanel();
    }
});


/* =========================================================
   28. INICIALIZAÇÃO
========================================================= */

function initializeMarket() {
    createCartPanel();

    updateFavoriteButtons();
    updateCartCount();
    renderCart();
    filterProducts();

    initializeRevealAnimations();
    updateSectionTracker();

    if (catalogFilters) {
        const hidden = catalogFilters.hidden;

        filterToggle?.setAttribute(
            "aria-expanded",
            String(!hidden)
        );
    }

    console.log(
        "Mercado Confiança — Smart Market 2.1 iniciado com sucesso!"
    );
}

initializeMarket();
