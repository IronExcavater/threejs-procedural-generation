import * as THREE from 'three';
import GUI from 'lil-gui';

class Controller {
    constructor(scene, terrain) {
        this.gui = new GUI();

        const lightingGroup = this.gui.addFolder('Lighting');
        lightingGroup.add(scene, 'lightPosition', -0.8, 0.8, 0.01).name('Position').onChange(() => scene.updateLighting());
        lightingGroup.add(scene.light, 'intensity', 0, 10, 0.5).name('Intensity').onChange(() => scene.updateLighting());
        lightingGroup.add(scene.light.shadow, 'normalBias', 0, 0.1, 0.001).name('Normal Bias');
        lightingGroup.add(scene, 'shadowDistance', 0, 100, 0.001).name('Shadow Distance').onChange(() => scene.updateLighting());

        const terrainGroup = this.gui.addFolder('Terrain');
        terrainGroup.add(terrain.speed, 'x', -10, 10, 0.001).name('Speed X');
        terrainGroup.add(terrain.speed, 'y', -10, 10, 0.001).name('Speed X');
        const terrainGenGroup = terrainGroup.addFolder('Generation');
        terrainGenGroup.add(terrain, 'size', 10, 200, 1).name('Size').onChange(() => terrain.updateGeometry());
        terrainGenGroup.add(terrain, 'resolution', 10, 2000, 1).name('Resolution').onChange(() => terrain.updateGeometry());
        terrainGenGroup.add(terrain.iterations, 'value', 0, 10, 1).name('Iterations');
        terrainGenGroup.add(terrain.frequency, 'value', 0, 1, 0.001).name('Frequency');
        terrainGenGroup.add(terrain.strength, 'value', 0, 20, 0.001).name('Strength');
        terrainGenGroup.add(terrain.normalShift, 'value', 0.01, 1, 0.001).name('Neighbour Shift');

        const terrainColGroup = terrainGroup.addFolder('Colour');
        terrainColGroup.addColor({ colour: terrain.colorOceanFloor.value.getHexString(THREE.SRGBColorSpace) }, 'colour').name('Ocean Floor Colour').onChange((value) => terrain.colorOceanFloor.value.set(value));
        terrainColGroup.addColor({ colour: terrain.colorOceanSurface.value.getHexString(THREE.SRGBColorSpace) }, 'colour').name('Ocean Surface Colour').onChange((value) => {
            terrain.colorOceanSurface.value.set(value);
            terrain.updateOcean();
        });
        terrainColGroup.addColor({ colour: terrain.colorBeach.value.getHexString(THREE.SRGBColorSpace) }, 'colour').name('Beach Colour').onChange((value) => terrain.colorBeach.value.set(value));
        terrainColGroup.addColor({ colour: terrain.colorHill.value.getHexString(THREE.SRGBColorSpace) }, 'colour').name('Hill Colour').onChange((value) => terrain.colorHill.value.set(value));
        terrainColGroup.addColor({ colour: terrain.colorCliff.value.getHexString(THREE.SRGBColorSpace) }, 'colour').name('Cliff Colour').onChange((value) => terrain.colorCliff.value.set(value));
        terrainColGroup.addColor({ colour: terrain.colorPeak.value.getHexString(THREE.SRGBColorSpace) }, 'colour').name('Peak Colour').onChange((value) => terrain.colorPeak.value.set(value));

        const terrainMixGroup = terrainGroup.addFolder('Mixing');
        terrainMixGroup.add(terrain.oceanHeight, 'value', -0.5, 0.2, 0.001).name('Ocean Height').onChange(() => terrain.updateOcean());
        terrainMixGroup.add(terrain.beachHeight, 'value', -0.2, 1, 0.001).name('Beach Height');
        terrainMixGroup.add(terrain.cliffSlope, 'value', 0, 1, 0.001).name('Cliff Slope');
        terrainMixGroup.add(terrain.peakHeight, 'value', 0, 1, 0.001).name('Peak Height');
        terrainMixGroup.add(terrain.beachBlend, 'value', 0, 0.5, 0.001).name('Beach Blend');
        terrainMixGroup.add(terrain.hillBlend, 'value', 0, 0.5, 0.001).name('Hill Blend');
        terrainMixGroup.add(terrain.cliffBlend, 'value', 0, 0.5, 0.001).name('Cliff Blend');
        terrainMixGroup.add(terrain.peakBlend, 'value', 0, 0.5, 0.001).name('Peak Blend');
    }
}

export default Controller;