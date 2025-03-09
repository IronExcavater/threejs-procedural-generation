import * as THREE from 'three/webgpu';
import {
    mx_noise_float, cross, float, transformNormalToView, positionLocal, sign, Fn, uniform, vec2, vec3, Loop,
    varyingProperty, color, step, smoothstep, dot
} from 'three/tsl';

class Terrain {
    constructor(scene) {
        const material = new THREE.MeshStandardNodeMaterial({
            metalness: 0,
            roughness: 0.5,
            color: this.colorHill,
        });

        this.size = 10;
        this.resolution = 1000;
        this.offset = uniform(vec2(0, 0)); // uniform stop shaders from modifying the value
        this.iterations = uniform(3);
        this.frequency = uniform(0.2);
        this.strength = uniform(12);
        this.normalShift = uniform(0.01);

        this.colorOceanDeep = uniform(color('#253b69'));
        this.colorOceanSurface = uniform(color('#6e93de'));
        this.colorBeach = uniform(color('#dccc63'));
        this.colorHill = uniform(color('#58b235'));
        this.colorCliff = uniform(color('#c0ae87'));
        this.colorPeak = uniform(color('#cccccc'));

        this.oceanHeight = uniform(-0.15);
        this.beachHeight = uniform(-0.05);
        this.cliffSlope = uniform(0.8);
        this.peakHeight = uniform(0.4);
        this.beachBlend = uniform(0.05);
        this.hillBlend = uniform(0.02);
        this.cliffBlend = uniform(0.2);
        this.peakBlend = uniform(0.05);

        const varyingNormal = varyingProperty('vec3');
        const varyingPosition = varyingProperty('vec3');

        const getHeight = Fn(([position]) => {
            const offsetPos = position.add(this.offset).toVar();

            const height = float(0).toVar();
            Loop( this.iterations, ({ i }) => {
                // Every noise iteration, double the frequency '*(i*2)' for finer detail and add increasing position offset
                const iterationPos = offsetPos.mul(this.frequency).mul(i.add(1).mul(2)).add(i.mul(10));
                // Every noise iteration, halve the strength '/(i*2)' for flatter detail
                const iterationHeight = mx_noise_float(iterationPos, 0.5, 0).div(i.add(1).mul(2));
                height.addAssign(iterationHeight);
            });

            const heightSign = sign(height);
            height.assign(height.abs().pow(2).mul(heightSign).mul(this.strength));
            return height;
        });

        material.positionNode = Fn(() => {
            // Set height for position
            const position = positionLocal.xyz.toVar();
            position.y.addAssign(getHeight(positionLocal.xz));

            // Calculate normal for position
            // 1. Get two neighbour positions (e.g. -x and +z)
            // note: opposite directions just removes the need to flip at the end
            const neighbourX = positionLocal.xyz.add(vec3(this.normalShift.negate(), 0, 0)).toVar();
            const neighbourZ = positionLocal.xyz.add(vec3(0, 0, this.normalShift)).toVar();

            // 2. Set height for neighbours
            neighbourX.y.addAssign(getHeight(neighbourX.xz));
            neighbourZ.y.addAssign(getHeight(neighbourZ.xz));

            // 3. Get relative vectors (self to neighbour)
            const toNeighbourX = neighbourX.sub(position);
            const toNeighbourZ = neighbourZ.sub(position);

            // 4. Get the normal by cross multiplying the relative vectors
            // why? output is perpendicular to both input
            varyingNormal.assign(cross(toNeighbourX, toNeighbourZ).normalize());

            varyingPosition.assign(position.add(vec3(this.offset.x, 0, this.offset.y)));
            return position;
        })();

        material.normalNode = transformNormalToView(varyingNormal);

        material.colorNode = Fn(() => {
            const finalColor = this.colorOceanDeep.toVar();

            const oceanSurfaceMix = smoothstep(this.oceanHeight.sub(0.5), this.oceanHeight, varyingPosition.y);
            finalColor.assign(oceanSurfaceMix.mix(finalColor, this.colorOceanSurface));

            const beachMix = smoothstep(this.oceanHeight, this.oceanHeight.add(this.beachBlend), varyingPosition.y);
            finalColor.assign(beachMix.mix(finalColor, this.colorBeach));

            const hillMix = smoothstep(this.beachHeight, this.beachHeight.add(this.hillBlend), varyingPosition.y);
            finalColor.assign(hillMix.mix(finalColor, this.colorHill));

            // Slope is dot product of normal and y-axis (oneMinus is to flip values => flat = 0, steep = 1)
            const slopeY = dot(varyingNormal, vec3(0, 1, 0));
            const cliffMix = smoothstep(this.cliffSlope.sub(this.cliffBlend), this.cliffSlope, slopeY).oneMinus();
            // Ensure cliff only appears above beach height
            cliffMix.mulAssign(step(this.beachHeight.add(this.hillBlend), varyingPosition.y));
            finalColor.assign(cliffMix.mix(finalColor, this.colorCliff));

            // The peak height changes at different positions with noise
            const peakThreshold = mx_noise_float(varyingPosition.xz.mul(25), 1, 0).mul(0.1).add(this.peakHeight);
            const peakMix = smoothstep(peakThreshold, peakThreshold.add(this.peakBlend), varyingPosition.y);
            finalColor.assign(peakMix.mix(finalColor, this.colorPeak));

            return finalColor;
        })();

        const geometry = new THREE.PlaneGeometry(this.size, this.size, this.resolution, this.resolution);
        geometry.rotateX(-Math.PI / 2);
        geometry.deleteAttribute('uv');
        geometry.deleteAttribute('normal');

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;
        scene.add(this.mesh);
    }

    updateGeometry() {
        this.mesh.geometry.dispose();
        const geometry = new THREE.PlaneGeometry(this.size, this.size, this.resolution, this.resolution);
        geometry.rotateX(-Math.PI / 2);
        this.mesh.geometry = geometry;
    }
}

export default Terrain;