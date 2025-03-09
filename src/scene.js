import * as THREE from 'three/webgpu';
import {OrbitControls} from "three/addons";

class Scene {
    constructor(backgroundColor) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(backgroundColor);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 5);

        this.light = new THREE.DirectionalLight(0xffffff, 2);
        this.light.castShadow = true;
        this.light.shadow.mapSize.set(1024, 1024);
        this.light.shadow.normalBias = 0.05;
        this.light.shadow.bias = 0;

        this.scene.add(this.light);
        this.lightPosition = 0.4;
        this.updateLighting();

        this.renderer = new THREE.WebGPURenderer({
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.renderer.setAnimationLoop(async () => {
            this.controls.update();
            await this.renderer.render(this.scene, this.camera);
        });

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    updateLighting() {
        // update lighting intensity and position
        this.light.position.set(
            this.lightPosition,
            Math.cos(this.lightPosition * 0.5 * Math.PI)
        )
    }
}

export default Scene;