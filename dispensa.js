
/* =========================================================
   MERCADO CONFIANÇA
   MINHA DESPENSA DIGITAL
========================================================= */

(() => {
    "use strict";

    /* =====================================================
       1. CONFIGURAÇÕES
    ===================================================== */

    const STORAGE_KEY = "mercadoConfiancaDespensa_v1";
    const EXPIRING_DAYS = 15;

    const $ = (id) => document.getElementById(id);

    const elements = {
        totalItems: $("pantryTotalItems"),
        lowItems: $("pantryLowItems"),
        expiringItems: $("pantryExpiringItems"),
        unitCount: $("pantryUnitCount"),

        form: $("pantryForm"),
        name: $("pantryName"),
        catalog: $("pantryCatalogList"),
        quantity: $("pantryQuantity"),
        unit: $("pantryUnit"),
        minimum: $("pantryMinimum"),
        expiry: $("pantryExpiry"),
        category: $("pantryCategory"),

        search: $("pantrySearch"),
        categoryFilter: $("pantryCategoryFilter"),
        statusFilter: $("pantryStatusFilter"),
        clearFilters: $("pantryClearFilters"),

        list: $("pantryList"),

        shoppingItems: $("pantryShoppingItems"),
        shoppingButton: $("pantryShoppingButton"),

        reset: $("pantryReset")
    };

    /* =====================================================
       2. VERIFICAÇÃO DO HTML
    ===================================================== */

    if (!elements.form || !elements.list) {
        console.warn(
            "Despensa Digital: elementos HTML não encontrados."
        );
        return;
    }

    /* =====================================================
       3. BANCO DE DADOS LOCAL
    ===================================================== */

    let pantry = loadPantry();

    function loadPantry() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return [];
            }

            const data = JSON.parse(saved);

            return Array.isArray(data) ? data : [];

        } catch (error) {
            console.error("Erro ao carregar despensa:", error);
            return [];
        }
    }

    function savePantry() {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(pantry)
        );
    }

    /* =====================================================
       4. FUNÇÕES AUXILIARES
    ===================================================== */

    function createId() {
        return (
            Date.now().toString(36) +
            Math.random().toString(36).substring(2, 9)
        );
    }

    function formatDate(date) {
        if (!date) return "Sem validade informada";

        const parts = date.split("-");

        if (parts.length !== 3) return date;

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function getDaysUntil(date) {
        if (!date) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiryDate = new Date(`${date}T00:00:00`);

        return Math.ceil(
            (expiryDate - today) / (1000 * 60 * 60 * 24)
        );
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => {
            const characters = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return characters[char];
        });
    }

    function formatQuantity(value) {
        return Number(value).toLocaleString("pt-BR", {
            maximumFractionDigits: 2
        });
    }

    /* =====================================================
       5. IDENTIFICAR SITUAÇÃO DO PRODUTO
    ===================================================== */

    function getProductStatus(product) {
        const days = getDaysUntil(product.expiry);

        if (days !== null && days < 0) {
            return {
                key: "expired",
                label: "Vencido",
                className: "pantry-status-expired"
            };
        }

        if (Number(product.quantity) <= 0) {
            return {
                key: "empty",
                label: "Em falta",
                className: "pantry-status-empty"
            };
        }

        if (
            Number(product.quantity) <=
            Number(product.minimum)
        ) {
            return {
                key: "low",
                label: "Estoque baixo",
                className: "pantry-status-low"
            };
        }

        if (days !== null && days <= EXPIRING_DAYS) {
            return {
                key: "expiring",
                label: "Próximo do vencimento",
                className: "pantry-status-expiring"
            };
        }

        return {
            key: "ok",
            label: "Estoque adequado",
            className: "pantry-status-ok"
        };
    }

    /* =====================================================
       6. NOTIFICAÇÕES
    ===================================================== */

    function showToast(message) {
        let toast = document.querySelector(".pantry-toast");

        if (!toast) {
            toast = document.createElement("div");
            toast.className = "pantry-toast";

            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add("active");

        clearTimeout(toast.timer);

        toast.timer = setTimeout(() => {
            toast.classList.remove("active");
        }, 2800);
    }

    /* =====================================================
       7. CADASTRAR PRODUTO
    ===================================================== */

    elements.form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = elements.name.value.trim();
        const quantity = Number(elements.quantity.value);
        const minimum = Number(elements.minimum.value);

        if (!name) {
            showToast("Informe o nome do produto.");
            return;
        }

        if (!Number.isFinite(quantity) || quantity < 0) {
            showToast("Informe uma quantidade válida.");
            return;
        }

        if (!Number.isFinite(minimum) || minimum < 0) {
            showToast("Informe um estoque mínimo válido.");
            return;
        }

        const normalizedName = name.toLowerCase();

        const existingProduct = pantry.find((product) => {
            return (
                product.name.toLowerCase() === normalizedName &&
                product.unit === elements.unit.value
            );
        });

        if (existingProduct) {
            existingProduct.quantity += quantity;
            existingProduct.minimum = minimum;
            existingProduct.category = elements.category.value;

            if (elements.expiry.value) {
                existingProduct.expiry = elements.expiry.value;
            }

            savePantry();
            render();
            elements.form.reset();

            showToast("Quantidade do produto atualizada!");
            return;
        }

        const product = {
            id: createId(),
            name,
            quantity,
            unit: elements.unit.value,
            minimum,
            expiry: elements.expiry.value || "",
            category: elements.category.value || "Outros",
            createdAt: new Date().toISOString(),
            needsPurchase: false
        };

        pantry.push(product);

        savePantry();
        render();

        elements.form.reset();

        showToast("Produto adicionado à despensa!");
    });

    /* =====================================================
       8. ENCONTRAR PRODUTO NO CATÁLOGO
    ===================================================== */

    function findCatalogProduct(name) {
        const cards = document.querySelectorAll(".product-card");

        const normalizedName = name.trim().toLowerCase();

        for (const card of cards) {
            const productName =
                card.dataset.name?.trim().toLowerCase();

            if (productName === normalizedName) {
                return {
                    name: card.dataset.name,
                    category: card.dataset.category || "Outros",
                    price: Number(card.dataset.price) || 0,
                    image: card.dataset.image || "",
                    description: card.dataset.description || ""
                };
            }
        }

        return null;
    }

    /* =====================================================
       9. SUGESTÕES DO CATÁLOGO
    ===================================================== */

    if (elements.catalog) {
        const cards = document.querySelectorAll(".product-card");

        const names = new Set();

        cards.forEach((card) => {
            const name = card.dataset.name;

            if (name) {
                names.add(name);
            }
        });

        elements.catalog.innerHTML = "";

        names.forEach((name) => {
            const option = document.createElement("option");

            option.value = name;

            elements.catalog.appendChild(option);
        });
    }

    if (elements.name) {
        elements.name.addEventListener("change", () => {
            const product = findCatalogProduct(elements.name.value);

            if (!product) return;

            if (elements.category) {
                const categoryExists = [
                    ...elements.category.options
                ].some(option => option.value === product.category);

                if (categoryExists) {
                    elements.category.value = product.category;
                }
            }
        });
    }

    /* =====================================================
       10. ATUALIZAR QUANTIDADE
    ===================================================== */

    function changeQuantity(id, amount) {
        const product = pantry.find(item => item.id === id);

        if (!product) return;

        const newQuantity =
            Number(product.quantity) + amount;

        if (newQuantity < 0) {
            showToast("A quantidade não pode ser negativa.");
            return;
        }

        product.quantity = newQuantity;

        savePantry();
        render();
    }

    /* =====================================================
       11. MARCAR PRODUTO PARA COMPRAR
    ===================================================== */

    function togglePurchase(id) {
        const product = pantry.find(item => item.id === id);

        if (!product) return;

        product.needsPurchase = !product.needsPurchase;

        savePantry();
        render();

        showToast(
            product.needsPurchase
                ? "Produto adicionado à lista de compras."
                : "Produto removido da lista de compras."
        );
    }

    /* =====================================================
       12. REMOVER PRODUTO
    ===================================================== */

    function removeProduct(id) {
        const product = pantry.find(item => item.id === id);

        if (!product) return;

        const confirmed = confirm(
            `Deseja remover "${product.name}" da despensa?`
        );

        if (!confirmed) return;

        pantry = pantry.filter(item => item.id !== id);

        savePantry();
        render();

        showToast("Produto removido.");
    }

    /* =====================================================
       13. RENDERIZAR PRODUTOS
    ===================================================== */

    function renderProducts() {
        const search = elements.search?.value
            .trim()
            .toLowerCase() || "";

        const category = elements.categoryFilter?.value || "all";
        const statusFilter = elements.statusFilter?.value || "all";

        let filtered = pantry.filter((product) => {
            const matchesSearch =
                product.name.toLowerCase().includes(search);

            const matchesCategory =
                category === "all" ||
                product.category === category;

            const status = getProductStatus(product);

            const matchesStatus =
                statusFilter === "all" ||
                status.key === statusFilter;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );
        });

        if (filtered.length === 0) {
            elements.list.innerHTML = `
                <div class="pantry-empty">
                    <div class="pantry-empty-icon">🧺</div>
                    <h3>Nenhum produto encontrado</h3>
                    <p>
                        Adicione produtos à sua despensa
                        ou altere os filtros.
                    </p>
                </div>
            `;

            return;
        }

        elements.list.innerHTML = filtered.map((product) => {
            const status = getProductStatus(product);

            const expiryText = product.expiry
                ? `Validade: ${formatDate(product.expiry)}`
                : "Validade não informada";

            return `
                <article class="pantry-item" data-id="${escapeHTML(product.id)}">

                    <div class="pantry-item-info">

                        <div class="pantry-item-icon">
                            🛒
                        </div>

                        <div>
                            <h3 class="pantry-item-name">
                                ${escapeHTML(product.name)}
                            </h3>

                            <span class="pantry-item-category">
                                ${escapeHTML(product.category)}
                            </span>

                            <p class="pantry-item-quantity">
                                ${formatQuantity(product.quantity)}
                                ${escapeHTML(product.unit)}
                            </p>

                            <small>${escapeHTML(expiryText)}</small>
                        </div>

                    </div>

                    <span class="pantry-status ${status.className}">
                        ${status.label}
                    </span>

                    <div class="pantry-item-actions">

                        <div class="pantry-quantity-control">

                            <button
                                type="button"
                                class="pantry-action-button"
                                data-action="decrease"
                                data-id="${escapeHTML(product.id)}"
                                aria-label="Diminuir quantidade"
                            >−</button>

                            <span>${formatQuantity(product.quantity)}</span>

                            <button
                                type="button"
                                class="pantry-action-button"
                                data-action="increase"
                                data-id="${escapeHTML(product.id)}"
                                aria-label="Aumentar quantidade"
                            >+</button>

                        </div>

                        <button
                            type="button"
                            class="pantry-action-button"
                            data-action="purchase"
                            data-id="${escapeHTML(product.id)}"
                            title="Adicionar à lista de compras"
                        >
                            ${product.needsPurchase ? "✓ Na lista" : "🛒 Comprar"}
                        </button>

                        <button
                            type="button"
                            class="pantry-action-button"
                            data-action="remove"
                            data-id="${escapeHTML(product.id)}"
                            title="Remover produto"
                        >
                            ✕
                        </button>

                    </div>

                </article>
            `;
        }).join("");
    }

    /* =====================================================
       14. ATUALIZAR INDICADORES
    ===================================================== */

    function renderStatistics() {
        const totalItems = pantry.length;

        const lowItems = pantry.filter((product) => {
            const status = getProductStatus(product);

            return (
                status.key === "low" ||
                status.key === "empty"
            );
        }).length;

        const expiringItems = pantry.filter((product) => {
            const status = getProductStatus(product);

            return (
                status.key === "expiring" ||
                status.key === "expired"
            );
        }).length;

        const totalUnits = pantry.reduce((total, product) => {
            return total + Number(product.quantity);
        }, 0);

        if (elements.totalItems) {
            elements.totalItems.textContent = totalItems;
        }

        if (elements.lowItems) {
            elements.lowItems.textContent = lowItems;
        }

        if (elements.expiringItems) {
            elements.expiringItems.textContent = expiringItems;
        }

        if (elements.unitCount) {
            elements.unitCount.textContent =
                formatQuantity(totalUnits);
        }
    }

    /* =====================================================
       15. LISTA DE COMPRAS DA DESPENSA
    ===================================================== */

    function renderShoppingList() {
        if (!elements.shoppingItems) return;

        const shoppingProducts = pantry.filter((product) => {
            return product.needsPurchase;
        });

        if (shoppingProducts.length === 0) {
            elements.shoppingItems.textContent =
                "Nenhum produto na lista de compras.";
        } else {
            elements.shoppingItems.textContent =
                shoppingProducts.map((product) => {
                    return (
                        `${product.name} (${formatQuantity(product.quantity)} ${product.unit})`
                    );
                }).join(" • ");
        }

        if (elements.shoppingButton) {
            elements.shoppingButton.disabled =
                shoppingProducts.length === 0;
        }
    }

    /* =====================================================
       16. ADICIONAR AO CARRINHO DO MERCADO
    ===================================================== */

    function sendToCart() {
        const shoppingProducts = pantry.filter((product) => {
            return product.needsPurchase;
        });

        if (shoppingProducts.length === 0) {
            showToast("Sua lista de compras está vazia.");
            return;
        }

        if (typeof window.addToCart !== "function") {
            showToast(
                "Não foi possível acessar o carrinho. Verifique o script principal."
            );
            return;
        }

        let added = 0;
        let notFound = [];

        shoppingProducts.forEach((product) => {
            const catalogProduct = findCatalogProduct(product.name);

            if (!catalogProduct) {
                notFound.push(product.name);
                return;
            }

            window.addToCart({
                name: catalogProduct.name,
                price: catalogProduct.price,
                image: catalogProduct.image,
                category: catalogProduct.category,
                description: catalogProduct.description
            }, 1);

            added++;

            product.needsPurchase = false;
        });

        savePantry();
        render();

        if (added > 0 && notFound.length === 0) {
            showToast(
                `${added} produto(s) enviado(s) ao carrinho!`
            );
        } else if (added > 0) {
            showToast(
                `${added} enviado(s). ${notFound.length} não encontrado(s) no catálogo.`
            );
        } else {
            showToast(
                "Nenhum produto da lista foi encontrado no catálogo."
            );
        }
    }

    /* =====================================================
       17. EVENTOS DOS PRODUTOS
    ===================================================== */

    elements.list.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action]");

        if (!button) return;

        const id = button.dataset.id;
        const action = button.dataset.action;

        if (action === "increase") {
            changeQuantity(id, 1);
        }

        if (action === "decrease") {
            changeQuantity(id, -1);
        }

        if (action === "purchase") {
            togglePurchase(id);
        }

        if (action === "remove") {
            removeProduct(id);
        }
    });

    /* =====================================================
       18. FILTROS E PESQUISA
    ===================================================== */

    if (elements.search) {
        elements.search.addEventListener("input", renderProducts);
    }

    if (elements.categoryFilter) {
        elements.categoryFilter.addEventListener(
            "change",
            renderProducts
        );
    }

    if (elements.statusFilter) {
        elements.statusFilter.addEventListener(
            "change",
            renderProducts
        );
    }

    if (elements.clearFilters) {
        elements.clearFilters.addEventListener("click", () => {
            if (elements.search) {
                elements.search.value = "";
            }

            if (elements.categoryFilter) {
                elements.categoryFilter.value = "all";
            }

            if (elements.statusFilter) {
                elements.statusFilter.value = "all";
            }

            renderProducts();
        });
    }

    /* =====================================================
       19. ENVIAR LISTA AO CARRINHO
    ===================================================== */

    if (elements.shoppingButton) {
        elements.shoppingButton.addEventListener(
            "click",
            sendToCart
        );
    }

    /* =====================================================
       20. LIMPAR DESPENSA
    ===================================================== */

    if (elements.reset) {
        elements.reset.addEventListener("click", () => {
            if (pantry.length === 0) {
                showToast("Sua despensa já está vazia.");
                return;
            }

            const confirmed = confirm(
                "Tem certeza que deseja apagar todos os produtos da despensa?"
            );

            if (!confirmed) return;

            pantry = [];

            savePantry();
            render();

            showToast("Despensa limpa com sucesso.");
        });
    }

    /* =====================================================
       21. RENDERIZAÇÃO GERAL
    ===================================================== */

    function render() {
        renderProducts();
        renderStatistics();
        renderShoppingList();
    }

    /* =====================================================
       22. INICIALIZAÇÃO
    ===================================================== */

    render();

    console.log("Despensa Digital carregada com sucesso!");

})();
