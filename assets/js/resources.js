(function () {
  "use strict";

  var SITE_ROOT = "/";
  var allResources = [];

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

  function renderHero(hero) {
    if (!hero) return;
    safeText("res-hero-kicker", hero.kicker);
    safeText("res-hero-title", hero.title);
    safeText("res-hero-subtitle", hero.subtitle);
  }

  function renderCategoryOptions(categories) {
    var select = document.getElementById("resCategory");
    if (!select) return;

    select.innerHTML = "";
    (categories || ["All"]).forEach(function (cat) {
      var opt = createEl("option", null, cat);
      opt.value = cat;
      select.appendChild(opt);
    });
  }

  function renderResources(list) {
    var grid = document.getElementById("resGrid");
    var empty = document.getElementById("res-empty");
    if (!grid) return;

    grid.innerHTML = "";

    if (!list || !list.length) {
      if (empty) empty.style.display = "block";
      return;
    }

    if (empty) empty.style.display = "none";

    list.forEach(function (item) {
      var card = createEl(
        "article",
        "resource-card" + (item.highlight ? " resource-card--highlight" : "")
      );

      var labelRow = createEl("div", "resource-card__label-row");
      if (item.category) {
        var cat = createEl("span", "resource-card__category", item.category);
        labelRow.appendChild(cat);
      }
      card.appendChild(labelRow);

      var title = createEl("h2", "resource-card__title", item.title || "");
      card.appendChild(title);

      if (item.summary) {
        card.appendChild(
          createEl("p", "resource-card__summary", item.summary)
        );
      }

      if (Array.isArray(item.tags) && item.tags.length) {
        var tagsRow = createEl("div", "resource-card__tags");
        item.tags.forEach(function (tag) {
          var t = createEl("span", "resource-tag", tag);
          tagsRow.appendChild(t);
        });
        card.appendChild(tagsRow);
      }

      // If link is provided, show a small 'Learn more' link
      if (item.link) {
        var footer = createEl("div", "resource-card__footer");
        var a = createEl("a", "resource-card__link", "Learn more");
        a.href = item.link;
        a.target = "_blank";
        footer.appendChild(a);
        card.appendChild(footer);
      }

      grid.appendChild(card);
    });
  }

  function applyFilters() {
    var categoryEl = document.getElementById("resCategory");
    var searchEl = document.getElementById("resSearch");
    var cat = categoryEl ? categoryEl.value : "All";
    var query = searchEl ? searchEl.value.trim().toLowerCase() : "";

    var filtered = allResources.filter(function (item) {
      var matchesCat =
        !cat || cat === "All" || item.category === cat;

      var matchesSearch = true;
      if (query) {
        var haystack =
          (item.title || "") +
          " " +
          (item.summary || "") +
          " " +
          (Array.isArray(item.tags) ? item.tags.join(" ") : "");
        haystack = haystack.toLowerCase();
        matchesSearch = haystack.indexOf(query) !== -1;
      }

      return matchesCat && matchesSearch;
    });

    renderResources(filtered);
  }

  function wireFilters() {
    var categoryEl = document.getElementById("resCategory");
    var searchEl = document.getElementById("resSearch");

    if (categoryEl) {
      categoryEl.addEventListener("change", applyFilters);
    }
    if (searchEl) {
      searchEl.addEventListener("input", function () {
        applyFilters();
      });
    }
  }

  function loadResources() {
    fetch(SITE_ROOT + "assets/data/resources.json")
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Failed to load resources.json");
        }
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        renderHero(data.hero);
        renderCategoryOptions(data.categories);
        allResources = data.items || [];
        applyFilters();
        wireFilters();
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  function init() {
    var page = document.body.getAttribute("data-page");
    if (page !== "resources") return;
    loadResources();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
