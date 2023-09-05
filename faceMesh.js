//Start with this command: export NODE_OPTIONS=--openssl-legacy-provider

const video2 = document.getElementsByClassName('input_video2')[0];
const controlsElement2 = document.getElementsByClassName('control2')[0];


//create a scene
const scene = new THREE.Scene();

//width & height calculations:
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

//create a camera
const cam = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
cam.position.z = 190;

//create the nose ring
class NoseRing
{
    constructor()
    {
        this.entity = new THREE.Object3D(); //Only this is to be added to the scene

        this.stone_length = 5;
        this.stone_breadth = 5;
        this.stone_depth = 3;
        this.stone_texture = new THREE.TextureLoader().load('./textures/ruby.jpg');
        this.stone_material = new THREE.MeshBasicMaterial({map: this.stone_texture});
        this.stone_geometry = new THREE.BoxGeometry(this.stone_breadth, this.stone_depth, this.stone_length, 0, 0, 0);
        this.stone = new THREE.Mesh(this.stone_geometry, this.stone_material);

        this.cylinder1_radius = 1
        this.cylinder1_height = 20
        this.cylinder1_texture = new THREE.TextureLoader().load('./textures/gold.jpg');
        this.cylinder1_material = new THREE.MeshBasicMaterial({map: this.cylinder1_texture});
        this.cylinder1_geometry = new THREE.CylinderGeometry(this.cylinder1_radius, this.cylinder1_radius, this.cylinder1_height, 40, 40);
        this.cylinder1 = new THREE.Mesh(this.cylinder1_geometry, this.cylinder1_material);

        this.cylinder2_radius = 1
        this.cylinder2_height = 20
        this.cylinder2_texture = new THREE.TextureLoader().load('./textures/gold.jpg');
        this.cylinder2_material = new THREE.MeshBasicMaterial({map: this.cylinder2_texture});
        this.cylinder2_geometry = new THREE.CylinderGeometry(this.cylinder2_radius, this.cylinder2_radius, this.cylinder2_height, 40, 40);
        this.cylinder2 = new THREE.Mesh(this.cylinder2_geometry, this.cylinder2_material);

        this.cylinder3_radius = 1
        this.cylinder3_height = 20
        this.cylinder3_texture = new THREE.TextureLoader().load('./textures/gold.jpg');
        this.cylinder3_material = new THREE.MeshBasicMaterial({map: this.cylinder3_texture});
        this.cylinder3_geometry = new THREE.CylinderGeometry(this.cylinder3_radius, this.cylinder3_radius, this.cylinder3_height, 40, 40);
        this.cylinder3 = new THREE.Mesh(this.cylinder3_geometry, this.cylinder3_material);

        this.cylinder4_radius = 1
        this.cylinder4_height = 20
        this.cylinder4_texture = new THREE.TextureLoader().load('./textures/gold.jpg');
        this.cylinder4_material = new THREE.MeshBasicMaterial({map: this.cylinder4_texture});
        this.cylinder4_geometry = new THREE.CylinderGeometry(this.cylinder4_radius, this.cylinder4_radius, this.cylinder4_height, 40, 40);
        this.cylinder4 = new THREE.Mesh(this.cylinder4_geometry, this.cylinder4_material);

        

        this.setPosOri();
        this.addDependencies();
    }

    setPosOri()
    {
      this.stone.position.set(0,0,0)
      this.stone.rotation.x = Math.PI/2
      this.stone.scale.set(0.20, 0.20, 0.20)
      this.cylinder1.rotation.z = Math.PI/2
      this.cylinder2.rotation.z = Math.PI/2
      this.cylinder3.rotation.z = Math.PI/2
      this.cylinder4.rotation.z = Math.PI/2

      this.cylinder2.rotation.y = Math.PI/4
      this.cylinder3.rotation.y = -1*Math.PI/4
      this.cylinder4.rotation.y = Math.PI/2
    }

    addDependencies()
    {
        // var arrowPos = new THREE.Vector3( 0,0,0 );
        // this.entity.add( new THREE.ArrowHelper( new THREE.Vector3( 1,0,0 ), arrowPos, 30, 0xFF0000, 20, 10 ) ); //red
        // this.entity.add( new THREE.ArrowHelper( new THREE.Vector3( 0,1,0 ), arrowPos, 30, 0x00FF00, 20, 10 ) ); //green
        // this.entity.add( new THREE.ArrowHelper( new THREE.Vector3( 0,0,1 ), arrowPos, 30, 0x0000FF, 20, 10 ) ); //blue

        this.entity.add(this.stone)
        this.stone.add(this.cylinder1)
        this.stone.add(this.cylinder2)
        this.stone.add(this.cylinder3)
        this.stone.add(this.cylinder4)

    }

}

var nr = new NoseRing();
var nose_ring = nr.entity;


//add the nose ring to the scene
scene.add(nose_ring);
var is_nose_ring_rendered = true

// Create a texture from the video element
const videoTexture = new THREE.VideoTexture(video2);

// Create a plane with the video texture as the background
const planeGeometry = new THREE.PlaneGeometry(window.innerWidth/2, window.innerHeight/2); // You can adjust the size as needed
const planeMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.set(0,0,-3)
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

var min_val = 10000000000
var max_val = -100000000000
function onResultsFaceMesh(results) {
  flag = 0
  //console.log(results.multiFaceLandmarks[0]) //Printing the 468 face mesh landmarks

  document.body.classList.add('loaded');
  fpsControl.tick();

  /*Position the nose ring appropriately for each frame*/
  var width = visibleWidthAtZDepth(0, cam)
  var height = visibleHeightAtZDepth(0, cam)

  var x_avg = 0;
  var y_avg = 0;
  var z_avg = 0;

  landmarks = [281, 363, 440, 420, 456]
  for(let i=0;i<landmarks.length;i++)
  {
    x_avg += results.multiFaceLandmarks[0][landmarks[i]].x;
    y_avg += results.multiFaceLandmarks[0][landmarks[i]].y;
    z_avg += results.multiFaceLandmarks[0][landmarks[i]].z;
  }
  x_avg /= landmarks.length
  y_avg /= landmarks.length
  z_avg /= landmarks.length

  nose_ring.position.x = (x_avg - 0.5)*width*(-1)
  nose_ring.position.y = (y_avg - 0.5)*height*(-1)
  nose_ring.position.z = z_avg
  if(nose_ring.position.z >= max_val){
    max_val = nose_ring.position.z
  }
  if(nose_ring.position.z <= min_val){
    min_val = nose_ring.position.z
  }


  /*Scale the nose ring appropriately for each frame */
  var scale_value = 10*((-0.0062) - nose_ring.position.z)/((-0.0062) - (-0.1593)) + 1
  nose_ring.scale.set(scale_value, scale_value, scale_value)

  /*Orient the nose ring appropriately for each frame */
  var l1 = results.multiFaceLandmarks[0][281]
  var l2 = results.multiFaceLandmarks[0][363]
  var l3 = results.multiFaceLandmarks[0][275]

  var v1 = new THREE.Vector3(0, 0, 0)
  var v2 = new THREE.Vector3(0, 0, 0)

  v1.x = l2.x - l1.x
  v1.y = l2.y - l1.y
  v1.z = l2.z - l1.z
  v2.x = l3.x - l1.x
  v2.y = l3.y - l1.y
  v2.z = l3.z - l1.z

  var cross_v = new THREE.Vector3(0, 0, 0)
  cross_v.crossVectors(v1, v2)
  var len_cross_v = cross_v.length()
  cross_v.x = cross_v.x/len_cross_v
  cross_v.y = cross_v.y/len_cross_v
  cross_v.z = cross_v.z/len_cross_v

  // nose_ring.rotation.x = Math.acos(cross_v.x) 
  // nose_ring.rotation.y = Math.acos(cross_v.y)
  // nose_ring.rotation.z = Math.acos(cross_v.z)

  var init_normal = new THREE.Vector3(0,0,1)
  var final_normal = cross_v
  var axis = new THREE.Vector3(0, 0, 0)
  axis.crossVectors(init_normal, final_normal)
  var norm = axis.length()
  axis.x = axis.x/norm
  axis.y = axis.y/norm
  axis.z = axis.z/norm

  var angle = Math.acos(init_normal.dot(final_normal))

  nose_ring.rotation.set(0,0,0)
  nose_ring.rotateOnAxis(axis, angle)

  /*Hiding the nose ring when needed*/
  //console.log(angle)
  if(Math.abs(angle) > Math.PI/2 && is_nose_ring_rendered)
  {
    scene.remove(nose_ring)
    is_nose_ring_rendered = false
  }
  if(Math.abs(angle) <= Math.PI/2 && !is_nose_ring_rendered)
  {
    scene.add(nose_ring)
    is_nose_ring_rendered = true
  }

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