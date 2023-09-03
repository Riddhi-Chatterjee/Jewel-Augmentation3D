//Start with this command: export NODE_OPTIONS=--openssl-legacy-provider

const video2 = document.getElementsByClassName('input_video2')[0];
const controlsElement2 = document.getElementsByClassName('control2')[0];


//create a scene
const scene = new THREE.Scene();

//create a camera

const visibleHeightAtZDepth = ( depth, camera ) => {
  // compensate for cameras not positioned at z=0
  const cameraOffset = camera.position.z;
  if ( depth < cameraOffset ) depth -= cameraOffset;
  else depth += cameraOffset;

  // vertical fov in radians
  const vFOV = camera.fov * Math.PI / 180; 

  // Math.abs to ensure the result is always positive
  return 2 * Math.tan( vFOV / 2 ) * Math.abs( depth );
};

const visibleWidthAtZDepth = ( depth, camera ) => {
  const height = visibleHeightAtZDepth( depth, camera );
  return height * camera.aspect;
};

const cam = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
cam.position.z = 190;

//create the nose ring
const geometry = new THREE.BoxGeometry(10, 10, 10);
var material = new THREE.MeshBasicMaterial({
  color: 0xfffff,
  wireframe: false,
});
var nose_ring = new THREE.Mesh(geometry, material);

//add some texture to the nose ring ...TODO


//add the nose ring to the scene
scene.add(nose_ring);

// Create a texture from the video element
const videoTexture = new THREE.VideoTexture(video2);

// Create a plane with the video texture as the background
const planeGeometry = new THREE.PlaneGeometry(window.innerWidth/2, window.innerHeight/2); // You can adjust the size as needed
const planeMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

//Renderer:
const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
renderer.setSize(window.innerWidth/2, window.innerHeight/2);
renderer.shadowMap.enabled = true;

//animation loop
const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, cam);
};

animate();

document.body.appendChild(renderer.domElement);


const fpsControl = new FPS();
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};

function onResultsFaceMesh(results) {

  //console.log(results.multiFaceLandmarks[0]) //Printing the 468 face mesh landmarks

  document.body.classList.add('loaded');
  fpsControl.tick();

  /*Position the nose ring appropriately for each frame*/
  var width = visibleWidthAtZDepth(0, cam)
  var height = visibleHeightAtZDepth(0, cam)
  // console.log("width: "+width)
  // console.log("height: "+height)
  // console.log("window_width: "+window.innerWidth)
  // console.log("window_height: "+window.innerHeight)
  
  var x_avg = 0;
  var y_avg = 0;

  landmarks = [281, 363, 440, 420, 456]
  for(let i=0;i<landmarks.length;i++)
  {
    x_avg += results.multiFaceLandmarks[0][landmarks[i]].x;
    y_avg += results.multiFaceLandmarks[0][landmarks[i]].y;
  }
  x_avg /= landmarks.length
  y_avg /= landmarks.length

  nose_ring.position.x = (x_avg - 0.5)*width*(-1)
  nose_ring.position.y = (y_avg - 0.5)*height*(-1)
  nose_ring.position.z = results.multiFaceLandmarks[0][0].z


  // console.log("x: "+nose_ring.position.x)
  // console.log("y: "+nose_ring.position.y)
  // console.log("z: "+nose_ring.position.z)


  /*Scale the nose ring appropriately for each frame ...TODO */
  

  /*Orient the nose ring appropriately for each frame ...TODO */


}

const faceMesh = new FaceMesh({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.1/${file}`;
}});
faceMesh.onResults(onResultsFaceMesh);

const camera = new Camera(video2, {
  onFrame: async () => {
    await faceMesh.send({image: video2});
  },
  width: window.innerWidth/2,
  height: window.innerHeight/2
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


