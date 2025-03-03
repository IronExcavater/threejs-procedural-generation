import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js'

export function generateTerrain(size, res, freq, scale) {
    const geometry = new THREE.PlaneGeometry(size, size, res, res);
    geometry.rotateX(-Math.PI / 2);

    const perlin = new ImprovedNoise();
    const positions = geometry.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i] * freq;
        const z = positions[i + 2] * freq;
        positions[i + 1] = perlin.noise(x, z, 0) * scale;
    }
    geometry.computeVertexNormals();

    return geometry;
}