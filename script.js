(function () {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const themeText = document.getElementById("theme-text");
  const menuBtn = document.getElementById("menu-btn");
  const nav = document.getElementById("nav");
  const copyBtn = document.getElementById("copy-btn");

  const THEME_KEY = "librejob_theme";

  const INSTALL_CMD =
    "git clone https://github.com/luisfer-cli/librejob.git\n" +
    "cd librejob\n" +
    "bun install\n" +
    "bun run tauri dev";

  // ---- Tema ----
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    const isDark = theme === "dark";
    themeIcon.className = "nf " + (isDark ? "nf-sun" : "nf-moon");
    themeText.textContent = isDark ? "Claro" : "Oscuro";
  }

  function loadTheme() {
    let theme = "light";
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === "dark" || stored === "light") theme = stored;
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) theme = "dark";
    } catch (_) {}
    applyTheme(theme);
  }

  themeToggle.addEventListener("click", function () {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (_) {}
  });

  // ---- Menú móvil ----
  menuBtn.addEventListener("click", function () {
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("open");
    });
  });

  // ---- Copiar comando de instalación ----
  if (copyBtn) {
    copyBtn.addEventListener("click", async function () {
      try {
        await navigator.clipboard.writeText(INSTALL_CMD);
      } catch (_) {
        const ta = document.createElement("textarea");
        ta.value = INSTALL_CMD;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
        } catch (__) {}
        document.body.removeChild(ta);
      }

      const icon = copyBtn.querySelector(".nf");
      const label = copyBtn.querySelector(".copy-label");
      copyBtn.classList.add("copied");
      label.textContent = "¡Copiado!";
      icon.className = "nf nf-check";

      setTimeout(function () {
        copyBtn.classList.remove("copied");
        label.textContent = "Copiar";
        icon.className = "nf nf-clipboard";
      }, 1600);
    });
  }

  // ---- Scroll-spy ----
  const links = Array.from(document.querySelectorAll(".nav a[href^='#']"));
  const sections = links
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  function onScroll() {
    const offset = 100;
    let currentId = null;

    for (let i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= offset) {
        currentId = sections[i].id;
      }
    }

    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
      currentId = sections[sections.length - 1].id;
    }

    links.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + currentId);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  loadTheme();
  onScroll();
})();
