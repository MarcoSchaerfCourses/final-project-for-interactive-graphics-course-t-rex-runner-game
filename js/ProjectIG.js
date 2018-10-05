//Variables

var scene,
  camera, camera2, fieldOfView, aspectRatio, nearPlane, farPlane,
  gobalLight, shadowLight, backLight,
  renderer,
  container,
  controls,
  clock;
var vista = true;
var delta = 0;
var floorRadius = 1000;
var speed = 1;
var distance = 0;
var level = 1;
var levelInterval;
var levelUpdateFreq = 5000;
var initSpeed = 6;
var maxSpeed = 40;
var floorRotation = 0;
var collisionCactus = 10;
var gameStatus = "play";;
var malusClearColor = 0xb44b39;
var malusClearAlpha = 0;
var PI = Math.PI;

var obstaclesNumber = 30;
var obstacles = [obstaclesNumber];
var old = [obstaclesNumber];
var angle = Math.PI/3;

var dino;
var up = true;
var fly = 0;

var HEIGHT, WIDTH, windowHalfX, windowHalfY,
  mousePos = {
    x: 0,
    y: 0
  };


// Materials

var blackMat = new THREE.MeshPhongMaterial({
    color: 0x100707,
    shading:THREE.FlatShading,
});

var whiteMat = new THREE.MeshPhongMaterial({
  color: 0xa49789,
  shading:THREE.FlatShading,
});

var greenMat = new THREE.MeshPhongMaterial({
  color: 0x347C2C,
  shading:THREE.FlatShading
});

var darkGreenMat = new THREE.MeshPhongMaterial({
    color: 0x254117,
    shininess:0,
    shading:THREE.FlatShading,
});


//Init ThreeJS, lights, screen and mouse events

var fieldDist = document.getElementById("dist");
var fieldDistance = document.getElementById("distValue");
var fieldGameOver = document.getElementById("gameoverInstructions");
var fieldInstruction = document.getElementById("instructions");
var fieldWelcomeMessage = document.getElementById("WelcomeMessage");
var fieldButtonStart = document.getElementById("Start");
var fieldPicture = document.getElementById("picture");
var fieldRestart = document.getElementById("Restart");


function initScreenAnd3D() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  windowHalfX = WIDTH / 2;
  windowHalfY = HEIGHT / 2;

  scene = new THREE.Scene();

  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 50;
  nearPlane = 1;
  farPlane = 5000;

  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );
  camera.position.x = 0;
  camera.position.z = 260;
  camera.position.y = 30;
  camera.lookAt(new THREE.Vector3(0, 30, 0));

  camera2 = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );
  camera2.position.x = -160;
  camera2.position.z = 0;
  camera2.position.y = 80;
  camera2.lookAt(new THREE.Vector3(-50, 30, 0));

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor( malusClearColor, malusClearAlpha);
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;

  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);
  document.body.onkeyup = function(e){
    if (e.keyCode == 32){
      handleMouseDown();
    }
    else if (e.keyCode == 67){
      vista=!vista;
    }
  }
  clock = new THREE.Clock();
}


function handleMouseDown(event){
  if (gameStatus == "play") dino.status="jumping";
}


function handleWindowResize() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  windowHalfX = WIDTH / 2;
  windowHalfY = HEIGHT / 2;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}


function createLights() {

  globalLight = new THREE.AmbientLight(0xffffff, .9);

  shadowLight = new THREE.DirectionalLight(0xffffff, 1);
  shadowLight.position.set(-30, 40, 20);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 2000;
  shadowLight.shadow.mapSize.width = shadowLight.shadow.mapSize.height = 2048;

  scene.add(globalLight);
  scene.add(shadowLight);
}


function createFloor() {

  floorShadow = new THREE.Mesh(new THREE.SphereGeometry(floorRadius, 100, 100), new THREE.MeshPhongMaterial({
    color: 0x7abf8e,
    specular:0x000000,
    shininess:1,
    transparent:true,
    opacity:.5
  }));
  floorShadow.rotation.x = -Math.PI / 2;
  floorShadow.receiveShadow = true;

  floor = new THREE.Group();
  floor.position.y = -floorRadius;
  floor.rotation.x = -Math.PI / 2;

  floorGrass = new THREE.Mesh(new THREE.SphereGeometry(floorRadius-0.5, 100, 100), new THREE.MeshBasicMaterial({color: 0x7abf4e}));
  floorGrass.receiveShadow = false;

  floor.add(floorShadow);
  floor.add(floorGrass);

  scene.add(floor);
}


//Creation of hierarchical models and their functions

Dino = function() {
  this.status = "running";
  this.runningCycle = 0;
  this.mesh = new THREE.Group();
  this.body = new THREE.Group();
  var segments = 8;

  var torsoGeom = new THREE.CubeGeometry(15,20,15,8,8,8);
  torsoGeom.faces.forEach( (face, idx) => {
    console.log((idx + (Math.floor(idx/(segments*2)) % 2 * 2)) % 4);
    if ( (idx + (Math.floor(idx/(segments*2)) % 2 * 2)) % 4 < 2 ) {
      face.color.setRGB(0,1,1);
    }
  })

  var material = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

  this.torso = new THREE.Mesh(torsoGeom, material);
  this.torso.rotation.x = 0.33;

  var headGeom = new THREE.CubeGeometry(20,20,40, 1);
  headGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,20));
  this.head = new THREE.Mesh(headGeom, darkGreenMat);
  this.head.position.z = -3;
  this.head.position.y = 19;
  this.head.rotation.x = - 0.33;

  var mouthGeom = new THREE.CubeGeometry(10,4,20, 1);
  mouthGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,-2,10));
  this.mouth = new THREE.Mesh(mouthGeom, darkGreenMat);
  this.mouth.position.y = -8;
  this.mouth.rotation.x = .4;
  this.mouth.position.z = 4;

  var toothGeom = new THREE.CubeGeometry(2,2,1,1);

  toothGeom.vertices[1].x-=1;
  toothGeom.vertices[4].x+=1;
  toothGeom.vertices[5].x+=1;
  toothGeom.vertices[0].x-=1;

  for(var i=0; i<3; i++){
    var toothf = new THREE.Mesh(toothGeom, whiteMat);
    toothf.position.x = -2.8 + i*2.5;
    toothf.position.y = 1;
    toothf.position.z = 19;

    var toothl = new THREE.Mesh(toothGeom, whiteMat);
    toothl.rotation.y = Math.PI/2;
    toothl.position.z = 12 + i*2.5;
    toothl.position.y = 1;
    toothl.position.x = 4;

    var toothr = toothl.clone();
    toothl.position.x = -4;

    this.mouth.add(toothf);
    this.mouth.add(toothl);
    this.mouth.add(toothr);
  }

  this.head.add(this.mouth);

  var eyeGeom = new THREE.CubeGeometry(2,3,3);

  this.eyeL = new THREE.Mesh(eyeGeom, whiteMat);
  this.eyeL.position.x = 10;
  this.eyeL.position.z = 5;
  this.eyeL.position.y = 5;
  this.eyeL.castShadow = true;
  this.head.add(this.eyeL);

  var irisGeom = new THREE.CubeGeometry(.6,1,1);

  this.iris = new THREE.Mesh(irisGeom, blackMat);
  this.iris.position.x = 1.2;
  this.iris.position.y = -1;
  this.iris.position.z = 1;
  this.eyeL.add(this.iris);

  this.eyeR = this.eyeL.clone();
  this.eyeR.children[0].position.x = -this.iris.position.x;
  this.eyeR.position.x = -this.eyeL.position.x;
  this.head.add(this.eyeR);

  var eyeGeom = new THREE.CubeGeometry(2,4,4);

  var tailGeom = new THREE.CylinderGeometry(0, 5, 25, 4, 1);
  tailGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,10,0));
  tailGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  tailGeom.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));

  this.tail = new THREE.Mesh(tailGeom, darkGreenMat);
  this.tail.position.z = -6;
  this.tail.position.y = -8;
  this.tail.rotation.x = -0.66;
  this.torso.add(this.tail);

  var pawGeom = new THREE.CylinderGeometry(1.5,0,10);
  pawGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,-5,0));
  this.pawFL = new THREE.Mesh(pawGeom, darkGreenMat);
  this.pawFL.position.y = 3.5;
  this.pawFL.position.z = 5.5;
  this.pawFL.position.x = 5.5;
  this.pawFL.rotation.x = -1.3;
  this.torso.add(this.pawFL);

  this.pawFR = this.pawFL.clone();
  this.pawFR.position.x = - this.pawFL.position.x;
  this.torso.add(this.pawFR);

  var UpperPawGeom = new THREE.CylinderGeometry(6,2,12);
  UpperPawGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,-5,-10));
  this.pawBUR = new THREE.Mesh(UpperPawGeom, darkGreenMat);
  this.pawBUR.position.y = 0.5;
  this.pawBUR.position.z = 8.5;
  this.pawBUR.position.x = 5.5;
  this.pawBUR.rotation.x = -0.66;
  this.torso.add(this.pawBUR);

  this.pawBUL = this.pawBUR.clone();
  this.pawBUL.position.x =  - this.pawBUR.position.x;
  this.torso.add(this.pawBUL);

  var LowerPawGeom = new THREE.CylinderGeometry(2,0,10);
  LowerPawGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,-5,0));
  this.pawBLR = new THREE.Mesh(LowerPawGeom, darkGreenMat);
  this.pawBLR.position.y = -10.5;
  this.pawBLR.position.z = -10;
  this.pawBLR.position.x = 0.5;
  this.pawBLR.rotation.x = 1;
  this.pawBUR.add(this.pawBLR);

  this.pawBLL = this.pawBLR.clone();
  this.pawBUL.add(this.pawBLL);

  var Foot = new THREE.BoxGeometry(5,7,3);
  this.footR = new THREE.Mesh(Foot, darkGreenMat);
  this.footR.position.y = -8;
  this.footR.position.z = 3;
  this.footR.position.x = 0;
  this.footR.rotation.x = 190;
  this.pawBLR.add(this.footR);

  this.footL = this.footR.clone();
  this.pawBLL.add(this.footL);

  this.mesh.add(this.body);
  this.torso.add(this.head);
  this.body.add(this.torso);

  this.torso.castShadow = true;
  this.head.castShadow = true;
  this.pawFL.castShadow = true;
  this.pawFR.castShadow = true;
  this.pawBUL.castShadow = true;
  this.pawBUR.castShadow = true;

  this.body.rotation.y = 0;
  this.body.position.y = 30;

  this.body.traverse(function(object) {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
}


Dino.prototype.run = function(){

  this.status = "running";
  var s = Math.min(speed,maxSpeed);
  this.runningCycle += delta * s * .7;
  this.runningCycle = this.runningCycle % (Math.PI*2);

  var t = this.runningCycle;
  var amp = 2;
  var disp = .2;

  this.body.rotation.x = .2 + Math.sin(t - Math.PI/2)*amp*.1;
  this.pawBUL.rotation.x = - 1 + Math.sin(t+2)*Math.PI/10;
  this.pawBLL.rotation.x = 0.7 + Math.sin(t+2)*Math.PI/4;
  this.pawBUR.rotation.x = - 1 + Math.sin(t+6)*Math.PI/10;
  this.pawBLR.rotation.x = 0.7 + Math.sin(t+6)*Math.PI/4;
  this.footR.rotation.z = Math.sin(t + Math.PI/2)*amp*.1;
  this.footL.rotation.z = Math.sin(t + Math.PI/2)*amp*.1;
  this.head.rotation.x = -0.5 + Math.sin(t + Math.PI/2)*amp*.1;
  this.mouth.rotation.x = .2 + Math.sin(t+Math.PI+.3)*.4;
}


Dino.prototype.jump = function(){

  var _this = this;
  var jumpHeight = 35;
  var totalSpeed = speed/2;

  if(up && this.mesh.position.y < jumpHeight){
    this.mesh.position.y += totalSpeed;
    return;
  }

  else if (fly <= 10){
    fly += speed/8;
    return;
  }

  else if (this.mesh.position.y >= jumpHeight&&up){
    up = false;
    return;
  }

  else if (this.mesh.position.y >- 3){
    this.mesh.position.y -= totalSpeed;
    if (this.mesh.position.y <- 3){
      this.mesh.position.y =- 3;
    }
    return;
  }

  up = true;
  fly = 0;
  this.status = "running";
}


function createDino() {

  dino = new Dino();
  dino.mesh.scale.set(0.5,0.5,0.5);
  dino.mesh.rotation.y = Math.PI/2 + 0.3;
  dino.mesh.position.x = -70;
  dino.mesh.position.y = -3;
  scene.add(dino.mesh);
}



Cactus = function() {

  this.mesh = new THREE.Group();

  var bodyGeom = new THREE.CubeGeometry(6, 36,6,1);
  this.body = new THREE.Mesh(bodyGeom, greenMat);

  var cactusArmHoriz = new THREE.BoxGeometry(4,4,5);
  this.armHoriz = new THREE.Mesh(cactusArmHoriz, greenMat);
  this.armHoriz.position.x = this.body.position.x - 5.5;
  this.armHoriz.position.y = 5;
  this.body.add(this.armHoriz);

  var cactusArmVertic = new THREE.BoxGeometry(3,7,5);
  this.armVertic = new THREE.Mesh(cactusArmVertic, greenMat);
  this.armVertic.position.x = this.armHoriz.position.x + 2;
  this.armVertic.position.y = 1.5;
  this.armHoriz.add(this.armVertic);

  var spikeGeom = new THREE.CubeGeometry(.5,2,.5,1);
  spikeGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,1,0));
  for (var i=0; i<9; i++){
    var row = (i%3);
    var col = Math.floor(i/3);
    var sb = new THREE.Mesh(spikeGeom, whiteMat);
    sb.rotation.x =-Math.PI/2 + (Math.PI/12*row) -.5 +  Math.random();
    sb.position.z = -3;
    sb.position.y = -2 + row*10;
    sb.position.x = -2 + col*2;
    this.body.add(sb);

    var sf = new THREE.Mesh(spikeGeom, whiteMat);
    sf.rotation.x =-Math.PI/2 + (Math.PI/12*row) -.5 +  Math.random();
    sf.position.z = 5;
    sf.position.y = -2 + row*10;
    sf.position.x = -2 + col*2;
    this.body.add(sf);

    var st = new THREE.Mesh(spikeGeom, whiteMat);
    st.position.y = 17;
    st.position.x = -2 + row*2;
    st.position.z = -2 + col*2;
    st.rotation.z = Math.PI/6 - (Math.PI/6*row) -.5 +  Math.random();
    this.body.add(st);

    var sr = new THREE.Mesh(spikeGeom, whiteMat);
    sr.position.x = 3;
    sr.position.y = -2 + row*10;
    sr.position.z = -2 + col*2;
    sr.rotation.z = -Math.PI/2 + (Math.PI/12*row) -.5 +  Math.random();
    this.body.add(sr);

    var sl = new THREE.Mesh(spikeGeom, whiteMat);
    sl.position.x = -3;
    sl.position.y = -2 + row*10;
    sl.position.z = -2 + col*2;
    sl.rotation.z = Math.PI/2  - (Math.PI/12*row) -.5 +  Math.random();;
    this.body.add(sl);
  }

  var cactusArmHoriz2 = new THREE.BoxGeometry(5,4,5);
  this.armHoriz2 = new THREE.Mesh(cactusArmHoriz2, greenMat);
  this.armHoriz2.position.x = this.body.position.x + 5.5;
  this.armHoriz2.position.y = 13;
  this.body.add(this.armHoriz2);

  var cactusArmVertic2 = new THREE.BoxGeometry(3,7,5);
  this.armVertic2 = new THREE.Mesh(cactusArmVertic2, greenMat);
  this.armVertic2.position.x = this.armHoriz2.position.x - 1.5;
  this.armVertic2.position.y = 1.5;
  this.armHoriz2.add(this.armVertic2);

  this.mesh.add(this.body);

  this.mesh.traverse(function(object) {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
}


CoupleCactus = function() {

  this.mesh = new THREE.Group();

  var bodyGeom = new THREE.CubeGeometry(6, 36,6,1);
  this.body = new THREE.Mesh(bodyGeom, greenMat);

  var cactusArmHoriz = new THREE.BoxGeometry(4,4,5);
  this.armHoriz = new THREE.Mesh(cactusArmHoriz, greenMat);
  this.armHoriz.position.x = this.body.position.x - 5;
  this.armHoriz.position.y = 5;
  this.body.add(this.armHoriz);

  var cactusArmVertic = new THREE.BoxGeometry(3,7,5);
  this.armVertic = new THREE.Mesh(cactusArmVertic, greenMat);
  this.armVertic.position.x = this.armHoriz.position.x + 2;
  this.armVertic.position.y = 1.5;
  this.armHoriz.add(this.armVertic);

  var spikeGeom = new THREE.CubeGeometry(.5,2,.5,1);
  spikeGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,1,0));
  for (var i=0; i<9; i++){
    var row = (i%3);
    var col = Math.floor(i/3);
    var sb = new THREE.Mesh(spikeGeom, whiteMat);
    sb.rotation.x =-Math.PI/2 + (Math.PI/12*row) -.5 +  Math.random();
    sb.position.z = -3;
    sb.position.y = -2 + row*10;
    sb.position.x = -2 + col*2;
    this.body.add(sb);

    var sf = new THREE.Mesh(spikeGeom, whiteMat);
    sf.rotation.x =-Math.PI/2 + (Math.PI/12*row) -.5 +  Math.random();
    sf.position.z = 5;
    sf.position.y = -2 + row*10;
    sf.position.x = -2 + col*2;
    this.body.add(sf);

    var st = new THREE.Mesh(spikeGeom, whiteMat);
    st.position.y = 17;
    st.position.x = -2 + row*2;
    st.position.z = -2 + col*2;
    st.rotation.z = Math.PI/6 - (Math.PI/6*row) -.5 +  Math.random();
    this.body.add(st);

    var sr = new THREE.Mesh(spikeGeom, whiteMat);
    sr.position.x = 3;
    sr.position.y = -2 + row*10;
    sr.position.z = -2 + col*2;
    sr.rotation.z = -Math.PI/2 + (Math.PI/12*row) -.5 +  Math.random();
    this.body.add(sr);

    var sl = new THREE.Mesh(spikeGeom, whiteMat);
    sl.position.x = -3;
    sl.position.y = -2 + row*10;
    sl.position.z = -2 + col*2;
    sl.rotation.z = Math.PI/2  - (Math.PI/12*row) -.5 +  Math.random();;
    this.body.add(sl);
  }

  this.mesh.add(this.body);

  var bodyGeom2 = new THREE.CubeGeometry(6, 36,6,1);
  this.body2 = new THREE.Mesh(bodyGeom2, greenMat);
  this.body2.position.x = this.body.position.x + 8;
  this.body.add(this.body2);

  var cactusArmHoriz2 = new THREE.BoxGeometry(5,4,5);
  this.armHoriz2 = new THREE.Mesh(cactusArmHoriz2, greenMat);
  this.armHoriz2.position.x = this.body2.position.x - 3;
  this.armHoriz2.position.y = 13;
  this.body2.add(this.armHoriz2);

  var cactusArmVertic2 = new THREE.BoxGeometry(3,7,5);
  this.armVertic2 = new THREE.Mesh(cactusArmVertic2, greenMat);
  this.armVertic2.position.x = this.armHoriz2.position.x - 1.5;
  this.armVertic2.position.y = 1.5;
  this.armHoriz2.add(this.armVertic2);

  var spikeGeom2 = new THREE.CubeGeometry(.5,2,.5,1);
  spikeGeom2.applyMatrix(new THREE.Matrix4().makeTranslation(0,1,0));
  for (var i=0; i<9; i++){
    var row = (i%3);
    var col = Math.floor(i/3);
    var sb = new THREE.Mesh(spikeGeom2, whiteMat);
    sb.rotation.x =-Math.PI/2 + (Math.PI/12*row) -.5 +  Math.random();
    sb.position.z = -3;
    sb.position.y = -2 + row*10;
    sb.position.x = -2 + col*2;
    this.body2.add(sb);

    var sf = new THREE.Mesh(spikeGeom2, whiteMat);
    sf.rotation.x =-Math.PI/2 + (Math.PI/12*row) -.5 +  Math.random();
    sf.position.z = 5;
    sf.position.y = -2 + row*10;
    sf.position.x = -2 + col*2;
    this.body2.add(sf);

    var st = new THREE.Mesh(spikeGeom2, whiteMat);
    st.position.y = 17;
    st.position.x = -2 + row*2;
    st.position.z = -2 + col*2;
    st.rotation.z = Math.PI/6 - (Math.PI/6*row) -.5 +  Math.random();
    this.body2.add(st);

    var sr = new THREE.Mesh(spikeGeom2, whiteMat);
    sr.position.x = 3;
    sr.position.y = -2 + row*10;
    sr.position.z = -2 + col*2;
    sr.rotation.z = -Math.PI/2 + (Math.PI/12*row) -.5 +  Math.random();
    this.body2.add(sr);

    var sl = new THREE.Mesh(spikeGeom2, whiteMat);
    sl.position.x = -3;
    sl.position.y = -2 + row*10;
    sl.position.z = -2 + col*2;
    sl.rotation.z = Math.PI/2  - (Math.PI/12*row) -.5 +  Math.random();;
    this.body2.add(sl);
  }

  this.mesh.traverse(function(object) {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
}


Pterodactyl = function() {

  this.runningCycle = 0;
  this.mesh = new THREE.Group();
  this.body = new THREE.Group();

  var torsoGeom = new THREE.CubeGeometry(6, 6, 12, 1);
  this.torso = new THREE.Mesh(torsoGeom, darkGreenMat);

  var neckGeom = new THREE.CylinderGeometry(1.5, 1.5, 3);
  this.neck = new THREE.Mesh(neckGeom, darkGreenMat);
  this.neck.position.z = -7.5;
  this.neck.rotation.x = -1.3;
  this.neck.position.y = 3;
  this.torso.add(this.neck);

  var headGeom = new THREE.CubeGeometry(8, 2, 9, 1);
  this.head = new THREE.Mesh(headGeom, darkGreenMat);
  this.head.rotation.x = -0.5;
  this.head.position.z = 0.5;
  this.head.position.y = 2.5;
  this.neck.add(this.head);

  var eyeGeom = new THREE.CubeGeometry(1,2,2);
  this.eyeL = new THREE.Mesh(eyeGeom, whiteMat);
  this.eyeL.position.x = 4.5;
  this.eyeL.position.z = 2;
  this.eyeL.position.y = 0.5;
  this.eyeL.castShadow = true;
  this.head.add(this.eyeL);

  var irisGeom = new THREE.CubeGeometry(.6,1,1);

  this.iris = new THREE.Mesh(irisGeom, blackMat);
  this.iris.position.x = 0.8;
  this.iris.position.y = 0.5;
  this.iris.position.z = -0.5;
  this.eyeL.add(this.iris);

  this.eyeR = this.eyeL.clone();
  this.eyeR.children[0].position.x = -this.iris.position.x;
  this.eyeR.position.x = -this.eyeL.position.x;
  this.head.add(this.eyeR);

  var growthGeom = new THREE.ConeGeometry(1.6, 5);
  this.growth = new THREE.Mesh(growthGeom, darkGreenMat);
  this.growth.rotation.x = 2;
  this.growth.position.y = -1.5;
  this.growth.position.z = 6.5;
  this.head.add(this.growth);

  var mouthGeom = new THREE.ConeGeometry(5, 9);
  this.mouth = new THREE.Mesh(mouthGeom, darkGreenMat);
  this.mouth.position.y = 5.5;
  this.head.add(this.mouth);

  var pawGeom = new THREE.CylinderGeometry(1.5,0,7.5);
  this.pawFL = new THREE.Mesh(pawGeom, darkGreenMat);
  this.pawFL.position.y = -3;
  this.pawFL.position.z = 9.5;
  this.pawFL.position.x = 4.5;
  this.pawFL.rotation.x = -1.2;
  this.torso.add(this.pawFL);

  this.pawFR = this.pawFL.clone();
  this.pawFR.position.x = - this.pawFL.position.x;
  this.torso.add(this.pawFR);

  var wingGeomR = new THREE.CylinderGeometry(4.5,0,18);
  wingGeomR.applyMatrix(new THREE.Matrix4().makeTranslation(4.5,0,0));
  wingGeomR.applyMatrix(new THREE.Matrix4().makeRotationZ(90));
  this.wingR = new THREE.Mesh(wingGeomR, darkGreenMat);
  this.wingR.position.y = 3;
  this.wingR.position.z = 0;
  this.wingR.position.x = 11;
  this.torso.add(this.wingR);

  var wingGeomL = new THREE.CylinderGeometry(4.5,0,18);
  wingGeomL.applyMatrix(new THREE.Matrix4().makeTranslation(-4.5,0,0));
  wingGeomL.applyMatrix(new THREE.Matrix4().makeRotationZ(-90));
  this.wingL = new THREE.Mesh(wingGeomL, darkGreenMat);
  this.wingL.position.y = 3;
  this.wingL.position.z = 0;
  this.wingL.position.x = -11;
  this.torso.add(this.wingL);

  this.body.add(this.torso);
  this.body.rotation.y = 1.5;
  this.body.position.y = 30;
  this.mesh.add(this.body);
  this.mesh.traverse(function(object) {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
}


Pterodactyl.prototype.fly = function(){

  var s = Math.min(speed,maxSpeed);
  this.runningCycle += delta * s * .7;
  this.runningCycle = this.runningCycle % (Math.PI*2);

  var t = this.runningCycle;
  var amp = 2;
  var disp = .2;

  this.head.rotation.x = -.5 + Math.sin(t+2)*Math.PI/10;
  this.wingL.rotation.x = 2 + Math.sin(t - Math.PI/2)*Math.PI/6*amp;
  this.wingR.rotation.x = 2 + Math.sin(t - Math.PI/2)*Math.PI/6*amp;
}


Obstacle = function(){

  this.angle=0;
  this.position = 0;
  this.type = randomNumber();
  this.trigger = false;
  this.obj = randomObstacle(this.type)
}


function randomObstacle(num){
  if (num == 3){
    return new Pterodactyl;
  }
  else if (num == 2){
    return new CoupleCactus;
  }
  else{
    return new Cactus;
  }
}


function randomNumber(){
  var rnd = parseInt(Math.random()*1000);
  if ((rnd % 3) == 0){
    return 3;
  }
  else if ((rnd % 2) == 0){
    return 2;
  }
  else{
    return 1;
  }
}


function createObstacles(){

  for(var i=0; i<obstaclesNumber; i++){
    obstacles[i] = new Obstacle();
    obstacles[i].angle = i * Math.PI/15 + Math.random() * Math.PI/90;
    scene.add(obstacles[i].obj.mesh);
  }
}


//Management of the game and update of the variables

function loop(){

  delta = clock.getDelta();
  updateFloorRotation();
  if (gameStatus == "play"){
    if (dino.status == "running"){
      dino.run();
    }
    if (dino.status == "jumping"){
      dino.jump();
    }
    pterodactylFly();
    updateDistance();
    updateObstaclesPosition();
    checkCollision();
  }
  render();
  requestAnimationFrame(loop);
}


function updateFloorRotation(){

  floorRotation += delta*.02 * speed;
  floorRotation = floorRotation%(Math.PI*2);
  floorRotation = floorRotation;
  floor.rotation.z = floorRotation;
}

function pterodactylFly(){

  for(var i=0; i<obstaclesNumber; i++){
    if(obstacles[i].type == 3){
      obstacles[i].obj.fly();
    }
  }
}

function updateDistance(){

  distance += delta*speed;
  var d = distance/2;
  fieldDistance.innerHTML = Math.floor(d);
}

function updateObstaclesPosition(){

  for(var i=0; i<obstaclesNumber; i++){
    old[i] = obstacles[i].position;
    obstacles[i].position = (floorRotation + obstacles[i].angle)%(Math.PI*2);
    if(obstacles[i].position > Math.PI/4 && obstacles[i].position < Math.PI/2){
      obstacles[i].trigger = false;
    }
    if(obstacles[i].position < old[i] && obstacles[i].trigger == false){
      scene.remove(obstacles[i].obj.mesh);
      obstacles[i].type = randomNumber();
      obstacles[i].obj = randomObstacle(obstacles[i].type);
      obstacles[i].angle = i * Math.PI/15 + Math.random() * Math.PI/90;
      obstacles[i].trigger = true;
      obstacles[i].obj.mesh.rotation.z = obstacles[i].position - Math.PI/2;
      obstacles[i].obj.mesh.position.y = -floorRadius + Math.sin(obstacles[i].position) * (floorRadius + 15);
      obstacles[i].obj.mesh.position.x = Math.cos(obstacles[i].position) * (floorRadius + 15);
      scene.add(obstacles[i].obj.mesh);
    }
    else{
      obstacles[i].obj.mesh.rotation.z = obstacles[i].position - Math.PI/2;
      obstacles[i].obj.mesh.position.y = -floorRadius + Math.sin(obstacles[i].position) * (floorRadius + 15);
      obstacles[i].obj.mesh.position.x = Math.cos(obstacles[i].position) * (floorRadius + 15);
    }
  }
}

function checkCollision(){

  var dm;
  for(var i=0; i<obstaclesNumber; i++){
    dm = dino.mesh.position.clone().sub(obstacles[i].obj.mesh.position.clone());
    if(obstacles[i].type==3){
      dm.x+=5;
      if(dm.length() < 13){
        gameOver();
      }
    }
    if(obstacles[i].type<=2){
      dm.y+=5;
      if(dm.length() < 15){
        gameOver();
      }
    }
  }
}

function gameOver(){

  fieldGameOver.className = "show";
  fieldRestart.className = "show";
  gameStatus = "gameOver";
  document.addEventListener('mousedown', resetGame);
}

function render(){

  if(vista){
    dino.body.rotation.y = 0;
    renderer.render(scene, camera);
  }
  else{
    dino.body.rotation.y = -0.3;
    renderer.render(scene, camera2);
  }
}


window.addEventListener('load', init, false);

function init(event){

  fieldButtonStart.onclick = function(){
    fieldDist.className = "show";
    fieldInstruction.className = "Notshow";
    fieldWelcomeMessage.className = "Notshow";
    fieldButtonStart.className = "Notshow";
    fieldPicture.className = "Notshow";
    fieldButtonStart.disabled = true;
    StartGame();
  };
}


function StartGame(){

  initScreenAnd3D();
  createLights();
  createFloor()
  createDino();
  createObstacles();
  resetGame();
  loop();
}


function resetGame(){

  fieldGameOver.className = "Notshow";
  fieldRestart.className = "Notshow";
  scene.add(dino.mesh);
  dino.mesh.rotation.y = Math.PI/2 + 0.3;
  dino.mesh.position.x = -70;
  dino.mesh.position.y = -3;

  speed = initSpeed;
  level = 0;
  distance = 0;
  gameStatus = "play";
  dino.status = "running";
  updateLevel();
  levelInterval = setInterval(updateLevel, levelUpdateFreq);
  console.log("resetGame");
  document.removeEventListener('mousedown', resetGame);
}

function updateLevel(){

  if (speed >= maxSpeed) return;
  level++;
  speed += 0.5;
}
