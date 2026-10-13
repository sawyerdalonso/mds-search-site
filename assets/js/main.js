(() => {
  const consentKey = "mdsPrivacyConsent";
  const consentVersion = 1;
  const day = 24 * 60 * 60 * 1000;
  const consentLifetime = 180 * day;
  const optOutLifetime = 365 * day;
  let optionalTrackingLoaded = false;

  const hasGlobalPrivacyControl = () => navigator.globalPrivacyControl === true;

  // US visitors get notice + opt-out. Visitors whose browser time zone places
  // them in Europe (EEA/UK/Switzerland) keep the opt-in flow GDPR requires.
  const requiresOptIn = (() => {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      return /^(Europe\/|Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe)$)/.test(timeZone);
    } catch (error) {
      return false;
    }
  })();

  function readConsent() {
    if (hasGlobalPrivacyControl()) {
      return { optionalTracking: false, source: "gpc" };
    }

    try {
      const consent = JSON.parse(window.localStorage.getItem(consentKey));
      const isCurrent = consent && consent.version === consentVersion;
      const lifetime = isCurrent && consent.optionalTracking === false ? optOutLifetime : consentLifetime;
      const isFresh = isCurrent && Date.now() - consent.updatedAt < lifetime;

      return isFresh ? consent : null;
    } catch (error) {
      return null;
    }
  }

  function saveConsent(optionalTracking, source = "user") {
    try {
      window.localStorage.setItem(consentKey, JSON.stringify({
        optionalTracking,
        source,
        updatedAt: Date.now(),
        version: consentVersion
      }));
    } catch (error) {
      // Keep the visitor's choice for this page even when storage is unavailable.
    }
  }

  function initApollo() {
    if (document.querySelector("script[data-mds-tracker='apollo']")) return;

    const cacheKey = Math.random().toString(36).substring(7);
    const tracker = document.createElement("script");

    tracker.dataset.mdsTracker = "apollo";
    tracker.src = `https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=${cacheKey}`;
    tracker.async = true;
    tracker.defer = true;
    tracker.onload = () => {
      if (window.trackingFunctions && typeof window.trackingFunctions.onLoad === "function") {
        window.trackingFunctions.onLoad({ appId: "6a56e0302cc63e001fd0caab" });
      }
    };
    document.head.appendChild(tracker);
  }

  function initInstantly() {
    if (document.getElementById("vtag-ai-js")) return;

    const tracker = document.createElement("script");

    tracker.id = "vtag-ai-js";
    tracker.async = true;
    tracker.src = "https://r2.leadsy.ai/tag.js";
    tracker.dataset.pid = "11szbJ5Qd9oNMmWNf";
    tracker.dataset.version = "062024";
    document.head.appendChild(tracker);
  }

  function loadOptionalTracking() {
    if (optionalTrackingLoaded || hasGlobalPrivacyControl()) return;

    optionalTrackingLoaded = true;
    // A vendor script failing must never affect the rest of the site.
    [initApollo, initInstantly].forEach(init => {
      try {
        init();
      } catch (error) {
        // Ignore: optional tracking only.
      }
    });
  }

  function closeConsentPanel(returnFocus) {
    const panel = document.querySelector("[data-consent-panel]");
    if (panel) panel.remove();
    if (returnFocus) returnFocus.focus();
  }

  function showConsentPanel(options = {}) {
    const existingPanel = document.querySelector("[data-consent-panel]");
    if (existingPanel) existingPanel.remove();

    const isManaging = options.isManaging === true;
    const isNotice = options.isNotice === true;
    const trigger = options.trigger || null;
    const globalPrivacyControl = hasGlobalPrivacyControl();
    const panel = document.createElement("section");
    const inner = document.createElement("div");
    const copy = document.createElement("div");
    const eyebrow = document.createElement("div");
    const heading = document.createElement("h2");
    const description = document.createElement("p");
    const policyLink = document.createElement("a");
    const actions = document.createElement("div");

    panel.className = "privacy-consent";
    panel.dataset.consentPanel = "";
    panel.setAttribute("aria-labelledby", "privacy-consent-title");
    panel.setAttribute("aria-live", "polite");
    inner.className = "privacy-consent__inner";
    copy.className = "privacy-consent__copy";
    eyebrow.className = "privacy-consent__eyebrow";
    eyebrow.textContent = "Privacy choices";
    heading.id = "privacy-consent-title";
    heading.className = "visually-hidden";
    if (globalPrivacyControl) {
      heading.textContent = "Optional tracking is off";
      description.textContent = "Your browser is sending a Global Privacy Control signal, so Apollo and Instantly visitor tracking will remain disabled.";
    } else if (isNotice) {
      heading.textContent = "A note on privacy";
      description.textContent = "We use Apollo and Instantly on this site to identify which companies visit and to support business outreach. You can opt out at any time.";
    } else {
      heading.textContent = "Your privacy, your choice";
      description.textContent = "May we use Apollo and Instantly to identify which companies visit and to support business outreach? The site and forms work fully without them.";
    }
    policyLink.href = "/privacy";
    policyLink.textContent = "Privacy policy";
    actions.className = "privacy-consent__actions";

    copy.append(eyebrow, heading, description, policyLink);
    inner.append(copy, actions);
    panel.appendChild(inner);

    if (globalPrivacyControl) {
      const closeButton = document.createElement("button");
      closeButton.className = "privacy-consent__button privacy-consent__button--secondary";
      closeButton.type = "button";
      closeButton.textContent = "Close";
      closeButton.addEventListener("click", () => closeConsentPanel(trigger));
      actions.appendChild(closeButton);
    } else {
      const acceptButton = document.createElement("button");
      const necessaryButton = document.createElement("button");

      acceptButton.className = "privacy-consent__button privacy-consent__button--primary";
      acceptButton.type = "button";
      acceptButton.textContent = isNotice ? "Got it" : "Allow optional tracking";
      acceptButton.addEventListener("click", () => {
        saveConsent(true, isNotice ? "notice" : "user");
        closeConsentPanel();
        loadOptionalTracking();
      });

      necessaryButton.className = "privacy-consent__button privacy-consent__button--secondary";
      necessaryButton.type = "button";
      necessaryButton.textContent = requiresOptIn ? "Necessary only" : "Opt out";
      necessaryButton.addEventListener("click", () => {
        const shouldReload = optionalTrackingLoaded;
        saveConsent(false);
        closeConsentPanel();
        if (shouldReload) window.location.reload();
      });

      actions.append(acceptButton, necessaryButton);

      if (isManaging) {
        const cancelButton = document.createElement("button");
        cancelButton.className = "privacy-consent__cancel";
        cancelButton.type = "button";
        cancelButton.textContent = "Keep current choice";
        cancelButton.addEventListener("click", () => closeConsentPanel(trigger));
        actions.appendChild(cancelButton);
      }
    }

    if (isManaging || globalPrivacyControl) {
      // Escape dismisses the panel without changing the stored choice.
      panel.addEventListener("keydown", event => {
        if (event.key === "Escape") closeConsentPanel(trigger);
      });
    }

    document.body.appendChild(panel);
    const firstButton = panel.querySelector("button");
    if (isManaging && firstButton) firstButton.focus();
  }

  function addPrivacyChoicesLink() {
    const privacyLink = document.querySelector(".footer a[href='/privacy']");
    const list = privacyLink ? privacyLink.closest("ul") : null;
    if (!list || list.querySelector("[data-privacy-choices]")) return;

    const item = document.createElement("li");
    const button = document.createElement("button");

    button.className = "footer-link privacy-choices-link";
    button.type = "button";
    button.dataset.privacyChoices = "";
    button.textContent = "Privacy choices";
    button.addEventListener("click", () => {
      showConsentPanel({ isManaging: true, trigger: button });
    });
    item.appendChild(button);
    list.appendChild(item);
  }

  try {
    addPrivacyChoicesLink();

    const consent = readConsent();
    if (consent && consent.optionalTracking) {
      loadOptionalTracking();
    } else if (!consent && requiresOptIn) {
      showConsentPanel();
    } else if (!consent) {
      loadOptionalTracking();
      showConsentPanel({ isNotice: true });
    }
  } catch (error) {
    // Navigation, the footer year and the hero below must still run.
  }

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const phoneViewport = window.matchMedia("(max-width: 767.98px)");

  // Phones, Data Saver and very slow connections get the still hero image instead of ~6 MB of video.
  const prefersStillHero = () => {
    const connection = navigator.connection || {};
    return motionPreference.matches
      || phoneViewport.matches
      || connection.saveData === true
      || /(^|-)2g$/.test(connection.effectiveType || "");
  };

  // Mobile menu toggle. Bootstrap's CSS handles the layout; this replaces its
  // JavaScript bundle, which the site only used for this one control.
  const menuToggle = document.querySelector(".navbar-toggler");
  const menu = document.getElementById("navMain");
  if (menuToggle && menu) {
    const setMenu = open => {
      menu.classList.toggle("show", open);
      menuToggle.classList.toggle("collapsed", !open);
      menuToggle.setAttribute("aria-expanded", String(open));
    };
    menuToggle.addEventListener("click", () => setMenu(!menu.classList.contains("show")));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menu.classList.contains("show")) {
        setMenu(false);
        menuToggle.focus();
      }
    });
  }

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

  // Set current year in any element that wants it
  document.querySelectorAll("[data-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Load the hero video only when motion is allowed and the device suits it. The
  // CSS poster stays visible until playback actually starts, so a slow connection
  // only delays the fade-in. If autoplay is blocked (e.g. Safari Low Power Mode or
  // a browser autoplay setting), retry on the visitor's first interaction. Only a
  // real load/decode error removes the video.
  const heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    // WebM first for Chrome, Edge and Firefox; MP4 after it for Safari.
    const sources = [...heroVideo.querySelectorAll("source[data-src]")];
    const hasSource = () => sources.some(source => source.hasAttribute("src"));
    const gestureEvents = ["click", "keydown", "touchend"];

    const stopGestureRetry = () => {
      gestureEvents.forEach(type => document.removeEventListener(type, retryOnGesture));
    };
    const waitForGesture = () => {
      gestureEvents.forEach(type => document.addEventListener(type, retryOnGesture, { passive: true }));
    };
    const playVideo = () => {
      // Set the property as well as the attribute; some engines only allow
      // muted autoplay when the live muted state is true.
      heroVideo.muted = true;
      const attempt = heroVideo.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(error => {
          if (error && error.name === "NotAllowedError") waitForGesture();
        });
      }
    };
    const retryOnGesture = () => {
      stopGestureRetry();
      if (!prefersStillHero() && heroVideo.paused && hasSource()) {
        playVideo();
      }
    };
    const showFallback = () => {
      stopGestureRetry();
      heroVideo.classList.remove("is-ready");
      heroVideo.classList.add("is-fallback");
      heroVideo.pause();
      if (hasSource()) {
        sources.forEach(source => source.removeAttribute("src"));
        heroVideo.load();
      }
    };
    const markReady = () => {
      stopGestureRetry();
      heroVideo.classList.remove("is-fallback");
      heroVideo.classList.add("is-ready");
    };
    const startVideo = () => {
      if (prefersStillHero() || !sources.length) {
        showFallback();
        return;
      }

      heroVideo.classList.remove("is-fallback", "is-ready");
      sources.forEach(source => source.setAttribute("src", source.dataset.src));
      heroVideo.load();
      playVideo();
    };

    heroVideo.addEventListener("playing", markReady);
    heroVideo.addEventListener("error", showFallback);
    // A <source> error only means that format failed; fall back after the last one.
    if (sources.length) sources[sources.length - 1].addEventListener("error", showFallback);

    const onPreferenceChange = () => {
      if (prefersStillHero()) showFallback();
      else if (!heroVideo.classList.contains("is-ready")) startVideo();
    };
    [motionPreference, phoneViewport].forEach(query => {
      if (query.addEventListener) query.addEventListener("change", onPreferenceChange);
      else query.addListener(onPreferenceChange);
    });

    startVideo();
  }
})();
