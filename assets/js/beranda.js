const prefersReducedMarqueeMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

document.querySelectorAll(".partners-track").forEach((track, rowIndex) => {
  const originalSet = track.querySelector(".partners-logo-set");
  if (!originalSet) return;

  for (let copy = 0; copy < 3; copy += 1) {
    const duplicate = originalSet.cloneNode(true);
    duplicate.setAttribute("aria-hidden", "true");
    duplicate.querySelectorAll("img").forEach((image) => {
      image.alt = "";
    });
    track.append(duplicate);
  }

  track.classList.add("is-ready");

  if (typeof gsap === "undefined") return;

  const row = track.closest(".partners-row");
  if (!row) return;

  let marquee;
  let resizeFrame = 0;

  const setSpeed = (speed) => {
    if (!marquee) return;
    gsap.to(marquee, {
      timeScale: speed,
      duration: speed === 0 ? 0.9 : 1.1,
      ease: speed === 0 ? "power2.out" : "power2.inOut",
      overwrite: true,
    });
  };

  const setupMarquee = () => {
    const reverse = rowIndex === 1;
    const progress = marquee?.progress() ?? (reverse ? 12 / 22 : 0);
    const speed = marquee?.timeScale() ?? 1;

    if (marquee) {
      gsap.killTweensOf(marquee);
      marquee.kill();
    }
    gsap.set(track, { clearProps: "transform" });

    if (prefersReducedMarqueeMotion.matches) {
      marquee = undefined;
      track.classList.remove("is-gsap");
      return;
    }

    const setWidth = originalSet.getBoundingClientRect().width;
    if (!setWidth) {
      marquee = undefined;
      track.classList.remove("is-gsap");
      return;
    }

    track.classList.add("is-gsap");
    marquee = gsap.fromTo(
      track,
      { x: reverse ? -setWidth : 0 },
      {
        x: reverse ? 0 : -setWidth,
        duration: reverse ? 22 : 32,
        ease: "none",
        repeat: -1,
      },
    );
    marquee.progress(progress).timeScale(speed);
  };

  row.querySelectorAll(".partner-card img").forEach((image) => {
    image.addEventListener("pointerenter", () => setSpeed(0));
    image.addEventListener("pointerleave", () => setSpeed(1));
  });

  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(setupMarquee);
  });
  prefersReducedMarqueeMotion.addEventListener("change", setupMarquee);
  setupMarquee();
});

const faq = document.querySelector(".faq");
if (faq) {
  const items = [...faq.querySelectorAll(".faq-item")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const closeTimers = new WeakMap();

  const finishClose = (item) => {
    window.clearTimeout(closeTimers.get(item));
    if (!item.classList.contains("is-expanded")) item.open = false;
  };

  const closeItem = (item) => {
    item.classList.remove("is-expanded");
    if (reducedMotion.matches) {
      finishClose(item);
    } else {
      closeTimers.set(
        item,
        window.setTimeout(() => finishClose(item), 400),
      );
    }
  };

  items.forEach((item) => {
    const summary = item.querySelector("summary");
    const panel = item.querySelector(".faq-panel-wrapper");
    if (!summary || !panel) return;

    summary.addEventListener("click", (event) => {
      event.preventDefault();
      if (item.classList.contains("is-expanded")) {
        closeItem(item);
        return;
      }

      items.forEach((other) => {
        if (other !== item && other.classList.contains("is-expanded"))
          closeItem(other);
      });
      window.clearTimeout(closeTimers.get(item));
      if (!item.open) {
        item.open = true;
        panel.getBoundingClientRect();
      }
      item.classList.add("is-expanded");
    });

    panel.addEventListener("transitionend", (event) => {
      if (event.propertyName === "grid-template-rows") finishClose(item);
    });
  });

  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) items.forEach(finishClose);
  });
  faq.classList.add("is-enhanced");
}

const useTabs = [...document.querySelectorAll(".use-tab")];
const usesSection = document.querySelector(".uses");

if (usesSection && "IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;

      usesSection.querySelectorAll(".use-image").forEach((image) => {
        image.loading = "eager";
        image.decode?.().catch(() => {});
      });
      imageObserver.disconnect();
    },
    { rootMargin: "800px" },
  );

  imageObserver.observe(usesSection);
}

const useCover = document.querySelector(".use-transition-cover");
const useCoverPauseMs = 400;
let requestedUseTab = useTabs.find(
  (tab) => tab.getAttribute("aria-selected") === "true",
);
let displayedUseTab = requestedUseTab;
let useTransitionId = 0;
let coverAnimation;
let fadeAnimation;

function activateUseTab(activeTab) {
  useTabs.forEach((tab) => {
    const selected = tab === activeTab;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden =
      !selected;
  });
  displayedUseTab = activeTab;
}

function resetUseCover() {
  coverAnimation?.cancel();
  fadeAnimation?.cancel();
  coverAnimation = undefined;
  fadeAnimation = undefined;
  if (!useCover) return;
  useCover.hidden = true;
  useCover.style.clipPath = "";
}

async function showUseTab(activeTab) {
  if (activeTab === requestedUseTab) return;
  requestedUseTab = activeTab;
  const transitionId = ++useTransitionId;
  resetUseCover();

  if (activeTab === displayedUseTab) return;
  if (
    !useCover?.animate ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    activateUseTab(activeTab);
    return;
  }

  const nextPanel = document.getElementById(
    activeTab.getAttribute("aria-controls"),
  );
  const nextImage = nextPanel.querySelector(".use-image");
  nextImage.loading = "eager";
  const imageReady = nextImage.decode?.().catch(() => {}) ?? Promise.resolve();

  useCover.hidden = false;
  coverAnimation = useCover.animate(
    [{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
    { duration: 500, easing: "ease", fill: "forwards" },
  );

  try {
    await Promise.all([coverAnimation.finished, imageReady]);
  } catch {
    if (transitionId === useTransitionId) {
      resetUseCover();
      activateUseTab(activeTab);
    }
    return;
  }
  if (transitionId !== useTransitionId) return;

  useCover.style.clipPath = "none";
  coverAnimation.cancel();
  coverAnimation = undefined;
  await new Promise((resolve) => setTimeout(resolve, useCoverPauseMs));
  if (transitionId !== useTransitionId) return;

  activateUseTab(activeTab);
  fadeAnimation = useCover.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 650,
    easing: "ease-in-out",
    fill: "forwards",
  });

  try {
    await fadeAnimation.finished;
  } catch {
    if (transitionId === useTransitionId) resetUseCover();
    return;
  }
  if (transitionId === useTransitionId) resetUseCover();
}

useTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => showUseTab(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % useTabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + useTabs.length) % useTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = useTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    showUseTab(useTabs[nextIndex]);
    useTabs[nextIndex].focus();
  });
});

const reviewsViewport = document.querySelector(".reviews-viewport");
const reviewsTrack = reviewsViewport?.querySelector(".reviews-track");
const reviewCards = [...(reviewsTrack?.querySelectorAll(".review-card") || [])];
const reviewDots = [...document.querySelectorAll(".reviews-dots button")];

if (
  reviewsViewport &&
  reviewsTrack &&
  reviewCards.length &&
  reviewCards.length === reviewDots.length
) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeReview = Math.max(
    0,
    reviewCards.findIndex((card) => card.classList.contains("is-active")),
  );
  let renderedCards = [];
  let pendingCard = null;
  let navigationFrame = 0;
  let scrollSettleTimer = 0;
  let resizeFrame = 0;
  let isRebasing = false;
  let isPointerDown = false;

  const cardCenter = (card) => {
    const rect = card.getBoundingClientRect();
    return rect.left + rect.width / 2;
  };

  const viewportCenter = () => {
    const rect = reviewsViewport.getBoundingClientRect();
    return rect.left + reviewsViewport.clientWidth / 2;
  };

  const nearestCard = () =>
    renderedCards.reduce(
      (nearest, card) =>
        Math.abs(cardCenter(card) - viewportCenter()) <
        Math.abs(cardCenter(nearest) - viewportCenter())
          ? card
          : nearest,
      renderedCards[0],
    );

  const setActiveReview = (index, force = false) => {
    if (index === activeReview && !force) return;
    activeReview = index;
    renderedCards.forEach((card) => {
      const distance = Math.abs(Number(card.dataset.reviewIndex) - index);
      const circularDistance = Math.min(
        distance,
        reviewCards.length - distance,
      );
      card.classList.toggle("is-active", circularDistance === 0);
      card.classList.toggle("review-card--edge", circularDistance >= 2);
    });
    reviewDots.forEach((dot, dotIndex) =>
      dot.setAttribute("aria-current", String(dotIndex === index)),
    );
  };

  const targetScrollLeft = (card) => {
    const gap = parseFloat(getComputedStyle(reviewsTrack).columnGap) || 0;
    const trackLeft =
      reviewsViewport.scrollLeft +
      reviewsTrack.getBoundingClientRect().left -
      reviewsViewport.getBoundingClientRect().left;
    const paddingLeft =
      parseFloat(getComputedStyle(reviewsTrack).paddingLeft) || 0;
    const widthFor = (entry) => {
      const tierWidth = parseFloat(
        getComputedStyle(entry).getPropertyValue("--review-tier-width"),
      );
      return Number.isFinite(tierWidth)
        ? tierWidth
        : entry.getBoundingClientRect().width;
    };
    const cardIndex = renderedCards.indexOf(card);
    const precedingWidth = renderedCards
      .slice(0, cardIndex)
      .reduce((sum, entry) => sum + widthFor(entry) + gap, 0);
    return (
      trackLeft +
      paddingLeft +
      precedingWidth +
      widthFor(card) / 2 -
      reviewsViewport.clientWidth / 2
    );
  };

  const rebaseToOriginal = (card) => {
    const original = reviewCards[Number(card.dataset.reviewIndex)];
    if (card === original) return;

    isRebasing = true;
    reviewsViewport.scrollLeft += cardCenter(original) - cardCenter(card);
    requestAnimationFrame(() => {
      isRebasing = false;
    });
  };

  const cancelNavigation = () => {
    cancelAnimationFrame(navigationFrame);
    navigationFrame = 0;
    pendingCard = null;
  };

  const finishScroll = () => {
    if (isRebasing || isPointerDown || pendingCard || !renderedCards.length)
      return;
    window.clearTimeout(scrollSettleTimer);
    const card = nearestCard();
    if (
      Number(card.dataset.reviewIndex) !== activeReview ||
      Math.abs(cardCenter(card) - viewportCenter()) > 3
    ) {
      scrollToCard(card);
    } else {
      rebaseToOriginal(card);
    }
  };

  const scrollToCard = (card, behavior = "smooth") => {
    cancelNavigation();
    window.clearTimeout(scrollSettleTimer);
    pendingCard = card;
    setActiveReview(Number(card.dataset.reviewIndex));
    const startLeft = reviewsViewport.scrollLeft;
    const endLeft = targetScrollLeft(card);

    if (
      reducedMotion.matches ||
      behavior === "auto" ||
      Math.abs(endLeft - startLeft) < 1
    ) {
      reviewsViewport.scrollLeft = endLeft;
      pendingCard = null;
      rebaseToOriginal(card);
      return;
    }

    const startTime = performance.now();
    const duration = 600;
    const animate = (now) => {
      if (pendingCard !== card) return;
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      reviewsViewport.scrollLeft = startLeft + (endLeft - startLeft) * eased;
      if (progress < 1) {
        navigationFrame = requestAnimationFrame(animate);
      } else {
        navigationFrame = 0;
        pendingCard = null;
        rebaseToOriginal(card);
      }
    };
    navigationFrame = requestAnimationFrame(animate);
  };

  const stepReview = (direction) => {
    const current = pendingCard || nearestCard();
    const next = renderedCards[renderedCards.indexOf(current) + direction];
    scrollToCard(
      next ||
        reviewCards[
          (activeReview + direction + reviewCards.length) % reviewCards.length
        ],
    );
  };

  const buildLoop = () => {
    window.clearTimeout(scrollSettleTimer);
    cancelNavigation();
    isRebasing = true;
    reviewsTrack.classList.add("is-looping");
    reviewsTrack.replaceChildren(...reviewCards);
    reviewCards.forEach((card, index) => {
      card.dataset.reviewIndex = String(index);
    });

    const gap = parseFloat(getComputedStyle(reviewsTrack).columnGap) || 0;
    const cycleWidth =
      reviewCards.reduce(
        (width, card) => width + card.getBoundingClientRect().width,
        0,
      ) +
      gap * reviewCards.length;
    const copiesPerSide = Math.max(
      2,
      Math.ceil(reviewsViewport.clientWidth / cycleWidth) + 1,
    );
    const cloneSet = () =>
      reviewCards.map((card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.setAttribute("inert", "");
        return clone;
      });
    const before = Array.from({ length: copiesPerSide }, cloneSet).flat();
    const after = Array.from({ length: copiesPerSide }, cloneSet).flat();
    reviewsTrack.replaceChildren(...before, ...reviewCards, ...after);
    renderedCards = [...reviewsTrack.querySelectorAll(".review-card")];
    setActiveReview(activeReview, true);
    reviewsViewport.scrollLeft +=
      cardCenter(reviewCards[activeReview]) - viewportCenter();

    requestAnimationFrame(() => {
      isRebasing = false;
    });
  };

  reviewsViewport.addEventListener(
    "scroll",
    () => {
      if (isRebasing || pendingCard || isPointerDown) return;
      window.clearTimeout(scrollSettleTimer);
      scrollSettleTimer = window.setTimeout(finishScroll, 180);
    },
    { passive: true },
  );

  reviewsViewport.addEventListener("scrollend", finishScroll);
  reviewsViewport.addEventListener(
    "pointerdown",
    () => {
      cancelNavigation();
      isPointerDown = true;
    },
    { passive: true },
  );
  const releasePointer = () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    window.clearTimeout(scrollSettleTimer);
    scrollSettleTimer = window.setTimeout(finishScroll, 180);
  };
  window.addEventListener("pointerup", releasePointer);
  window.addEventListener("pointercancel", releasePointer);
  reviewsViewport.addEventListener(
    "wheel",
    () => {
      cancelNavigation();
      window.clearTimeout(scrollSettleTimer);
      scrollSettleTimer = window.setTimeout(finishScroll, 180);
    },
    { passive: true },
  );

  document.querySelectorAll("[data-review-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      stepReview(Number(button.dataset.reviewDirection));
    });
  });

  reviewDots.forEach((dot, index) =>
    dot.addEventListener("click", () => {
      const target = renderedCards
        .filter((card) => Number(card.dataset.reviewIndex) === index)
        .reduce((nearest, card) =>
          Math.abs(cardCenter(card) - viewportCenter()) <
          Math.abs(cardCenter(nearest) - viewportCenter())
            ? card
            : nearest,
        );
      scrollToCard(target);
    }),
  );

  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(buildLoop);
  });

  buildLoop();
}

// Expand/collapse overlay gambar kartu permasalahan
const problemCards = document.querySelectorAll(".problem-card");

problemCards.forEach((card) => {
  const iconButton = card.querySelector(".problem-icon");
  const overlay = card.querySelector(".problem-media-overlay");

  iconButton?.addEventListener("click", () => {
    problemCards.forEach((otherCard) => {
      if (otherCard !== card) {
        otherCard.classList.remove("is-expanded");
        otherCard
          .querySelector(".problem-media-overlay")
          ?.setAttribute("tabindex", "-1");
      }
    });

    card.classList.add("is-expanded");
    overlay?.setAttribute("tabindex", "0");
  });

  overlay?.addEventListener("click", () => {
    card.classList.remove("is-expanded");
    overlay.setAttribute("tabindex", "-1");
    iconButton?.focus();
  });

  // Support aksesibilitas keyboard: tutup overlay pakai Enter / Spasi
  overlay?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.classList.remove("is-expanded");
      overlay.setAttribute("tabindex", "-1");
      iconButton?.focus();
    }
  });
});

// Tutup semua overlay kalau user tekan Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    problemCards.forEach((card) => {
      card.classList.remove("is-expanded");
      card
        .querySelector(".problem-media-overlay")
        ?.setAttribute("tabindex", "-1");
    });
  }
});
