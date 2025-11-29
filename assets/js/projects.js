(function () {
  "use strict";

  var SITE_ROOT = "/";
  var PROJECTS_URL = SITE_ROOT + "assets/data/projects.json";

  function fetchProjects() {
    return fetch(PROJECTS_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load projects.json");
        return res.json();
      })
      .catch(function (err) {
        console.error(err);
        return null;
      });
  }

  function buildYearOptions(projects) {
    var years = Array.from(
      new Set(
        projects
          .map(function (p) { return p.year; })
          .filter(function (y) { return !!y; })
      )
    ).sort(function (a, b) { return b - a; }); // newest first
    return years;
  }

  function renderFilters(data) {
    var projects = data.projects || [];
    var industries = data.industries || [];
    var yearSelect = document.getElementById("projFilterYear");
    var industrySelect = document.getElementById("projFilterIndustry");

    if (industrySelect && industries.length) {
      industrySelect.innerHTML = "";
      var optAll = document.createElement("option");
      optAll.value = "";
      optAll.textContent = "All industries";
      industrySelect.appendChild(optAll);

      industries.forEach(function (ind) {
        var opt = document.createElement("option");
        opt.value = ind;
        opt.textContent = ind;
        industrySelect.appendChild(opt);
      });
    }

    if (yearSelect && projects.length) {
      yearSelect.innerHTML = "";
      var optAllYear = document.createElement("option");
      optAllYear.value = "";
      optAllYear.textContent = "All years";
      yearSelect.appendChild(optAllYear);

      buildYearOptions(projects).forEach(function (y) {
        var opt = document.createElement("option");
        opt.value = String(y);
        opt.textContent = String(y);
        yearSelect.appendChild(opt);
      });
    }
  }

  function applyFilters(projects) {
    var industrySelect = document.getElementById("projFilterIndustry");
    var yearSelect = document.getElementById("projFilterYear");
    var searchInput = document.getElementById("projSearchInput");

    var industry = industrySelect ? industrySelect.value : "";
    var year = yearSelect ? yearSelect.value : "";
    var q = searchInput ? searchInput.value.trim().toLowerCase() : "";

    return projects.filter(function (p) {
      if (industry && p.industry !== industry) return false;
      if (year && String(p.year) !== year) return false;

      if (q) {
        var haystack =
          (p.title || "") +
          " " +
          (p.summary || "") +
          " " +
          (p.tags || []).join(" ") +
          " " +
          (p.industry || "");
        haystack = haystack.toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }

      return true;
    });
  }

  function renderProjectsGrid(projects) {
    var grid = document.getElementById("projectsGrid");
    var empty = document.getElementById("projectsEmpty");

    if (!grid) return;
    grid.innerHTML = "";

    if (!projects.length) {
      if (empty) empty.style.display = "block";
      return;
    } else if (empty) {
      empty.style.display = "none";
    }

    projects.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "card project-card";

      if (p.thumbnail) {
        var media = document.createElement("div");
        media.className = "project-card__thumb";
        var img = document.createElement("img");
        img.src = SITE_ROOT + p.thumbnail.replace(/^\/+/, "");
        img.alt = p.title || "";
        media.appendChild(img);
        card.appendChild(media);
      }

      var body = document.createElement("div");
      body.className = "project-card__body";

      var meta = document.createElement("div");
      meta.className = "project-card__meta";
      var industrySpan = document.createElement("span");
      industrySpan.className = "project-chip";
      industrySpan.textContent = p.industry || "Project";
      meta.appendChild(industrySpan);

      if (p.year || p.country) {
        var yc = document.createElement("span");
        yc.className = "project-meta-text";
        var parts = [];
        if (p.year) parts.push(p.year);
        if (p.country) parts.push(p.country);
        yc.textContent = parts.join(" · ");
        meta.appendChild(yc);
      }

      body.appendChild(meta);

      var h = document.createElement("h3");
      h.textContent = p.title || "";
      body.appendChild(h);

      if (p.summary) {
        var summary = document.createElement("p");
        summary.textContent = p.summary;
        body.appendChild(summary);
      }

      if (p.highlight) {
        var highlight = document.createElement("p");
        highlight.className = "project-highlight";
        highlight.textContent = p.highlight;
        body.appendChild(highlight);
      }

      if (Array.isArray(p.tags) && p.tags.length) {
        var tags = document.createElement("div");
        tags.className = "project-tags";
        p.tags.forEach(function (t) {
          var tag = document.createElement("span");
          tag.className = "project-tag";
          tag.textContent = t;
          tags.appendChild(tag);
        });
        body.appendChild(tags);
      }

      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  function init() {
    var page = document.body.getAttribute("data-page");
    if (page !== "projects") return;

    fetchProjects().then(function (data) {
      if (!data || !Array.isArray(data.projects)) return;

      renderFilters(data);
      renderProjectsGrid(data.projects);

      var industrySelect = document.getElementById("projFilterIndustry");
      var yearSelect = document.getElementById("projFilterYear");
      var searchInput = document.getElementById("projSearchInput");

      function onChange() {
        var filtered = applyFilters(data.projects);
        renderProjectsGrid(filtered);
      }

      if (industrySelect) industrySelect.addEventListener("change", onChange);
      if (yearSelect) yearSelect.addEventListener("change", onChange);
      if (searchInput) searchInput.addEventListener("input", onChange);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
