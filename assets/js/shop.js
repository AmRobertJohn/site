(function () {
  "use strict";

  var SITE_ROOT = "/";
  var PRODUCTS_URL = SITE_ROOT + "assets/data/products.json";

  var state = {
    allProducts: [],
    filteredProducts: [],
    currentPage: 1,
    pageSize: 20,
    cart: []
  };

  // ---------- Data loading ----------
  function fetchProducts() {
    return fetch(PRODUCTS_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load products.json");
        return res.json();
      })
      .catch(function (err) {
        console.error(err);
        return null;
      });
  }

  // ---------- Filters ----------
  function buildFilterOptions(products) {
    var categories = Array.from(
      new Set(
        products
          .map(function (p) { return p.category; })
          .filter(Boolean)
      )
    ).sort();

    var brands = Array.from(
      new Set(
        products
          .map(function (p) { return p.brand; })
          .filter(Boolean)
      )
    ).sort();

    var catSelect = document.getElementById("shopFilterCategory");
    var brandSelect = document.getElementById("shopFilterBrand");

    if (catSelect) {
      catSelect.innerHTML = "";
      var optAllC = document.createElement("option");
      optAllC.value = "";
      optAllC.textContent = "All categories";
      catSelect.appendChild(optAllC);
      categories.forEach(function (c) {
        var opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        catSelect.appendChild(opt);
      });
    }

    if (brandSelect) {
      brandSelect.innerHTML = "";
      var optAllB = document.createElement("option");
      optAllB.value = "";
      optAllB.textContent = "All brands";
      brandSelect.appendChild(optAllB);
      brands.forEach(function (b) {
        var opt = document.createElement("option");
        opt.value = b;
        opt.textContent = b;
        brandSelect.appendChild(opt);
      });
    }
  }

  function applyFilters() {
    var products = state.allProducts.slice();
    var catSelect = document.getElementById("shopFilterCategory");
    var brandSelect = document.getElementById("shopFilterBrand");
    var priceSelect = document.getElementById("shopFilterPriceType");
    var searchInput = document.getElementById("shopSearchInput");

    var category = catSelect ? catSelect.value : "";
    var brand = brandSelect ? brandSelect.value : "";
    var priceType = priceSelect ? priceSelect.value : "";
    var q = searchInput ? searchInput.value.trim().toLowerCase() : "";

    var filtered = products.filter(function (p) {
      if (category && p.category !== category) return false;
      if (brand && p.brand !== brand) return false;

      if (priceType === "priced" && !p.has_price) return false;
      if (priceType === "request" && p.has_price) return false;

      if (q) {
        var haystack =
          (p.title || "") +
          " " +
          (p.sku || "") +
          " " +
          (p.short_desc || "") +
          " " +
          (p.details || "") +
          " " +
          (p.brand || "") +
          " " +
          (p.category || "") +
          " " +
          (p.tags || []).join(" ");
        haystack = haystack.toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }

      return true;
    });

    state.filteredProducts = filtered;
    state.currentPage = 1;
    renderProductsPage();
  }

  // ---------- Rendering ----------
  function renderProductsPage() {
    var grid = document.getElementById("shopGrid");
    var empty = document.getElementById("shopEmpty");
    var pag = document.getElementById("shopPagination");

    if (!grid) return;

    grid.innerHTML = "";

    var total = state.filteredProducts.length;
    if (!total) {
      if (empty) empty.style.display = "block";
      if (pag) pag.innerHTML = "";
      return;
    } else if (empty) {
      empty.style.display = "none";
    }

    var pageSize = state.pageSize;
    var current = state.currentPage;
    var start = (current - 1) * pageSize;
    var end = start + pageSize;
    var slice = state.filteredProducts.slice(start, end);

    slice.forEach(function (p) {
      grid.appendChild(renderProductCard(p));
    });

    renderPagination(total);
  }

  function renderProductCard(p) {
    var card = document.createElement("article");
    card.className = "card product-card";

    if (p.images && p.images.length) {
      var media = document.createElement("div");
      media.className = "product-card__thumb";
      var img = document.createElement("img");
      img.src = SITE_ROOT + p.images[0].replace(/^\/+/, "");
      img.alt = p.title || "";
      media.appendChild(img);
      card.appendChild(media);
    }

    var body = document.createElement("div");
    body.className = "product-card__body";

    var meta = document.createElement("div");
    meta.className = "product-card__meta";

    if (p.category) {
      var cat = document.createElement("span");
      cat.className = "product-chip";
      cat.textContent = p.category;
      meta.appendChild(cat);
    }

    if (p.brand) {
      var brand = document.createElement("span");
      brand.className = "product-meta-text";
      brand.textContent = p.brand;
      meta.appendChild(brand);
    }

    body.appendChild(meta);

    var h = document.createElement("h3");
    h.textContent = p.title || "";
    body.appendChild(h);

    if (p.short_desc) {
      var desc = document.createElement("p");
      desc.className = "product-card__desc";
      desc.textContent = p.short_desc;
      body.appendChild(desc);
    }

    var price = document.createElement("div");
    price.className = "product-card__price";

    if (p.has_price && p.price != null) {
      var currency = p.currency || "USD";
      price.textContent = currency + " " + Number(p.price).toLocaleString();
    } else {
      price.textContent = "Price on request";
    }
    body.appendChild(price);

    var actions = document.createElement("div");
    actions.className = "product-card__actions";

    var infoBtn = document.createElement("button");
    infoBtn.type = "button";
    infoBtn.className = "btn btn--sm btn--ghost";
    infoBtn.textContent = "More info";
    infoBtn.addEventListener("click", function () {
      openProductModal(p);
    });

    var addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn--sm btn--primary";
    addBtn.textContent = "Add to request";
    addBtn.addEventListener("click", function () {
      addToCart(p);
    });

    actions.appendChild(infoBtn);
    actions.appendChild(addBtn);
    body.appendChild(actions);

    card.appendChild(body);
    return card;
  }

  function renderPagination(totalItems) {
    var pag = document.getElementById("shopPagination");
    if (!pag) return;

    var pageSize = state.pageSize;
    var totalPages = Math.ceil(totalItems / pageSize);
    if (totalPages <= 1) {
      pag.innerHTML = "";
      return;
    }

    var current = state.currentPage;
    var html = "";

    html +=
      '<button type="button" class="page-btn" data-page="' +
      (current - 1) +
      '"' +
      (current === 1 ? " disabled" : "") +
      ">Previous</button>";

    for (var i = 1; i <= totalPages; i++) {
      html +=
        '<button type="button" class="page-btn' +
        (i === current ? " is-active" : "") +
        '" data-page="' +
        i +
        '">' +
        i +
        "</button>";
    }

    html +=
      '<button type="button" class="page-btn" data-page="' +
      (current + 1) +
      '"' +
      (current === totalPages ? " disabled" : "") +
      ">Next</button>";

    pag.innerHTML = html;

    pag.querySelectorAll(".page-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var page = parseInt(btn.getAttribute("data-page"), 10);
        if (!page || page === state.currentPage) return;
        if (page < 1 || page > totalPages) return;
        state.currentPage = page;
        renderProductsPage();
      });
    });
  }

  // ---------- Product Modal ----------
  function openProductModal(p) {
    var modal = document.getElementById("productModal");
    if (!modal) return;

    var mainImg = document.getElementById("pmMainImage");
    var thumbs = document.getElementById("pmThumbs");
    var cat = document.getElementById("pmCategory");
    var title = document.getElementById("pmTitle");
    var sku = document.getElementById("pmSku");
    var brand = document.getElementById("pmBrand");
    var price = document.getElementById("pmPrice");
    var shortDesc = document.getElementById("pmShortDesc");
    var details = document.getElementById("pmDetails");

    if (p.images && p.images.length) {
      var first = SITE_ROOT + p.images[0].replace(/^\/+/, "");
      mainImg.src = first;
      mainImg.alt = p.title || "";
      thumbs.innerHTML = "";
      p.images.slice(0, 3).forEach(function (src, idx) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pm-thumb-btn" + (idx === 0 ? " is-active" : "");
        var img = document.createElement("img");
        img.src = SITE_ROOT + src.replace(/^\/+/, "");
        img.alt = p.title || "";
        btn.appendChild(img);
        btn.addEventListener("click", function () {
          mainImg.src = img.src;
          thumbs
            .querySelectorAll(".pm-thumb-btn")
            .forEach(function (b) { b.classList.remove("is-active"); });
          btn.classList.add("is-active");
        });
        thumbs.appendChild(btn);
      });
    } else {
      mainImg.src = "";
      mainImg.alt = "";
      thumbs.innerHTML = "";
    }

    cat.textContent = p.category || "";
    title.textContent = p.title || "";
    sku.textContent = p.sku ? "SKU: " + p.sku : "";
    brand.textContent = p.brand ? "Brand: " + p.brand : "";

    if (p.has_price && p.price != null) {
      var currency = p.currency || "USD";
      price.textContent = currency + " " + Number(p.price).toLocaleString();
    } else {
      price.textContent = "Price on request";
    }

    shortDesc.textContent = p.short_desc || "";
    details.textContent = p.details || "";

    var addBtn = document.getElementById("pmAddToRequestBtn");
    if (addBtn) {
      addBtn.onclick = function () {
        addToCart(p);
      };
    }

    modal.classList.add("is-open");
  }

  function closeProductModal() {
    var modal = document.getElementById("productModal");
    if (!modal) return;
    modal.classList.remove("is-open");
  }

  // ---------- Cart / Request drawer ----------
  function addToCart(p) {
    var existing = state.cart.find(function (item) {
      return item.id === p.id;
    });
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({
        id: p.id,
        sku: p.sku,
        title: p.title,
        has_price: p.has_price,
        price: p.price,
        currency: p.currency,
        qty: 1
      });
    }
    renderCart();
    openCartDrawer();
  }

  function removeFromCart(id) {
    state.cart = state.cart.filter(function (item) { return item.id !== id; });
    renderCart();
  }

  function renderCart() {
    var container = document.getElementById("cartItemsContainer");
    var summary = document.getElementById("cartSummary");
    if (!container || !summary) return;

    container.innerHTML = "";

    if (!state.cart.length) {
      container.innerHTML =
        '<p class="cart-empty">Your request list is currently empty.</p>';
      summary.textContent = "";
      return;
    }

    var totalKnown = 0;
    var hasPricedItems = false;
    var hasUnpricedItems = false;

    state.cart.forEach(function (item) {
      if (item.has_price && item.price != null) {
        hasPricedItems = true;
        totalKnown += item.price * item.qty;
      } else {
        hasUnpricedItems = true;
      }

      var row = document.createElement("div");
      row.className = "cart-item";

      var info = document.createElement("div");
      info.className = "cart-item__info";

      var title = document.createElement("div");
      title.className = "cart-item__title";
      title.textContent = item.title || "";
      info.appendChild(title);

      var meta = document.createElement("div");
      meta.className = "cart-item__meta";
      meta.textContent = (item.sku ? "SKU: " + item.sku + " · " : "") + "Qty: " + item.qty;
      info.appendChild(meta);

      row.appendChild(info);

      var controls = document.createElement("div");
      controls.className = "cart-item__controls";

      var priceText = document.createElement("div");
      priceText.className = "cart-item__price";
      if (item.has_price && item.price != null) {
        var currency = item.currency || "USD";
        priceText.textContent =
          currency + " " + Number(item.price * item.qty).toLocaleString();
      } else {
        priceText.textContent = "On request";
      }

      var removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "cart-item__remove";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", function () {
        removeFromCart(item.id);
      });

      controls.appendChild(priceText);
      controls.appendChild(removeBtn);
      row.appendChild(controls);

      container.appendChild(row);
    });

    var summaryText = "";
    if (hasPricedItems) {
      summaryText +=
        "Indicative total for priced items: " +
        (state.cart[0] && state.cart[0].currency ? state.cart[0].currency : "USD") +
        " " +
        totalKnown.toLocaleString() +
        ". ";
    }
    if (hasUnpricedItems) {
      summaryText +=
        "Items without prices will be quoted by our team based on configuration.";
    }

    summary.textContent = summaryText;
  }

  function openCartDrawer() {
    var drawer = document.getElementById("cartDrawer");
    if (!drawer) return;
    drawer.classList.add("is-open");
  }

  function closeCartDrawer() {
    var drawer = document.getElementById("cartDrawer");
    if (!drawer) return;
    drawer.classList.remove("is-open");
  }

  // ---------- Checkout ----------
  function setCheckoutStatus(msg, type) {
    var el = document.getElementById("checkoutStatus");
    if (!el) return;
    el.textContent = msg || "";
    el.className = "checkout-status" + (type ? " checkout-status--" + type : "");
  }

  function handleCheckoutSubmit(e) {
    e.preventDefault();
    var form = e.target;

    if (!state.cart.length) {
      setCheckoutStatus("Please add at least one item to your request list.", "error");
      return;
    }

    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var phone = form.phone.value.trim();
    var company = form.company.value.trim();
    var notes = form.notes.value.trim();
	var country = form.country ? form.country.value.trim() : "";
	var contactMethod = form.contact_method ? form.contact_method.value.trim() : "";
	var deliveryLocation = form.delivery_location ? form.delivery_location.value.trim() : "";


    if (!name || !email || !phone) {
      setCheckoutStatus("Name, email and phone are required.", "error");
      return;
    }

    setCheckoutStatus("Sending request...", "info");

	var payload = {
	  name: name,
	  email: email,
	  phone: phone,
	  company: company,
	  notes: notes,
	  country: country,
	  contact_method: contactMethod,
	  delivery_location: deliveryLocation,
	  source: "shop",
	  items: state.cart
	};


    // Backend endpoint will be implemented later
	fetch(SITE_ROOT + "api/shop_request.php", {
	  method: "POST",
	  headers: {
		"Content-Type": "application/json"
	  },
	  body: JSON.stringify(payload)
	})
	  .then(function (res) {
		if (!res.ok) {
		  throw new Error("Request failed with status " + res.status);
		}
		return res.json();
	  })
	  .then(function (data) {
		if (data && (data.ok || data.success)) {
		  setCheckoutStatus(
			"Thank you. Your request has been received. We will reachout as soon as possible!.",
			"success"
		  );
		  form.reset();
		  // Optionally: clear the cart as well
		  // state.cart = [];
		  // renderCart();
		} else {
		  setCheckoutStatus(
			(data && data.message) ||
			  "We could not confirm if the request was sent. Please try again or contact us directly.",
			"error"
		  );
		}
	  })
	  .catch(function (err) {
		console.error(err);
		setCheckoutStatus(
		  "There was a problem sending your request. Please try again later or contact us by phone.",
		  "error"
		);
	  });
  }

  // ---------- Init ----------
  function init() {
    var page = document.body.getAttribute("data-page");
    if (page !== "shop") return;

    fetchProducts().then(function (data) {
      if (!data || !Array.isArray(data.products)) return;
      state.allProducts = data.products;
      state.filteredProducts = data.products.slice();

      buildFilterOptions(state.allProducts);
      renderProductsPage();

      var catSelect = document.getElementById("shopFilterCategory");
      var brandSelect = document.getElementById("shopFilterBrand");
      var priceSelect = document.getElementById("shopFilterPriceType");
      var searchInput = document.getElementById("shopSearchInput");

      function onFiltersChange() {
        applyFilters();
      }

      if (catSelect) catSelect.addEventListener("change", onFiltersChange);
      if (brandSelect) brandSelect.addEventListener("change", onFiltersChange);
      if (priceSelect) priceSelect.addEventListener("change", onFiltersChange);
      if (searchInput) searchInput.addEventListener("input", onFiltersChange);
    });

    // Product modal events
    var backdrop = document.getElementById("productModalBackdrop");
    var closeBtn = document.getElementById("productModalClose");
    if (backdrop) {
      backdrop.addEventListener("click", closeProductModal);
    }
    if (closeBtn) {
      closeBtn.addEventListener("click", closeProductModal);
    }

    // Cart drawer events
    var openCartBtn = document.getElementById("openCartBtn");
    var cartBackdrop = document.getElementById("cartDrawerBackdrop");
    var cartClose = document.getElementById("cartDrawerClose");

    if (openCartBtn) openCartBtn.addEventListener("click", openCartDrawer);
    if (cartBackdrop) cartBackdrop.addEventListener("click", closeCartDrawer);
    if (cartClose) cartClose.addEventListener("click", closeCartDrawer);

    var checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", handleCheckoutSubmit);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
