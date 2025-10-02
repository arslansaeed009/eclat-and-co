// script.js
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* =========================
     Existing: smoothly update prices + WA link + nav highlight
     (kept & integrated)
     =========================*/
  const cards = document.querySelectorAll(".product-card");

  cards.forEach((card) => {
    const sizeSelect = card.querySelector(".size-select");
    const oldPriceEl = card.querySelector(".old-price");
    const newPriceEl = card.querySelector(".new-price");
    const orderBtn = card.querySelector(".order-btn");

    const name = card.getAttribute("data-name") || "Perfume";
    const wa = card.getAttribute("data-wa") || "923001234567";

    // helper to format number with commas
    const fmt = (num) => Number(num).toLocaleString("en-PK");

    function update() {
      const size = sizeSelect.value; // "30" | "50" | "100"
      const newKey = `data-new-${size}`;
      const oldKey = `data-old-${size}`;

      const newPrice = card.getAttribute(newKey);
      const oldPrice = card.getAttribute(oldKey);

      if (newPrice) newPriceEl.textContent = `Rs. ${fmt(newPrice)}`;
      if (oldPrice) oldPriceEl.textContent = `Rs. ${fmt(oldPrice)}`;

      // discount badge auto (%)
      const discountTag = card.querySelector(".discount-tag");
      if (discountTag && newPrice && oldPrice) {
        const perc = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
        discountTag.textContent = `${perc}% OFF`;
      }

      // WhatsApp message with current selection
      const msg = `Hi, I want to order ${name} (${size}ml) for Rs. ${fmt(newPrice || "")}.`;
      const href = `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
      orderBtn.setAttribute("href", href);
    }

    // initialize based on default select value
    update();
    sizeSelect.addEventListener("change", update);
  });

  // Optional: highlight active nav link on scroll
  const sections = document.querySelectorAll("header, section");
  const navLinks = document.querySelectorAll(".navbar .nav-link");

  const onScroll = () => {
    let current = "";
    sections.forEach(sec => {
      const top = window.scrollY + 120;
      if (sec.offsetTop <= top && sec.offsetTop + sec.offsetHeight > top) {
        current = sec.getAttribute("id");
      }
    });
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (current && link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });

    // Back to top toggle
    const back = document.getElementById("backToTop");
    if (back) {
      if (window.scrollY > 300) back.classList.add("show");
      else back.classList.remove("show");
    }
  };
  document.addEventListener("scroll", onScroll, { passive: true });

  /* =========================
     PRELOADER
     =========================*/
  window.addEventListener("load", () => {
    const pre = document.getElementById("preloader");
    if (pre) {
      pre.classList.add("hidden");
      // fully remove after transition
      setTimeout(() => pre.remove(), 700);
    }
  });

  /* =========================
     BACK TO TOP
     =========================*/
  const backBtn = document.getElementById("backToTop");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* =========================
     THEME TOGGLE (dark/light)
     Saves preference in localStorage
     =========================*/
  const themeToggle = document.getElementById("themeToggle");
  const root = document.body;

  function applyTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      root.removeAttribute("data-theme");
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
  }

  const savedTheme = localStorage.getItem("eclat_theme");
  applyTheme(savedTheme || "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
      localStorage.setItem("eclat_theme", next);
    });
  }

  /* =========================
     CART (localStorage) - dynamic add-to-cart buttons are created here
     =========================*/
  const CART_KEY = "eclat_cart_v1";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveCart(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)); }

  function updateCartCountUI() {
    const cnt = getCart().reduce((s, it) => s + (it.qty || 1), 0);
    const el = document.getElementById("cartCount");
    if (el) el.textContent = String(cnt || 0);
  }

  function renderCartModal() {
    const container = document.getElementById("cartItemsContainer");
    const checkoutBtn = document.getElementById("checkoutWhatsapp");
    const cart = getCart();

    if (!container) return;
    container.innerHTML = "";

    if (!cart.length) {
      container.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
      if (checkoutBtn) checkoutBtn.setAttribute("href", "#");
      return;
    }

    const list = document.createElement("div");
    list.className = "d-flex flex-column gap-2";

    let total = 0;
    cart.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "d-flex align-items-center justify-content-between bg-dark p-2 rounded-2";

      const left = document.createElement("div");
      left.innerHTML = `<strong>${item.name}</strong><div class="small text-secondary-2">${item.size}ml × ${item.qty}</div>`;

      const right = document.createElement("div");
      right.innerHTML = `<div><strong>Rs. ${Number(item.price).toLocaleString("en-PK")}</strong></div>
                         <div class="small text-secondary-2">Item ${idx+1}</div>`;

      const remove = document.createElement("button");
      remove.className = "btn btn-sm btn-outline-light ms-2";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        const updated = getCart().filter((_, i) => i !== idx);
        saveCart(updated);
        updateCartCountUI();
        renderCartModal();
      });

      const leftWrap = document.createElement("div");
      leftWrap.className = "d-flex align-items-center gap-3";
      leftWrap.appendChild(left);
      leftWrap.appendChild(remove);

      row.innerHTML = "";
      row.appendChild(leftWrap);
      row.appendChild(right);

      list.appendChild(row);

      total += (Number(item.price) * (item.qty || 1));
    });

    const totRow = document.createElement("div");
    totRow.className = "mt-3 d-flex align-items-center justify-content-between";
    totRow.innerHTML = `<div class="fw-bold">Total</div><div class="fw-bold">Rs. ${Number(total).toLocaleString("en-PK")}</div>`;

    container.appendChild(list);
    container.appendChild(totRow);

    // build whatsapp checkout link
    if (checkoutBtn) {
      let msg = "Hello, I would like to order:%0A";
      cart.forEach(it => {
        msg += `- ${it.name} (${it.size}ml) × ${it.qty} — Rs. ${Number(it.price).toLocaleString("en-PK")}%0A`;
      });
      msg += `%0ATotal: Rs. ${Number(total).toLocaleString("en-PK")}%0AThanks!`;
      // use first item's WA number if present, fallback to your default
      const wa = cart[0]?.wa || "923001234567";
      checkoutBtn.setAttribute("href", `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`);
    }
  }

  // dynamically add an "Add to Cart" button to each product card (keeps your HTML untouched)
  cards.forEach(card => {
    const orderBtn = card.querySelector(".order-btn");
    if (!orderBtn) return;

    const addBtn = document.createElement("button");
    addBtn.className = "add-to-cart w-100 mt-2 btn btn-outline-light";
    addBtn.innerHTML = '<i class="fas fa-plus me-2"></i>Add to Cart';

    addBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const name = card.getAttribute("data-name") || "Perfume";
      const wa = card.getAttribute("data-wa") || "923001234567";
      const sizeSel = card.querySelector(".size-select");
      const size = sizeSel ? sizeSel.value : "50";
      const price = card.getAttribute(`data-new-${size}`) || card.getAttribute("data-new-50") || "0";

      const cart = getCart();
      // if same product+size exists, increment qty
      const idx = cart.findIndex(it => it.name === name && it.size === size);
      if (idx > -1) {
        cart[idx].qty = (cart[idx].qty || 1) + 1;
      } else {
        cart.push({ name, size, price: Number(price), wa, qty: 1 });
      }
      saveCart(cart);
      updateCartCountUI();
      // give user quick feedback
      addBtn.innerHTML = '<i class="fas fa-check me-2"></i>Added';
      setTimeout(() => addBtn.innerHTML = '<i class="fas fa-plus me-2"></i>Add to Cart', 1200);
    });

    // append after order button
    orderBtn.parentNode.appendChild(addBtn);
  });

  // update cart UI initially
  updateCartCountUI();

  // when cart modal opens, render items
  const cartModalEl = document.getElementById("cartModal");
  if (cartModalEl) {
    cartModalEl.addEventListener("show.bs.modal", renderCartModal);
  }

  /* =========================
     Reveal-on-scroll using IntersectionObserver
     =========================*/
  const revealEls = document.querySelectorAll(".product-card, .about-section, .contact-section, .hero-overlay, .section-heading");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        entry.target.classList.remove("reveal");
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => {
    el.classList.add("reveal");
    obs.observe(el);
  });

  /* =========================
     Newsletter (local, demo)
     =========================*/
  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterMsg = document.getElementById("newsletterMsg");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("newsletterEmail");
      const email = emailInput.value.trim();
      if (!email) return;
      // store locally (demo). In production send to server.
      const key = "eclat_newsletters";
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      if (!arr.includes(email)) arr.push(email);
      localStorage.setItem(key, JSON.stringify(arr));
      newsletterMsg.textContent = "Thank you — you'll receive special offers soon!";
      emailInput.value = "";
      setTimeout(() => newsletterMsg.textContent = "", 5000);
    });
  }

  /* =========================
     Helpful: re-run nav highlight on load
     =========================*/
  onScroll();

}); // DOMContentLoaded end
