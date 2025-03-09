import WebGL from 'three/addons/capabilities/WebGL.js';
import showToast from './toast.js';
import Scene from './scene.js';
import Terrain from './terrain.js';
import Controller from './controller.js';

if (WebGL.isWebGL2Available()) {
    initScene();
} else {
    showToast(WebGL.getWebGL2ErrorMessage());
}

function initScene() {
    const scene = new Scene(0x70c7cc);
    const terrain = new Terrain(scene);
    const controller = new Controller(scene, terrain);
    showToast('Project loaded');
}