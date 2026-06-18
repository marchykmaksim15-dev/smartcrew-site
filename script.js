const revealTargets = [
  ".section-header",
  ".section-copy",
  ".experience-card",
  ".signal-card",
  ".evidence-card",
  ".proof-board",
  ".funnel-visual",
  ".step-list li",
  ".asset-placeholder",
  ".speed-callout",
  ".journey-line",
  ".need-thesis",
  ".need-ladder li",
  ".module-grid article",
  ".pill-cloud",
  ".benchmark-table-card",
  ".economy-impact-card",
  ".client-proof",
  ".launch-card",
  ".final-cta",
  ".footer-inner",
];

const targets = document.querySelectorAll(revealTargets.join(","));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

targets.forEach((target) => target.classList.add("reveal"));

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  targets.forEach((target) => target.classList.add("is-visible"));
} else {
  const revealVisibleTargets = () => {
    const triggerLine = window.innerHeight * 0.9;

    targets.forEach((target) => {
      if (target.classList.contains("is-visible")) return;
      const rect = target.getBoundingClientRect();

      if (rect.top < triggerLine) {
        target.classList.add("is-visible");
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.16,
    },
  );

  targets.forEach((target, index) => {
    target.style.transitionDelay = `${Math.min(index % 5, 4) * 55}ms`;
    observer.observe(target);
  });

  window.addEventListener("scroll", revealVisibleTargets, { passive: true });
  window.addEventListener("resize", revealVisibleTargets);
  requestAnimationFrame(revealVisibleTargets);

  const revealPulse = window.setInterval(revealVisibleTargets, 180);
  window.setTimeout(() => window.clearInterval(revealPulse), 12000);
}

const modal = document.querySelector(".cost-modal");

if (modal) {
  const openButtons = document.querySelectorAll("[data-open-test-modal]");
  const closeButtons = modal.querySelectorAll("[data-close-test-modal]");
  const steps = [...modal.querySelectorAll(".cost-step")];
  const progressItems = [...modal.querySelectorAll(".cost-progress span")];
  const form = modal.querySelector(".cost-form");
  const prevButton = modal.querySelector("[data-prev-step]");
  const nextButton = modal.querySelector("[data-next-step]");
  const actions = modal.querySelector(".cost-actions");
  const error = modal.querySelector("[data-form-error]");
  const resultCost = modal.querySelector("[data-result-cost]");
  const resultSummary = modal.querySelector("[data-result-summary]");
  const bookCall = modal.querySelector("[data-book-call]");

  const regions = {
    rb: "Только РБ",
    rf: "Вся РФ",
    cis: "Все СНГ",
    local: "Локальный бизнес",
  };

  let activeStep = 0;
  let lastActiveElement = null;

  const selectedValue = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value || "";
  const selectedInput = (name) => form.querySelector(`input[name="${name}"]:checked`);
  const customNiche = () => form.elements.nicheCustom.value.trim();
  const selectedNiche = () => customNiche() || selectedValue("niche");
  const lowerFirst = (value) => value ? value[0].toLowerCase() + value.slice(1) : value;
  const displayValue = (name) => {
    const input = selectedInput(name);
    return input?.dataset.summaryValue || input?.value || "";
  };

  const setError = (message = "") => {
    error.textContent = message;
  };

  const renderResult = () => {
    const niche = selectedNiche();
    const regionValue = selectedValue("region");
    const region = regions[regionValue] || "не указан";
    const leads = selectedValue("leads") || "не указано";
    const productPrice = displayValue("productPrice") || "не указано";
    const productPriceSentence = productPrice.replace(/\.$/, "");
    const intro = `Вводные: ${niche.toLowerCase()}, ${lowerFirst(region)}, нужно ${leads}, стоимость продукта ${productPriceSentence}.`;

    resultCost.textContent = "Запуск под ключ: 4-5 недель";
    resultSummary.textContent = intro;

    const message = [
      "Илья, привет! Хочу забронировать звонок по B2C Outreach ВКонтакте.",
      "",
      "Ответы по брифу:",
      `Ниша: ${niche}`,
      `Регион: ${region}`,
      `Потребность в лидах после запуска: ${leads}`,
      `Стоимость продукта: ${productPrice}`,
      "",
      "Какие есть временные слоты на ближайшее время?",
    ].join("\n");

    bookCall.href = `https://t.me/ilya_tseluiko?text=${encodeURIComponent(message)}`;
  };

  const updateStep = () => {
    steps.forEach((step, index) => {
      step.classList.toggle("is-active", index === activeStep);
    });

    progressItems.forEach((item, index) => {
      item.classList.toggle("is-active", index <= activeStep);
    });

    const progressWidth = steps.length > 1 ? (activeStep / (steps.length - 1)) * 80 : 0;
    modal.querySelector(".cost-progress").style.setProperty("--progress-width", `${progressWidth}%`);

    actions.classList.toggle("can-go-back", activeStep > 0);
    actions.classList.toggle("is-result", activeStep === steps.length - 1);
    modal.classList.toggle("is-result", activeStep === steps.length - 1);
    nextButton.textContent = activeStep === steps.length - 2 ? "Показать итог" : "Дальше";

    if (activeStep === steps.length - 1) {
      renderResult();
    }
  };

  const validateStep = () => {
    if (activeStep === 0 && !selectedNiche()) {
      setError("Выберите нишу или впишите ее вручную.");
      return false;
    }

    if (activeStep === 1 && !selectedValue("region")) {
      setError("Выберите географию запуска.");
      return false;
    }

    if (activeStep === 2 && !selectedValue("leads")) {
      setError("Выберите потребность в лидах.");
      return false;
    }

    if (activeStep === 3 && !selectedValue("productPrice")) {
      setError("Выберите среднюю стоимость продукта.");
      return false;
    }

    setError();
    return true;
  };

  const openModal = () => {
    lastActiveElement = document.activeElement;
    activeStep = 0;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    updateStep();
    modal.querySelector(".cost-modal__close").focus();
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    setError();
    lastActiveElement?.focus?.();
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  nextButton.addEventListener("click", () => {
    if (!validateStep()) return;
    activeStep = Math.min(activeStep + 1, steps.length - 1);
    updateStep();
  });

  prevButton.addEventListener("click", () => {
    activeStep = Math.max(activeStep - 1, 0);
    setError();
    updateStep();
  });

  form.addEventListener("input", () => {
    if (error.textContent) validateStep();
    if (activeStep === steps.length - 1) renderResult();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  if (window.location.hash === "#test-cost") {
    openModal();
  }
}

const lazyVideos = document.querySelectorAll("video.lazy-video[data-src]");

const loadLazyVideo = (video) => {
  if (video.dataset.loaded === "true") return;
  video.src = video.dataset.src;
  video.dataset.loaded = "true";
  video.load();
  video.play().catch(() => {});
};

if (lazyVideos.length) {
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    lazyVideos.forEach(loadLazyVideo);
  } else {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          loadLazyVideo(entry.target);
          videoObserver.unobserve(entry.target);
        });
      },
      {
        rootMargin: "260px 0px",
        threshold: 0.05,
      },
    );

    lazyVideos.forEach((video) => videoObserver.observe(video));
  }
}
