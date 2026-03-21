// loader.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function loadModel(scene, camera, controls, path, onLoaded) {
  const loader = new GLTFLoader();
  loader.load(path, (gltf) => {

    console.log(JSON.stringify(gltf.parser.json, null, 2));


    const model = gltf.scene;
    scene.add(model);

    const box = new THREE.Box3().setFromObject(model);
     const center = box.getCenter(new THREE.Vector3());
     const size = box.getSize(new THREE.Vector3());
   
     model.position.sub(center);
   
     model.traverse((child) => {
       //구조 확인하기 
       console.log(child.name, child.type, child.isMesh ? child.material.name : '');
    
   
       if (child.isMesh) {
         const mat = child.material;
   
         if (mat.name.startsWith('liquid_')) {
           mat.transmission = 0;
           mat.emissiveIntensity = 3;
           mat.depthWrite = true;
           child.renderOrder = 0;
         } else if (mat.name.startsWith('glass_')) {
           mat.thickness = 1.0;
           mat.ior = 1.1;
           mat.depthWrite = false;
           child.renderOrder = 999;
         } else if (mat.name.startsWith('emit_')) {
           mat.emissiveIntensity = 3;
         }
       }
     });
   
     const maxDim = Math.max(size.x, size.y, size.z);
     camera.position.set(0, 0, maxDim * 2);
     camera.lookAt(0, 0, 0);
     controls.target.set(0, 0, 0);
     controls.update();
   

    onLoaded(model); // hierarchy한테 넘겨줄 루트
  }, undefined, (error) => {
    console.error('로드 에러:', error);
  });
}