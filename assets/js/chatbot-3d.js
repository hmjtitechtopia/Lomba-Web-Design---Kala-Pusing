// Render model 3D bot Kala di launcher (idle floating & cursor tracking)
export class Chatbot3D {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.pivot = null;
    this.model = null;
    this.clock = null;
    this.animId = null;
    this.isRunning = false;

    this.mouseTarget = { x: 0, y: 0 };
    this.mouseCurrent = { x: 0, y: 0 };

    this.isNodding = false;
    this.nodProgress = 0;

    this.onMouseMove = this.handleMouseMove.bind(this);
  }

  async init() {
    try {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");

      this.clock = new THREE.Clock();

      const width = this.canvas.clientWidth || 96;
      const height = this.canvas.clientHeight || 96;

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: "low-power",
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(width, height, false);
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.3;

      this.scene = new THREE.Scene();

      // Setup kamera framing wajah bot
      this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
      this.camera.position.set(0, 0, 3.8);
      this.camera.lookAt(0, 0, 0);

      // Lighting studio
      const ambient = new THREE.AmbientLight(0xffffff, 1.5);
      this.scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xffedd5, 2.4);
      keyLight.position.set(2.5, 3.5, 4);
      this.scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xb0d8ff, 1.0);
      fillLight.position.set(-3, -1, 3);
      this.scene.add(fillLight);

      // Load model 3D bot-face dengan cache buster version
      const modelUrl = new URL(
        "../model-chatbot/bot-face.glb?v=3",
        import.meta.url,
      ).href;
      const loader = new GLTFLoader();

      const gltf = await loader.loadAsync(modelUrl);
      this.model = gltf.scene;

      // Pivot group biar rotasi & floating berpusat di tengah kepala
      this.pivot = new THREE.Group();
      this.scene.add(this.pivot);

      const box = new THREE.Box3().setFromObject(this.model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Geser origin model ke center pivot (0, 0, 0)
      this.model.position.x -= center.x;
      this.model.position.y -= center.y;
      this.model.position.z -= center.z;

      // Normalisasi skala model biar pas di frame canvas
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        this.model.scale.setScalar(2.0 / maxDim);
      }

      this.pivot.add(this.model);

      window.addEventListener("mousemove", this.onMouseMove, { passive: true });

      if (window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.canvas);
      }

      this.resize();
      this.start();
      console.log("SEKALA: Model 3D Kala berhasil dimuat dan aktif.");
    } catch (err) {
      console.warn("SEKALA: Gagal memuat model 3D bot-face.glb:", err);
    }
  }

  handleMouseMove(e) {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.mouseTarget.x = x * 0.45;
    this.mouseTarget.y = y * 0.35;
  }

  resize() {
    if (!this.renderer || !this.camera) return;
    const w = this.canvas.clientWidth || 96;
    const h = this.canvas.clientHeight || 96;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  nod() {
    this.isNodding = true;
    this.nodProgress = 0;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    if (this.clock) this.clock.start();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  loop() {
    if (!this.isRunning) return;
    this.animId = requestAnimationFrame(() => this.loop());

    const elapsed = this.clock ? this.clock.getElapsedTime() : 0;

    if (this.pivot) {
      // Floating naik-turun halus (idle sinusoidal)
      this.pivot.position.y = Math.sin(elapsed * 2.2) * 0.05;

      // Lerp rotasi buat tracking kursor mouse
      this.mouseCurrent.x += (this.mouseTarget.x - this.mouseCurrent.x) * 0.08;
      this.mouseCurrent.y += (this.mouseTarget.y - this.mouseCurrent.y) * 0.08;

      let targetRotX = -this.mouseCurrent.y;
      let targetRotY = this.mouseCurrent.x;

      // Offset rotasi pas animasi nod / mengangguk aktif
      if (this.isNodding) {
        this.nodProgress += 0.08;
        targetRotX += Math.sin(this.nodProgress * Math.PI * 2) * 0.25;
        if (this.nodProgress >= 1.5) {
          this.isNodding = false;
        }
      }

      this.pivot.rotation.x = targetRotX;
      this.pivot.rotation.y = targetRotY;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener("mousemove", this.onMouseMove);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.renderer) this.renderer.dispose();
  }
}
