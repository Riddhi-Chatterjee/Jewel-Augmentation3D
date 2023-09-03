//Start with this command: export NODE_OPTIONS=--openssl-legacy-provider

const video2 = document.getElementsByClassName('input_video2')[0];
const out2 = document.getElementsByClassName('output2')[0];
const controlsElement2 = document.getElementsByClassName('control2')[0];
const canvasCtx = out2.getContext('webgl');

// console.log(canvasCtx)
const canvas = document.querySelector("canvas.output2");
// console.log(canvas)

// console.log(document.getElementsByClassName('output2'))

const fpsControl = new FPS();
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};

function onResultsFaceMesh(results) {

  console.log(results.multiFaceLandmarks[0]) //Printing the 468 face mesh landmarks

  document.body.classList.add('loaded');
  fpsControl.tick();

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, out2.width, out2.height);
  canvasCtx.drawImage(
      results.image, 0, 0, out2.width, out2.height);
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      drawConnectors(
          canvasCtx, landmarks, FACEMESH_TESSELATION,
          {color: '#C0C0C070', lineWidth: 1});
      drawConnectors(
          canvasCtx, landmarks, FACEMESH_RIGHT_EYE,
          {color: '#FF3030'});
      drawConnectors(
          canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW,
          {color: '#FF3030'});
      drawConnectors(
          canvasCtx, landmarks, FACEMESH_LEFT_EYE,
          {color: '#30FF30'});
      drawConnectors(
          canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW,
          {color: '#30FF30'});
      drawConnectors(
          canvasCtx, landmarks, FACEMESH_FACE_OVAL,
          {color: '#E0E0E0'});
      drawConnectors(
          canvasCtx, landmarks, FACEMESH_LIPS,
          {color: '#E0E0E0'});
    }
  }
  canvasCtx.restore();
}

const faceMesh = new FaceMesh({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.1/${file}`;
}});
faceMesh.onResults(onResultsFaceMesh);

const camera = new Camera(video2, {
  onFrame: async () => {
    await faceMesh.send({image: video2});
  },
  width: 480,
  height: 480
});
camera.start();

new ControlPanel(controlsElement2, {
      selfieMode: true,
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
    .add([
      new StaticText({title: 'MediaPipe Face Mesh'}),
      fpsControl,
      new Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
      new Slider({
        title: 'Max Number of Faces',
        field: 'maxNumFaces',
        range: [1, 4],
        step: 1
      }),
      new Slider({
        title: 'Min Detection Confidence',
        field: 'minDetectionConfidence',
        range: [0, 1],
        step: 0.01
      }),
      new Slider({
        title: 'Min Tracking Confidence',
        field: 'minTrackingConfidence',
        range: [0, 1],
        step: 0.01
      }),
    ])
    .on(options => {
      video2.classList.toggle('selfie', options.selfieMode);
      faceMesh.setOptions(options);
    });




//create a scene
const scene = new THREE.Scene();

//create a camera
const cam = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
cam.position.z = 5;

//create an object
const geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({
  color: 0xfffff,
  wireframe: false,
});
var cube = new THREE.Mesh(geometry, material);

//add the object to scene
scene.add(cube);

// Create a texture from the video element
const videoTexture = new THREE.VideoTexture(video2);

// Create a plane with the video texture as the background
const planeGeometry = new THREE.PlaneGeometry(video2.clientWidth, video2.clientHeight); // You can adjust the size as needed
const planeMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

//Renderer:
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

//animation loop
const animate = () => {
  requestAnimationFrame(animate);
  cube.rotation.y += 0.01;
  cube.rotation.x += 0.02;
  renderer.render(scene, cam);
};

animate();

document.body.appendChild(renderer.domElement);


// var scene, threejs_camera, renderer, light;
// var earthRotY = 0, moonRotY = 0;
// var radY = 0, radZ = -0.3;
// var moonDist = 70;
// var earthRadius = 25;
// var earthMesh, tmpMesh;
// var moonMesh;
// var positionHistory = [];
// var lastPos, diffMove, lastEarthScale = 1;
// var ping = 0;


// function init(width, height) {
//     scene = new THREE.Scene();
//     // Setup cameta with 45 deg field of view and same aspect ratio
//     var aspect = width / height;
//     threejs_camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
//     // Set the camera to 400 units along `z` axis
//     threejs_camera.position.set(0, 0, 400);

//     renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
//     renderer.setSize(width, height);
//     renderer.shadowMap.enabled = true;
//     document.body.appendChild(renderer.domElement);
// }

// function initLight() {
//     light = new THREE.SpotLight(0xffffff);
//     // Position the light slightly to a side to make 
//     // shadows look better.
//     light.position.set(400, 100, 1000);
//     light.castShadow = true;
//     scene.add(light);
// }

// function initEarth() {
//     // Load Earth texture and create material from it
//     var earthTexture = THREE.ImageUtils.loadTexture("./images/earth.jpg");
//     earthTexture.minFilter = THREE.NearestFilter;
//     var earthMaterial = new THREE.MeshLambertMaterial({
//         map: earthTexture,
//     });
//     // Create a sphere 25 units in radius and 16 segments
//     // both horizontally and vertically.
//     var earthGeometry = new THREE.SphereGeometry(earthRadius, 16, 16);
//     earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
//     earthMesh.receiveShadow = true;
//     earthMesh.castShadow = true;
//     // Add Earth to the scene
//     scene.add(earthMesh);
// }

// function initMoon() {
//     var moonTexture = THREE.ImageUtils.loadTexture("./images/moon.jpg");
//     moonTexture.minFilter = THREE.NearestFilter;
//     var moonMaterial = new THREE.MeshLambertMaterial({
//         map: moonTexture,
//     });
//     var moonGeometry =  new THREE.SphereGeometry(earthRadius * 0.273, 10, 10);
//     moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
//     moonMesh.receiveShadow = true;
//     moonMesh.castShadow = true;
//     scene.add(moonMesh);
// }

// function initPlane(videoTexture) {
//     // The plane needs to be large to be sure it'll always intersect
//     var tmpGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
//     tmpGeometry.position = new THREE.Vector3(0, 0, 0);

//     var planeMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

//     tmpMesh = new THREE.Mesh(tmpGeometry, planeMaterial);
//     scene.add(tmpMesh)
// }

// // Update position of objects in the scene
// function update() {

//     earthRotY += 0.007;

//     earthMesh.rotation.y = earthRotY;
//     console.log("Earth rotation")


//     moonRotY += 0.005;
//     radY += 0.03;
//     radZ += 0.0005;

//     // Update Moon position
//     x = lastEarthScale * moonDist * Math.cos(radZ) * Math.sin(radY);
//     y = lastEarthScale * moonDist * Math.sin(radZ) * Math.sin(radY);
//     z = lastEarthScale * moonDist * Math.cos(radY);

//     moonMesh.position.set(x + earthMesh.position.x, y + earthMesh.position.y, z);
//     moonMesh.rotation.y = moonRotY;
// }

// // Redraw entire scene
// function render() {
//     update();
    
//     renderer.setClearColor(0x000000, 0);
//     renderer.render(scene, threejs_camera);
//     // Schedule another frame
//     requestAnimationFrame(render);
// }

// //function onDocumentMouseMove(event) {
// //    // Current mouse position with [0,0] in the center of the document
// //    // and ranging from -1.0 to +1.0 with `y` axis inverted.
// //    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
// //    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
// //}


// var videoTexture;
// var video = out2;

// videoTexture = new THREE.VideoTexture(video);
// videoTexture.minFilter = THREE.LinearFilter;
// init(video.clientWidth, video.clientHeight);
// initPlane(videoTexture);
// initEarth();
// initMoon();
// initLight();

// requestAnimationFrame(render);

// Select the video element
// const videoElement = out2;

// // Set up your Three.js scene, camera, and renderer as before
// const scene = new THREE.Scene();
// const cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
// renderer.setSize(window.innerWidth, window.innerHeight);

// // Create a texture from the video element
// const videoTexture = new THREE.VideoTexture(videoElement);

// // Create a plane with the video texture as the background
// const planeGeometry = new THREE.PlaneGeometry(videoElement.clientWidth, videoElement.clientHeight); // You can adjust the size as needed
// const planeMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

// const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// scene.add(plane);

// //create an object
// const geometry = new THREE.BoxGeometry(1, 1, 1);
// var material = new THREE.MeshBasicMaterial({
//   color: 0xfff000,
//   wireframe: false,
// });
// var cube = new THREE.Mesh(geometry, material);

// //add the object to scene
// scene.add(cube);

// // Set the camera position and add animation or other objects as needed
// cam.position.z = 5;

// // Create an animation loop
// const animate = function () {
//     requestAnimationFrame(animate);

//     // Update any animations or interactions here
//     cube.rotation.y += 0.01
//     cube.rotation.x += 0.02

//     renderer.render(scene, cam);
// };

// animate();
