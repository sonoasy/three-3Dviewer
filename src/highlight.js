import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';


import * as THREE from 'three';

let composer, outlinePass;

// composer 초기화 - main.js에서 한 번 호출
export function initHighlight(renderer, scene, camera) {
  composer = new EffectComposer(renderer);
  
   renderer.outputColorSpace = THREE.SRGBColorSpace; //환경광 

  composer.addPass(new RenderPass(scene, camera)); // 씬 렌더링
  
  outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  outlinePass.edgeThickness = 2;
  outlinePass.edgeStrength = 50;   // 외곽선 강도
  outlinePass.edgeColor = new THREE.Color('#ff00ff'); // 외곽선 색
  composer.addPass(outlinePass);

  composer.addPass(new OutputPass()); //환경광 됫ㅁ
}

// 오브젝트 선택 시 호출
export function selectObject(object) {
  outlinePass.selectedObjects = [object];
}

// 선택 해제
export function clearSelection() {
  outlinePass.selectedObjects = [];
}

// animate loop에서 renderer.render() 대신 이걸 호출
export function render() {
  composer.render();
}