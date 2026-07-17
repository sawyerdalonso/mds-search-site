(() => {
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Navbar glass effect on scroll
  const nav = document.querySelector(".navbar-glass");
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Active nav highlighting
  const page = document.body.getAttribute("data-page");
  if (page) {
    document.querySelectorAll("[data-nav]").forEach(a => {
      if (a.getAttribute("data-nav") === page) a.classList.add("active");
    });
  }

  // AOS animations
  if (window.AOS && !motionPreference.matches) {
    AOS.init({
      once: true,
      duration: 650,
      easing: "ease-out-cubic",
      offset: 40
    });
  }

  // Set current year in any element that wants it
  document.querySelectorAll("[data-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Load the hero video only when motion is allowed. If mobile autoplay or
  // loading fails, remove the video cleanly and leave the CSS poster visible.
  const heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    const source = heroVideo.querySelector("source[data-src]");
    let fallbackTimer;

    const clearFallbackTimer = () => window.clearTimeout(fallbackTimer);
    const showFallback = () => {
      clearFallbackTimer();
      heroVideo.classList.remove("is-ready");
      heroVideo.classList.add("is-fallback");
      heroVideo.pause();
      if (source && source.hasAttribute("src")) {
        source.removeAttribute("src");
        heroVideo.load();
      }
    };
    const markReady = () => {
      clearFallbackTimer();
      heroVideo.classList.remove("is-fallback");
      heroVideo.classList.add("is-ready");
    };
    const startVideo = () => {
      if (motionPreference.matches || !source) {
        showFallback();
        return;
      }

      heroVideo.classList.remove("is-fallback", "is-ready");
      source.setAttribute("src", source.dataset.src);
      heroVideo.load();
      heroVideo.play().catch(showFallback);
      fallbackTimer = window.setTimeout(() => {
        if (heroVideo.paused || heroVideo.readyState < 2) showFallback();
      }, 8000);
    };

    heroVideo.addEventListener("playing", markReady);
    heroVideo.addEventListener("error", showFallback);
    if (source) source.addEventListener("error", showFallback);

    const onMotionChange = () => {
      if (motionPreference.matches) showFallback();
      else startVideo();
    };
    if (motionPreference.addEventListener) {
      motionPreference.addEventListener("change", onMotionChange);
    } else {
      motionPreference.addListener(onMotionChange);
    }

    startVideo();
  }
})();
