import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as dat from "lil-gui";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

/**
 * Base
 */
// Initial gsap settings
gsap.registerPlugin(SplitText);
// gsap.set(".loader", { autoAlpha: 0 });
let loaderText = new SplitText("#loadIndicator", { type: "chars" });

// Debug
const gui = new dat.GUI();
gui.hide();

// Loading manager
const loadingManager = new THREE.LoadingManager();

loadingManager.onLoad = () => {
  let loadTL = gsap.timeline();

  loadTL
    .to(loaderText.chars, {
      yPercent: -50,
      autoAlpha: 0,
      stagger: 0.03,
      ease: "power4.inOut",
    })
    .to(".loader", {
      delay: 1,
      autoAlpha: 0,
      duration: 1,
    });
};

// Loaders
const gltfLoader = new GLTFLoader(loadingManager);

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Lights
const ambientLight = new THREE.AmbientLight("#ffffff", 0.3);

const directionalLight = new THREE.DirectionalLight("#ffffff", 0.7);
directionalLight.position.set(1, 2, 3);

// Add Lights to the scene
scene.add(ambientLight, directionalLight);

// initialize Duck GLTF
let duckGltf = null;

// Load the model
gltfLoader.load("./models/Duck/glTF-Binary/Duck.glb", (gltf) => {
  duckGltf = gltf.scene;
  duckGltf.position.y = -1.2;
  //  Add the model to scene
  scene.add(duckGltf);
});

/**
 * Objects
 */
const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
);
object1.position.x = -2;

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
);

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
);
object3.position.x = 2;

// scene.add(object1, object2, object3);

// Ray caster
const raycaster = new THREE.Raycaster();

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

const mouse = new THREE.Vector2();

//  windows events
window.addEventListener("mousemove", (_event) => {
  mouse.x = (_event.clientX / sizes.width) * 2 - 1;
  mouse.y = (-_event.clientY / sizes.height) * 2 + 1;
});

// window.addEventListener("click", (_event) => {
//   if (currentIntersect) {
//     switch (currentIntersect.object) {
//       case object1:
//         console.log("Clicked Obj 1");
//         break;
//       case object2:
//         console.log("Clicked Obj 2");
//         break;
//       case object3:
//         console.log("Clicked Obj 3");
//         break;
//       default:
//         break;
//     }
//   }
// });

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
camera.position.z = 3;
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

/**
 * Animate
 */
const clock = new THREE.Clock();

// Witness
let currentIntersect = null;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Animate objects
  // object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5;
  // object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5;
  // object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5;

  // Cast a ray

  raycaster.setFromCamera(mouse, camera);

  // const objectsToTest = [object1, object2, object3];
  // const intersects = raycaster.intersectObjects(objectsToTest);

  // objectsToTest.map((object) => {
  //   object.material.color.set("#ff0000");
  // });
  // intersects.map((intersect) => {
  //   intersect.object.material.color.set("#0000ff");
  // });

  // if (intersects.length) {
  //   if (!currentIntersect) {
  //     console.log("mouse enter");
  //   }
  //   currentIntersect = intersects[0];
  // } else {
  //   if (currentIntersect) {
  //     console.log("mouse leave");
  //   }
  //   currentIntersect = null;
  // }

  if (duckGltf) {
    const intersectDuck = raycaster.intersectObject(duckGltf);

    intersectDuck.length
      ? duckGltf.scale.set(1.2, 1.2, 1.2)
      : duckGltf.scale.set(1, 1, 1);
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
