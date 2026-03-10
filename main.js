/* =====================================================
   DODI REPACKS GUIDE — main.js

   Key principle: device type is detected ONCE when the
   page loads (window.innerWidth at that moment).
   body.is-desktop or body.is-mobile is set immediately,
   before first paint (called in <head> inline if needed,
   but DOMContentLoaded is early enough here since CSS
   hides both navs by default until a class is set).
   No resize listeners — no layout thrashing.
===================================================== */
"use strict";

/* =========================================================
   1. DEVICE DETECTION — runs once, sets body class
   ========================================================= */
function detectDevice() {
  const BREAKPOINT = 900; // px — same threshold as design intent
  if (window.innerWidth >= BREAKPOINT) {
    document.body.classList.add("is-desktop");
    document.body.classList.remove("is-mobile");
  } else {
    document.body.classList.add("is-mobile");
    document.body.classList.remove("is-desktop");
  }
}

/* =========================================================
   2. PROGRESS BAR
   ========================================================= */
function initProgressBar() {
  const bar = document.createElement("div");
  bar.className = "progress-bar";
  document.body.prepend(bar);

  window.addEventListener("scroll", () => {
    const scrolled  = window.scrollY;
    const total     = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? (scrolled / total * 100) + "%" : "0%";
  }, { passive: true });
}

/* =========================================================
   3. ACTIVE NAV LINK
   Watches sections and highlights the matching nav link.
   Works for both sidebar (.sidebar-nav a) and mobile nav
   (.mobile-nav-inner a) — selects whichever is active.
   ========================================================= */
function initActiveNav() {
  const sections = Array.from(document.querySelectorAll("section[id]"));
  if (!sections.length) return;

  function getLinks() {
    // Return whichever nav is currently in use
    if (document.body.classList.contains("is-desktop")) {
      return document.querySelectorAll(".sidebar-nav a[href^='#']");
    }
    return document.querySelectorAll(".mobile-nav-inner a[href^='#']");
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id    = entry.target.id;
      const links = getLinks();
      links.forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === "#" + id);
      });
    });
  }, {
    rootMargin: "-60px 0px -55% 0px",
    threshold: 0
  });

  sections.forEach(s => observer.observe(s));
}

/* =========================================================
   4. SMOOTH SCROLL
   Offsets differ: desktop has no sticky top bar so just
   a small gap; mobile offsets below the sticky nav bar.
   ========================================================= */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      const id     = anchor.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = document.body.classList.contains("is-mobile") ? 56 : 20;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

/* =========================================================
   5. DARK / LIGHT MODE TOGGLE
   ========================================================= */
function initDarkMode() {
  const btn  = document.getElementById("darkModeToggle");
  const icon = document.getElementById("darkIcon");
  if (!btn) return;

  const saved = localStorage.getItem("colorMode");
  const apply = (mode) => {
    document.body.classList.toggle("light", mode === "light");
    if (icon) icon.textContent = mode === "light" ? "🌙" : "☀";
    btn.title = mode === "light" ? "Switch to dark mode" : "Switch to light mode";
  };

  apply(saved === "light" ? "light" : "dark");

  btn.addEventListener("click", () => {
    const next = document.body.classList.contains("light") ? "dark" : "light";
    localStorage.setItem("colorMode", next);
    apply(next);
  });
}

/* =========================================================
   6. BACK TO TOP
   ========================================================= */
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* =========================================================
   7. CARD ENTRANCE ANIMATIONS
   ========================================================= */
function initCardAnimations() {
  const cards = document.querySelectorAll(".card");
  if (!cards.length || !("IntersectionObserver" in window)) return;

  cards.forEach(c => {
    c.style.opacity   = "0";
    c.style.transform = "translateY(22px)";
    c.style.transition = "opacity 0.45s ease, transform 0.45s ease";
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.opacity   = "1";
      entry.target.style.transform = "translateY(0)";
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.07 });

  cards.forEach(c => obs.observe(c));
}

/* =========================================================
   8. KEYBOARD SHORTCUT — T = back to top
   ========================================================= */
function initKeyboard() {
  document.addEventListener("keydown", e => {
    if (e.key === "t" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  detectDevice();        // ← sets is-desktop or is-mobile ONCE
  initProgressBar();
  initActiveNav();
  initSmoothScroll();
  initDarkMode();
  initBackToTop();
  initCardAnimations();
  initKeyboard();
});
