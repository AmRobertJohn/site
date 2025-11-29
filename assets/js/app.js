(function () {
  "use strict";

var SITE_ROOT = "/";



  function fetchText(url) {
    return fetch(url, { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("Failed to load " + url);
      return res.text();
    });
  }

  function includeFragment(selector, url) {
    var el = document.querySelector(selector);
    if (!el) return Promise.resolve();
    return fetchText(url)
      .then(function (html) {
        el.innerHTML = html;
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  function loadLayout() {
    return Promise.all([
      includeFragment("#siteHeader", SITE_ROOT + "assets/includes/header.html"),
      includeFragment("#siteFooter", SITE_ROOT + "assets/includes/footer.html")
    ]);
  }

  function loadSettings() {
    return fetch(SITE_ROOT + "assets/data/settings.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("settings.json missing");
        return res.json();
      })
      .then(function (settings) {
        wireSettingsIntoUI(settings);
      })
      .catch(function (err) {
        console.warn("Settings not loaded:", err.message);
      });
  }

  function wireSettingsIntoUI(settings) {
    // Footer contact
    var phoneEl = document.getElementById("footerPhone");
    var waEl = document.getElementById("footerWhatsApp");
    var mailEl = document.getElementById("footerEmail");
    var addrEl = document.getElementById("footerAddress");
    var yearEl = document.getElementById("footerYear");

    if (phoneEl && settings.phone) {
      phoneEl.textContent = settings.phone;
      phoneEl.href = "tel:" + settings.phone.replace(/\s+/g, "");
    }
    if (waEl && settings.whatsapp) {
      waEl.textContent = settings.whatsapp;
      waEl.href =
        "https://wa.me/" + settings.whatsapp.replace(/\D+/g, "");
    }
    if (mailEl && settings.email) {
      mailEl.textContent = settings.email;
      mailEl.href = "mailto:" + settings.email;
    }
    if (addrEl && settings.address) {
      addrEl.textContent = settings.address;
    }
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }

    // Socials
    var socials = settings.social || {};
    var fb = document.getElementById("socialFacebook");
    var x = document.getElementById("socialX");
    var li = document.getElementById("socialLinkedIn");
    var yt = document.getElementById("socialYouTube");

    if (fb && socials.facebook) fb.href = socials.facebook;
    if (x && (socials.x || socials.twitter))
      x.href = socials.x || socials.twitter;
    if (li && socials.linkedin) li.href = socials.linkedin;
    if (yt && socials.youtube) yt.href = socials.youtube;
  }

  function setupHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 10) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function setupNavToggle() {
    var navToggle = document.getElementById("navToggle");
    var nav = document.getElementById("mainNav");
    if (!navToggle || !nav) return;

    navToggle.addEventListener("click", function () {
      nav.classList.toggle("nav-open");
    });

    // close on link click (mobile)
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("nav-open");
      }
    });

    // dropdowns for mobile & desktop
    nav.addEventListener("click", function (e) {
      var btn = e.target.closest(".nav-link--dropdown");
      if (!btn) return;
      var li = btn.closest(".nav-item--has-dropdown");
      if (!li) return;
      e.preventDefault();
      li.classList.toggle("nav-open");
    });

    // close dropdowns when clicking outside
    document.addEventListener("click", function (e) {
      var insideNav = e.target.closest(".main-nav");
      if (insideNav) return;
      var items = nav.querySelectorAll(".nav-item--has-dropdown.nav-open");
      items.forEach(function (item) {
        item.classList.remove("nav-open");
      });
    });
  }

  function init() {
    // Step 1: Load header/footer
    loadLayout().then(function () {
      // After header/footer HTML is injected, wire nav and scroll
      setupNavToggle();
      setupHeaderScroll();
      loadSettings();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
