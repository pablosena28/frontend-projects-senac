/**
 * Interações mínimas do site:
 * 1. abre e fecha o menu no celular;
 * 2. fecha o menu após a escolha de um link;
 * 3. atualiza automaticamente o ano no rodapé.
 */

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
const navigationLinks = document.querySelectorAll(".main-nav a");
const yearElement = document.querySelector("#current-year");

function closeMenu() {
  navigation.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

menuButton.addEventListener("click", () => {
  const menuIsOpen = navigation.classList.toggle("open");

  menuButton.setAttribute("aria-expanded", String(menuIsOpen));
  document.body.classList.toggle("menu-open", menuIsOpen);
});

navigationLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

yearElement.textContent = new Date().getFullYear();
