(function () {
  "use strict";

  var SITE_ROOT = "/";

  function createEl(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function safeText(id, text) {
    var el = typeof id === "string" ? document.getElementById(id) : id;
    if (!el) return;
    el.textContent = text || "";
  }

  // ========== MAIN SERVICES PAGE RENDERERS ==========

  function renderHero(hero) {
    if (!hero) return;
    safeText("svc-hero-kicker", hero.kicker);
    safeText("svc-hero-title", hero.title);
    safeText("svc-hero-subtitle", hero.subtitle);

    var badgesWrap = document.getElementById("svc-hero-badges");
    if (!badgesWrap) return;
    badgesWrap.innerHTML = "";

    if (Array.isArray(hero.badges)) {
      hero.badges.forEach(function (b) {
        var span = createEl("span", "hero-badge", b);
        badgesWrap.appendChild(span);
      });
    }
  }

  function renderCoreServices(core) {
    var wrap = document.getElementById("svc-core");
    if (!wrap || !Array.isArray(core)) return;
    wrap.innerHTML = "";

    core.forEach(function (svc) {
      var card = createEl("article", "service-card");
      var header = createEl("div", "service-card__header");
      var title = createEl("h3", "service-card__title", svc.title || "");
      var subtitle = createEl("p", "service-card__subtitle", svc.subtitle || "");
      header.appendChild(title);
      header.appendChild(subtitle);
      card.appendChild(header);

      if (Array.isArray(svc.points) && svc.points.length) {
        var ul = createEl("ul", "service-card__list");
        svc.points.forEach(function (p) {
          var li = createEl("li", null, p);
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }

      var footer = createEl("div", "service-card__footer");
      var link = createEl("a", "btn btn--ghost btn--sm", "Request a quote");
      link.href = "/contact/#contact";
      footer.appendChild(link);
      card.appendChild(footer);

      wrap.appendChild(card);
    });
  }

  function renderStreaming(engine) {
    if (!engine) return;

    safeText("svc-streaming-title", engine.title);
    safeText("svc-streaming-subtitle", engine.subtitle);
    safeText("svc-streaming-note", engine.note);

    var wrap = document.getElementById("svc-streaming-packages");
    if (!wrap || !Array.isArray(engine.packages)) return;
    wrap.innerHTML = "";

    engine.packages.forEach(function (pkg) {
      var card = createEl("article", "package-card");
      var head = createEl("div", "package-card__head");
      head.appendChild(createEl("h3", "package-card__title", pkg.name || ""));
      head.appendChild(
        createEl("p", "package-card__tagline", pkg.tagline || "")
      );
      card.appendChild(head);

      if (pkg.monthly_from) {
        card.appendChild(
          createEl("div", "package-card__price", pkg.monthly_from)
        );
      }

      if (pkg.best_for) {
        card.appendChild(
          createEl(
            "p",
            "package-card__bestfor",
            "Best for: " + pkg.best_for
          )
        );
      }

      if (Array.isArray(pkg.features) && pkg.features.length) {
        var ul = createEl("ul", "package-card__list");
        pkg.features.forEach(function (f) {
          var li = createEl("li", null, f);
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }

      var footer = createEl("div", "package-card__footer");
      var btn = createEl("a", "btn btn--primary btn--sm", "Request a quote");
      btn.href = "/contact/#contact";
      footer.appendChild(btn);
      card.appendChild(footer);

      wrap.appendChild(card);
    });
  }

  function renderWeb(web) {
    if (!web) return;

    safeText("svc-web-title", web.title);
    safeText("svc-web-subtitle", web.subtitle);

    var wrap = document.getElementById("svc-web-packages");
    if (!wrap || !Array.isArray(web.packages)) return;
    wrap.innerHTML = "";

    web.packages.forEach(function (pkg) {
      var card = createEl("article", "package-card package-card--web");
      var head = createEl("div", "package-card__head");
      head.appendChild(createEl("h3", "package-card__title", pkg.name || ""));
      head.appendChild(
        createEl("p", "package-card__tagline", pkg.summary || "")
      );
      card.appendChild(head);

      if (pkg.ideal_for) {
        card.appendChild(
          createEl(
            "p",
            "package-card__bestfor",
            "Ideal for: " + pkg.ideal_for
          )
        );
      }

      if (Array.isArray(pkg.highlights) && pkg.highlights.length) {
        var ul = createEl("ul", "package-card__list");
        pkg.highlights.forEach(function (f) {
          var li = createEl("li", null, f);
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }

      var footer = createEl("div", "package-card__footer");
      var btn = createEl(
        "a",
        "btn btn--ghost btn--sm",
        "Discuss this package"
      );
      btn.href = "/contact/#contact";
      footer.appendChild(btn);
      card.appendChild(footer);

      wrap.appendChild(card);
    });
  }

  function renderIndustries(block) {
    if (!block) return;
    safeText("svc-industries-title", block.title);
    safeText("svc-industries-subtitle", block.subtitle);

    var list = document.getElementById("svc-industries-list");
    if (!list || !Array.isArray(block.items)) return;
    list.innerHTML = "";

    block.items.forEach(function (name) {
      var li = createEl("li", "pill-list__item", name);
      list.appendChild(li);
    });
  }

  // ========== STANDALONE PAGES (STREAMING & WEB) ==========

  // /services/streaming/
  function renderStreamingStandalone(engine) {
    if (!engine) return;
    var wrap = document.getElementById("sePackages");
    if (!wrap || !Array.isArray(engine.packages)) return;
    wrap.innerHTML = "";

    engine.packages.forEach(function (pkg) {
      var card = createEl("article", "package-card");
      var head = createEl("div", "package-card__head");
      head.appendChild(createEl("h3", "package-card__title", pkg.name || ""));
      head.appendChild(
        createEl("p", "package-card__tagline", pkg.tagline || "")
      );
      card.appendChild(head);

      if (pkg.best_for) {
        card.appendChild(
          createEl(
            "p",
            "package-card__bestfor",
            "Best for: " + pkg.best_for
          )
        );
      }

      if (Array.isArray(pkg.features) && pkg.features.length) {
        var ul = createEl("ul", "package-card__list");
        pkg.features.forEach(function (f) {
          var li = createEl("li", null, f);
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }

      var footer = createEl("div", "package-card__footer");
      var btn = createEl("a", "btn btn--primary btn--sm", "Request a quote");
      btn.href = "/contact/#contact";
      footer.appendChild(btn);
      card.appendChild(footer);

      wrap.appendChild(card);
    });
  }

  // /services/web/
  function renderWebStandalone(web) {
    if (!web) return;
    var wrap = document.getElementById("webPackages");
    if (!wrap || !Array.isArray(web.packages)) return;
    wrap.innerHTML = "";

    web.packages.forEach(function (pkg) {
      var card = createEl("article", "package-card package-card--web");
      var head = createEl("div", "package-card__head");
      head.appendChild(createEl("h3", "package-card__title", pkg.name || ""));
      head.appendChild(
        createEl("p", "package-card__tagline", pkg.summary || "")
      );
      card.appendChild(head);

      if (pkg.ideal_for) {
        card.appendChild(
          createEl(
            "p",
            "package-card__bestfor",
            "Ideal for: " + pkg.ideal_for
          )
        );
      }

      if (Array.isArray(pkg.highlights) && pkg.highlights.length) {
        var ul = createEl("ul", "package-card__list");
        pkg.highlights.forEach(function (h) {
          var li = createEl("li", null, h);
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }

      var footer = createEl("div", "package-card__footer");
      var btn = createEl(
        "a",
        "btn btn--primary btn--sm",
        "Request a web quote"
      );
      btn.href = "/contact/#contact";
      footer.appendChild(btn);
      card.appendChild(footer);

      wrap.appendChild(card);
    });
  }

  // ========== LOADERS & INIT ==========

  function loadServices() {
    fetch(SITE_ROOT + "assets/data/services.json")
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Failed to load services.json");
        }
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        renderHero(data.hero);
        renderCoreServices(data.core_services);
        renderStreaming(data.streaming_engine);
        renderWeb(data.web_offerings);
        renderIndustries(data.industries);
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  function loadStreamingStandalonePage() {
    fetch(SITE_ROOT + "assets/data/services.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load services.json");
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        renderStreamingStandalone(data.streaming_engine);
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  function loadWebStandalonePage() {
    fetch(SITE_ROOT + "assets/data/services.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load services.json");
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        renderWebStandalone(data.web_offerings);
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  function init() {
    var page = document.body.getAttribute("data-page");
    if (page === "services") {
      loadServices();
    } else if (page === "services-streaming") {
      loadStreamingStandalonePage();
    } else if (page === "services-webdev") {
      loadWebStandalonePage();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
