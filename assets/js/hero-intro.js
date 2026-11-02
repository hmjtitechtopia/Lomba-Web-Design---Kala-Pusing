(() => {
  const root = document.documentElement;
  if (
    !root.classList.contains("is-initial-home") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    typeof window.gsap === "undefined"
  )
    return;

  const titleLines = [...document.querySelectorAll(".hero-title-line-inner")];
  const description = document.querySelector(".hero-description p");
  const actions = [...document.querySelectorAll(".hero-actions > *")];
  const screen = document.querySelector(".hero-intro-screen");
  const loader = document.querySelector(".hero-intro-loader");
  if (
    titleLines.length !== 2 ||
    !description ||
    actions.length !== 2 ||
    !screen ||
    !loader
  )
    return;

  // Kalau animasi fallback CSS udah keburu jalan lewat 1.3 detik, jangan ditimpa GSAP lagi
  if (Number(screen.getAnimations?.()[0]?.currentTime) >= 1300) return;

  root.classList.add("is-gsap-hero-intro");
  const onMobile = window.matchMedia("(max-width: 700px)").matches;
  const animatedElements = [...titleLines, description, ...actions];

  window.gsap.set(screen, { clipPath: "inset(0 0 0 0)" });
  window.gsap.set(loader, { opacity: 0, y: 20, scale: 0.9 });
  window.gsap.set(
    titleLines,
    onMobile
      ? { opacity: 0 }
      : { opacity: 0, yPercent: 78, willChange: "transform, opacity" },
  );
  window.gsap.set(description, {
    opacity: 0,
    y: 18,
    willChange: "transform, opacity",
  });
  window.gsap.set(actions, {
    opacity: 0,
    y: 12,
    willChange: "transform, opacity",
  });

  const timeline = window.gsap.timeline({
    onComplete: () => {
      window.gsap.set(animatedElements, {
        clearProps: "opacity,transform,willChange",
      });
      window.gsap.set([loader, screen], { clearProps: "all" });
      root.classList.remove("is-initial-home", "is-gsap-hero-intro");
    },
  });

  timeline.to(
    loader,
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.75,
      ease: "power3.out",
    },
    0.12,
  );

  timeline.to(
    loader,
    {
      opacity: 0,
      y: -18,
      scale: 0.96,
      duration: 0.38,
      ease: "power2.in",
    },
    1.25,
  );

  timeline.to(
    screen,
    {
      clipPath: "inset(0 0 100% 0)",
      duration: 0.82,
      ease: "power3.inOut",
    },
    1.39,
  );

  timeline.to(
    titleLines,
    {
      opacity: 1,
      ...(onMobile ? {} : { yPercent: 0 }),
      duration: 1.12,
      stagger: 0.14,
      ease: "power3.out",
    },
    1.79,
  );

  timeline.to(
    description,
    {
      opacity: 1,
      y: 0,
      duration: 0.92,
      ease: "power2.out",
    },
    2.19,
  );

  timeline.to(
    actions,
    {
      opacity: 1,
      y: 0,
      duration: 0.84,
      stagger: 0.1,
      ease: "power2.out",
    },
    2.37,
  );

  window.addEventListener(
    "pagehide",
    () => {
      timeline.progress(1).kill();
    },
    { once: true },
  );
})();
