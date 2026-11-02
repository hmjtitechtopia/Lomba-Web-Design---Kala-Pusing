(() => {
  const scriptUrl = document.currentScript?.src;
  if (!scriptUrl) return;

  const homeUrl = new URL("../../index.html", scriptUrl);
  const homeDirectory = new URL("./", homeUrl);
  const returnKey = "sekala:return-home";
  const departureKey = "sekala:departed-home";
  const entryKey = "sekala:route-entry";
  const guardKey = "sekalaHomeBackGuard";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isHomeUrl = (url) =>
    url.origin === homeUrl.origin &&
    (url.pathname === homeUrl.pathname ||
      url.pathname === homeDirectory.pathname);
  const onHome = isHomeUrl(window.location);

  const readSession = (key) => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const writeSession = (key, value) => {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      /* Fallback kalau sessionStorage disabled */
    }
  };
  const clearSession = (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* Fallback kalau sessionStorage disabled */
    }
  };

  if (!onHome && !document.querySelector(".route-entry-curtain")) {
    const entryCurtain = document.createElement("div");
    entryCurtain.className = "route-entry-curtain";
    entryCurtain.setAttribute("aria-hidden", "true");
    document.body.prepend(entryCurtain);
  }

  const curtain = document.createElement("div");
  curtain.className = "route-return-curtain";
  curtain.setAttribute("aria-hidden", "true");
  document.body.append(curtain);

  let leaving = false;
  let lastScrollX = window.scrollX;
  let lastScrollY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      if (!leaving) {
        lastScrollX = window.scrollX;
        lastScrollY = window.scrollY;
      }
    },
    { passive: true },
  );

  const coverAndNavigate = (navigate) => {
    if (leaving) return;
    leaving = true;
    if (reducedMotion.matches) {
      navigate();
      return;
    }

    curtain.classList.add("is-closing");
    setTimeout(navigate, 680);
  };

  const resetExitCurtain = () => {
    leaving = false;
    lastScrollX = window.scrollX;
    lastScrollY = window.scrollY;
    curtain.classList.remove("is-closing");
  };

  const departedFromInternal =
    readSession(departureKey) === window.location.pathname;
  clearSession(departureKey);
  let referredFromInternal = false;
  try {
    const referrerUrl = new URL(document.referrer);
    referredFromInternal =
      referrerUrl.origin === homeUrl.origin &&
      (referrerUrl.pathname !== window.location.pathname ||
        referrerUrl.search !== window.location.search);
  } catch {
    /* Akses langsung tanpa referrer */
  }

  let guardActive = false;
  const hasExistingGuard = window.history.state?.[guardKey] === true;
  const shouldGuard = onHome
    ? departedFromInternal
    : departedFromInternal || referredFromInternal;
  if ((hasExistingGuard || shouldGuard) && !reducedMotion.matches) {
    const state =
      window.history.state && typeof window.history.state === "object"
        ? window.history.state
        : {};
    if (state[guardKey] !== true) {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.history.pushState(
        { ...state, [guardKey]: true },
        "",
        window.location.href,
      );
    }
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "auto";
    }
    guardActive = true;
  }

  if (onHome) {
    let revealing = false;

    const revealHome = (event) => {
      resetExitCurtain();
      if (window.history.state?.[guardKey] === true && !reducedMotion.matches) {
        guardActive = true;
      }
      if (revealing) return;
      const isPersisted = event?.persisted === true;
      if (readSession(returnKey) !== "1" && !isPersisted) {
        document.documentElement.classList.remove(
          "is-returning-home",
          "is-revealing-home",
        );
        return;
      }
      revealing = true;
      clearSession(returnKey);
      clearSession(entryKey);
      document.documentElement.classList.remove(
        "is-initial-home",
        "is-revealing-home",
      );

      if (reducedMotion.matches) {
        document.documentElement.classList.remove(
          "is-returning-home",
          "is-revealing-home",
        );
        revealing = false;
        return;
      }

      document.documentElement.classList.add("is-returning-home");
      requestAnimationFrame(() => {
        document.documentElement.classList.add("is-revealing-home");
        setTimeout(() => {
          document.documentElement.classList.remove(
            "is-returning-home",
            "is-revealing-home",
          );
          revealing = false;
        }, 1200);
      });
    };

    window.addEventListener("pagehide", () => {
      resetExitCurtain();
      if (!reducedMotion.matches) {
        document.documentElement.classList.remove(
          "is-initial-home",
          "is-revealing-home",
        );
        document.documentElement.classList.add("is-returning-home");
      }
    });

    window.addEventListener("pageshow", revealHome);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => revealHome(), {
        once: true,
      });
    } else {
      revealHome();
    }
  } else {
    let revealingPage = false;

    const revealPage = (event) => {
      resetExitCurtain();
      if (window.history.state?.[guardKey] === true && !reducedMotion.matches) {
        guardActive = true;
      }
      if (revealingPage) return;
      const isPersisted = event?.persisted === true;
      const entryTarget = readSession(entryKey);
      if (
        entryTarget !== window.location.pathname &&
        entryTarget !== "*" &&
        !isPersisted
      ) {
        document.documentElement.classList.remove(
          "is-entering-page",
          "is-revealing-page",
        );
        return;
      }
      revealingPage = true;
      clearSession(entryKey);
      clearSession(returnKey);
      document.documentElement.classList.remove("is-revealing-page");

      if (reducedMotion.matches) {
        document.documentElement.classList.remove(
          "is-entering-page",
          "is-revealing-page",
        );
        revealingPage = false;
        return;
      }

      document.documentElement.classList.add("is-entering-page");
      requestAnimationFrame(() => {
        document.documentElement.classList.add("is-revealing-page");
        setTimeout(() => {
          document.documentElement.classList.remove(
            "is-entering-page",
            "is-revealing-page",
          );
          revealingPage = false;
        }, 1200);
      });
    };

    window.addEventListener("pagehide", () => {
      resetExitCurtain();
      if (!reducedMotion.matches) {
        document.documentElement.classList.remove("is-revealing-page");
        document.documentElement.classList.add("is-entering-page");
      }
    });

    window.addEventListener("pageshow", revealPage);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => revealPage(), {
        once: true,
      });
    } else {
      revealPage();
    }
  }

  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    if (leaving) {
      event.preventDefault();
      return;
    }
    const link = event.target.closest("a[href]");
    if (
      !link ||
      (link.target && link.target !== "_self") ||
      link.hasAttribute("download")
    )
      return;
    const destination = new URL(link.href);
    if (destination.origin !== homeUrl.origin) return;
    if (
      destination.pathname === window.location.pathname &&
      destination.search === window.location.search
    ) {
      if (destination.hash && guardActive) {
        event.preventDefault();
        document.querySelector(destination.hash)?.scrollIntoView({
          behavior: reducedMotion.matches ? "auto" : "smooth",
        });
      }
      return;
    }

    writeSession(departureKey, destination.pathname);
    if (isHomeUrl(destination)) {
      clearSession(entryKey);
      writeSession(returnKey, "1");
      if (reducedMotion.matches) return;
      event.preventDefault();
      coverAndNavigate(() => window.location.assign(destination.href));
      return;
    }

    clearSession(returnKey);
    writeSession(entryKey, destination.pathname);
    if (reducedMotion.matches) return;
    event.preventDefault();
    coverAndNavigate(() => window.location.assign(destination.href));
  });

  window.addEventListener("popstate", () => {
    if (window.history.state?.[guardKey] === true) {
      guardActive = !reducedMotion.matches;
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
      return;
    }
    if (!guardActive) return;
    guardActive = false;
    const savedX = lastScrollX;
    const savedY = lastScrollY;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(savedX, savedY);
    requestAnimationFrame(() => {
      window.scrollTo(savedX, savedY);
    });
    coverAndNavigate(() => {
      writeSession(returnKey, "1");
      writeSession(entryKey, "*");
      window.history.back();
    });
  });
})();
