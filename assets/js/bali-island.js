// Sistem koordinat model: glTF X timur, Y atas, -Z utara (atribusi ada di folder aset)
const stage = document.querySelector(".bali-island");
const header = document.querySelector(".site-header");
const status = document.querySelector("#island-status");
const pins = [...stage.querySelectorAll(".bali-island-pins .bali-pin")].map(
  (button) => ({
    button,
    position: (button.dataset.position || "0,0,0").split(",").map(Number),
    anchor: null,
  }),
);
const readyMessage = `Pulau Bali siap. ${pins.length} kabupaten dapat dipilih.`;
const posterMessage = `Menampilkan gambar Pulau Bali dengan ${pins.length} titik kabupaten.`;
const assetRoot = new URL("../model-3d-bali/", import.meta.url);
const compassRose = stage.querySelector("[data-compass-rose]");
const compassDirections = [
  { key: "north", world: [0, 0, -1], initial: [0, -1] },
  { key: "east", world: [1, 0, 0], initial: [1, 0] },
  { key: "south", world: [0, 0, 1], initial: [0, 1] },
  { key: "west", world: [-1, 0, 0], initial: [-1, 0] },
].map((direction) => ({
  ...direction,
  label: stage.querySelector(`[data-compass-label="${direction.key}"]`),
}));
let draw = drawPosterPins;
let disposed = false;

function placeCompassDirection(direction, x, y) {
  const length = Math.hypot(x, y) || 1;
  const dx = x / length;
  const dy = y / length;
  direction.screenX = dx;
  direction.screenY = dy;
  direction.label.setAttribute("x", 80 + dx * 73);
  direction.label.setAttribute("y", 80 + dy * 73);
}

function updateCompassRose() {
  const east = compassDirections[1];
  const south = compassDirections[2];
  // Sinkronkan sumbu timur & selatan kompas mawar dengan proyeksi peta
  const tx = 80 - 80 * (east.screenX + south.screenX);
  const ty = 80 - 80 * (east.screenY + south.screenY);
  compassRose.setAttribute(
    "transform",
    `matrix(${east.screenX} ${east.screenY} ${south.screenX} ${south.screenY} ${tx} ${ty})`,
  );
}

function frame() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  const viewHeight = Math.max(10.125, (16.2 * height) / Math.max(width, 1));
  return {
    width,
    height,
    viewHeight,
    viewWidth: (viewHeight * width) / Math.max(height, 1),
  };
}

// Posisi pin kabupaten tetap pas di atas poster fallback kalau WebGL nonaktif
function drawPosterPins() {
  const { width, height, viewWidth, viewHeight } = frame();
  const length = Math.hypot(16.85, 15);
  for (const {
    button,
    position: [x, y, z],
  } of pins) {
    const up = ((y - 0.15) * 15 - z * 16.85) / length;
    button.style.left = `${(x / viewWidth + 0.5) * width}px`;
    button.style.top = `${(0.5 - up / viewHeight) * height}px`;
  }
  for (const direction of compassDirections)
    placeCompassDirection(direction, ...direction.initial);
  updateCompassRose();
  stage.classList.add("has-pins");
}

drawPosterPins();
const resizeObserver = new ResizeObserver(() => {
  stage.style.setProperty(
    "--island-header-height",
    `${header.getBoundingClientRect().height}px`,
  );
  draw();
});
resizeObserver.observe(stage);
resizeObserver.observe(header);

async function initIsland() {
  let renderer;
  let model;
  let water;
  let waterTexture;
  let controls;
  let renderFrame = 0;
  let onVisibilityChange;

  function release() {
    cancelAnimationFrame(renderFrame);
    controls?.dispose();
    if (model) {
      model.traverse((object) => {
        object.geometry?.dispose();
        for (const material of [object.material].flat().filter(Boolean)) {
          material.map?.dispose();
          material.dispose();
        }
      });
    }
    water?.geometry.dispose();
    water?.material.dispose();
    waterTexture?.dispose();
    renderer?.dispose();
    renderer?.domElement.remove();
    if (onVisibilityChange)
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }

  try {
    const THREE = await import("three");
    const [{ GLTFLoader }, { OrbitControls }] = await Promise.all([
      import("three/addons/loaders/GLTFLoader.js"),
      import("three/addons/controls/OrbitControls.js"),
    ]);
    if (disposed) return;
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.className = "bali-island-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    stage.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -8.1,
      8.1,
      5.0625,
      -5.0625,
      0.1,
      150,
    );
    camera.position.set(0, 17, 15);
    camera.lookAt(0, 0.15, 0);
    scene.add(new THREE.HemisphereLight(0xfff4df, 0x59412f, 1.7));
    const key = new THREE.DirectionalLight(0xfff0d6, 2.2);
    key.position.set(-5, 9, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xdcecff, 0.8);
    fill.position.set(5, 6, -3);
    scene.add(fill);

    const useLow =
      window.matchMedia("(max-width: 700px)").matches ||
      navigator.connection?.saveData;
    const filename = useLow
      ? "sekala-bali-merged-low.glb"
      : "sekala-bali-merged.glb";
    const modelUrl = new URL(filename, assetRoot);
    modelUrl.searchParams.set(
      "v",
      useLow ? "sentinel-2016-1024" : "sentinel-2016-4096",
    );
    const textureUrl = new URL("bali-water.webp", assetRoot);
    textureUrl.searchParams.set("v", "sea-crop-192");
    const [gltf, texture] = await Promise.all([
      new GLTFLoader().loadAsync(modelUrl.href),
      new THREE.TextureLoader().loadAsync(textureUrl.href).catch((error) => {
        console.warn(
          "SEKALA: tekstur air tidak tersedia, memakai warna laut.",
          error,
        );
        return null;
      }),
    ]);
    model = gltf.scene;
    waterTexture = texture;
    if (disposed) {
      release();
      return;
    }
    if (waterTexture) {
      waterTexture.colorSpace = THREE.SRGBColorSpace;
      waterTexture.wrapS = waterTexture.wrapT = THREE.MirroredRepeatWrapping;
      waterTexture.repeat.set(64, 64);
      waterTexture.anisotropy = Math.min(
        useLow ? 2 : 4,
        renderer.capabilities.getMaxAnisotropy(),
      );
    }
    // Plane air sederhana di bawah garis pantai, cukup tekstur crop tanpa loop render berat
    water = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshBasicMaterial({
        map: waterTexture,
        color: waterTexture ? 0xffffff : 0x102936,
        toneMapped: false,
      }),
    );
    water.name = "Bali_Water";
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.012;
    scene.add(water);
    scene.add(model);
    if (!useLow)
      model.traverse((object) => {
        for (const material of [object.material].flat().filter(Boolean)) {
          if (material.map)
            material.map.anisotropy = Math.min(
              8,
              renderer.capabilities.getMaxAnisotropy(),
            );
        }
      });
    // Posisi anchor pin kabupaten diambil dari poligon ADM2 regency-pins.json
    for (const pin of pins) {
      pin.anchor = new THREE.Object3D();
      pin.anchor.name = `Regency_${pin.button.dataset.regency}`;
      pin.anchor.position.set(...pin.position);
      model.add(pin.anchor);
    }

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.15, 0);
    controls.enablePan = false;
    controls.enableDamping = !window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    controls.dampingFactor = 0.08;
    controls.minZoom = 0.8;
    controls.maxZoom = 2.5;
    controls.minPolarAngle = 0.15;
    controls.maxPolarAngle = 1.1;
    controls.minAzimuthAngle = -0.65;
    controls.maxAzimuthAngle = 0.65;
    controls.update();
    const projected = new THREE.Vector3();
    const compassVectors = compassDirections.map((direction) => ({
      direction,
      vector: new THREE.Vector3(...direction.world),
    }));
    const compassProjected = new THREE.Vector3();

    function render() {
      renderFrame = 0;
      if (disposed || document.hidden) return;
      if (controls.enableDamping) controls.update();
      renderer.render(scene, camera);
      // Proyeksikan arah mata angin lewat kamera yang sama biar label ngikutin orbit & tilt peta
      for (const { direction, vector } of compassVectors) {
        compassProjected
          .copy(vector)
          .transformDirection(camera.matrixWorldInverse);
        placeCompassDirection(
          direction,
          compassProjected.x,
          -compassProjected.y,
        );
      }
      updateCompassRose();
      for (const { button, anchor } of pins) {
        if (!anchor) {
          button.hidden = true;
          continue;
        }
        anchor.getWorldPosition(projected).project(camera);
        button.hidden =
          Math.abs(projected.x) > 1 ||
          Math.abs(projected.y) > 1 ||
          Math.abs(projected.z) > 1;
        button.style.left = `${((projected.x + 1) * stage.clientWidth) / 2}px`;
        button.style.top = `${((1 - projected.y) * stage.clientHeight) / 2}px`;
      }
    }

    function requestRender() {
      if (!renderFrame) renderFrame = requestAnimationFrame(render);
    }

    const resizeAndRender = () => {
      const { width, height, viewWidth, viewHeight } = frame();
      renderer.setSize(width, height, false);
      camera.left = -viewWidth / 2;
      camera.right = viewWidth / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      requestRender();
    };
    draw = resizeAndRender;
    controls.addEventListener("change", requestRender);
    onVisibilityChange = () => {
      if (!document.hidden) requestRender();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    renderer.domElement.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      controls.enabled = false;
      cancelAnimationFrame(renderFrame);
      renderFrame = 0;
      stage.classList.remove("is-ready");
      for (const pin of pins) pin.button.hidden = false;
      draw = drawPosterPins;
      draw();
      status.textContent = posterMessage;
    });
    renderer.domElement.addEventListener("webglcontextrestored", () => {
      controls.enabled = true;
      draw = resizeAndRender;
      draw();
      stage.classList.add("is-ready");
      status.textContent = readyMessage;
    });
    draw();
    stage.classList.add("is-ready");
    status.textContent = readyMessage;
    window.addEventListener("pagehide", (event) => {
      if (!event.persisted) release();
    });
  } catch (error) {
    release();
    stage.classList.remove("is-ready");
    draw = drawPosterPins;
    draw();
    status.textContent = posterMessage;
    console.warn("SEKALA: menggunakan gambar pengganti model 3D.", error);
  }
}

window.addEventListener("pagehide", (event) => {
  if (event.persisted) return;
  disposed = true;
  resizeObserver.disconnect();
});
initIsland();
