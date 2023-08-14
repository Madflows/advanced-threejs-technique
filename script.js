import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "lil-gui";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { TextPlugin } from "gsap/TextPlugin";

/**
 * Base
 */
// Initial gsap settings
gsap.registerPlugin(SplitText, DrawSVGPlugin, TextPlugin);
// gsap.set(".loader", { autoAlpha: 0 });

let loaderText = new SplitText("#loadIndicator", { type: "chars" });

// Debug
const gui = new dat.GUI();
gui.domElement.id = "gui";
const debugObject = {
  envMapIntensity: 5
}


// Loading manager
const loadingManager = new THREE.LoadingManager();
const gltfLoader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

loadingManager.onLoad = () => {
  let loadTL = gsap.timeline();

  loadTL
    .to('#loadIndicator', { duration: 1, text: "Assets Loaded", ease: "none" })
    .to('#loadIndicator', {
      autoAlpha: 0,
      stagger: 0.01,
      ease: "power4.inOut",
    }).to('svg', {
      autoAlpha: 0,
      yPercent: 300
    })
    .to(".loader", {
      delay: 1,
      autoAlpha: 0,
      duration: 1,
    });
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Update all materials
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMap = environmentMap;
      child.material.envMapIntensity = debugObject.envMapIntensity
    }
  });
};

gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials)


// Environment map
const environmentMap = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.jpg",
  "/textures/environmentMaps/0/nx.jpg",
  "/textures/environmentMaps/0/py.jpg",
  "/textures/environmentMaps/0/ny.jpg",
  "/textures/environmentMaps/0/pz.jpg",
  "/textures/environmentMaps/0/nz.jpg",
]);

scene.background = environmentMap;
// scene.environment = environmentMap;

// Models
gltfLoader.load("/models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
  gltf.scene.scale.set(10, 10, 10);
  gltf.scene.position.set(0, -4, 0);
  gltf.scene.rotation.y = Math.PI * 0.5;
  scene.add(gltf.scene);

  // Add rotation to GUI
  gui
    .add(gltf.scene.rotation, "y")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001)
    .name("helmetRotationY");

  updateAllMaterials();
});

/**
 * Test sphere
 */
const testSphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial()
);
scene.add(testSphere);

// Lights
const sun = new THREE.DirectionalLight("#ffffff", 0.3);
sun.position.set(0.25, 3, -2.25);
scene.add(sun);

// Light controls
const lightGroup = gui.addFolder("Light");
lightGroup.close();
lightGroup.add(sun, "intensity").min(0).max(10).step(0.001);
lightGroup.add(sun.position, "x").min(-5).max(5).step(0.001);
lightGroup.add(sun.position, "y").min(-5).max(5).step(0.001);
lightGroup.add(sun.position, "z").min(-5).max(5).step(0.001);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(4, 1, -4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.useLegacyLights = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;
// renderer.setClearColor('#222222')

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
