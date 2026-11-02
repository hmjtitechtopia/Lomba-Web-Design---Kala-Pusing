const stage = document.querySelector(".bali-island");
const popup = document.querySelector("#wilayah-popup");
const closeButton = popup.querySelector(".wilayah-popup__close");
const list = popup.querySelector(".wilayah-popup__list");
const pins = stage.querySelectorAll(".bali-island-pins .bali-pin");

let activePin = null;
let pointerStart = null;
let closeTimer = null;
let handleAnimationEnd = null;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function cleanupClose() {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  if (handleAnimationEnd) {
    popup.removeEventListener("animationend", handleAnimationEnd);
    handleAnimationEnd = null;
  }
  popup.classList.remove("is-closing");
}

function openPopup(pin) {
  cleanupClose();
  if (activePin && activePin !== pin) {
    activePin.setAttribute("aria-expanded", "false");
  }
  activePin = pin;
  if (pin && typeof pin.setAttribute === "function") {
    pin.setAttribute("aria-expanded", "true");
  }

  // Redirect semua wilayah ke Badung sesuai brief lomba
  const cta = popup.querySelector(".wilayah-popup__button");
  if (cta) {
    cta.href = "daftar-tradisi.html?wilayah=badung";
  }

  popup.hidden = false;
  list.scrollTop = 0;
  closeButton.focus();
}

function closePopup(returnFocus) {
  if (popup.hidden || popup.classList.contains("is-closing")) return;

  const pinToFocus = activePin;
  if (activePin) {
    activePin.setAttribute("aria-expanded", "false");
  }

  // Skip animasi exit kalau reduced motion aktif
  if (prefersReducedMotion()) {
    cleanupClose();
    popup.hidden = true;
    activePin = null;
    if (returnFocus && pinToFocus) pinToFocus.focus();
    return;
  }

  popup.classList.add("is-closing");

  const finish = () => {
    cleanupClose();
    popup.hidden = true;
    activePin = null;
    if (returnFocus && pinToFocus) {
      pinToFocus.focus();
    }
  };

  handleAnimationEnd = (event) => {
    if (event.target === popup) {
      finish();
    }
  };

  popup.addEventListener("animationend", handleAnimationEnd);
  // Fallback timer kalau animationend nggak ketrigger
  closeTimer = setTimeout(finish, 320);
}

for (const pin of pins) {
  pin.setAttribute("aria-haspopup", "dialog");
  pin.setAttribute("aria-controls", "wilayah-popup");
  pin.setAttribute("aria-expanded", "false");
  // Prevent default link biar pin cuma buka modal popup
  pin.addEventListener("click", (event) => {
    event.preventDefault();
    openPopup(pin);
  });
}

closeButton.addEventListener("click", () => closePopup(true));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePopup(true);
});

// Catat koordinat pointerdown biar drag rotasi peta nggak dianggap klik luar (outside click)
document.addEventListener("pointerdown", (event) => {
  pointerStart = { x: event.clientX, y: event.clientY };
});

document.addEventListener("click", (event) => {
  if (popup.hidden || popup.classList.contains("is-closing")) return;
  if (
    popup.contains(event.target) ||
    event.target.closest(".bali-pin") ||
    event.target.closest(".wilayah-view-switcher") ||
    event.target.closest(".leaflet-control")
  ) {
    return;
  }
  const moved = pointerStart
    ? Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y)
    : 0;
  if (moved > 6) return;
  closePopup(false);
});

// Expose ke global window biar bisa dipanggil Leaflet marker (mode 2D)
window.openWilayahPopup = openPopup;
window.closeWilayahPopup = closePopup;
