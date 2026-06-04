import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2c1e16); 
scene.fog=new THREE.Fog(0x2c1e16,10,40);

const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
camera.position.set(0,3,7);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true });
  renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
 renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.xr.enabled = true;


const ambient = new THREE.AmbientLight(0xffffff, 0.6);
 const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5,10,5);
dirLight.castShadow = true;
scene.add(ambient, dirLight);


const textureLoader = new THREE.TextureLoader();
const mejaTexture = textureLoader.load('teksturemeja.jpg');

let objects = [];

const meja=new THREE.Mesh(
    new THREE.BoxGeometry(10,0.5,5),
    new THREE.MeshStandardMaterial({ map: mejaTexture, roughness: 0.9 })
);
meja.position.set(0,-0.25,0);
meja.receiveShadow=true;
scene.add(meja);


 const cangkir = new THREE.Mesh(
     new THREE.CylinderGeometry(0.6, 0.4, 1.2, 32),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 })
);
cangkir.position.set(-2, 0.6, 0);
cangkir.castShadow = true;
cangkir.userData.name = 'Cangkir Kopi Susu';
scene.add(cangkir);
objects.push(cangkir);

const donat = new THREE.Mesh(new THREE.TorusGeometry(0.5,0.25,16,50), new THREE.MeshStandardMaterial({color:0xd4a373, roughness:0.6}));
donat.position.set(2, 0.25, 0);
donat.rotation.x = -Math.PI/2;
donat.castShadow = true;
donat.userData.name='Donat Karamel';
scene.add(donat);
objects.push(donat);

 const bijiKopi = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.7 })
);
bijiKopi.position.set(0, 0.5, 1.5);
bijiKopi.scale.set(1, 0.6, 0.4);
bijiKopi.castShadow = true;
bijiKopi.userData.name = 'Biji Kopi Arabika';
scene.add(bijiKopi);
objects.push(bijiKopi);

const corong = new THREE.Mesh(
  new THREE.ConeGeometry(0.4, 0.8, 32),
  new THREE.MeshStandardMaterial({color:0x888888, metalness:0.8, roughness:0.2})
);
corong.position.set(0,0.4,-1);
corong.castShadow = true;
corong.userData.name = 'Corong Seduh V60';
scene.add(corong);
objects.push(corong);

// orbit
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2;

// raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selected = null; let hovered = null;
const infoDiv = document.getElementById('info');
infoDiv.innerHTML = "Arahkan & Klik objek di Meja Bar";

window.addEventListener('mousemove', (e) => {
    mouse.x=(e.clientX/innerWidth)*2-1;
    mouse.y=-(e.clientY/innerHeight)*2+1;
    
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(objects);
    
    if (hits.length > 0) {
        if (hovered !== hits[0].object && hovered !== selected) {
            if (hovered) hovered.material.emissive.setHex(0x000000);
            hovered = hits[0].object;
            if(hovered !== selected) hovered.material.emissive.setHex(0x444444);
        }
        document.body.style.cursor='pointer';
    } else {
        if (hovered && hovered !== selected) hovered.material.emissive.setHex(0x000000);
        hovered=null;
        document.body.style.cursor='default';
    }
});

window.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(objects);
    
    if(selected){ 
        selected.material.emissive.setHex(0x000000);
        if(selected===bijiKopi) selected.scale.set(1,0.6,0.4); else selected.scale.setScalar(1);
        selected=null;
        infoDiv.innerHTML = "Arahkan & Klik objek di Meja Bar"; 
    }
    
    if(hits.length>0){ 
        selected = hits[0].object;
        selected.material.emissive.setHex(0x664422);
        if(selected===bijiKopi) selected.scale.set(1.4, 0.8, 0.5); else selected.scale.setScalar(1.3);
        infoDiv.innerHTML = "Terpilih: <b>" + selected.userData.name + "</b>"; 
    } 
});

// loop
renderer.setAnimationLoop(() => {
    objects.forEach(o => { 
        if(o === bijiKopi && o !== selected) {
            o.rotation.y += 0.01; 
        }
    });
    controls.update();
    renderer.render(scene, camera); 
});

window.addEventListener('resize', () => {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight); 
});

// vr
const vrBtn = document.getElementById('vrBtn');
async function checkXRSupport() {
    if(!('xr' in navigator)){ vrBtn.style.display='none'; return; }
    const ok=await navigator.xr.isSessionSupported('immersive-vr');
    if(!ok){ vrBtn.style.display='none'; return; }
    vrBtn.disabled=false;
}
vrBtn.addEventListener('click', async () => {
    try{
        const session=await navigator.xr.requestSession('immersive-vr', {optionalFeatures:['local-floor']});
        await renderer.xr.setSession(session);
    }catch(e){console.error(e);}
});
checkXRSupport();