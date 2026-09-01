(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Header shadow on scroll
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (!header) return;
    header.style.boxShadow = window.scrollY > 8 ? "0 8px 24px -12px rgba(0,0,0,0.5)" : "none";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Contact form: posts to the /api/contact Cloudflare Pages Function
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");

  if (form && note) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var submitBtn = form.querySelector(".form-submit");
      if (submitBtn) submitBtn.setAttribute("disabled", "true");
      note.classList.remove("is-error");
      note.textContent = "Skickar...";

      var payload = {
        name: form.name.value,
        email: form.email.value,
        company: form.company.value,
        message: form.message.value,
        website: form.website.value, // honeypot, should stay empty
      };

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("request-failed");
          return res.json();
        })
        .then(function () {
          note.textContent = "Tack! Vi återkommer inom en arbetsdag.";
          form.reset();
        })
        .catch(function () {
          note.classList.add("is-error");
          note.textContent = "Något gick fel. Maila oss gärna direkt istället.";
        })
        .finally(function () {
          if (submitBtn) submitBtn.removeAttribute("disabled");
        });
    });
  }
})();
