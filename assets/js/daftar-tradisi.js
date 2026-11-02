const regionNames = {
  denpasar: "Denpasar",
  jembrana: "Jembrana",
  tabanan: "Tabanan",
  badung: "Badung",
  gianyar: "Gianyar",
  klungkung: "Klungkung",
  bangli: "Bangli",
  karangasem: "Karangasem",
  buleleng: "Buleleng",
};

const slug =
  new URLSearchParams(window.location.search).get("wilayah")?.toLowerCase() ||
  "badung";
const region = Object.hasOwn(regionNames, slug) ? regionNames[slug] : null;
const grid = document.querySelector("[data-tradisi-grid]");
const empty = document.querySelector("[data-tradisi-empty]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelector("[data-region-name]").textContent =
  region || "Tidak ditemukan";
document.title = region
  ? `Daftar Tradisi ${region} - Sekala`
  : "Wilayah tidak ditemukan - Sekala";

if (slug !== "badung") {
  grid.hidden = true;
  empty.hidden = false;
  document.querySelector("[data-empty-heading]").textContent = region
    ? `Tradisi ${region} sedang disiapkan`
    : "Wilayah tidak ditemukan";
  document.querySelector("[data-empty-message]").textContent = region
    ? `Daftar tradisi untuk ${region} belum tersedia. Pilih wilayah lain melalui peta untuk melanjutkan penjelajahan.`
    : "Pilih salah satu wilayah Bali melalui peta untuk melihat daftar tradisinya.";
  const searchEl = document.querySelector("[data-tradisi-search]");
  if (searchEl) searchEl.hidden = true;
}

// Filter search tradisi (live search & state pencarian kosong)
const searchInput = document.getElementById("tradisi-search-input");
const searchClearBtn = document.getElementById("tradisi-search-clear");
const noResultsEl = document.getElementById("tradisi-no-results");
const noResultsQueryEl = document.getElementById("tradisi-no-results-query");
const resetSearchBtn = document.getElementById("tradisi-reset-search");
const tradisiCards = document.querySelectorAll(".tradisi-card");

function filterTradisi(rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  let matchCount = 0;

  tradisiCards.forEach((card) => {
    const title = card.querySelector("h2")?.textContent.toLowerCase() || "";
    const desc =
      card
        .querySelector(".tradisi-card__description")
        ?.textContent.toLowerCase() || "";
    const isMatch = !query || title.includes(query) || desc.includes(query);

    if (isMatch) {
      card.classList.remove("is-hidden");
      matchCount += 1;
    } else {
      card.classList.add("is-hidden");
    }
  });

  if (searchClearBtn) {
    const hasValue = Boolean(rawQuery && rawQuery.length > 0);
    searchClearBtn.hidden = !hasValue;
    if (hasValue) {
      searchClearBtn.classList.add("is-visible");
    } else {
      searchClearBtn.classList.remove("is-visible");
    }
  }

  if (noResultsEl) {
    if (matchCount === 0 && query) {
      noResultsEl.hidden = false;
      if (grid) grid.hidden = true;
      if (noResultsQueryEl) noResultsQueryEl.textContent = rawQuery.trim();
    } else {
      noResultsEl.hidden = true;
      if (grid && slug === "badung") grid.hidden = false;
    }
  }
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    filterTradisi(e.target.value);
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      filterTradisi("");
      searchInput.blur();
    }
  });
}

if (searchClearBtn) {
  searchClearBtn.addEventListener("click", () => {
    if (searchInput) {
      searchInput.value = "";
      filterTradisi("");
      searchInput.focus();
    }
  });
}

if (resetSearchBtn) {
  resetSearchBtn.addEventListener("click", () => {
    if (searchInput) {
      searchInput.value = "";
      filterTradisi("");
      searchInput.focus();
    }
  });
}
