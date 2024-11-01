import { Product } from "./Product";

declare global {
  interface Window {
    quantityItems: number;
    products: Product[];
    filteredProducts: Product[];
    colorsFiltered: string[];
    priceFiltered: string[];
    sizeFiltered: string[];
    firstRender: boolean;
    openFilterMenuMobile: () => void;
    openOrderMenuMobile: () => void;
    closeFilterMenuMobile: () => void;
    closeOrderMenuMobile: () => void;
    openFilterAccordion: (filterId: string) => void;
    clearFilters: () => void;
    applyFilters: () => void;
    applyOrders: (orderType: string) => void;
  }
}

const serverUrl = "http://localhost:5000";

async function getProducts() {
  const response = await fetch(`${serverUrl}/products`);
  const data: Product[] = await response.json();
  return data;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

function handleBuyClick(product: Product) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const cartQuantity = document.querySelector(".cart-quantity");

  if (cart.length === 0) {
    localStorage.setItem("cart", JSON.stringify([{ ...product, quantity: 1 }]));
    cartQuantity.innerHTML = "1";
    return;
  }

  const productIndex = cart.findIndex((p: Product) => p.id === product.id);
  const cartString = cart
    .reduce(
      (acumulator: number, cartItem: { quantity: number }) =>
        acumulator + cartItem.quantity,
      0
    )
    .toString();

  if (productIndex !== -1) {
    cart[productIndex].quantity += 1;
    localStorage.setItem("cart", JSON.stringify(cart));
    cartQuantity.innerHTML = cartString;
    return;
  }

  cart.push({ ...product, quantity: 1 });
  cartQuantity.innerHTML = cartString;

  localStorage.setItem("cart", JSON.stringify(cart));
}

function renderProducts(products: Product[]) {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  const quantityItemsRendered = window.quantityItems;
  const slicedProducts = products.slice(0, quantityItemsRendered);

  const slicedProductsElement = slicedProducts.map((product) => {
    const installment = product.parcelamento[0];
    const installmentValue = formatPrice(product.parcelamento[1]);

    const productDiv = document.createElement("div");
    productDiv.className = "product-item";
    productDiv.innerHTML = `
              <img src="${product.image}" alt="${
      product.name
    }" class="product-item__image" />
              <h3 class="product-item__name">${product.name}</h3>
              <p class="product-item__price">${formatPrice(product.price)}</p>
              <p class="product-item__installment">até ${installment}x de ${installmentValue}</p>
          `;

    const buyButton = document.createElement("button");
    buyButton.className = "product-item__button";
    buyButton.innerHTML = "Comprar";
    buyButton.onclick = () => handleBuyClick(product);
    productDiv.append(buyButton);

    return productDiv;
  });

  productList.append(...slicedProductsElement);
  window.filteredProducts = products;

  renderButton();

  if (
    window.filteredProducts.length < 6 ||
    quantityItemsRendered >= window.products.length
  ) {
    const hasbutton = document.querySelector(".load-more");
    hasbutton.remove();
  }
}

function renderButton() {
  const hasbutton = document.querySelector(".load-more");
  const productList = document.getElementById("product-list");
  const loadMoreButton = document.createElement("button");
  loadMoreButton.className = "load-more";
  loadMoreButton.innerHTML = "Carregar mais";

  loadMoreButton.onclick = () => {
    window.quantityItems += innerWidth < 769 ? 2 : 3;
    renderProducts(window.products);
  };

  if (!hasbutton) {
    productList.insertAdjacentElement("afterend", loadMoreButton);
  }
}

function openFilterMenuMobile() {
  const filterContainer = document.getElementById("filter-container");
  const content: HTMLElement = document.querySelector(".content");
  filterContainer.style.display = "block";
  content.style.display = "none";
}

function openOrderMenuMobile() {
  const orderContainer = document.getElementById("order-container");
  const content: HTMLElement = document.querySelector(".content");
  orderContainer.style.display = "block";
  content.style.display = "none";
}

function closeFilterMenuMobile() {
  const filterContainer = document.getElementById("filter-container");
  const content: HTMLElement = document.querySelector(".content");
  filterContainer.style.display = "none";
  content.style.display = "flex";
}

function closeOrderMenuMobile() {
  const orderContainer = document.getElementById("order-container");
  const content: HTMLElement = document.querySelector(".content");
  orderContainer.style.display = "none";
  content.style.display = "flex";
}

function createColorsFilters() {
  const colors = [
    "Amarelo",
    "Azul",
    "Branco",
    "Cinza",
    "Laranja",
    "Verde",
    "Vermelho",
    "Preto",
    "Rosa",
    "Vinho",
  ];

  const colorDivElement = colors.map((color) => {
    const colorDiv = document.createElement("div");
    colorDiv.className = "filter-item";

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.id = "filter-checkbox";
    checkBox.value = color;
    checkBox.onchange = () => renderApplyButtons();

    const label = document.createElement("label");
    label.innerText = color;

    colorDiv.append(checkBox);
    colorDiv.append(label);

    return colorDiv;
  });

  return colorDivElement;
}

function createSizesFilters() {
  const sizes = ["P", "M", "G", "GG", "U", "36", "38", "40", "36", "38", "40"];

  const sizeDivElement = sizes.map((size) => {
    const sizeDiv = document.createElement("div");
    sizeDiv.className = "size-item";

    const filterItemDiv = document.createElement("div");
    filterItemDiv.id = "filter-item";

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.id = "size-checkbox";
    checkBox.value = size;
    checkBox.onchange = () => renderApplyButtons();

    const label = document.createElement("label");
    label.className = "label-price";
    label.innerText = size;

    filterItemDiv.append(checkBox);
    filterItemDiv.append(label);
    sizeDiv.append(filterItemDiv);

    return sizeDiv;
  });

  return sizeDivElement;
}

function createPriceFilters() {
  const prices = [
    { min: 0, max: 50 },
    { min: 51, max: 150 },
    { min: 151, max: 300 },
    { min: 301, max: 500 },
    { min: 500, max: "infinity" },
  ];

  const priceDivElement = prices.map((price) => {
    const lastPrice = price.max === "infinity";
    const priceDiv = document.createElement("div");
    priceDiv.className = "filter-item";

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.id = "filter-checkbox";
    checkBox.value = JSON.stringify(price);
    checkBox.onchange = () => renderApplyButtons();

    const label = document.createElement("label");
    label.innerText = `${!lastPrice ? "de" : "a partir de"} R$${price.min} ${
      !lastPrice ? `até R$${price.max}` : ""
    }`;

    priceDiv.append(checkBox);
    priceDiv.append(label);

    return priceDiv;
  });

  return priceDivElement;
}

function renderApplyButtons() {
  const buttonDiv: HTMLElement = document.querySelector(".filter-buttons");
  buttonDiv.style.display = "flex";
}

function resetFilters() {
  window.colorsFiltered = [];
  window.priceFiltered = [];
  window.sizeFiltered = [];

  window.filteredProducts = window.products;
  renderProducts(window.products);
}

function applyFilters() {
  window.colorsFiltered = [];
  window.priceFiltered = [];
  window.sizeFiltered = [];

  document
    .querySelectorAll('.filters__colors input[type="checkbox"]:checked')
    .forEach((e: HTMLInputElement) => {
      window.colorsFiltered.push(e.value);
    });

  document
    .querySelectorAll('.filters__prices input[type="checkbox"]:checked')
    .forEach((e: HTMLInputElement) => {
      window.priceFiltered.push(e.value);
    });

  document
    .querySelectorAll('.filters__sizes input[type="checkbox"]:checked')
    .forEach((e: HTMLInputElement) => {
      window.sizeFiltered.push(e.value);
    });

  renderFilteredProducts();
  window.firstRender = false;
  closeFilterMenuMobile();
}

function applyOrders(orderType: string) {
  let orderedProducts: Product[] = [];
  const filteredProducts =
    window.filteredProducts.length > 0
      ? window.filteredProducts
      : window.products;

  if (orderType === "price_asc") {
    orderedProducts = filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (orderType === "price_desc") {
    orderedProducts = filteredProducts.sort((a, b) => b.price - a.price);
  }

  if (orderType === "newest") {
    orderedProducts = filteredProducts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  const selected = document.querySelectorAll(".select-orders option");

  selected.forEach((option: HTMLInputElement) => {
    if (option?.value === orderType) {
      option.setAttribute("selected", "selected");
    } else {
      option.removeAttribute("selected");
    }
  });

  window.filteredProducts = orderedProducts;

  renderProducts(orderedProducts);
  window.firstRender = false;
  closeOrderMenuMobile();
}

function renderFilters() {
  const filterColors = document.querySelector(".filters__colors");
  const filterSizes = document.querySelector(".filters__sizes");
  const filterPrices = document.querySelector(".filters__prices");
  const desktopFilterColors: HTMLElement = document.querySelector(
    ".desktop-filter__colors"
  );
  const desktopFilterSizes = document.querySelector(".desktop-filter__sizes");
  const desktopFilterPrices = document.querySelector(".desktop-filter__prices");
  
  const expandDeskFilters = document.createElement("div");
  expandDeskFilters.className = "expand-filters";
  expandDeskFilters.innerText = "Ver todas as cores";
  expandDeskFilters.onclick = () => {
    desktopFilterColors.style.height = "100%";
    expandDeskFilters.style.display = "none";
  };

  filterColors.innerHTML = "";
  filterSizes.innerHTML = "";
  filterPrices.innerHTML = "";

  filterColors.append(...createColorsFilters());
  filterSizes.append(...createSizesFilters());
  filterPrices.append(...createPriceFilters());

  desktopFilterColors.append(...createColorsFilters());
  desktopFilterColors.insertAdjacentElement("afterend", expandDeskFilters);
  desktopFilterSizes.append(...createSizesFilters());
  desktopFilterPrices.append(...createPriceFilters());
}

function clearFilters() {
  resetFilters();
  renderFilters();
  window.quantityItems = innerWidth < 769 ? 6 : 9;
}

function handleFilterDesktop() {
  document
    .querySelectorAll('.desktop-filter__colors input[type="checkbox"]')
    .forEach((e: HTMLInputElement) => {
      e.onclick = () => {
        if (e.checked) {
          window.colorsFiltered.push(e.value);
        } else {
          window.colorsFiltered = window.colorsFiltered.filter(
            (color) => color !== e.value
          );
        }
        renderFilteredProducts();
      };
    });

  document
    .querySelectorAll('.desktop-filter__prices input[type="checkbox"]')
    .forEach((e: HTMLInputElement) => {
      e.onclick = () => {
        if (e.checked) {
          window.priceFiltered.push(e.value);
        } else {
          window.priceFiltered = window.priceFiltered.filter(
            (price) => price !== e.value
          );
        }
        renderFilteredProducts();
      };
    });

  document
    .querySelectorAll('.desktop-filter__sizes input[type="checkbox"]')
    .forEach((e: HTMLInputElement) => {
      e.onclick = () => {
        if (e.checked) {
          window.sizeFiltered.push(e.value);
        } else {
          window.sizeFiltered = window.sizeFiltered.filter(
            (color) => color !== e.value
          );
        }
        renderFilteredProducts();
      };
    });

  window.firstRender = false;
}

function openFilterAccordion(filterClass: string) {
  const filterContainer = document.querySelector(filterClass);
  if (filterContainer.classList.contains("hidden")) {
    filterContainer.classList.remove("hidden");
    return;
  }

  filterContainer.classList.add("hidden");
}

function renderFilteredProducts() {
  if (
    window.colorsFiltered.length === 0 &&
    window.priceFiltered.length === 0 &&
    window.sizeFiltered.length === 0
  ) {
    window.filteredProducts = window.products;
    renderProducts(window.filteredProducts);
    return;
  }

  const filteredProducts = window.products.filter((product) => {
    const hasColor =
      window.colorsFiltered.length === 0 ||
      window.colorsFiltered.includes(product.color);

    const hasPrice =
      window.priceFiltered.length === 0 ||
      window.priceFiltered.some((price) => {
        const parsedPrice = JSON.parse(price);
        if (parsedPrice.max === "infinity") {
          return product.price >= parsedPrice.min;
        }

        return (
          product.price >= parsedPrice.min && product.price <= parsedPrice.max
        );
      });

    const hasSize =
      window.sizeFiltered.length === 0 ||
      product.size.some((size) => window.sizeFiltered.includes(size));

    return hasColor && hasPrice && hasSize;
  });

  window.filteredProducts = filteredProducts;

  renderProducts(filteredProducts);
}

async function main() {
  window.firstRender = true;
  window.quantityItems = innerWidth < 769 ? 6 : 9;
  window.colorsFiltered = [];
  window.priceFiltered = [];
  window.sizeFiltered = [];
  window.filteredProducts = [];
  const data = await getProducts();
  window.products = data;
  renderProducts(window.products);
  renderFilters();
  handleFilterDesktop();
  const cartQuantity = document.querySelector(".cart-quantity");
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (cart.length > 0) {
    cartQuantity.innerHTML = cart
      .reduce((acc: number, p: { quantity: number }) => acc + p.quantity, 0)
      .toString();
  }
}

window.openFilterMenuMobile = openFilterMenuMobile;
window.openOrderMenuMobile = openOrderMenuMobile;
window.closeFilterMenuMobile = closeFilterMenuMobile;
window.closeOrderMenuMobile = closeOrderMenuMobile;
window.openFilterAccordion = openFilterAccordion;
window.clearFilters = clearFilters;
window.applyFilters = applyFilters;
window.applyOrders = applyOrders;

document.addEventListener("DOMContentLoaded", main);
