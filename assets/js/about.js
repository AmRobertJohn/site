(function () {
  "use strict";

  var SITE_ROOT = "/";


  function safeText(el, text) {
    if (!el) return;
    el.textContent = text || "";
  }

  function createEl(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function renderHero(data) {
    if (!data) return;
    safeText(document.getElementById("about-hero-kicker"), data.kicker);
    safeText(document.getElementById("about-hero-title"), data.title);
    safeText(document.getElementById("about-hero-subtitle"), data.subtitle);

    var badgesWrap = document.getElementById("about-hero-badges");
    if (!badgesWrap) return;
    badgesWrap.innerHTML = "";
    if (Array.isArray(data.badges)) {
      data.badges.forEach(function (b) {
        var span = createEl("span", "hero-badge", b);
        badgesWrap.appendChild(span);
      });
    }
  }

  function renderCompany(data) {
    if (!data) return;
    safeText(document.getElementById("about-company-lede"), data.lede);

    var bodyWrap = document.getElementById("about-company-body");
    if (!bodyWrap) return;
    bodyWrap.innerHTML = "";
    if (Array.isArray(data.body)) {
      data.body.forEach(function (p) {
        var para = createEl("p", null, p);
        bodyWrap.appendChild(para);
      });
    }
  }

  function renderStats(stats) {
    var wrap = document.getElementById("about-stats");
    if (!wrap || !Array.isArray(stats)) return;
    wrap.innerHTML = "";

    stats.forEach(function (s) {
      var card = createEl("div", "stat-card");
      var v = createEl("div", "stat-card__value", s.value || "");
      var l = createEl("div", "stat-card__label", s.label || "");
      card.appendChild(v);
      card.appendChild(l);
      if (s.note) {
        var n = createEl("div", "stat-card__note", s.note);
        card.appendChild(n);
      }
      wrap.appendChild(card);
    });
  }

  function renderPillars(pillars) {
    var wrap = document.getElementById("about-pillars");
    if (!wrap || !Array.isArray(pillars)) return;
    wrap.innerHTML = "";

    pillars.forEach(function (p) {
      var card = createEl("div", "pillar-card");
      var title = createEl("h3", "pillar-card__title", p.title || "");
      var desc = createEl("p", "pillar-card__desc", p.description || "");
      card.appendChild(title);
      card.appendChild(desc);
      wrap.appendChild(card);
    });
  }

  function renderExpertise(blocks) {
    var wrap = document.getElementById("about-expertise");
    if (!wrap || !Array.isArray(blocks)) return;
    wrap.innerHTML = "";

    blocks.forEach(function (b) {
      var card = createEl("article", "card");
      var h = createEl("h3", "card__title", b.title || "");
      card.appendChild(h);

      if (Array.isArray(b.items) && b.items.length) {
        var ul = createEl("ul", "card__list");
        b.items.forEach(function (item) {
          var li = createEl("li", null, item);
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }

      wrap.appendChild(card);
    });
  }

  function renderExperience(rows) {
    var wrap = document.getElementById("about-experience");
    if (!wrap || !Array.isArray(rows)) return;
    wrap.innerHTML = "";

    rows.forEach(function (r) {
      var row = createEl("div", "timeline-row");
      var period = createEl("div", "timeline-row__period", r.period || "");
      var detail = createEl("div", "timeline-row__detail", r.detail || "");
      row.appendChild(period);
      row.appendChild(detail);
      wrap.appendChild(row);
    });
  }

  function renderClientsHighlight(block) {
    if (!block) return;

    safeText(document.getElementById("about-clients-title"), block.title);
    safeText(document.getElementById("about-clients-desc"), block.description);
    safeText(document.getElementById("about-clients-note"), block.note);

    var list = document.getElementById("about-clients-segments");
    if (!list) return;
    list.innerHTML = "";

    if (Array.isArray(block.segments)) {
      block.segments.forEach(function (seg) {
        var li = createEl("li", "pill-list__item", seg);
        list.appendChild(li);
      });
    }
  }

  function loadAbout() {
    // about/ is one level deep → ../assets/...
    fetch(SITE_ROOT + "assets/data/about.json")
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Failed to load about.json");
        }
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        renderHero(data.hero);
        renderCompany(data.company);
        renderStats(data.stats);
        renderPillars(data.pillars);
        renderExpertise(data.expertise_blocks);
        renderExperience(data.experience);
        renderClientsHighlight(data.clients_highlight);
      })
      .catch(function (err) {
        console.error(err);
        // fail silently on UI – page still has basic static copy
      });
  }

  function init() {
    var page = document.body.getAttribute("data-page");
    if (page !== "about") return;
    loadAbout();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
