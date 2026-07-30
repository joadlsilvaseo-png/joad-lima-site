const menuButton = document.querySelector(".menu-button");
const mainNav = document.querySelector(".main-nav");
const navLinks = document.querySelectorAll(".main-nav a");

function closeMenu() {
  if (!menuButton || !mainNav) return;

  menuButton.classList.remove("is-active");
  mainNav.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menu");
  document.body.classList.remove("menu-open");
}

if (menuButton && mainNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";

    menuButton.classList.toggle("is-active", !isOpen);
    mainNav.classList.toggle("is-open", !isOpen);
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Abrir menu" : "Fechar menu",
    );
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1060) {
      closeMenu();
    }
  });
}

const currentYear = document.querySelector("#current-year");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

const revealElements = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries, revealObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealElements.forEach((element) => observer.observe(element));
}

const projectCarousels = document.querySelectorAll("[data-project-carousel]");

projectCarousels.forEach((carousel) => {
  const track = carousel.querySelector(".project-carousel-track");
  const slides = Array.from(carousel.querySelectorAll(".project-slide"));
  const previousButton = carousel.querySelector(".project-carousel-prev");
  const nextButton = carousel.querySelector(".project-carousel-next");
  const dotsContainer = carousel.querySelector(".project-carousel-dots");

  if (
    !track ||
    !previousButton ||
    !nextButton ||
    !dotsContainer ||
    slides.length === 0
  ) {
    return;
  }

  if (slides.length === 1) {
    carousel.classList.add("is-single-slide");
    return;
  }

  const dots = slides.map((slide, index) => {
    const dot = document.createElement("button");

    dot.className = "project-carousel-dot";
    dot.type = "button";
    dot.setAttribute(
      "aria-label",
      `Ver tela ${index + 1} de ${carousel.dataset.carouselName || "o projeto"}`,
    );
    dot.addEventListener("click", () => {
      goToSlide(index);
    });

    dotsContainer.appendChild(dot);

    return dot;
  });

  function getCurrentSlideIndex() {
    if (track.clientWidth === 0) {
      return 0;
    }

    return Math.round(track.scrollLeft / track.clientWidth);
  }

  function goToSlide(index) {
    const destination = Math.min(Math.max(index, 0), slides.length - 1);

    track.scrollTo({
      left: track.clientWidth * destination,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  function updateCarousel() {
    const currentIndex = Math.min(
      Math.max(getCurrentSlideIndex(), 0),
      slides.length - 1,
    );

    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slides.length - 1;

    dots.forEach((dot, index) => {
      const isActive = index === currentIndex;

      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  previousButton.addEventListener("click", () => {
    goToSlide(getCurrentSlideIndex() - 1);
  });

  nextButton.addEventListener("click", () => {
    goToSlide(getCurrentSlideIndex() + 1);
  });

  let scrollTimeout;

  track.addEventListener("scroll", () => {
    window.clearTimeout(scrollTimeout);

    scrollTimeout = window.setTimeout(() => {
      updateCarousel();
    }, 80);
  });

  track.addEventListener(
    "wheel",
    (event) => {
      const movement =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;

      const movingForward = movement > 0;
      const movingBackward = movement < 0;

      const canMoveForward =
        track.scrollLeft + track.clientWidth < track.scrollWidth - 2;

      const canMoveBackward = track.scrollLeft > 2;

      if (
        (movingForward && canMoveForward) ||
        (movingBackward && canMoveBackward)
      ) {
        event.preventDefault();

        track.scrollBy({
          left: movement,
          behavior: "auto",
        });
      }
    },
    {
      passive: false,
    },
  );

  window.addEventListener("resize", () => {
    goToSlide(getCurrentSlideIndex());
    updateCarousel();
  });

  updateCarousel();
});

document.addEventListener("click", (event) => {
  const clickedLink = event.target.closest("a");

  if (!clickedLink || typeof window.gtag !== "function") {
    return;
  }

  const linkAddress = clickedLink.href;
  const linkText = clickedLink.textContent.trim().replace(/\s+/g, " ");

  if (linkAddress.includes("wa.me")) {
    window.gtag("event", "whatsapp_click", {
      link_text: linkText,
      link_url: linkAddress,
      page_location: window.location.href,
    });

    return;
  }

  if (linkAddress.startsWith("mailto:")) {
    window.gtag("event", "email_click", {
      link_text: linkText,
      link_url: linkAddress,
      page_location: window.location.href,
    });

    return;
  }

  if (linkAddress.includes("linkedin.com")) {
    window.gtag("event", "linkedin_click", {
      link_text: linkText,
      link_url: linkAddress,
      page_location: window.location.href,
    });
  }
});
