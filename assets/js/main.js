(() => {
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

  // AOS animations (optional)
  if (window.AOS) {
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
})();
