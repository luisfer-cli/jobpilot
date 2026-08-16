(function () {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const themeText = document.getElementById("theme-text");
  const langToggle = document.getElementById("lang-toggle");
  const langLabel = document.getElementById("lang-label");
  const menuBtn = document.getElementById("menu-btn");
  const nav = document.getElementById("nav");
  const copyBtn = document.getElementById("copy-btn");

  const THEME_KEY = "librejob_theme";
  const LANG_KEY = "librejob_lang";

  const INSTALL_CMD =
    "git clone https://github.com/luisfer-cli/librejob.git\n" +
    "cd librejob\n" +
    "bun install\n" +
    "bun run tauri dev";

  const I18N = {
    en: {
      "meta.title": "LibreJob — AI-assisted job search",
      "meta.description":
        "LibreJob is a free, open-source desktop app that helps you find a job with AI: it analyzes offers, generates tailored CVs, cover letters, technical tests and ATS analysis. All local.",
      "nav.features": "Features",
      "nav.how": "How it works",
      "nav.install": "Installation",
      "nav.tech": "Technology",
      "nav.faq": "FAQ",
      "nav.menu": "Open menu",
      "nav.theme.title": "Toggle theme",
      "lang.switch": "Switch to Spanish",
      "theme.dark": "Dark",
      "theme.light": "Light",
      "hero.badge": "Free software · Desktop app",
      "hero.title": "Find a job with AI, locally",
      "hero.sub":
        "LibreJob analyzes job offers and generates tailored CVs, cover letters, technical tests and ATS analysis. Everything happens on your machine, no clouds.",
      "hero.start": "Get started",
      "hero.github": "View on GitHub",
      "hero.providers":
        "Works with <strong>OpenRouter</strong> · <strong>OpenAI</strong> · <strong>Groq</strong> · <strong>Together</strong> · <strong>Mistral</strong> · <strong>DeepSeek</strong> · <strong>Perplexity</strong> or any OpenAI-compatible API.",
      "preview.title": "LibreJob — Dashboard",
      "preview.group.main": "Main",
      "preview.group.manage": "Manage",
      "preview.group.system": "System",
      "preview.item.dashboard": "Dashboard",
      "preview.item.cv": "My CV",
      "preview.item.offers": "Offers",
      "preview.item.tests": "Tests",
      "preview.item.settings": "Settings",
      "preview.stat.offers": "Offers",
      "preview.stat.interviews": "Interviews",
      "preview.stat.received": "Offers received",
      "preview.stat.applied": "Applied",
      "preview.badge.saved": "Saved",
      "preview.badge.applied": "Applied",
      "preview.badge.interview": "Interview",
      "preview.badge.offer": "Offer",
      "preview.badge.rejected": "Rejected",
      "preview.card.backend": "Backend Developer",
      "preview.card.react": "React Frontend",
      "preview.card.fullstack": "Full-stack Engineer",
      "preview.card.node": "Node.js Developer",
      "preview.card.sw": "Software Engineer",
      "preview.card.devops": "DevOps Engineer",
      "features.title": "Features",
      "features.sub": "Everything you need to go from offer to contract.",
      "features.1.title": "Offer extraction",
      "features.1.body":
        "Paste an offer and the AI extracts title, company, location, salary, requirements and responsibilities.",
      "features.2.title": "Tailored CV",
      "features.2.body": "Adapt your CV to each offer, in the language you choose. Export to PDF in one click.",
      "features.3.title": "Cover letter",
      "features.3.body": "Generate personalized letters ready to send, with subject, greeting and sign-off.",
      "features.4.title": "Technical test",
      "features.4.body": "Interactive tests with automatic grading and multiple question types.",
      "features.5.title": "ATS analysis",
      "features.5.body": "Measure your fit against the offer and spot the keywords missing from your CV.",
      "features.6.title": "Kanban pipeline",
      "features.6.body": "Track every offer from «Saved» to «Offer» with a drag-and-drop board.",
      "how.title": "How it works",
      "how.sub": "From a pasted offer to a contract, in three steps.",
      "how.1.title": "1. Install & configure",
      "how.1.body": "Clone the repo, run <code>bun run tauri dev</code> and add your API key.",
      "how.2.title": "2. Paste the offer",
      "how.2.body": "The AI structures it automatically: title, company, requirements and more.",
      "how.3.title": "3. Generate & apply",
      "how.3.body": "Create CVs, letters, tests and ATS analysis in one click, and track your progress.",
      "install.title": "Installation",
      "install.sub": "You need Bun and Rust (for Tauri). Then, four commands.",
      "install.c1": "# 1. Clone the repository",
      "install.c2": "# 2. Enter the project",
      "install.c3": "# 3. Install dependencies",
      "install.c4": "# 4. Launch the app",
      "install.copy": "Copy",
      "install.copied": "Copied!",
      "install.note":
        "On first launch, open <strong>Settings</strong> to configure your AI provider and API key.",
      "tech.title": "Technology",
      "tech.sub": "A modern, lightweight, 100% local stack.",
      "tech.1.title": "Angular 20 + TypeScript",
      "tech.1.body": "UI with standalone components and strict templates.",
      "tech.2.title": "Tauri 2 + Rust",
      "tech.2.body": "Native, lightweight desktop. AI is called from the Rust backend.",
      "tech.3.title": "SQLite",
      "tech.3.body": "Data and settings stored locally with versioned migrations.",
      "tech.4.title": "OpenAI-compatible AI",
      "tech.4.body": "OpenRouter, OpenAI, Groq, Together, Mistral, DeepSeek, Perplexity…",
      "faq.title": "Frequently asked questions",
      "faq.1.q": "Is it free?",
      "faq.1.a": "Yes. LibreJob is free and open-source software. You can use it, modify it and contribute freely.",
      "faq.2.q": "Where is my data stored?",
      "faq.2.a":
        "Everything is stored locally, in a SQLite database on your machine. Your API key and your offers never leave your machine (except for the calls you make to your AI provider).",
      "faq.3.q": "Do I need an API key?",
      "faq.3.a":
        "Yes, for the AI features (CVs, letters, tests and ATS analysis). You can use any provider compatible with the OpenAI API.",
      "faq.4.q": "Which systems does it run on?",
      "faq.4.a": "Built with Tauri 2, it runs on Linux, Windows and macOS.",
      "footer.tagline": "Free software · Built with Angular, Tauri and Rust.",
      "footer.author": "Created by <strong>Luis Fer</strong>",
      "kofi.title": "Support me on Ko-fi",
      "kofi.text": "Support me"
    },
    es: {
      "meta.title": "LibreJob — Búsqueda de empleo asistida por IA",
      "meta.description":
        "LibreJob es una aplicación de escritorio de código abierto que te ayuda a buscar empleo con IA: analiza ofertas, genera CVs a medida, cartas de presentación, pruebas técnicas y análisis ATS. Todo en local.",
      "nav.features": "Características",
      "nav.how": "Cómo funciona",
      "nav.install": "Instalación",
      "nav.tech": "Tecnología",
      "nav.faq": "FAQ",
      "nav.menu": "Abrir menú",
      "nav.theme.title": "Cambiar tema",
      "lang.switch": "Cambiar a inglés",
      "theme.dark": "Oscuro",
      "theme.light": "Claro",
      "hero.badge": "Software libre · Aplicación de escritorio",
      "hero.title": "Busca trabajo con IA, en local",
      "hero.sub":
        "LibreJob analiza ofertas de empleo y genera CVs a medida, cartas de presentación, pruebas técnicas y análisis ATS. Todo ocurre en tu equipo, sin nubes.",
      "hero.start": "Empezar",
      "hero.github": "Ver en GitHub",
      "hero.providers":
        "Compatible con <strong>OpenRouter</strong> · <strong>OpenAI</strong> · <strong>Groq</strong> · <strong>Together</strong> · <strong>Mistral</strong> · <strong>DeepSeek</strong> · <strong>Perplexity</strong> o cualquier API compatible con OpenAI.",
      "preview.title": "LibreJob — Resumen",
      "preview.group.main": "Principal",
      "preview.group.manage": "Gestión",
      "preview.group.system": "Sistema",
      "preview.item.dashboard": "Resumen",
      "preview.item.cv": "Mi Currículum",
      "preview.item.offers": "Ofertas",
      "preview.item.tests": "Pruebas",
      "preview.item.settings": "Ajustes",
      "preview.stat.offers": "Ofertas",
      "preview.stat.interviews": "Entrevistas",
      "preview.stat.received": "Ofertas recibidas",
      "preview.stat.applied": "Aplicadas",
      "preview.badge.saved": "Guardada",
      "preview.badge.applied": "Aplicada",
      "preview.badge.interview": "Entrevista",
      "preview.badge.offer": "Oferta",
      "preview.badge.rejected": "Rechazada",
      "preview.card.backend": "Desarrollador Backend",
      "preview.card.react": "Frontend React",
      "preview.card.fullstack": "Full-stack Engineer",
      "preview.card.node": "Desarrollador Node.js",
      "preview.card.sw": "Ingeniero de software",
      "preview.card.devops": "Ingeniero DevOps",
      "features.title": "Características",
      "features.sub": "Todo lo que necesitas para pasar de la oferta al contrato.",
      "features.1.title": "Extracción de ofertas",
      "features.1.body":
        "Pega una oferta y la IA extrae título, empresa, ubicación, salario, requisitos y responsabilidades.",
      "features.2.title": "CV especializado",
      "features.2.body": "Adapta tu currículum a cada oferta, en el idioma que elijas. Exporta a PDF en un clic.",
      "features.3.title": "Carta de presentación",
      "features.3.body": "Genera cartas personalizadas listas para enviar, con asunto, saludo y despedida.",
      "features.4.title": "Prueba técnica",
      "features.4.body": "Pruebas interactivas con corrección automática y varios tipos de pregunta.",
      "features.5.title": "Análisis ATS",
      "features.5.body": "Mide tu encaje con la oferta y detecta las keywords que faltan en tu CV.",
      "features.6.title": "Pipeline kanban",
      "features.6.body": "Sigue cada oferta de «Guardada» a «Oferta» con un tablero de arrastrar y soltar.",
      "how.title": "Cómo funciona",
      "how.sub": "De la oferta pegada al contrato, en tres pasos.",
      "how.1.title": "1. Instala y configura",
      "how.1.body": "Clona el repositorio, ejecuta <code>bun run tauri dev</code> y añade tu API key.",
      "how.2.title": "2. Pega la oferta",
      "how.2.body": "La IA la estructura automáticamente: título, empresa, requisitos y más.",
      "how.3.title": "3. Genera y postula",
      "how.3.body": "Crea CVs, cartas, pruebas y análisis ATS a un clic, y sigue tu progreso.",
      "install.title": "Instalación",
      "install.sub": "Necesitas Bun y Rust (para Tauri). Luego, cuatro comandos.",
      "install.c1": "# 1. Clona el repositorio",
      "install.c2": "# 2. Entra en el proyecto",
      "install.c3": "# 3. Instala las dependencias",
      "install.c4": "# 4. Lanza la aplicación",
      "install.copy": "Copiar",
      "install.copied": "¡Copiado!",
      "install.note":
        "Al primer arranque, abre <strong>Ajustes</strong> para configurar tu proveedor de IA y tu API key.",
      "tech.title": "Tecnología",
      "tech.sub": "Un stack moderno, ligero y 100 % local.",
      "tech.1.title": "Angular 20 + TypeScript",
      "tech.1.body": "Interfaz con componentes standalone y strict templates.",
      "tech.2.title": "Tauri 2 + Rust",
      "tech.2.body": "Escritorio nativo y ligero. La IA se llama desde el backend Rust.",
      "tech.3.title": "SQLite",
      "tech.3.body": "Datos y ajustes almacenados localmente con migraciones versionadas.",
      "tech.4.title": "IA compatible con OpenAI",
      "tech.4.body": "OpenRouter, OpenAI, Groq, Together, Mistral, DeepSeek, Perplexity…",
      "faq.title": "Preguntas frecuentes",
      "faq.1.q": "¿Es gratuito?",
      "faq.1.a": "Sí. LibreJob es software libre y de código abierto. Puedes usarlo, modificarlo y contribuir libremente.",
      "faq.2.q": "¿Dónde se guardan mis datos?",
      "faq.2.a":
        "Todo se guarda en local, en una base de datos SQLite de tu equipo. Tu API key y tus ofertas no salen de tu máquina (salvo las llamadas que haces a tu proveedor de IA).",
      "faq.3.q": "¿Necesito una API key?",
      "faq.3.a":
        "Sí, para las funciones de IA (CVs, cartas, pruebas y análisis ATS). Puedes usar cualquier proveedor compatible con la API de OpenAI.",
      "faq.4.q": "¿En qué sistemas funciona?",
      "faq.4.a": "Al estar construido con Tauri 2, funciona en Linux, Windows y macOS.",
      "footer.tagline": "Software libre · Hecho con Angular, Tauri y Rust.",
      "footer.author": "Creado por <strong>Luis Fer</strong>",
      "kofi.title": "Apóyame en Ko-fi",
      "kofi.text": "Apóyame"
    }
  };

  let currentLang = "en";

  function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
  }

  // ---- Idioma ----
  function updateLangToggle() {
    const isEn = currentLang === "en";
    langLabel.textContent = isEn ? "ES" : "EN";
    const title = t("lang.switch");
    langToggle.setAttribute("title", title);
    langToggle.setAttribute("aria-label", title);
  }

  function applyLang(lang) {
    currentLang = lang;
    root.setAttribute("lang", lang);
    document.title = t("meta.title");
    document
      .querySelector('meta[name="description"]')
      .setAttribute("content", t("meta.description"));

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });

    updateLangToggle();
    applyTheme(root.getAttribute("data-theme"));
  }

  function loadLang() {
    let lang = "en";
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === "en" || stored === "es") lang = stored;
    } catch (_) {}
    applyLang(lang);
  }

  langToggle.addEventListener("click", function () {
    const next = currentLang === "en" ? "es" : "en";
    applyLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch (_) {}
  });

  // ---- Tema ----
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    const isDark = theme === "dark";
    themeIcon.className = "nf " + (isDark ? "nf-sun" : "nf-moon");
    themeText.textContent = isDark ? t("theme.light") : t("theme.dark");
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
      label.textContent = t("install.copied");
      icon.className = "nf nf-check";

      setTimeout(function () {
        copyBtn.classList.remove("copied");
        label.textContent = t("install.copy");
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

  loadLang();
  loadTheme();
  onScroll();
})();
