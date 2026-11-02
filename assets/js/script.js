if (typeof Lenis !== "undefined") {
  new Lenis({
    autoRaf: true,
    anchors: true,
    lerp: 0.1,
    wheelMultiplier: 0.9,
  });
}

const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (nav && navToggle && navLinks) {
  const setMenuOpen = (open) => {
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute(
      "aria-label",
      open ? "Tutup menu navigasi" : "Buka menu navigasi",
    );
    navLinks.classList.toggle("is-open", open);
  };

  navToggle.addEventListener("click", () => {
    setMenuOpen(navToggle.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target)) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key !== "Escape" ||
      navToggle.getAttribute("aria-expanded") !== "true"
    )
      return;
    setMenuOpen(false);
    navToggle.focus();
  });

  window
    .matchMedia("(min-width: 701px)")
    .addEventListener("change", () => setMenuOpen(false));
}

const newsletterForm = document.querySelector(".footer-newsletter");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]');
    if (!email.value.trim() || !email.checkValidity()) {
      email.focus();
      return;
    }
    newsletterForm.reset();
  });
}

// Scroll reveal via IntersectionObserver buat elemen [data-reveal]
const revealTargets = document.querySelectorAll(
  "[data-reveal]:not([hidden]), [data-reveal-child]:not([hidden])",
);
const prefersReducedReveal = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

if (
  revealTargets.length &&
  !prefersReducedReveal.matches &&
  "IntersectionObserver" in window
) {
  document.documentElement.classList.add("has-scroll-reveal");
  void document.documentElement.offsetHeight;
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        window.setTimeout(() => {
          entry.target.classList.add("reveal-complete");
        }, 1150);
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -48px 0px" },
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
}
