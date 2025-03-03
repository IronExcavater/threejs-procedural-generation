import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js'
import { GUI } from 'dat.gui';
import { showToast } from './toast.js'
import { generateTerrain } from "./generation.js";

let scene, renderer, camera, controls, stats;
const clock = new THREE.Clock();

let terrainMesh;


const params = {
    terrainSize: 100,
    terrainResolution: 50,
    terrainFrequency: 0.2,
    terrainScale: 5,
    treeDensity: 10,
}

// Show error if device doesn't support WebGL 2
if (!WebGL.isWebGL2Available()) {
    showToast(WebGL.getWebGL2ErrorMessage());
} else {
    initScene();
}

function initScene() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x70c7cc);

    // Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    renderer.shadowMap.enabled = true;

    // Parameter GUI
    const gui = new GUI();
    gui.add(params, 'terrainResolution', 5, 100, 5).name('Terrain Detail').onChange(updateTerrain);
    gui.add(params, 'terrainFrequency', 0, 0.1, 0.01).name('Terrain Frequency').onChange(updateTerrain);
    gui.add(params, 'terrainScale', 0, 10, 1).name('Terrain Scale').onChange(updateTerrain);

    updateTerrain();

    // Camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 50);

    // Directional Light
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.intensity = 5;
    directionalLight.position.set(10, 10, 10);
    directionalLight.lookAt(terrainMesh);
    scene.add(directionalLight);

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function updateTerrain() {
    const terrainGeometry = generateTerrain(params.terrainSize, params.terrainResolution, params.terrainFrequency, params.terrainScale);

    if (!terrainMesh) {
        const terrainMaterial = new THREE.MeshStandardMaterial({ color: 0x4fc400 });
        terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrainMesh.receiveShadow = true;
        scene.add(terrainMesh);
    } else {
        terrainMesh.geometry.dispose();
        terrainMesh.geometry = terrainGeometry;
    }
}