// Setup peta satelit 2D Leaflet & handler toggle view 3D/2D
(() => {
  const switchButtons = document.querySelectorAll(
    ".wilayah-view-switcher .view-switch-btn",
  );
  const mapContainer = document.getElementById("bali-map-2d");
  const pins3D = document.querySelectorAll(".bali-island-pins .bali-pin");

  let leafletMap = null;

  // Fallback lat/lng kabupaten kalau nggak kebaca dari atribut pin
  const defaultCoords = {
    jembrana: [-8.3582, 114.6369],
    tabanan: [-8.5381, 115.1239],
    badung: [-8.5819, 115.1771],
    gianyar: [-8.5435, 115.3244],
    klungkung: [-8.5356, 115.4045],
    bangli: [-8.4543, 115.3548],
    karangasem: [-8.4474, 115.6074],
    buleleng: [-8.112, 115.0882],
  };

  function initMap2D() {
    if (leafletMap || !window.L || !mapContainer) return;

    // Boundary area Bali biar panning peta nggak bablas ke laut lepas
    const baliBounds = L.latLngBounds(
      L.latLng(-9.45, 114.0),
      L.latLng(-7.65, 116.3),
    );

    const isMobile = window.innerWidth <= 700;
    const initialZoom = isMobile ? 8.4 : 9.7;

    leafletMap = L.map(mapContainer, {
      center: [-8.32, 115.18],
      zoom: initialZoom,
      minZoom: 8.5,
      maxZoom: 17,
      maxBounds: baliBounds,
      maxBoundsViscosity: 0.7,
      zoomControl: false,
      attributionControl: true,
    });

    // Tombol zoom di kanan bawah biar nggak nabrak switcher atau modal popup
    L.control.zoom({ position: "bottomright" }).addTo(leafletMap);

    // Tile layer satelit Esri World Imagery
    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 18,
        attribution: "Satelit: &copy; Esri, Maxar, Earthstar Geographics",
      },
    );

    // Tile layer label & batas wilayah dari Esri
    const labelLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 18,
        attribution: "Batas &amp; Nama: &copy; Esri",
      },
    );

    satelliteLayer.addTo(leafletMap);
    labelLayer.addTo(leafletMap);

    // Custom HTML marker pakai pin yang seragam dengan mode 3D
    pins3D.forEach((pin) => {
      const regency = pin.dataset.regency;
      const lat =
        parseFloat(pin.dataset.lat) ||
        (defaultCoords[regency] ? defaultCoords[regency][0] : null);
      const lng =
        parseFloat(pin.dataset.lng) ||
        (defaultCoords[regency] ? defaultCoords[regency][1] : null);
      const label =
        pin.querySelector(".bali-pin-label")?.textContent ||
        pin.textContent.trim() ||
        regency;

      if (lat === null || lng === null) return;

      const pinIcon = L.divIcon({
        className: "bali-leaflet-marker-wrap",
        html: `
          <button class="bali-pin is-2d" data-regency="${regency}" type="button" aria-label="Titik ${label}, tampilkan tradisi">
            <span class="bali-pin-dot" aria-hidden="true"></span>
            <span class="bali-pin-label">${label}</span>
          </button>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([lat, lng], {
        icon: pinIcon,
        title: label,
      }).addTo(leafletMap);

      marker.on("click", (event) => {
        if (event.originalEvent) {
          event.originalEvent.stopPropagation();
        }
        if (typeof window.openWilayahPopup === "function") {
          window.openWilayahPopup(pin);
        }
      });
    });

    // Tutup popup kalau klik sembarang area peta di luar marker
    leafletMap.on("click", () => {
      if (typeof window.closeWilayahPopup === "function") {
        window.closeWilayahPopup(false);
      }
    });
  }

  function setMode(mode) {
    const is2D = mode === "2d";

    switchButtons.forEach((btn) => {
      const matches = btn.dataset.mode === mode;
      btn.classList.toggle("is-active", matches);
      btn.setAttribute("aria-checked", String(matches));
    });

    document.body.classList.toggle("is-view-2d", is2D);

    if (is2D) {
      if (!leafletMap) {
        initMap2D();
      }
      setTimeout(() => {
        if (leafletMap) {
          leafletMap.invalidateSize();
        }
      }, 150);
    } else {
      // Dispatch resize event biar render Three.js update pas switch balik ke 3D
      window.dispatchEvent(new Event("resize"));
    }
  }

  switchButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      setMode(mode);
    });
  });

  // Set initial mode kalau ada parameter ?mode=2d atau hash #2d
  const urlParams = new URLSearchParams(window.location.search);
  const requestedMode =
    urlParams.get("mode") || (window.location.hash === "#2d" ? "2d" : null);
  if (requestedMode === "2d") {
    setMode("2d");
  }

  // Fallback kalau library Leaflet baru kelar dimuat setelah event load
  window.addEventListener("load", () => {
    if (document.body.classList.contains("is-view-2d")) {
      initMap2D();
    }
  });
})();
