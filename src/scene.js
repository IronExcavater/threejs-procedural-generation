import * as THREE from 'three/webgpu';
import {MapControls} from "three/addons";

class Scene {
    constructor(backgroundColor) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(backgroundColor);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 5);

        this.light = new THREE.DirectionalLight(0xffffff, 2);
        this.light.castShadow = true;
        this.light.shadow.mapSize.set(2048, 2048);
        this.light.shadow.normalBias = 0.05;
        this.scene.add(this.light.target);
        this.scene.add(this.light);

        this.lightOffset = new THREE.Vector3();
        this.lightPosition = 0.4;
        this.shadowDistance = 10;
        this.updateLighting();

        this.renderer = new THREE.WebGPURenderer({
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // const helper = new THREE.CameraHelper(this.light.shadow.camera);
        // this.scene.add(helper);

        this._updateListeners = [];
        const clock = new THREE.Clock();
        this.renderer.setAnimationLoop(async () => {
            this.controls.update();
            for (const listener of this._updateListeners) {
                listener(clock.getDelta());
            }

            this.light.target.position.copy(this.controls.target);
            this.light.position.copy(this.controls.target).add(this.lightOffset);

            await this.renderer.render(this.scene, this.camera);
        });

        this.controls = new MapControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.rotateSpeed = 0.5;

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    updateLighting() {
        // update lighting intensity and position
        this.lightOffset.set(
            this.lightPosition * 100,
            Math.cos(this.lightPosition * 0.5 * Math.PI) * 100,
            0
        )

        this.light.shadow.camera.left = -this.shadowDistance;
        this.light.shadow.camera.right = this.shadowDistance;
        this.light.shadow.camera.top = this.shadowDistance * 0.5;
        this.light.shadow.camera.bottom = -this.shadowDistance * 0.5;
        this.light.shadow.camera.updateProjectionMatrix();
    }

    addUpdateListener(callback) {
        this._updateListeners.push(callback);
    }

    removeUpdateListener(callback) {
        this._updateListeners = this._updateListeners.filter(fn => fn !== callback);
    }
}

export default Scene;