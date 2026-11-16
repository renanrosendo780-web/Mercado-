'use strict';

/*
 * MERCADO CONFIANÇA — ADMIN.JS
 * Painel administrativo demonstrativo.
 * Os dados ficam no localStorage deste navegador. Para uso real, conecte API,
 * banco de dados, autenticação no servidor e integração do checkout/PDV.
 */

const STORAGE = {
  products: 'mc_admin_products_v1',
  suppliers: 'mc_admin_suppliers_v1',
  movements: 'mc_admin_movements_v1'
};

const demoProducts = [
  { id:'p1', name:'Arroz tipo 1 5 kg', category:'Mercearia', unit:'un', sku:'MC-0001', barcode:'7891000100011', brand:'Grão Bom', supplier:'Distribuidora Central', description:'Arroz tipo 1, pacote de 5 kg.', purchaseCost:22.4, freight:0.55, extraCost:0.2, variablePercent:8, salePrice:29.9, wholesalePrice:27.5, wholesaleMin:6, promoPrice:27.9, promoMin:1, promoStart:'2026-11-10', promoEnd:'2026-11-20', promoNote:'Oferta da semana', stock:42, minStock:20, maxStock:100, lot:'AR-1026', expiry:'2027-05-30', location:'Corredor 1 / A2', active:true, image:'', soldMonth:85, lostCount:0 },
  { id:'p2', name:'Feijão carioca 1 kg', category:'Mercearia', unit:'un', sku:'MC-0002', barcode:'7891000100028', brand:'Sabor da Terra', supplier:'Distribuidora Central', description:'Feijão carioca tipo 1, pacote de 1 kg.', purchaseCost:6.15, freight:0.18, extraCost:0.08, variablePercent:8, salePrice:8.99, wholesalePrice:8.2, wholesaleMin:10, promoPrice:0, promoMin:1, promoStart:'', promoEnd:'', promoNote:'', stock:18, minStock:20, maxStock:80, lot:'FC-441', expiry:'2027-04-15', location:'Corredor 1 / A3', active:true, image:'', soldMonth:210, lostCount:0 },
  { id:'p3', name:'Óleo de soja 900 ml', category:'Mercearia', unit:'un', sku:'MC-0003', barcode:'7891000100035', brand:'Campo Leve', supplier:'Atacado União', description:'Óleo de soja refinado, embalagem de 900 ml.', purchaseCost:4.55, freight:0.12, extraCost:0.06, variablePercent:8, salePrice:6.49, wholesalePrice:5.95, wholesaleMin:12, promoPrice:0, promoMin:1, promoStart:'', promoEnd:'', promoNote:'', stock:55, minStock:25, maxStock:120, lot:'OS-882', expiry:'2027-08-21', location:'Corredor 2 / B1', active:true, image:'', soldMonth:220, lostCount:0 },
  { id:'p4', name:'Leite integral 1 L', category:'Frios e laticínios', unit:'un', sku:'MC-0004', barcode:'7891000100042', brand:'Fazenda Clara', supplier:'Laticínios Horizonte', description:'Leite integral UHT, embalagem de 1 litro.', purchaseCost:4.05, freight:0.1, extraCost:0.04, variablePercent:8, salePrice:5.49, wholesalePrice:5.1, wholesaleMin:12, promoPrice:4.99, promoMin:1, promoStart:'2026-11-11', promoEnd:'2026-11-15', promoNote:'Oferta relâmpago', stock:24, minStock:25, maxStock:90, lot:'LT-771', expiry:'2026-11-19', location:'Refrigerador 1', active:true, image:'', soldMonth:280, lostCount:3 },
  { id:'p5', name:'Banana prata (kg)', category:'Hortifruti', unit:'kg', sku:'MC-0005', barcode:'', brand:'Seleção do produtor', supplier:'Produtores locais', description:'Banana prata selecionada, vendida por quilograma.', purchaseCost:3.65, freight:0.3, extraCost:0.15, variablePercent:8, salePrice:7.99, wholesalePrice:6.9, wholesaleMin:5, promoPrice:0, promoMin:1, promoStart:'', promoEnd:'', promoNote:'', stock:16, minStock:12, maxStock:45, lot:'HORT-1211', expiry:'2026-11-14', location:'Banca H1', active:true, image:'', soldMonth:160, lostCount:4 },
  { id:'p6', name:'Tomate (kg)', category:'Hortifruti', unit:'kg', sku:'MC-0006', barcode:'', brand:'Seleção do produtor', supplier:'Produtores locais', description:'Tomate fresco, vendido por quilograma.', purchaseCost:4.4, freight:0.35, extraCost:0.2, variablePercent:8, salePrice:8.99, wholesalePrice:7.8, wholesaleMin:5, promoPrice:0, promoMin:1, promoStart:'', promoEnd:'', promoNote:'', stock:8, minStock:12, maxStock:35, lot:'HORT-1212', expiry:'2026-11-13', location:'Banca H2', active:true, image:'', soldMonth:150, lostCount:6 },
  { id:'p7', name:'Detergente neutro 500 ml', category:'Limpeza', unit:'un', sku:'MC-0007', barcode:'7891000100073', brand:'Brilho', supplier:'Atacado União', description:'Detergente líquido neutro, frasco de 500 ml.', purchaseCost:1.25, freight:0.08, extraCost:0.03, variablePercent:8, salePrice:2.49, wholesalePrice:2.2, wholesaleMin:12, promoPrice:0, promoMin:1, promoStart:'', promoEnd:'', promoNote:'', stock:70, minStock:25, maxStock:160, lot:'DET-551', expiry:'2028-02-10', location:'Corredor 5 / E1', active:true, image:'', soldMonth:125, lostCount:0 },
  { id:'p8', name:'Café torrado 500 g', category:'Mercearia', unit:'un', sku:'MC-0008', barcode:'7891000100080', brand:'Café da Serra', supplier:'Distribuidora Central', description:'Café torrado e moído, pacote de 500 g.', purchaseCost:13.6, freight:0.28, extraCost:0.1, variablePercent:8, salePrice:18.9, wholesalePrice:17.2, wholesaleMin:6, promoPrice:17.9, promoMin:1, promoStart:'2026-11-09', promoEnd:'2026-11-16', promoNote:'Semana do café', stock:12, minStock:15, maxStock:65, lot:'CAF-902', expiry:'2027-07-10', location:'Corredor 2 / B4', active:true, image:'', soldMonth:170, lostCount:0 },
  { id:'p9', name:'Refrigerante cola 2 L', category:'Bebidas', unit:'un', sku:'MC-0009', barcode:'7891000100097', brand:'Cola Mix', supplier:'Bebidas Brasil', description:'Refrigerante sabor cola, garrafa de 2 litros.', purchaseCost:6.2, freight:0.2, extraCost:0.05, variablePercent:8, salePrice:9.49, wholesalePrice:8.7, wholesaleMin:6, promoPrice:0, promoMin:1, promoStart:'', promoEnd:'', promoNote:'', stock:38, minStock:18, maxStock:100, lot:'RC-281', expiry:'2027-03-09', location:'Ilha de bebidas', active:true, image:'', soldMonth:190, lostCount:0 },
  { id:'p10', name:'Pão de forma tradicional', category:'Padaria', unit:'un', sku:'MC-0010', barcode:'7891000100103', brand:'Pão Nosso', supplier:'Padaria parceira', description:'Pão de forma tradicional, pacote de 450 g.', purchaseCost:5.3, freight:0.15, extraCost:0.1, variablePercent:8, salePrice:7.99, wholesalePrice:7.3, wholesaleMin:6, promoPrice:0, promoMin:1, promoStart:'', promoEnd:'', promoNote:'', stock:9, minStock:10, maxStock:40, lot:'PF-119', expiry:'2026-11-14', location:'Gôndola da padaria', active:true, image:'', soldMonth:95, lostCount:2 },
  { id:'p11', name:'Sabonete hidratante 90 g', category:'Higiene', unit:'un', sku:'MC-0011', barcode:'7891000100110', brand:'Pele Suave', supplier:'Atacado União', description:'Sabonete em barra, unidade de 90 g.', purchaseCost:1.9, freight:0.06, extraCost:0.03, variablePercent:8, salePrice:3.49, wholesalePrice:3.1, wholesaleMin:12, promoPrice:0, promoMin:1, promoStart:'', promoEnd:'', promoNote:'', stock:62, minStock:20, maxStock:120, lot:'SB-081', expiry:'2028-06-01', location:'Corredor 6 / F2', active:true, image:'', soldMonth:110, lostCount:0 },
  { id:'p12', name:'Peito de frango resfriado (kg)', category:'Açougue', unit:'kg', sku:'MC-0012', barcode:'', brand:'Corte do Dia', supplier:'Frigorífico Planalto', description:'Peito de frango resfriado, vendido por quilograma.', purchaseCost:12.5, freight:0.45, extraCost:0.25, variablePercent:8, salePrice:18.9, wholesalePrice:17.2, wholesaleMin:5, promoPrice:0, promoMin:1, promoStart:'', promoEnd:'', promoNote:'', stock:14, minStock:10, maxStock:40, lot:'FR-600', expiry:'2026-11-16', location:'Balcão refrigerado', active:true, image:'', soldMonth:72, lostCount:1 }
];

const demoSuppliers = [
  { id:'s1', name:'Distribuidora Central', category:'Mercearia e café', phone:'(61) 3333-1010', leadTime:'2 dias úteis', terms:'28 dias' },
  { id:'s2', name:'Atacado União', category:'Limpeza e mercearia', phone:'(61) 3333-2020', leadTime:'1 dia útil', terms:'PIX / 14 dias' },
  { id:'s3', name:'Laticínios Horizonte', category:'Frios e laticínios', phone:'(61) 3333-3030', leadTime:'Diária', terms:'7 dias' },
  { id:'s4', name:'Produtores locais', category:'Hortifruti', phone:'(61) 3333-4040', leadTime:'Diária', terms:'À vista' },
  { id:'s5', name:'Bebidas Brasil', category:'Bebidas', phone:'(61) 3333-5050', leadTime:'2 dias úteis', terms:'21 dias' }
];

// Valores fictícios usados somente para preencher os gráficos de demonstração.
const demoCategorySales = [
  { name:'Mercearia', value:14400 },
  { name:'Hortifruti', value:11500 },
  { name:'Bebidas', value:8200 },
  { name:'Limpeza', value:5600 },
  { name:'Frios e laticínios', value:5300 },
  { name:'Padaria e outros', value:3320 }
];

const demoDailySales = [5200, 6100, 4800, 7300, 6500, 8000, 10420];

const demoOrders = [
  ['#MC-04821','12/11/2026','Loja física','12 itens','Cartão','R$ 184,70','Concluído'],
  ['#MC-04820','12/11/2026','Loja virtual','7 itens','PIX','R$ 96,40','Concluído'],
  ['#MC-04819','12/11/2026','Loja física','4 itens','Dinheiro','R$ 42,90','Concluído'],
  ['#MC-04818','11/11/2026','Loja virtual','9 itens','PIX','R$ 132,50','Em separação'],
  ['#MC-04817','11/11/2026','Loja física','16 itens','Cartão','R$ 221,30','Concluído']
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const currency = new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' });

let products = loadStored(STORAGE.products, demoProducts);
let suppliers = loadStored(STORAGE.suppliers, demoSuppliers);
let movements = loadStored(STORAGE.movements, []);
let toastTimer = null;
let activeView = 'overview';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadStored(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return clone(fallback);

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : clone(fallback);
  } catch (error) {
    console.warn(`Falha ao carregar ${key}:`, error);
    return clone(fallback);
  }
}

function saveAll() {
  try {
    localStorage.setItem(STORAGE.products, JSON.stringify(products));
    localStorage.setItem(STORAGE.suppliers, JSON.stringify(suppliers));
    localStorage.setItem(STORAGE.movements, JSON.stringify(movements.slice(-200)));
    return true;
  } catch (error) {
    console.error('Não foi possível salvar os dados:', error);
    showToast('Armazenamento local cheio. Reduza o tamanho das fotos e tente novamente.');
    return false;
  }
}

function number(value) {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

function money(value) {
  return currency.format(number(value));
}

function quantity(value) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 3
  }).format(number(value));
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  })[char]);
}

function dateOnly(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function daysUntil(dateString) {
  if (!dateString) return null;

  const target = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(target.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.round(
    (target.getTime() - today.getTime()) / 86400000
  );
}

function formatDate(dateString) {
  if (!dateString) return 'Não informado';

  const date = new Date(`${dateString}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? 'Não informado'
    : date.toLocaleDateString('pt-BR');
}

function landedCost(product) {
  return number(product.purchaseCost) +
    number(product.freight) +
    number(product.extraCost);
}

function contributionValue(product, price = product.salePrice) {
  const salePrice = number(price);

  return salePrice -
    landedCost(product) -
    salePrice * number(product.variablePercent) / 100;
}

function contributionRate(product, price = product.salePrice) {
  const salePrice = number(price);

  return salePrice > 0
    ? contributionValue(product, salePrice) / salePrice * 100
    : 0;
}

function isPromotion(product) {
  const promo = number(product.promoPrice);
  const sale = number(product.salePrice);

  if (promo <= 0 || promo >= sale) return false;

  const today = dateOnly();

  return (!product.promoStart || product.promoStart <= today) &&
    (!product.promoEnd || product.promoEnd >= today);
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('is-visible');

  window.clearTimeout(toastTimer);

  toastTimer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 3000);
}

function openModal(id) {
  const modal = typeof id === 'string'
    ? document.getElementById(id)
    : id;

  if (!modal) return;

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  if (!modal) return;

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');

  if (!$('.modal-backdrop.is-open')) {
    document.body.style.overflow = '';
  }
}

// ======================================
// NAVEGAÇÃO E ACESSO DEMONSTRATIVO
// ======================================

function showView(viewName) {
  const view = document.getElementById(`view-${viewName}`);

  if (!view) return;

  activeView = viewName;

  $$('.view').forEach(section => {
    section.classList.toggle('is-visible', section === view);
  });

  $$('.nav-link[data-view]').forEach(button => {
    button.classList.toggle(
      'is-active',
      button.dataset.view === viewName
    );
  });

  const activeButton = $(`.nav-link[data-view="${viewName}"]`);

  $('#pageTitle').textContent = activeButton
    ? activeButton.textContent.trim()
    : 'Painel administrativo';

  closeSidebar();

  if (viewName === 'overview') renderOverview();
  if (viewName === 'products') renderProducts();
  if (viewName === 'inventory') renderInventory();
  if (viewName === 'promotions') renderPromotions();
  if (viewName === 'suppliers') renderSuppliers();

  if (viewName === 'finance') {
    populatePriceProductSelect();
    recalculatePricing();
    recalculateBreakEven();
  }

  if (viewName === 'reports') renderReports();
}

function openSidebar() {
  $('#sidebar')?.classList.add('is-open');
  $('#sidebarBackdrop')?.classList.add('is-visible');
}

function closeSidebar() {
  $('#sidebar')?.classList.remove('is-open');
  $('#sidebarBackdrop')?.classList.remove('is-visible');
}

function enterDemo() {
  $('#loginScreen')?.classList.add('is-hidden');
  $('#adminApp')?.classList.remove('is-hidden');
  renderAll();
}

// Esta tela ainda é demonstrativa: não realiza autenticação real.
$('#demoAccess')?.addEventListener('click', enterDemo);

$('#loginForm')?.addEventListener('submit', event => {
  event.preventDefault();

  showToast(
    'Login real ainda não está conectado. Use “Acessar demonstração”.'
  );
});

$('#logoutButton')?.addEventListener('click', () => {
  $('#adminApp')?.classList.add('is-hidden');
  $('#loginScreen')?.classList.remove('is-hidden');
  closeSidebar();
});

$('#openSidebar')?.addEventListener('click', openSidebar);
$('#closeSidebar')?.addEventListener('click', closeSidebar);
$('#sidebarBackdrop')?.addEventListener('click', closeSidebar);

$$('.nav-link[data-view]').forEach(button => {
  button.addEventListener('click', () => {
    showView(button.dataset.view);
  });
});

$$('[data-go]').forEach(button => {
  button.addEventListener('click', () => {
    showView(button.dataset.go);
  });
});

// ======================================
// CADASTRO, EDIÇÃO E LISTAGEM DE PRODUTOS
// ======================================

function setImagePreview(dataUrl) {
  const preview = $('#imagePreview');

  if (!preview) return;

  if (dataUrl) {
    preview.innerHTML = `
      <img src="${dataUrl}" alt="Prévia da foto do produto">
    `;
  } else {
    preview.textContent = 'IMG';
  }
}

function resetProductForm() {
  $('#productForm')?.reset();

  $('#editProductId').value = '';
  $('#productImageData').value = '';

  $('#productStock').value = '0';
  $('#productMinStock').value = '5';
  $('#productMaxStock').value = '100';

  $('#productVariableCost').value = '8';
  $('#productWholesaleMin').value = '12';
  $('#productPromoMin').value = '1';

  $('#productActive').checked = true;

  setImagePreview('');
  updateProductCostPreview();
}

function openProductModal(productId = null, promotionFocus = false) {
  resetProductForm();

  const product = productId
    ? products.find(item => item.id === productId)
    : null;

  $('#productModalTitle').textContent = product
    ? 'Editar produto'
    : 'Cadastrar produto';

  if (product) {
    $('#editProductId').value = product.id;

    $('#productName').value = product.name || '';
    $('#productCategory').value = product.category || '';
    $('#productUnit').value = product.unit || 'un';
    $('#productSku').value = product.sku || '';
    $('#productBarcode').value = product.barcode || '';
    $('#productBrand').value = product.brand || '';
    $('#productSupplier').value = product.supplier || '';
    $('#productDescription').value = product.description || '';

    $('#productPurchaseCost').value = number(product.purchaseCost);
    $('#productFreight').value = number(product.freight);
    $('#productExtraCost').value = number(product.extraCost);
    $('#productVariableCost').value = number(product.variablePercent);

    $('#productSalePrice').value = number(product.salePrice);
    $('#productWholesalePrice').value = number(product.wholesalePrice);
    $('#productWholesaleMin').value = number(product.wholesaleMin) || 1;

    $('#productPromoPrice').value = number(product.promoPrice) || '';
    $('#productPromoMin').value = number(product.promoMin) || 1;
    $('#productPromoStart').value = product.promoStart || '';
    $('#productPromoEnd').value = product.promoEnd || '';
    $('#productPromoNote').value = product.promoNote || '';

    $('#productStock').value = number(product.stock);
    $('#productMinStock').value = number(product.minStock);
    $('#productMaxStock').value = number(product.maxStock);

    $('#productLot').value = product.lot || '';
    $('#productExpiry').value = product.expiry || '';
    $('#productLocation').value = product.location || '';

    $('#productActive').checked = product.active !== false;

    $('#productImageData').value = product.image || '';
    setImagePreview(product.image || '');
  }

  updateProductCostPreview();
  openModal('productModal');

  if (promotionFocus) {
    window.setTimeout(() => {
      $('#productPromoPrice')?.focus();
    }, 50);
  }
}

$('#addProductButton')?.addEventListener('click', () => {
  openProductModal();
});

$('#newPromotionButton')?.addEventListener('click', () => {
  openProductModal();
});

function updateProductCostPreview() {
  const cost =
    number($('#productPurchaseCost')?.value) +
    number($('#productFreight')?.value) +
    number($('#productExtraCost')?.value);

  const sale = number($('#productSalePrice')?.value);
  const variable = number($('#productVariableCost')?.value);

  const contribution = sale > 0
    ? ((sale - cost - sale * variable / 100) / sale) * 100
    : 0;

  if ($('#productLandedCost')) {
    $('#productLandedCost').textContent = money(cost);
  }

  if ($('#productContribution')) {
    $('#productContribution').textContent =
      `${contribution.toFixed(1).replace('.', ',')}%`;
  }
}

[
  'productPurchaseCost',
  'productFreight',
  'productExtraCost',
  'productVariableCost',
  'productSalePrice'
].forEach(id => {
  document.getElementById(id)?.addEventListener(
    'input',
    updateProductCostPreview
  );
});

// Redimensiona as imagens para reduzir o uso de armazenamento local.
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Não foi possível ler o arquivo.'));
    };

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => {
        reject(new Error('O arquivo não é uma imagem válida.'));
      };

      image.onload = () => {
        const maxSide = 560;

        const scale = Math.min(
          1,
          maxSide / Math.max(image.width, image.height)
        );

        const canvas = document.createElement('canvas');

        canvas.width = Math.max(
          1,
          Math.round(image.width * scale)
        );

        canvas.height = Math.max(
          1,
          Math.round(image.height * scale)
        );

        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Não foi possível processar a imagem.'));
          return;
        }

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };

      image.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}

$('#productImageFile')?.addEventListener('change', async event => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    showToast('Escolha uma imagem JPG, PNG ou WebP.');
    event.target.value = '';
    return;
  }

  try {
    const dataUrl = await resizeImage(file);

    $('#productImageData').value = dataUrl;
    setImagePreview(dataUrl);

    showToast('Foto adicionada ao produto.');
  } catch (error) {
    console.error(error);
    showToast('Não foi possível carregar essa foto.');
  }
});

function validateProduct(data) {
  if (!data.name || !data.category) {
    return 'Preencha o nome e a categoria do produto.';
  }

  if (data.salePrice <= 0) {
    return 'O preço de venda precisa ser maior que zero.';
  }

  if (
    data.purchaseCost < 0 ||
    data.freight < 0 ||
    data.extraCost < 0
  ) {
    return 'Os custos não podem ser negativos.';
  }

  if (
    data.variablePercent < 0 ||
    data.variablePercent >= 100
  ) {
    return 'As despesas variáveis devem ficar entre 0% e menos de 100%.';
  }

  if (
    data.minStock > data.maxStock &&
    data.maxStock > 0
  ) {
    return 'O estoque mínimo não pode ser maior que o estoque máximo.';
  }

  if (
    data.promoPrice > 0 &&
    data.promoPrice >= data.salePrice
  ) {
    return 'O preço promocional deve ser menor que o preço normal.';
  }

  if (
    data.promoStart &&
    data.promoEnd &&
    data.promoEnd < data.promoStart
  ) {
    return 'A data final da promoção não pode ser anterior à data inicial.';
  }

  return '';
}

$('#productForm')?.addEventListener('submit', event => {
  event.preventDefault();

  const id = $('#editProductId').value;

  const previous = id
    ? products.find(product => product.id === id)
    : null;

  const data = {
    id: id || (
      window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `p-${Date.now()}`
    ),

    name: $('#productName').value.trim(),
    category: $('#productCategory').value,
    unit: $('#productUnit').value,

    sku: $('#productSku').value.trim() ||
      `MC-${String(Date.now()).slice(-6)}`,

    barcode: $('#productBarcode').value.trim(),
    brand: $('#productBrand').value.trim(),
    supplier: $('#productSupplier').value.trim(),
    description: $('#productDescription').value.trim(),

    purchaseCost: number($('#productPurchaseCost').value),
    freight: number($('#productFreight').value),
    extraCost: number($('#productExtraCost').value),
    variablePercent: number($('#productVariableCost').value),

    salePrice: number($('#productSalePrice').value),
    wholesalePrice: number($('#productWholesalePrice').value),
    wholesaleMin: Math.max(
      1,
      number($('#productWholesaleMin').value)
    ),

    promoPrice: number($('#productPromoPrice').value),
    promoMin: Math.max(
      1,
      number($('#productPromoMin').value)
    ),

    promoStart: $('#productPromoStart').value,
    promoEnd: $('#productPromoEnd').value,
    promoNote: $('#productPromoNote').value.trim(),

    // Ao editar, o saldo anterior é preservado.
    // Alterações devem ser registradas no módulo de estoque.
    stock: previous
      ? number(previous.stock)
      : number($('#productStock').value),

    minStock: number($('#productMinStock').value),
    maxStock: number($('#productMaxStock').value),

    lot: $('#productLot').value.trim(),
    expiry: $('#productExpiry').value,
    location: $('#productLocation').value.trim(),

    active: $('#productActive').checked,

    image: $('#productImageData').value ||
      previous?.image ||
      '',

    soldMonth: number(previous?.soldMonth),
    lostCount: number(previous?.lostCount)
  };

  const validationMessage = validateProduct(data);

  if (validationMessage) {
    showToast(validationMessage);
    return;
  }

  const duplicateSku = products.some(product =>
    product.id !== data.id &&
    data.sku &&
    product.sku === data.sku
  );

  if (duplicateSku) {
    showToast('Este SKU já está cadastrado em outro produto.');
    return;
  }

  const promoProfit = contributionValue(data, data.promoPrice);

  if (data.promoPrice > 0 && promoProfit < 0) {
    const accepted = confirm(
      'A promoção gera margem de contribuição negativa. Deseja salvar mesmo assim?'
    );

    if (!accepted) return;
  }

  if (previous) {
    products = products.map(product =>
      product.id === data.id ? data : product
    );
  } else {
    products.unshift(data);
  }

  if (!saveAll()) return;

  closeModal($('#productModal'));
  renderAll();

  showToast(
    previous
      ? 'Produto atualizado com sucesso.'
      : 'Produto cadastrado com sucesso.'
  );
});

function productImageMarkup(product) {
  if (product.image) {
    return `<img src="${product.image}" alt="${escapeHTML(product.name)}">`;
  }

  return 'IMG';
}

function renderProducts() {
  const search = ($('#productSearch')?.value || '')
    .trim()
    .toLowerCase();

  const category = $('#productCategoryFilter')?.value || '';
  const status = $('#productStatusFilter')?.value || '';

  const filtered = products.filter(product => {
    const matchesSearch = [
      product.name,
      product.sku,
      product.barcode,
      product.brand
    ].some(value =>
      String(value || '').toLowerCase().includes(search)
    );

    const matchesCategory =
      !category || product.category === category;

    const isLow =
      product.active &&
      number(product.stock) <= number(product.minStock);

    const matchesStatus =
      !status ||
      (status === 'active' && product.active) ||
      (status === 'inactive' && !product.active) ||
      (status === 'low' && isLow);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  $('#productsCount').textContent =
    products.filter(product => product.active).length;

  $('#promotedCount').textContent =
    products.filter(isPromotion).length;

  $('#lowStockCount').textContent =
    products.filter(product =>
      product.active &&
      number(product.stock) <= number(product.minStock)
    ).length;

  const active = products.filter(product => product.active);

  const average = active.length
    ? active.reduce(
        (sum, product) => sum + contributionRate(product),
        0
      ) / active.length
    : 0;

  $('#averageMargin').textContent =
    `${average.toFixed(1).replace('.', ',')}%`;

  $('#productsTableCount').textContent =
    `${filtered.length} de ${products.length} produtos`;

  $('#productsTableBody').innerHTML = filtered.length
    ? filtered.map(product => {
        const margin = contributionRate(product);

        const low =
          product.active &&
          number(product.stock) <= number(product.minStock);

        const statusLabel = !product.active
          ? '<span class="status-tag status-off">Inativo</span>'
          : low
            ? '<span class="status-tag status-low">Estoque baixo</span>'
            : '<span class="status-tag status-ok">Ativo</span>';

        const marginClass = margin < 0 ? 'negative' : '';

        return `
          <tr>
            <td>
              <div class="product-cell">
                <span class="product-thumb">
                  ${productImageMarkup(product)}
                </span>
                <span>
                  <strong>${escapeHTML(product.name)}</strong>
                  <small>
                    ${escapeHTML(product.sku || 'Sem SKU')}
                    ·
                    ${escapeHTML(product.brand || 'Sem marca')}
                  </small>
                </span>
              </div>
            </td>

            <td>${escapeHTML(product.category)}</td>
            <td>${money(landedCost(product))}</td>

            <td>
              <strong>${money(product.salePrice)}</strong>
              ${
                isPromotion(product)
                  ? `<small class="promo-inline">Oferta: ${money(product.promoPrice)}</small>`
                  : ''
              }
            </td>

            <td class="${marginClass}">
              ${margin.toFixed(1).replace('.', ',')}%
            </td>

            <td>
              ${quantity(product.stock)}
              ${escapeHTML(product.unit || '')}
            </td>

            <td>${statusLabel}</td>

            <td>
              <span class="row-actions">
                <button
                  type="button"
                  title="Editar produto"
                  aria-label="Editar ${escapeHTML(product.name)}"
                  data-edit-product="${escapeHTML(product.id)}"
                >✎</button>

                <button
                  type="button"
                  title="Excluir produto"
                  aria-label="Excluir ${escapeHTML(product.name)}"
                  data-delete-product="${escapeHTML(product.id)}"
                >×</button>
              </span>
            </td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="8" class="empty-state">Nenhum produto corresponde aos filtros.</td></tr>';
}

$('#productSearch')?.addEventListener('input', renderProducts);
$('#productCategoryFilter')?.addEventListener('change', renderProducts);
$('#productStatusFilter')?.addEventListener('change', renderProducts);

$('#productsTableBody')?.addEventListener('click', event => {
  const edit = event.target.closest('[data-edit-product]');
  const remove = event.target.closest('[data-delete-product]');

  if (edit) {
    openProductModal(edit.dataset.editProduct);
  }

  if (remove) {
    const product = products.find(
      item => item.id === remove.dataset.deleteProduct
    );

    if (!product) return;

    if (confirm(
      `Deseja excluir o produto “${product.name}” do cadastro deste navegador?`
    )) {
      products = products.filter(item => item.id !== product.id);

      saveAll();
      renderAll();

      showToast('Produto excluído.');
    }
  }
});

// ======================================
// PAINEL DE VISÃO GERAL
// ======================================

function renderDailyChart() {
  const max = Math.max(...demoDailySales, 1);

  $('#salesChart').innerHTML = demoDailySales.map((value, index) => {
    const height = Math.max(5, value / max * 100);

    const label = [
      'Seg',
      'Ter',
      'Qua',
      'Qui',
      'Sex',
      'Sáb',
      'Dom'
    ][index];

    return `
      <div class="chart-bar-wrap" title="${money(value)}">
        <div class="chart-bar" style="height:${height}%"></div>
        <small>${label}</small>
      </div>
    `;
  }).join('');
}

function renderCategoryChart(
  containerSelector,
  data = demoCategorySales
) {
  const container = $(containerSelector);

  if (!container) return;

  const total = data.reduce(
    (sum, category) => sum + number(category.value),
    0
  );

  container.innerHTML = data.map(category => {
    const percent = total > 0
      ? number(category.value) / total * 100
      : 0;

    return `
      <div class="category-row">
        <span>${escapeHTML(category.name)}</span>

        <div class="category-track">
          <div
            class="category-fill"
            style="width:${percent.toFixed(1)}%"
          ></div>
        </div>

        <strong>${money(category.value)}</strong>
      </div>
    `;
  }).join('');
}

function renderOverview() {
  const inventoryValue = products.reduce(
    (sum, product) =>
      sum + number(product.stock) * landedCost(product),
    0
  );

  const activeProducts = products.filter(
    product => product.active
  );

  const lowStock = activeProducts.filter(
    product =>
      number(product.stock) <= number(product.minStock)
  );

  // Estes indicadores comerciais são exemplos, não vendas reais.
  const contributionEstimate = 12563.20;

  $('#kpiRevenue').textContent = money(48320);
  $('#kpiContribution').textContent =
    money(contributionEstimate);

  $('#kpiTicket').textContent = money(67.48);
  $('#kpiStockValue').textContent = money(inventoryValue);

  $('#stockNavCount').textContent = lowStock.length;

  const expiringCount = activeProducts.filter(product => {
    const days = daysUntil(product.expiry);

    return days !== null && days >= 0 && days <= 15;
  }).length;

  $('#alertTotal').textContent =
    lowStock.length + expiringCount;

  renderDailyChart();
  renderCategoryChart('#categoryChart');

  const topProducts = [...products]
    .sort((a, b) => number(b.soldMonth) - number(a.soldMonth))
    .slice(0, 5);

  $('#topProductsBody').innerHTML = topProducts.length
    ? topProducts.map(product => `
        <tr>
          <td>
            <div class="product-cell">
              <span class="product-thumb">
                ${productImageMarkup(product)}
              </span>

              <span>
                <strong>${escapeHTML(product.name)}</strong>
                <small>${escapeHTML(product.sku || '')}</small>
              </span>
            </div>
          </td>

          <td>${escapeHTML(product.category)}</td>
          <td>${quantity(product.soldMonth)}</td>

          <td>
            <strong>
              ${money(number(product.soldMonth) * number(product.salePrice))}
            </strong>
          </td>
        </tr>
      `).join('')
    : '<tr><td colspan="4" class="empty-state">Cadastre produtos para visualizar o ranking.</td></tr>';

  const alerts = [];

  lowStock.forEach(product => {
    alerts.push({
      symbol: '!',
      title: `Estoque baixo: ${product.name}`,
      description: `Saldo ${quantity(product.stock)} · mínimo ${quantity(product.minStock)}`
    });
  });

  activeProducts.forEach(product => {
    const days = daysUntil(product.expiry);

    if (days !== null && days >= 0 && days <= 15) {
      alerts.push({
        symbol: '◷',
        title: `Validade próxima: ${product.name}`,
        description: `Vence em ${days} dia(s) · ${formatDate(product.expiry)}`
      });
    }
  });

  $('#overviewAlerts').innerHTML = alerts.length
    ? alerts.slice(0, 7).map(alert => `
        <div class="alert-item">
          <span class="alert-symbol">${alert.symbol}</span>

          <span>
            <strong>${escapeHTML(alert.title)}</strong>
            <small>${escapeHTML(alert.description)}</small>
          </span>
        </div>
      `).join('')
    : '<div class="empty-state">Nenhum alerta de estoque ou validade.</div>';
}

// ======================================
// ESTOQUE E MOVIMENTAÇÕES
// ======================================

function populateStockSelect() {
  const select = $('#stockProductSelect');

  if (!select) return;

  select.innerHTML = products.map(product => `
    <option value="${escapeHTML(product.id)}">
      ${escapeHTML(product.name)}
      — saldo ${quantity(product.stock)}
    </option>
  `).join('');
}

function renderInventory() {
  const search = ($('#inventorySearch')?.value || '')
    .trim()
    .toLowerCase();

  const filtered = products.filter(product => {
    return [
      product.name,
      product.sku,
      product.lot
    ].some(value =>
      String(value || '').toLowerCase().includes(search)
    );
  });

  const active = products.filter(product => product.active);

  const low = active.filter(product =>
    number(product.stock) <= number(product.minStock)
  );

  const expiring = active.filter(product => {
    const days = daysUntil(product.expiry);

    return days !== null && days >= 0 && days <= 15;
  });

  const units = products.reduce(
    (sum, product) => sum + number(product.stock),
    0
  );

  const capital = products.reduce(
    (sum, product) =>
      sum + number(product.stock) * landedCost(product),
    0
  );

  $('#inventoryLow').textContent = low.length;
  $('#inventoryExpiry').textContent = expiring.length;
  $('#inventoryUnits').textContent = quantity(units);
  $('#inventoryCapital').textContent = money(capital);

  $('#inventoryTableBody').innerHTML = filtered.length
    ? filtered.map(product => {
        const days = daysUntil(product.expiry);

        const status = !product.active
          ? '<span class="status-tag status-off">Inativo</span>'
          : number(product.stock) <= number(product.minStock)
            ? '<span class="status-tag status-low">Repor</span>'
            : days !== null && days >= 0 && days <= 15
              ? '<span class="status-tag status-low">Vence em breve</span>'
              : days !== null && days < 0
                ? '<span class="status-tag status-low">Vencido</span>'
                : '<span class="status-tag status-ok">Regular</span>';

        const suggested = Math.max(
          0,
          number(product.maxStock) - number(product.stock)
        );

        return `
          <tr>
            <td>
              <strong>${escapeHTML(product.name)}</strong>
              <small class="table-subline">${escapeHTML(product.sku || '')}</small>
            </td>

            <td>
              ${quantity(product.stock)}
              ${escapeHTML(product.unit || '')}
            </td>

            <td>${quantity(product.minStock)}</td>

            <td>
              ${quantity(suggested)}
              ${escapeHTML(product.unit || '')}
            </td>

            <td>${escapeHTML(product.lot || '—')}</td>
            <td>${formatDate(product.expiry)}</td>
            <td>${status}</td>

            <td>
              <span class="row-actions">
                <button
                  type="button"
                  title="Ajustar estoque"
                  data-adjust-stock="${escapeHTML(product.id)}"
                >±</button>
              </span>
            </td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="8" class="empty-state">Nenhum produto encontrado.</td></tr>';

  const movementNames = {
    entry: 'Entrada',
    exit: 'Saída',
    loss: 'Perda / quebra',
    count: 'Contagem'
  };

  const recent = [...movements].reverse().slice(0, 12);

  $('#inventoryMovementsBody').innerHTML = recent.length
    ? recent.map(movement => {
        const date = new Date(movement.createdAt);

        const dateText = Number.isNaN(date.getTime())
          ? '—'
          : date.toLocaleString('pt-BR');

        const sign = movement.type === 'entry'
          ? '+'
          : movement.type === 'count'
            ? '→'
            : '−';

        return `
          <tr>
            <td>${dateText}</td>
            <td><strong>${escapeHTML(movement.productName)}</strong></td>
            <td>${movementNames[movement.type] || 'Ajuste'}</td>
            <td>${sign} ${quantity(movement.quantity)}</td>
            <td>${quantity(movement.before)}</td>
            <td><strong>${quantity(movement.after)}</strong></td>
            <td>${escapeHTML(movement.reason)}</td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="7" class="empty-state">Nenhuma movimentação registrada.</td></tr>';

  populateStockSelect();
}

$('#inventorySearch')?.addEventListener('input', renderInventory);

$('#inventoryAdjustmentButton')?.addEventListener('click', () => {
  populateStockSelect();

  if (!products.length) {
    showToast('Cadastre um produto antes de ajustar o estoque.');
    return;
  }

  $('#stockForm').reset();
  openModal('stockModal');
});

$('#inventoryTableBody')?.addEventListener('click', event => {
  const button = event.target.closest('[data-adjust-stock]');

  if (!button) return;

  populateStockSelect();

  $('#stockProductSelect').value = button.dataset.adjustStock;

  $('#stockForm').reset();

  // Reaplica a seleção após o reset do formulário.
  $('#stockProductSelect').value = button.dataset.adjustStock;

  openModal('stockModal');
});

$('#stockForm')?.addEventListener('submit', event => {
  event.preventDefault();

  const product = products.find(
    item => item.id === $('#stockProductSelect').value
  );

  const type = $('#stockMovementType').value;
  const amount = number($('#stockMovementQuantity').value);
  const reason = $('#stockMovementReason').value.trim();

  if (!product || amount <= 0 || !reason) {
    showToast('Informe o produto, a quantidade e o motivo.');
    return;
  }

  const before = number(product.stock);

  let after = before;

  if (type === 'entry') after += amount;

  if (type === 'exit' || type === 'loss') {
    after -= amount;
  }

  if (type === 'count') {
    after = amount;
  }

  if (after < 0) {
    showToast('O estoque não pode ficar negativo.');
    return;
  }

  product.stock = after;

  if (type === 'loss') {
    product.lostCount = number(product.lostCount) + amount;
  }

  movements.push({
    id: `m-${Date.now()}`,
    productId: product.id,
    productName: product.name,
    type,
    quantity: amount,
    before,
    after,
    reason,
    createdAt: new Date().toISOString()
  });

  if (!saveAll()) return;

  closeModal($('#stockModal'));
  $('#stockForm').reset();

  renderAll();

  showToast(`Estoque de ${product.name} atualizado.`);
});

// ======================================
// PROMOÇÕES
// ======================================

function renderPromotions() {
  const withPromotion = products.filter(product =>
    number(product.promoPrice) > 0 &&
    number(product.promoPrice) < number(product.salePrice)
  );

  const active = withPromotion.filter(isPromotion);

  $('#promotionCount').textContent = withPromotion.length;
  $('#promotionActiveCount').textContent = active.length;
  $('#promotionProductCount').textContent = active.length;

  $('#promotionCards').innerHTML = withPromotion.length
    ? withPromotion.map(product => {
        const discount =
          (1 - number(product.promoPrice) / number(product.salePrice)) * 100;

        const status = isPromotion(product)
          ? '<span class="status-tag status-ok">Ativa</span>'
          : '<span class="status-tag status-off">Agendada / encerrada</span>';

        const range = [
          product.promoStart,
          product.promoEnd
        ].filter(Boolean).map(formatDate).join(' até ') ||
          'Sem período definido';

        return `
          <article class="promotion-card">
            <div class="promotion-visual">
              <strong>-${discount.toFixed(0)}%</strong>
              <span>OFERTA<br>VAREJO</span>
            </div>

            <div class="promotion-details">
              <h3>${escapeHTML(product.name)}</h3>

              <p>
                ${escapeHTML(product.promoNote || 'Oferta especial')}
                ·
                ${escapeHTML(range)}
              </p>

              <div class="promotion-prices">
                <del>${money(product.salePrice)}</del>
                <strong>${money(product.promoPrice)}</strong>
              </div>

              <div class="promotion-actions">
                ${status}

                <button
                  type="button"
                  class="text-button"
                  data-edit-promo="${escapeHTML(product.id)}"
                >Editar oferta →</button>
              </div>
            </div>
          </article>
        `;
      }).join('')
    : '<div class="panel empty-state">Nenhuma promoção cadastrada. Use “Criar promoção” para começar.</div>';
}

$('#promotionCards')?.addEventListener('click', event => {
  const button = event.target.closest('[data-edit-promo]');

  if (button) {
    openProductModal(button.dataset.editPromo, true);
  }
});

// ======================================
// FORNECEDORES
// ======================================

function renderSuppliers() {
  $('#supplierCount').textContent = suppliers.length;

  $('#suppliersTableBody').innerHTML = suppliers.length
    ? suppliers.map(supplier => `
        <tr>
          <td>
            <strong>${escapeHTML(supplier.name)}</strong>
            <small class="table-subline">${escapeHTML(supplier.id)}</small>
          </td>

          <td>${escapeHTML(supplier.category || '—')}</td>
          <td>${escapeHTML(supplier.phone || '—')}</td>
          <td>${escapeHTML(supplier.leadTime || '—')}</td>
          <td>${escapeHTML(supplier.terms || 'A combinar')}</td>

          <td>
            <span class="status-tag status-ok">Cadastrado</span>
          </td>
        </tr>
      `).join('')
    : '<tr><td colspan="6" class="empty-state">Nenhum fornecedor cadastrado.</td></tr>';
}

$('#addSupplierButton')?.addEventListener('click', () => {
  $('#supplierForm').reset();
  openModal('supplierModal');
});

$('#supplierForm')?.addEventListener('submit', event => {
  event.preventDefault();

  const name = $('#supplierName').value.trim();

  if (!name) {
    showToast('Informe o nome do fornecedor.');
    return;
  }

  suppliers.unshift({
    id: `s-${Date.now()}`,
    name,
    category: $('#supplierCategory').value.trim(),
    phone: $('#supplierPhone').value.trim(),
    leadTime: $('#supplierLeadTime').value.trim(),
    terms: $('#supplierTerms').value.trim()
  });

  if (!saveAll()) return;

  closeModal($('#supplierModal'));
  $('#supplierForm').reset();

  renderSuppliers();

  showToast('Fornecedor cadastrado.');
});

// ======================================
// VENDAS DEMONSTRATIVAS
// ======================================

function renderSales() {
  $('#salesTableBody').innerHTML = demoOrders.map(order => {
    return `
      <tr>
        ${order.map((value, index) => {
          if (index === 5) {
            return `<td><strong>${escapeHTML(value)}</strong></td>`;
          }

          if (index === 6) {
            const statusClass = value === 'Concluído'
              ? 'status-ok'
              : 'status-pending';

            return `
              <td>
                <span class="status-tag ${statusClass}">
                  ${escapeHTML(value)}
                </span>
              </td>
            `;
          }

          return `<td>${escapeHTML(value)}</td>`;
        }).join('')}
      </tr>
    `;
  }).join('');
}

$('#periodFilter')?.addEventListener('change', () => {
  showToast(
    'Este filtro é demonstrativo: conecte o histórico real de vendas para atualizar o período.'
  );
});

$('#salesPeriod')?.addEventListener('change', () => {
  showToast(
    'O filtro de vendas será aplicado após a integração com pedidos reais.'
  );
});

// ======================================
// FINANCEIRO E PRECIFICAÇÃO
// ======================================

function populatePriceProductSelect() {
  const select = $('#priceProductSelect');

  if (!select) return;

  const selected = select.value;

  select.innerHTML = `
    <option value="">Produto manual / informar custo</option>
    ${products.map(product => `
      <option value="${escapeHTML(product.id)}">
        ${escapeHTML(product.name)}
      </option>
    `).join('')}
  `;

  if (products.some(product => product.id === selected)) {
    select.value = selected;
  }
}

function recalculatePricing() {
  const cost = number($('#priceCost')?.value);
  const variable = number($('#priceVariable')?.value);
  const desired = number($('#targetMargin')?.value);

  const denominator =
    1 - variable / 100 - desired / 100;

  if (
    cost < 0 ||
    variable < 0 ||
    desired < 0 ||
    variable >= 100 ||
    desired >= 100 ||
    denominator <= 0
  ) {
    $('#suggestedPrice').textContent = 'Não calculável';

    $('#priceFormula').textContent =
      'A soma das despesas variáveis e da margem deve ser menor que 100%.';

    return;
  }

  const suggested = cost / denominator;

  $('#suggestedPrice').textContent = money(suggested);

  $('#priceFormula').textContent =
    `${money(cost)} ÷ (1 − ${variable}% − ${desired}%)`;
}

function recalculateBreakEven() {
  const salesValue = products.reduce(
    (sum, product) =>
      sum + number(product.soldMonth) * number(product.salePrice),
    0
  );

  const contribution = products.reduce(
    (sum, product) =>
      sum + number(product.soldMonth) * contributionValue(product),
    0
  );

  const fallbackMargin = products.length
    ? products.reduce(
        (sum, product) => sum + contributionRate(product),
        0
      ) / products.length / 100
    : 0;

  const rate = salesValue > 0
    ? contribution / salesValue
    : fallbackMargin;

  const fixed = number($('#fixedCosts')?.value);
  const desiredProfit = number($('#desiredProfit')?.value);

  const breakEven = rate > 0
    ? fixed / rate
    : null;

  const salesGoal = rate > 0
    ? (fixed + desiredProfit) / rate
    : null;

  $('#averageContributionRate').textContent =
    `${(rate * 100).toFixed(1).replace('.', ',')}%`;

  $('#breakEvenValue').textContent =
    breakEven === null
      ? 'Sem margem positiva'
      : money(breakEven);

  $('#salesGoalValue').textContent =
    salesGoal === null
      ? 'Sem margem positiva'
      : money(salesGoal);
}

$('#priceProductSelect')?.addEventListener('change', event => {
  const product = products.find(
    item => item.id === event.target.value
  );

  if (product) {
    $('#priceCost').value = landedCost(product).toFixed(2);
    $('#priceVariable').value = number(product.variablePercent);
  }

  recalculatePricing();
});

[
  'priceCost',
  'priceVariable',
  'targetMargin'
].forEach(id => {
  document.getElementById(id)?.addEventListener(
    'input',
    recalculatePricing
  );
});

[
  'fixedCosts',
  'desiredProfit'
].forEach(id => {
  document.getElementById(id)?.addEventListener(
    'input',
    recalculateBreakEven
  );
});

// ======================================
// RELATÓRIOS
// ======================================

function renderReports() {
  const total = demoCategorySales.reduce(
    (sum, item) => sum + number(item.value),
    0
  );

  renderCategoryChart(
    '#reportCategoryChart',
    demoCategorySales
  );

  $('#categoryReportBody').innerHTML =
    demoCategorySales.map(item => {
      const share = total > 0
        ? item.value / total * 100
        : 0;

      const note = share >= 20
        ? 'Categoria de destaque'
        : share >= 10
          ? 'Participação intermediária'
          : 'Acompanhar evolução';

      return `
        <tr>
          <td><strong>${escapeHTML(item.name)}</strong></td>
          <td>${money(item.value)}</td>
          <td>${share.toFixed(1).replace('.', ',')}%</td>
          <td>${note}</td>
        </tr>
      `;
    }).join('');
}

// ======================================
// EXPORTAÇÕES E BACKUP LOCAL
// ======================================

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportBackup() {
  const backup = {
    exportedAt: new Date().toISOString(),
    note: 'Backup local demonstrativo; não substitui backup do servidor.',
    products,
    suppliers,
    movements
  };

  downloadFile(
    `mercado-confianca-backup-${dateOnly()}.json`,
    JSON.stringify(backup, null, 2),
    'application/json'
  );

  showToast(
    'Backup local exportado. Guarde o arquivo em local seguro.'
  );
}

$('#exportBackup')?.addEventListener('click', exportBackup);
$('#securityBackup')?.addEventListener('click', exportBackup);

$('#exportProducts')?.addEventListener('click', () => {
  const columns = [
    'Nome',
    'Categoria',
    'SKU',
    'Codigo de barras',
    'Custo real',
    'Preco varejo',
    'Preco atacado',
    'Margem contribuicao %',
    'Estoque',
    'Estoque minimo',
    'Lote',
    'Validade',
    'Ativo'
  ];

  const rows = products.map(product => [
    product.name,
    product.category,
    product.sku,
    product.barcode,
    landedCost(product).toFixed(2),
    number(product.salePrice).toFixed(2),
    number(product.wholesalePrice).toFixed(2),
    contributionRate(product).toFixed(2),
    product.stock,
    product.minStock,
    product.lot,
    product.expiry,
    product.active ? 'Sim' : 'Nao'
  ]);

  const csv = [columns, ...rows]
    .map(row =>
      row.map(value =>
        `"${String(value ?? '').replace(/"/g, '""')}"`
      ).join(';')
    )
    .join('\r\n');

  downloadFile(
    `produtos-mercado-confianca-${dateOnly()}.csv`,
    '\ufeff' + csv,
    'text/csv;charset=utf-8;'
  );

  showToast('Lista de produtos exportada em CSV.');
});

$('#exportReport')?.addEventListener('click', () => {
  const report = {
    generatedAt: new Date().toISOString(),

    categorySales: demoCategorySales,

    inventoryValue: products.reduce(
      (sum, product) =>
        sum + number(product.stock) * landedCost(product),
      0
    ),

    productCount: products.length,

    lowStock: products
      .filter(product =>
        product.active &&
        number(product.stock) <= number(product.minStock)
      )
      .map(product => product.name)
  };

  downloadFile(
    `relatorio-mercado-confianca-${dateOnly()}.json`,
    JSON.stringify(report, null, 2),
    'application/json'
  );

  showToast('Resumo gerencial exportado.');
});

// ======================================
// FECHAMENTO DE MODAIS E TECLADO
// ======================================

$$('[data-close-modal]').forEach(button => {
  button.addEventListener('click', () => {
    closeModal(button.closest('.modal-backdrop'));
  });
});

$$('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) {
      closeModal(backdrop);
    }
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    $$('.modal-backdrop.is-open').forEach(closeModal);
    closeSidebar();
  }
});

// ======================================
// INICIALIZAÇÃO
// ======================================

function renderAll() {
  renderOverview();
  renderProducts();
  renderInventory();
  renderPromotions();
  renderSuppliers();
  renderSales();

  populatePriceProductSelect();

  renderReports();
  recalculatePricing();
  recalculateBreakEven();
}

// Inicializa sem depender de backend.
renderAll();