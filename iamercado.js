
/* =========================================================
   MERCADO CONFIANÇA — COMPRA INTELIGENTE
   Módulo de planejamento e gerenciamento de compras
   Integrado ao SCRIPT PRINCIPAL 2.0
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       1. ELEMENTOS E CONFIGURAÇÕES
    ===================================================== */

    const ci = {
        goalMode: document.querySelector("#ciGoalMode"),
        manualMode: document.querySelector("#ciManualMode"),

        goalPanel: document.querySelector("#ciGoalPanel"),
        manualPanel: document.querySelector("#ciManualPanel"),

        goalForm: document.querySelector("#ciGoalForm"),
        manualForm: document.querySelector("#ciManualForm"),

        goal: document.querySelector("#ciGoal"),
        budget: document.querySelector("#ciBudget"),
        manualBudget: document.querySelector("#ciManualBudget"),
        people: document.querySelector("#ciPeople"),
        additionalInfo: document.querySelector("#ciAdditionalInfo"),

        preferences: document.querySelector("#ciPreferences"),
        restrictions: document.querySelector("#ciRestrictions"),
        preferredBrands: document.querySelector("#ciPreferredBrands"),

        productSelect: document.querySelector("#ciProductSelect"),
        productQuantity: document.querySelector("#ciProductQuantity"),

        generateButton: document.querySelector("#ciGenerateButton"),

        shoppingItems: document.querySelector("#ciShoppingItems"),
        emptyState: document.querySelector("#ciEmptyState"),

        budgetDisplay: document.querySelector("#ciBudgetDisplay"),
        budgetProgress: document.querySelector("#ciBudgetProgress"),
        spent: document.querySelector("#ciSpent"),
        remaining: document.querySelector("#ciRemaining"),
        total: document.querySelector("#ciTotal"),

        clearList: document.querySelector("#ciClearList"),
        sendToCart: document.querySelector("#ciSendToCart"),

        distribution: document.querySelector("#ciCategoryDistribution"),
        economy: document.querySelector("#ciEconomySuggestions"),

        substitutionPanel: document.querySelector("#ciSubstitutionPanel"),
        substitutionProducts: document.querySelector("#ciSubstitutionProducts"),
        closeSubstitution: document.querySelector("#ciCloseSubstitution"),

        explanation: document.querySelector("#ciRecommendationExplanation"),

        budgetAlert: document.querySelector("#ciBudgetAlert"),
        budgetAlertTitle: document.querySelector("#ciBudgetAlertTitle"),
        budgetAlertMessage: document.querySelector("#ciBudgetAlertMessage"),

        stockAlert: document.querySelector("#ciStockAlert"),
        stockAlternatives: document.querySelector("#ciStockAlternatives"),

        comparisonBudget: document.querySelector("#ciComparisonBudget"),
        compareBudgets: document.querySelector("#ciCompareBudgets"),
        comparisonResults: document.querySelector("#ciComparisonResults"),
        currentComparison: document.querySelector("#ciCurrentComparison"),
        newComparison: document.querySelector("#ciNewComparison"),
        comparisonDifference: document.querySelector("#ciComparisonDifference"),
        comparisonAnalysis: document.querySelector("#ciComparisonAnalysis"),

        savePlan: document.querySelector("#ciSavePlan"),
        saveCurrentList: document.querySelector("#ciSaveCurrentList"),
        historyList: document.querySelector("#ciHistoryList")
    };


    const STORAGE_KEY = "mercadoConfiancaSmartPlans";

    let shoppingBudget = 0;
    let shoppingItems = [];
    let activeMode = "goal";


    /* =====================================================
       2. FUNÇÕES AUXILIARES
    ===================================================== */

    function money(value) {
        return formatPrice(value);
    }


    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }


    function getProducts() {

        return getAllProductCards()
            .map(card => ({
                ...getProductData(card),
                card,
                available: isAvailable(card)
            }))
            .filter(product => product.price > 0);

    }


    function isAvailable(card) {

        const availability = card.dataset.available;
        const stock = card.dataset.stock;

        if (availability === "false") {
            return false;
        }

        if (stock !== undefined && Number(stock) <= 0) {
            return false;
        }

        return true;

    }


    function findProduct(id) {

        return getProducts().find(product => product.id === id);

    }


    function calculateTotal() {

        return shoppingItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

    }


    function notify(message, type = "success") {

        if (typeof showNotification === "function") {
            showNotification(message, type);
        }

    }


    function loadPlans() {

        try {

            return JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            ) || [];

        } catch (error) {

            console.error("Erro ao carregar planejamentos:", error);
            return [];

        }

    }


    function savePlans(plans) {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(plans)
            );

            return true;

        } catch (error) {

            console.error("Erro ao salvar planejamentos:", error);

            notify("Não foi possível salvar o planejamento.", "error");

            return false;

        }

    }


    /* =====================================================
       3. ALTERNAR ENTRE OS MODOS
    ===================================================== */

    function changeMode(mode) {

        activeMode = mode;

        const goalActive = mode === "goal";

        ci.goalMode?.classList.toggle("active", goalActive);
        ci.manualMode?.classList.toggle("active", !goalActive);

        if (ci.goalMode) {
            ci.goalMode.setAttribute(
                "aria-selected",
                String(goalActive)
            );
        }

        if (ci.manualMode) {
            ci.manualMode.setAttribute(
                "aria-selected",
                String(!goalActive)
            );
        }

        if (ci.goalPanel) {
            ci.goalPanel.hidden = !goalActive;
            ci.goalPanel.classList.toggle("active", goalActive);
        }

        if (ci.manualPanel) {
            ci.manualPanel.hidden = goalActive;
            ci.manualPanel.classList.toggle("active", !goalActive);
        }

    }


    ci.goalMode?.addEventListener("click", () => {
        changeMode("goal");
    });


    ci.manualMode?.addEventListener("click", () => {
        changeMode("manual");
    });


    /* =====================================================
       4. CARREGAR PRODUTOS DO CATÁLOGO
    ===================================================== */

    function populateProductSelect() {

        if (!ci.productSelect) return;

        const products = getProducts();

        if (!products.length) {

            ci.productSelect.innerHTML = `
                <option value="">
                    Nenhum produto encontrado
                </option>
            `;

            return;

        }

        ci.productSelect.innerHTML = `
            <option value="">
                Selecione um produto
            </option>

            ${products.map(product => `
                <option
                    value="${escapeHTML(product.id)}"
                    ${!product.available ? "disabled" : ""}
                >
                    ${escapeHTML(product.name)}
                    — ${money(product.price)}
                    ${!product.available ? "(Indisponível)" : ""}
                </option>
            `).join("")}
        `;

    }


    /* =====================================================
       5. ADICIONAR PRODUTO À LISTA
    ===================================================== */

    function addShoppingProduct(product, quantity = 1) {

        if (!product) {

            notify("Produto não encontrado.", "error");
            return false;

        }

        if (!product.available) {

            notify("Esse produto está indisponível.", "error");
            return false;

        }

        const safeQuantity = Math.max(
            1,
            Math.floor(Number(quantity) || 1)
        );

        const existing = shoppingItems.find(
            item => item.id === product.id
        );

        if (existing) {

            existing.quantity += safeQuantity;

        } else {

            shoppingItems.push({

                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price,
                image: product.image,
                description: product.description,
                quantity: safeQuantity

            });

        }

        renderShoppingList();

        return true;

    }


    /* =====================================================
       6. MONTAR LISTA AUTOMÁTICA
    ===================================================== */

    function getGoalKeywords(goal) {

        const keywords = {

            barbecue: [
                "carne",
                "frango",
                "linguica",
                "linguiça",
                "picanha",
                "costela",
                "carvao",
                "carvão",
                "churrasco",
                "pao de alho",
                "pão de alho",
                "bebida"
            ],

            cleaning: [
                "limpeza",
                "detergente",
                "sabao",
                "sabão",
                "desinfetante",
                "amaciante",
                "esponja",
                "agua sanitaria",
                "água sanitária",
                "multiuso",
                "limpador"
            ],

            monthly: [],

            weekly: [],

            personal: []

        };

        return (keywords[goal] || []).map(normalize);

    }


    function calculateRelevance(product, goal) {

        const keywords = getGoalKeywords(goal);

        if (!keywords.length) return 1;

        const text = normalize(
            product.name + " " + product.category
        );

        return keywords.reduce((score, keyword) => {

            return score + (
                text.includes(keyword) ? 3 : 0
            );

        }, 0);

    }


    function generateSmartList(data) {

        const products = getProducts()
            .filter(product => product.available);

        if (!products.length) {

            notify("Não existem produtos disponíveis no catálogo.", "error");
            return;

        }

        const budget = Number(data.budget);

        if (!Number.isFinite(budget) || budget <= 0) {

            notify("Informe um orçamento válido.", "error");
            return;

        }

        const goal = data.goal;

        const people = Math.max(
            1,
            Number(data.people) || 1
        );

        const preference = data.preference || "balance";

        const goalKeywords = getGoalKeywords(goal);

        const restrictions = normalize(data.restrictions);

        const brandPreferences = normalize(data.brands);

        let candidates = products.filter(product => {

            const text = normalize(
                product.name + " " + product.category
            );

            // Restrições informadas pelo cliente.
            if (restrictions) {

                const words = restrictions
                    .split(/[,\n;]+/)
                    .map(normalize)
                    .filter(word => word.length > 2);

                if (words.some(word => text.includes(word))) {
                    return false;
                }

            }

            // Marcas preferidas: quando informadas,
            // prioriza produtos que contenham o nome da marca.
            product.brandMatch = brandPreferences
                ? text.includes(brandPreferences)
                : false;

            return true;

        });


        if (!candidates.length) {

            notify(
                "Não encontramos produtos compatíveis com as restrições informadas.",
                "error"
            );

            return;

        }


        // Ordenação conforme finalidade e preferência.

        candidates.sort((a, b) => {

            const relevanceA = calculateRelevance(a, goal);
            const relevanceB = calculateRelevance(b, goal);

            if (relevanceA !== relevanceB) {
                return relevanceB - relevanceA;
            }

            if (preference === "economy") {
                return a.price - b.price;
            }

            if (preference === "quality") {
                return b.price - a.price;
            }

            if (preference === "brands") {
                if (a.brandMatch !== b.brandMatch) {
                    return Number(b.brandMatch) - Number(a.brandMatch);
                }
            }

            return a.price - b.price;

        });


        const selected = [];
        const usedCategories = new Set();

        let remaining = budget;

        // Primeiro, procura diversificar as categorias.
        for (const product of candidates) {

            if (selected.length >= 15) break;

            const category = normalize(product.category);

            if (usedCategories.has(category)) continue;

            if (product.price > remaining) continue;

            selected.push(product);
            usedCategories.add(category);

            remaining -= product.price;

        }


        // Depois, utiliza o saldo restante.
        for (const product of candidates) {

            if (selected.length >= 15) break;

            if (selected.some(item => item.id === product.id)) {
                continue;
            }

            if (product.price > remaining) continue;

            selected.push(product);

            remaining -= product.price;

        }


        if (!selected.length) {

            notify(
                "Não encontramos produtos que caibam nesse orçamento.",
                "error"
            );

            return;

        }


        shoppingItems = selected.map(product => ({

            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            image: product.image,
            description: product.description,
            quantity: 1

        }));


        // Guarda o orçamento e a finalidade.
        shoppingBudget = budget;

        renderShoppingList();

        renderExplanation(goal, people, preference);

        notify("Sua lista de compras foi criada!");

        ci.shoppingItems?.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }


    /* =====================================================
       7. FORMULÁRIO DE COMPRA POR OBJETIVO
    ===================================================== */

    ci.goalForm?.addEventListener("submit", event => {

        event.preventDefault();

        const data = {

            goal: ci.goal?.value,

            budget: ci.budget?.value,

            people: ci.people?.value,

            additionalInfo: ci.additionalInfo?.value,

            preference: ci.preferences?.value,

            restrictions: ci.restrictions?.value,

            brands: ci.preferredBrands?.value

        };


        if (!data.goal) {

            notify("Selecione a finalidade da compra.", "error");
            return;

        }


        generateSmartList(data);

    });


    /* =====================================================
       8. FORMULÁRIO DE COMPRA MANUAL
    ===================================================== */

    ci.manualForm?.addEventListener("submit", event => {

        event.preventDefault();

        const budget = Number(ci.manualBudget?.value);

        if (!Number.isFinite(budget) || budget <= 0) {

            notify("Informe um orçamento válido.", "error");
            return;

        }

        const productId = ci.productSelect?.value;

        if (!productId) {

            notify("Selecione um produto.", "error");
            return;

        }

        const product = findProduct(productId);

        const quantity = Number(ci.productQuantity?.value) || 1;

        if (addShoppingProduct(product, quantity)) {

            shoppingBudget = budget;

            renderShoppingList();

            notify("Produto adicionado à sua lista!");

            if (ci.productQuantity) {
                ci.productQuantity.value = 1;
            }

        }

    });


    ci.manualBudget?.addEventListener("input", () => {

        const value = Number(ci.manualBudget.value);

        if (value > 0) {

            shoppingBudget = value;
            updateFinancialSummary();

        }

    });


    /* =====================================================
       9. RENDERIZAR LISTA DE COMPRAS
    ===================================================== */

    function renderShoppingList() {

        if (!ci.shoppingItems) return;

        if (ci.emptyState) {
            ci.emptyState.hidden = shoppingItems.length > 0;
        }

        ci.shoppingItems.innerHTML = shoppingItems.map(item => `

            <article
                class="ci-product-item"
                data-ci-product="${escapeHTML(item.id)}"
            >

                <div class="ci-product-image">

                    <img
                        src="${escapeHTML(item.image || "")}"
                        alt="${escapeHTML(item.name)}"
                        loading="lazy"
                    >

                </div>


                <div class="ci-product-information">

                    <strong class="ci-product-name">
                        ${escapeHTML(item.name)}
                    </strong>

                    <span class="ci-product-category">
                        ${escapeHTML(item.category)}
                    </span>

                    <span class="ci-product-unit-price">
                        ${money(item.price)} / unidade
                    </span>


                    <div class="ci-product-controls">

                        <button
                            type="button"
                            data-ci-action="decrease"
                            aria-label="Diminuir quantidade"
                        >−</button>

                        <span>${item.quantity}</span>

                        <button
                            type="button"
                            data-ci-action="increase"
                            aria-label="Aumentar quantidade"
                        >+</button>

                    </div>

                </div>


                <div class="ci-product-final">

                    <strong>
                        ${money(item.price * item.quantity)}
                    </strong>

                    <button
                        type="button"
                        data-ci-action="substitute"
                    >
                        Substituir
                    </button>

                    <button
                        type="button"
                        data-ci-action="remove"
                    >
                        Remover
                    </button>

                </div>

            </article>

        `).join("");


        updateFinancialSummary();
        renderCategoryDistribution();
        renderEconomySuggestions();
        updateStockAlert();

        if (ci.sendToCart) {
            ci.sendToCart.disabled = shoppingItems.length === 0;
        }

    }


    /* =====================================================
       10. ALTERAR QUANTIDADES E REMOVER PRODUTOS
    ===================================================== */

    ci.shoppingItems?.addEventListener("click", event => {

        const button = event.target.closest("[data-ci-action]");

        if (!button) return;

        const productElement = button.closest("[data-ci-product]");

        if (!productElement) return;

        const id = productElement.dataset.ciProduct;

        const item = shoppingItems.find(
            product => product.id === id
        );

        if (!item) return;

        const action = button.dataset.ciAction;


        if (action === "increase") {

            item.quantity++;

        }


        if (action === "decrease") {

            item.quantity--;

            if (item.quantity <= 0) {

                shoppingItems = shoppingItems.filter(
                    product => product.id !== id
                );

            }

        }


        if (action === "remove") {

            shoppingItems = shoppingItems.filter(
                product => product.id !== id
            );

            notify("Produto removido da lista.");

        }


        if (action === "substitute") {

            openSubstitution(id);
            return;

        }


        renderShoppingList();

    });


    /* =====================================================
       11. RESUMO FINANCEIRO
    ===================================================== */

    function updateFinancialSummary() {

        const total = calculateTotal();

        const remaining = shoppingBudget - total;

        const percentage = shoppingBudget > 0
            ? (total / shoppingBudget) * 100
            : 0;


        if (ci.budgetDisplay) {
            ci.budgetDisplay.textContent = money(shoppingBudget);
        }

        if (ci.spent) {
            ci.spent.textContent = money(total);
        }

        if (ci.remaining) {

            ci.remaining.textContent = money(remaining);

            ci.remaining.classList.toggle(
                "negative",
                remaining < 0
            );

        }

        if (ci.total) {
            ci.total.textContent = money(total);
        }


        if (ci.budgetProgress) {

            ci.budgetProgress.style.width =
                `${Math.min(percentage, 100)}%`;

            ci.budgetProgress.classList.toggle(
                "warning",
                percentage >= 80 && percentage <= 100
            );

            ci.budgetProgress.classList.toggle(
                "danger",
                percentage > 100
            );

        }


        updateBudgetAlert(percentage, remaining);

    }


    /* =====================================================
       12. ALERTAS DE ORÇAMENTO
    ===================================================== */

    function updateBudgetAlert(percentage, remaining) {

        if (!ci.budgetAlert) return;

        const show = shoppingBudget > 0 &&
            (percentage >= 80 || remaining < 0);

        ci.budgetAlert.hidden = !show;

        if (!show) return;


        if (remaining < 0) {

            ci.budgetAlertTitle.textContent =
                "Orçamento ultrapassado";

            ci.budgetAlertMessage.textContent =
                `Sua lista ultrapassou o limite em ${money(Math.abs(remaining))}. Considere substituir alguns produtos.`;

        } else if (percentage >= 100) {

            ci.budgetAlertTitle.textContent =
                "Você atingiu seu limite";

            ci.budgetAlertMessage.textContent =
                "Não há saldo disponível para novos produtos.";

        } else {

            ci.budgetAlertTitle.textContent =
                "Atenção ao orçamento";

            ci.budgetAlertMessage.textContent =
                `Você já utilizou ${percentage.toFixed(0)}% do orçamento disponível.`;

        }

    }


    /* =====================================================
       13. DISTRIBUIÇÃO POR CATEGORIA
    ===================================================== */

    function renderCategoryDistribution() {

        if (!ci.distribution) return;

        if (!shoppingItems.length) {

            ci.distribution.innerHTML = `
                <div class="ci-distribution-empty">
                    A distribuição aparecerá quando sua lista tiver produtos.
                </div>
            `;

            return;

        }


        const categories = {};

        shoppingItems.forEach(item => {

            const category = item.category || "Outros";

            categories[category] =
                (categories[category] || 0) +
                item.price * item.quantity;

        });


        const total = calculateTotal();

        ci.distribution.innerHTML = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .map(([category, value]) => {

                const percentage = total > 0
                    ? (value / total) * 100
                    : 0;

                return `

                    <div class="ci-distribution-item">

                        <div class="ci-distribution-info">

                            <strong>${escapeHTML(category)}</strong>

                            <span>
                                ${money(value)}
                                (${percentage.toFixed(1)}%)
                            </span>

                        </div>

                        <div class="ci-distribution-track">

                            <div
                                class="ci-distribution-bar"
                                style="width: ${percentage}%"
                            ></div>

                        </div>

                    </div>

                `;

            }).join("");

    }


    /* =====================================================
       14. SUGESTÕES ECONÔMICAS
    ===================================================== */

    function renderEconomySuggestions() {

        if (!ci.economy) return;

        if (!shoppingItems.length) {

            ci.economy.innerHTML = `
                <div class="ci-suggestion-empty">
                    As sugestões econômicas aparecerão conforme os produtos forem adicionados.
                </div>
            `;

            return;

        }


        const suggestions = [];

        shoppingItems.forEach(item => {

            const alternatives = getProducts()
                .filter(product => {

                    return product.available &&
                        product.id !== item.id &&
                        normalize(product.category) === normalize(item.category) &&
                        product.price < item.price;

                })
                .sort((a, b) => a.price - b.price);


            if (alternatives.length) {

                const alternative = alternatives[0];

                suggestions.push({

                    original: item,
                    alternative,
                    saving: (
                        item.price - alternative.price
                    ) * item.quantity

                });

            }

        });


        if (!suggestions.length) {

            ci.economy.innerHTML = `
                <div class="ci-suggestion-empty">
                    Não encontramos alternativas mais baratas na mesma categoria dos produtos selecionados.
                </div>
            `;

            return;

        }


        ci.economy.innerHTML = suggestions.slice(0, 5).map(suggestion => `

            <div class="ci-suggestion-card">

                <div class="ci-suggestion-info">

                    <strong>
                        ${escapeHTML(suggestion.original.name)}
                    </strong>

                    <small>
                        Alternativa: ${escapeHTML(suggestion.alternative.name)}
                    </small>

                    <small>
                        De ${money(suggestion.original.price)}
                        por ${money(suggestion.alternative.price)}
                    </small>

                </div>


                <div class="ci-suggestion-action">

                    <strong class="ci-suggestion-saving">
                        Economize ${money(suggestion.saving)}
                    </strong>

                    <button
                        type="button"
                        data-ci-economy-product="${escapeHTML(suggestion.original.id)}"
                        data-ci-alternative="${escapeHTML(suggestion.alternative.id)}"
                    >
                        Substituir
                    </button>

                </div>

            </div>

        `).join("");

    }


    ci.economy?.addEventListener("click", event => {

        const button = event.target.closest(
            "[data-ci-economy-product]"
        );

        if (!button) return;

        replaceProduct(
            button.dataset.ciEconomyProduct,
            button.dataset.ciAlternative
        );

    });


    /* =====================================================
       15. SUBSTITUIÇÃO DE PRODUTOS
    ===================================================== */

    function openSubstitution(productId) {

        const current = shoppingItems.find(
            item => item.id === productId
        );

        if (!current || !ci.substitutionPanel) return;


        const alternatives = getProducts()
            .filter(product => {

                return product.available &&
                    product.id !== current.id &&
                    normalize(product.category) === normalize(current.category);

            })
            .sort((a, b) => a.price - b.price);


        ci.substitutionPanel.hidden = false;


        if (!alternatives.length) {

            ci.substitutionProducts.innerHTML = `
                <p>
                    Não encontramos outros produtos disponíveis
                    nesta categoria.
                </p>
            `;

        } else {

            ci.substitutionProducts.innerHTML = alternatives.map(product => `

                <div class="ci-substitution-option">

                    <div>

                        <strong>${escapeHTML(product.name)}</strong>

                        <p>${money(product.price)}</p>

                    </div>

                    <button
                        type="button"
                        data-ci-replace="${escapeHTML(product.id)}"
                        data-ci-original="${escapeHTML(current.id)}"
                    >
                        Escolher
                    </button>

                </div>

            `).join("");

        }


        ci.substitutionPanel.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }


    function replaceProduct(originalId, alternativeId) {

        const original = shoppingItems.find(
            item => item.id === originalId
        );

        const alternative = findProduct(alternativeId);

        if (!original || !alternative) {

            notify("Não foi possível substituir o produto.", "error");
            return;

        }

        if (!alternative.available) {

            notify("A alternativa está indisponível.", "error");
            return;

        }


        const quantity = original.quantity;

        shoppingItems = shoppingItems.filter(
            item => item.id !== originalId
        );


        const existing = shoppingItems.find(
            item => item.id === alternative.id
        );


        if (existing) {

            existing.quantity += quantity;

        } else {

            shoppingItems.push({

                id: alternative.id,
                name: alternative.name,
                category: alternative.category,
                price: alternative.price,
                image: alternative.image,
                description: alternative.description,
                quantity

            });

        }


        if (ci.substitutionPanel) {
            ci.substitutionPanel.hidden = true;
        }

        renderShoppingList();

        notify("Produto substituído com sucesso!");

    }


    ci.substitutionProducts?.addEventListener("click", event => {

        const button = event.target.closest("[data-ci-replace]");

        if (!button) return;

        replaceProduct(
            button.dataset.ciOriginal,
            button.dataset.ciReplace
        );

    });


    ci.closeSubstitution?.addEventListener("click", () => {

        if (ci.substitutionPanel) {
            ci.substitutionPanel.hidden = true;
        }

    });


    /* =====================================================
       16. EXPLICAÇÃO DAS RECOMENDAÇÕES
    ===================================================== */

    function renderExplanation(goal, people, preference) {

        if (!ci.explanation) return;

        const goalNames = {

            monthly: "compras do mês",
            weekly: "compras da semana",
            barbecue: "churrasco",
            cleaning: "produtos de limpeza",
            personal: "compra personalizada"

        };


        const preferenceNames = {

            economy: "economia",
            quality: "qualidade",
            balance: "equilíbrio entre preço e qualidade",
            brands: "marcas de preferência"

        };


        ci.explanation.innerHTML = `

            <p>

                Sua lista foi organizada para:
                <strong>${escapeHTML(goalNames[goal] || "sua compra")}</strong>.

                O planejamento considera um orçamento de
                <strong>${money(shoppingBudget)}</strong> para
                <strong>${people} pessoa(s)</strong>.

                A preferência selecionada foi
                <strong>${escapeHTML(preferenceNames[preference] || "equilíbrio")}</strong>.

            </p>

            <p>
                Os produtos foram selecionados com base nas categorias,
                preços e informações disponíveis no catálogo.
                Você pode editar todas as escolhas.
            </p>

        `;

    }


    /* =====================================================
       17. VERIFICAR DISPONIBILIDADE
    ===================================================== */

    function updateStockAlert() {

        if (!ci.stockAlert) return;

        const unavailable = shoppingItems.filter(item => {

            const product = findProduct(item.id);

            return !product || !product.available;

        });


        ci.stockAlert.hidden = unavailable.length === 0;

        if (!unavailable.length) return;


        ci.stockAlternatives.innerHTML = unavailable.map(item => `

            <div class="ci-stock-item">

                <strong>${escapeHTML(item.name)}</strong>

                <button
                    type="button"
                    data-ci-stock-substitute="${escapeHTML(item.id)}"
                >
                    Procurar substituto
                </button>

            </div>

        `).join("");

    }


    ci.stockAlternatives?.addEventListener("click", event => {

        const button = event.target.closest(
            "[data-ci-stock-substitute]"
        );

        if (!button) return;

        openSubstitution(
            button.dataset.ciStockSubstitute
        );

    });


    /* =====================================================
       18. LIMPAR LISTA
    ===================================================== */

    ci.clearList?.addEventListener("click", () => {

        if (!shoppingItems.length) {

            notify("Sua lista já está vazia.");
            return;

        }

        shoppingItems = [];

        renderShoppingList();

        if (ci.substitutionPanel) {
            ci.substitutionPanel.hidden = true;
        }

        notify("Lista de compras limpa.");

    });


    /* =====================================================
       19. ADICIONAR LISTA AO CARRINHO
    ===================================================== */

    ci.sendToCart?.addEventListener("click", () => {

        if (!shoppingItems.length) {

            notify("Sua lista está vazia.", "error");
            return;

        }


        const unavailable = shoppingItems.filter(item => {

            const product = findProduct(item.id);

            return !product || !product.available;

        });


        if (unavailable.length) {

            notify(
                "Existem produtos indisponíveis. Substitua-os antes de continuar.",
                "error"
            );

            return;

        }


        shoppingItems.forEach(item => {

            addToCart({

                id: item.id,
                name: item.name,
                category: item.category,
                price: item.price,
                image: item.image,
                description: item.description

            }, item.quantity);

        });


        notify("Sua lista foi enviada ao carrinho!");

    });


    /* =====================================================
       20. COMPARAÇÃO DE ORÇAMENTOS
    ===================================================== */

    ci.compareBudgets?.addEventListener("click", () => {

        const newBudget = Number(ci.comparisonBudget?.value);

        if (!Number.isFinite(newBudget) || newBudget <= 0) {

            notify("Informe um novo orçamento válido.", "error");
            return;

        }

        if (shoppingBudget <= 0) {

            notify("Primeiro defina seu orçamento atual.", "error");
            return;

        }


        const difference = newBudget - shoppingBudget;

        const total = calculateTotal();

        if (ci.comparisonResults) {
            ci.comparisonResults.hidden = false;
        }

        if (ci.currentComparison) {
            ci.currentComparison.textContent = money(shoppingBudget);
        }

        if (ci.newComparison) {
            ci.newComparison.textContent = money(newBudget);
        }

        if (ci.comparisonDifference) {
            ci.comparisonDifference.textContent = money(difference);
        }


        if (ci.comparisonAnalysis) {

            if (newBudget < total) {

                ci.comparisonAnalysis.textContent =
                    `O novo orçamento não cobre sua lista atual. Faltariam ${money(total - newBudget)}. Você precisaria substituir ou remover produtos.`;

            } else {

                ci.comparisonAnalysis.textContent =
                    `Com esse novo orçamento, sua lista atual caberia no limite e sobrariam ${money(newBudget - total)}.`;

            }

        }

    });


    /* =====================================================
       21. SALVAR PLANEJAMENTO
    ===================================================== */

    function saveCurrentPlan() {

        if (!shoppingItems.length) {

            notify("Adicione produtos antes de salvar.", "error");
            return;

        }

        const plans = loadPlans();

        const plan = {

            id: Date.now(),

            name: `Planejamento ${new Date().toLocaleDateString("pt-BR")}`,

            date: new Date().toISOString(),

            budget: shoppingBudget,

            total: calculateTotal(),

            items: shoppingItems.map(item => ({ ...item }))

        };


        plans.unshift(plan);

        if (!savePlans(plans)) return;

        renderHistory();

        notify("Planejamento salvo com sucesso!");

    }


    ci.savePlan?.addEventListener("click", saveCurrentPlan);

    ci.saveCurrentList?.addEventListener("click", saveCurrentPlan);


    /* =====================================================
       22. HISTÓRICO DE PLANEJAMENTOS
    ===================================================== */

    function renderHistory() {

        if (!ci.historyList) return;

        const plans = loadPlans();

        if (!plans.length) {

            ci.historyList.innerHTML = `

                <div class="ci-history-empty">

                    <span>▤</span>

                    <strong>Nenhum planejamento salvo</strong>

                    <p>
                        Quando você salvar uma lista, ela aparecerá aqui.
                    </p>

                </div>

            `;

            return;

        }


        ci.historyList.innerHTML = plans.map(plan => `

            <div class="ci-history-card" data-ci-plan="${plan.id}">

                <div class="ci-history-information">

                    <strong>${escapeHTML(plan.name)}</strong>

                    <span>
                        ${new Date(plan.date).toLocaleDateString("pt-BR")}
                    </span>

                    <span>
                        ${plan.items.length} produto(s)
                    </span>

                    <strong>${money(plan.total)}</strong>

                </div>


                <div class="ci-history-actions">

                    <button
                        type="button"
                        data-ci-load-plan="${plan.id}"
                    >
                        Abrir lista
                    </button>

                    <button
                        type="button"
                        data-ci-delete-plan="${plan.id}"
                    >
                        Excluir
                    </button>

                </div>

            </div>

        `).join("");

    }


    ci.historyList?.addEventListener("click", event => {

        const loadButton = event.target.closest(
            "[data-ci-load-plan]"
        );

        const deleteButton = event.target.closest(
            "[data-ci-delete-plan]"
        );


        if (loadButton) {

            const id = Number(loadButton.dataset.ciLoadPlan);

            const plan = loadPlans().find(
                item => item.id === id
            );

            if (!plan) return;


            shoppingItems = plan.items.map(item => ({ ...item }));

            shoppingBudget = Number(plan.budget) || 0;

            renderShoppingList();

            notify("Planejamento carregado!");

            document.querySelector("#compra-inteligente")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }


        if (deleteButton) {

            const id = Number(deleteButton.dataset.ciDeletePlan);

            const updatedPlans = loadPlans().filter(
                item => item.id !== id
            );

            if (savePlans(updatedPlans)) {

                renderHistory();

                notify("Planejamento excluído.");

            }

        }

    });


    /* =====================================================
       23. INICIALIZAÇÃO
    ===================================================== */

    function initializeSmartShopping() {

        if (!document.querySelector("#compra-inteligente")) {
            return;
        }

        populateProductSelect();

        renderShoppingList();

        renderHistory();

        changeMode("goal");

        console.log(
            "Mercado Confiança — Compra Inteligente inicializada."
        );

    }


    initializeSmartShopping();


})();
