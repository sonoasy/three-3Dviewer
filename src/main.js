import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { loadModel } from './loader.js';
import { buildTree, updateInspector } from './hierarchy.js';
import {initHighlight,render,selectObject} from './highlight.js';


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2d2d2d);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
//document.body.appendChild(renderer.domElement);
document.getElementById('viewport').appendChild(renderer.domElement);


initHighlight(renderer, scene, camera);


renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);
let curmodel = null;

function onSelect(selected) {
  updateInspector(selected);
  selectObject(selected);
  currentObject = selected;
  document.getElementById('memo-input').value = memos[selected.name] || '';
  const box = new THREE.Box3().setFromObject(selected);
  const center = box.getCenter(new THREE.Vector3());
  camera.position.set(center.x, center.y, center.z + 0.2);
  controls.target.copy(center);
  controls.update();
}



/*

//모델 로드 부분 
loadModel(scene, camera, controls, '/potion.glb', (model) => {
  // 여기서 buildTree 나중에 호출
  curmodel=model;
   buildTree(model, onSelect);
  
   console.log(curmodel);

  console.log('모델 로드 완료', model);
});
*/

function loadAndBuild(url) {
  if (curmodel) scene.remove(curmodel);
  loadModel(scene, camera, controls, url, (model) => {
    curmodel = model;
    buildTree(model, onSelect);
  });
}

// 초기 로드
loadAndBuild('/potion.glb');

// 버튼 이벤트
document.getElementById('upload-btn').addEventListener('click', () => {
  document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const url = URL.createObjectURL(file);
  loadAndBuild(url);
});



const memos = {}; //메모용
let currentObject = null;
document.getElementById('memo-input').addEventListener('input', (e) => {
  if (currentObject) {
    memos[currentObject.name] = e.target.value;
  }
});


//x-ray모두 추가 
let xrayMode = false;
document.getElementById('xray-btn').addEventListener('click', () => {
  xrayMode = !xrayMode;
  document.getElementById('xray-btn').classList.toggle('active');
});

let wireMode = false;
document.getElementById('wire-btn').addEventListener('click', () => {
  wireMode = !wireMode;
  document.getElementById('wire-btn').classList.toggle('active');

   curmodel.traverse((child) => {
    if (child.isMesh) {
      child.material.wireframe = wireMode;
    }
  });

});




const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let xrayIndex = 0; // 현재 몇 번째 오브젝트 선택 중인지


window.addEventListener('click', (e) => {
  // 마우스 좌표를 -1 ~ 1 범위로 변환 (Three.js가 이 형식으로 받음)
  //mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  //mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  const viewport = document.getElementById('viewport');
  const rect = viewport.getBoundingClientRect(); // viewport의 실제 위치/크기

  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1; 


  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true); // true = 자식까지 검사

  /*
  if (intersects.length > 0) {
    const selected = intersects[0].object; // 가장 앞에 있는 오브젝트
    selectObject(selected);
    updateInspector(selected);
  }
   */
    if (intersects.length > 0) {
      let hit; // 밖으로 빼기
      if (xrayMode) {
        // 클릭할 때마다 다음 오브젝트로 순환
        xrayIndex = xrayIndex % intersects.length;
        hit = intersects[xrayIndex].object;
        xrayIndex++;
      
      } 
      else {
        hit = intersects[0].object;
        xrayIndex = 0; // X-Ray OFF면 초기화
       }
        selectObject(hit);
        updateInspector(hit);
        currentObject = hit;
        document.getElementById('memo-input').value = memos[hit.name] || '';
         // 포커스 추가!
        //코르크가 너무 가까워짐

        const box =new THREE.Box3().setFromObject(hit); //new THREE.Box3().setFromObject(curmodel);//new THREE.Box3().setFromObject(hit);
        console.log(curmodel);
       
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.set(center.x, center.y, center.z + 0.2);
        controls.target.copy(center);
        controls.update();
  }


});


function animate() {
  requestAnimationFrame(animate);
  controls.update();
  render();
  //renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});