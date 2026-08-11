(() => {
  "use strict";

  /* Catálogo único: vitrine e carrinho usam a mesma fonte de dados. */
  const PRODUCTS = [
    {
      id: "speedrunner-pro",
      name: "SpeedRunner Pro",
      category: "Masculino • Corrida",
      tag: "Corrida",
      price: 499.9,
      image: "assets/speedrunner-pro.jpg",
      alt: "Tênis SpeedRunner Pro preto e branco",
      description: "Estrutura robusta, design esportivo e amortecimento para treinos intensos.",
      features: ["Solado alto com absorção de impacto", "Visual esportivo preto e branco", "Ideal para corrida e uso urbano"]
    },
    {
      id: "airboost-max",
      name: "AirBoost Max",
      category: "Unissex • Casual",
      tag: "Casual",
      price: 379.9,
      image: "assets/airboost-max.jpg",
      alt: "Tênis AirBoost Max bege",
      description: "Modelo moderno em tom neutro, com visual premium para compor looks esportivos.",
      features: ["Câmara de amortecimento aparente", "Acabamento monocromático elegante", "Conforto para a rotina diária"],
      featured: true
    },
    {
      id: "flexfit-ultra",
      name: "FlexFit Ultra",
      category: "Feminino • Treino",
      tag: "Treino",
      price: 429.9,
      image: "assets/flexfit-ultra.jpg",
      alt: "Tênis FlexFit Ultra cinza",
      description: "Tênis leve, flexível e respirável para treino, caminhada e uso prolongado.",
      features: ["Cabedal em tecido respirável", "Solado branco flexível", "Leveza para exercícios diários"]
    }
  ];

  const PRODUCTS_BY_ID = new Map(PRODUCTS.map((product) => [product.id, product]));
  const STORAGE = { cart: "speedkicks:cart:v2", account: "speedkicks:account:v1" };
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  const state = {
    cart: readStorage(STORAGE.cart, {}),
    account: readStorage(STORAGE.account, null)
  };

  const dom = {
    menuToggle: document.querySelector("#menuToggle"),
    mainNav: document.querySelector("#mainNav"),
    productGrid: document.querySelector("#productGrid"),
    cartButton: document.querySelector("#cartButton"),
    cartCount: document.querySelector("#cartCount"),
    cartDrawer: document.querySelector("#cartDrawer"),
    cartOverlay: document.querySelector("#cartOverlay"),
    closeCartButton: document.querySelector("#closeCartButton"),
    emptyCart: document.querySelector("#emptyCart"),
    cartContent: document.querySelector("#cartContent"),
    cartItems: document.querySelector("#cartItems"),
    cartQuantitySummary: document.querySelector("#cartQuantitySummary"),
    cartTotal: document.querySelector("#cartTotal"),
    clearCartButton: document.querySelector("#clearCartButton"),
    checkoutButton: document.querySelector("#checkoutButton"),
    accountButton: document.querySelector("#accountButton"),
    accountButtonText: document.querySelector("#accountButtonText"),
    accountDialog: document.querySelector("#accountDialog"),
    accountTitle: document.querySelector("#accountTitle"),
    closeAccountButton: document.querySelector("#closeAccountButton"),
    registerForm: document.querySelector("#registerForm"),
    registerEmail: document.querySelector("#registerEmail"),
    registerPassword: document.querySelector("#registerPassword"),
    registerPasswordConfirm: document.querySelector("#registerPasswordConfirm"),
    registerCep: document.querySelector("#registerCep"),
    cepFeedback: document.querySelector("#cepFeedback"),
    registerFeedback: document.querySelector("#registerFeedback"),
    accountProfile: document.querySelector("#accountProfile"),
    profileEmail: document.querySelector("#profileEmail"),
    profileCep: document.querySelector("#profileCep"),
    profileAddress: document.querySelector("#profileAddress"),
    logoutButton: document.querySelector("#logoutButton"),
    checkoutDialog: document.querySelector("#checkoutDialog"),
    closeCheckoutButton: document.querySelector("#closeCheckoutButton"),
    checkoutForm: document.querySelector("#checkoutForm"),
    checkoutEmail: document.querySelector("#checkoutEmail"),
    checkoutCep: document.querySelector("#checkoutCep"),
    checkoutTotal: document.querySelector("#checkoutTotal"),
    checkoutFeedback: document.querySelector("#checkoutFeedback"),
    contactForm: document.querySelector("#contactForm"),
    contactFeedback: document.querySelector("#contactFeedback"),
    toast: document.querySelector("#toast")
  };

  let toastTimer;
  let focusBeforeCart;

  /* Acesso defensivo ao localStorage evita quebrar a interface se o storage estiver indisponível. */
  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("Não foi possível salvar dados locais.", error);
    }
  }

  function removeStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Não foi possível remover dados locais.", error);
    }
  }

  function formatMoney(value) {
    return money.format(value);
  }

  function normalizeCep(value) {
    return String(value).replace(/\D/g, "").slice(0, 8);
  }

  function formatCep(value) {
    const digits = normalizeCep(value);
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  }

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => dom.toast.classList.remove("show"), 2500);
  }

  /* Vitrine */
  function renderProducts() {
    dom.productGrid.innerHTML = PRODUCTS.map((product) => `
      <article class="product-card${product.featured ? " featured" : ""}">
        <div class="product-image">
          <span class="product-tag">${product.tag}</span>
          <img src="${product.image}" alt="${product.alt}" loading="lazy">
        </div>
        <div class="product-info">
          <p class="product-category">${product.category}</p>
          <h3>${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <ul class="product-features">${product.features.map((item) => `<li>${item}</li>`).join("")}</ul>
          <div class="product-footer">
            <div class="product-price"><small>À vista</small><strong>${formatMoney(product.price)}</strong></div>
            <button class="add-to-cart" type="button" data-product-id="${product.id}">Adicionar</button>
          </div>
        </div>
      </article>
    `).join("");
  }

  /* Carrinho: toda alteração termina em saveCart + renderCart. */
  function cartEntries() {
    return Object.entries(state.cart)
      .filter(([id, quantity]) => PRODUCTS_BY_ID.has(id) && Number.isInteger(quantity) && quantity > 0)
      .map(([id, quantity]) => ({ product: PRODUCTS_BY_ID.get(id), quantity }));
  }

  function cartQuantity() {
    return cartEntries().reduce((sum, item) => sum + item.quantity, 0);
  }

  function cartTotal() {
    return cartEntries().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  function saveCart() {
    writeStorage(STORAGE.cart, state.cart);
  }

  function renderCart() {
    const entries = cartEntries();
    const quantity = cartQuantity();
    const total = cartTotal();
    const hasItems = entries.length > 0;

    dom.cartCount.textContent = quantity;
    dom.cartQuantitySummary.textContent = quantity;
    dom.cartTotal.textContent = formatMoney(total);
    dom.checkoutTotal.textContent = formatMoney(total);
    dom.emptyCart.hidden = hasItems;
    dom.cartContent.hidden = !hasItems;

    dom.cartItems.innerHTML = entries.map(({ product, quantity: itemQuantity }) => `
      <article class="cart-item">
        <div class="cart-item-image"><img src="${product.image}" alt="${product.alt}"></div>
        <div class="cart-item-info">
          <h3>${product.name}</h3>
          <span class="cart-item-unit-price">${formatMoney(product.price)} cada</span>
          <div class="cart-item-controls">
            <div class="quantity-control" aria-label="Quantidade de ${product.name}">
              <button type="button" data-cart-action="decrease" data-product-id="${product.id}">−</button>
              <span>${itemQuantity}</span>
              <button type="button" data-cart-action="increase" data-product-id="${product.id}">+</button>
            </div>
            <button class="remove-item" type="button" data-cart-action="remove" data-product-id="${product.id}">Remover</button>
          </div>
          <strong class="cart-item-subtotal">Subtotal: ${formatMoney(product.price * itemQuantity)}</strong>
        </div>
      </article>
    `).join("");
  }

  function setCartQuantity(productId, quantity, message = "") {
    if (!PRODUCTS_BY_ID.has(productId)) return;
    if (quantity <= 0) delete state.cart[productId];
    else state.cart[productId] = quantity;
    saveCart();
    renderCart();
    if (message) showToast(message);
  }

  function addToCart(productId) {
    const product = PRODUCTS_BY_ID.get(productId);
    if (!product) return;
    setCartQuantity(productId, (state.cart[productId] || 0) + 1, `${product.name} adicionado ao carrinho.`);
    openCart();
  }

  function openCart() {
    focusBeforeCart = document.activeElement;
    dom.cartDrawer.classList.add("open");
    dom.cartOverlay.classList.add("open");
    dom.cartDrawer.setAttribute("aria-hidden", "false");
    dom.cartButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("drawer-open");
    dom.closeCartButton.focus();
  }

  function closeCart() {
    dom.cartDrawer.classList.remove("open");
    dom.cartOverlay.classList.remove("open");
    dom.cartDrawer.setAttribute("aria-hidden", "true");
    dom.cartButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("drawer-open");
    if (focusBeforeCart instanceof HTMLElement) focusBeforeCart.focus();
  }

  /* Cadastro local demonstrativo. A senha é validada, mas nunca persistida. */
  function renderAccount() {
    const logged = Boolean(state.account);
    dom.accountButtonText.textContent = logged ? "Minha conta" : "Cadastro";
    dom.accountTitle.textContent = logged ? "Minha conta" : "Cadastro";
    dom.registerForm.hidden = logged;
    dom.accountProfile.hidden = !logged;
    if (logged) {
      dom.profileEmail.textContent = state.account.email;
      dom.profileCep.textContent = formatCep(state.account.cep);
      dom.profileAddress.textContent = state.account.address || "Não informado";
    }
  }

  function openAccount() {
    closeCart();
    renderAccount();
    dom.accountDialog.showModal();
  }

  async function lookupCep() {
    const cep = normalizeCep(dom.registerCep.value);
    if (cep.length !== 8) return "";
    dom.cepFeedback.textContent = "Consultando CEP...";
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!response.ok || data.erro) throw new Error("CEP não encontrado");
      const address = [data.logradouro, data.bairro, `${data.localidade} - ${data.uf}`].filter(Boolean).join(", ");
      dom.cepFeedback.textContent = address;
      dom.cepFeedback.className = "field-feedback success";
      return address;
    } catch {
      dom.cepFeedback.textContent = "Consulta indisponível. O CEP poderá ser usado normalmente.";
      dom.cepFeedback.className = "field-feedback";
      return "";
    }
  }

  async function registerAccount(event) {
    event.preventDefault();
    const email = dom.registerEmail.value.trim().toLowerCase();
    const password = dom.registerPassword.value;
    const confirmation = dom.registerPasswordConfirm.value;
    const cep = normalizeCep(dom.registerCep.value);
    const validPassword = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

    if (!dom.registerEmail.checkValidity() || !validPassword || password !== confirmation || cep.length !== 8) {
      dom.registerFeedback.textContent = "Revise o e-mail, a senha, a confirmação e o CEP.";
      return;
    }

    const address = await lookupCep();
    state.account = { email, cep, address, createdAt: new Date().toISOString() };
    writeStorage(STORAGE.account, state.account);
    dom.registerForm.reset();
    dom.registerFeedback.textContent = "";
    renderAccount();
    prefillCheckout();
    showToast("Cadastro criado com sucesso.");
  }

  function logoutAccount() {
    state.account = null;
    removeStorage(STORAGE.account);
    renderAccount();
    dom.accountDialog.close();
    showToast("Conta local removida.");
  }

  /* Checkout demonstra o fluxo sem processar pagamentos reais. */
  function prefillCheckout() {
    if (!state.account) return;
    dom.checkoutEmail.value = state.account.email;
    dom.checkoutCep.value = formatCep(state.account.cep);
  }

  function openCheckout() {
    if (!cartQuantity()) {
      showToast("Adicione um produto antes de finalizar.");
      return;
    }
    closeCart();
    dom.checkoutTotal.textContent = formatMoney(cartTotal());
    prefillCheckout();
    dom.checkoutDialog.showModal();
  }

  function finishCheckout(event) {
    event.preventDefault();
    const payment = dom.checkoutForm.elements.payment;
    if (!dom.checkoutEmail.checkValidity() || normalizeCep(dom.checkoutCep.value).length !== 8 || !payment.checkValidity()) {
      dom.checkoutFeedback.textContent = "Preencha corretamente todos os campos obrigatórios.";
      return;
    }
    const order = Math.floor(100000 + Math.random() * 900000);
    state.cart = {};
    saveCart();
    renderCart();
    dom.checkoutForm.reset();
    dom.checkoutDialog.close();
    showToast(`Pedido demonstrativo #${order} confirmado.`);
  }

  function submitContact(event) {
    event.preventDefault();
    if (!dom.contactForm.checkValidity()) {
      dom.contactFeedback.classList.add("error");
      dom.contactFeedback.textContent = "Preencha os campos obrigatórios.";
      return;
    }
    dom.contactFeedback.classList.remove("error");
    dom.contactFeedback.textContent = "Mensagem enviada com sucesso.";
    dom.contactForm.reset();
  }

  function configureEvents() {
    dom.menuToggle.addEventListener("click", () => {
      const open = dom.mainNav.classList.toggle("open");
      dom.menuToggle.setAttribute("aria-expanded", String(open));
    });

    dom.productGrid.addEventListener("click", (event) => {
      const button = event.target.closest(".add-to-cart");
      if (button) addToCart(button.dataset.productId);
    });

    dom.cartItems.addEventListener("click", (event) => {
      const button = event.target.closest("[data-cart-action]");
      if (!button) return;
      const id = button.dataset.productId;
      const current = state.cart[id] || 0;
      if (button.dataset.cartAction === "increase") setCartQuantity(id, current + 1);
      if (button.dataset.cartAction === "decrease") setCartQuantity(id, current - 1);
      if (button.dataset.cartAction === "remove") setCartQuantity(id, 0, `${PRODUCTS_BY_ID.get(id).name} removido do carrinho.`);
    });

    dom.cartButton.addEventListener("click", openCart);
    document.querySelectorAll("[data-open-cart]").forEach((button) => button.addEventListener("click", openCart));
    document.querySelectorAll("[data-close-cart]").forEach((button) => button.addEventListener("click", closeCart));
    dom.closeCartButton.addEventListener("click", closeCart);
    dom.cartOverlay.addEventListener("click", closeCart);
    dom.clearCartButton.addEventListener("click", () => { state.cart = {}; saveCart(); renderCart(); showToast("Carrinho esvaziado."); });
    dom.checkoutButton.addEventListener("click", openCheckout);

    dom.accountButton.addEventListener("click", openAccount);
    dom.closeAccountButton.addEventListener("click", () => dom.accountDialog.close());
    dom.registerForm.addEventListener("submit", registerAccount);
    dom.registerCep.addEventListener("input", () => { dom.registerCep.value = formatCep(dom.registerCep.value); });
    dom.registerCep.addEventListener("blur", lookupCep);
    dom.logoutButton.addEventListener("click", logoutAccount);

    dom.closeCheckoutButton.addEventListener("click", () => dom.checkoutDialog.close());
    dom.checkoutForm.addEventListener("submit", finishCheckout);
    dom.checkoutCep.addEventListener("input", () => { dom.checkoutCep.value = formatCep(dom.checkoutCep.value); });
    dom.contactForm.addEventListener("submit", submitContact);

    dom.mainNav.addEventListener("click", () => {
      dom.mainNav.classList.remove("open");
      dom.menuToggle.setAttribute("aria-expanded", "false");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeCart();
    });
  }

  renderProducts();
  renderCart();
  renderAccount();
  prefillCheckout();
  configureEvents();
})();
