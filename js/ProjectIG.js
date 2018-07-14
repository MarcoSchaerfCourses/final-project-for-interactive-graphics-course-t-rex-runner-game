//THREEJS RELATED VARIABLES

var scene,
  camera, fieldOfView, aspectRatio, nearPlane, farPlane,
  gobalLight, shadowLight, backLight,
  renderer,
  container,
  controls,
  clock;
var delta = 0;
var floorRadius = 1000;
var speed = 0.5;
var distance = 0;
var level = 1;
var levelInterval;
var levelUpdateFreq = 5000;
var initSpeed = 5;
var maxSpeed = 48;
var monsterPos = .65;
var monsterPosTarget = .65;
var floorRotation = 0;
var collisionCactus = 10;
var collisionBonus = 20;
var gameStatus = "play";
var cameraPosGame = 160;
var cameraPosGameOver = 260;
var monsterAcceleration = 0.004;
var malusClearColor = 0xb44b39;
var malusClearAlpha = 0;

var numCactus = 5;
var cactuses = [numCactus];

var fieldGameOver, fieldDistance;

//SCREEN & MOUSE VARIABLES

var HEIGHT, WIDTH, windowHalfX, windowHalfY,
  mousePos = {
    x: 0,
    y: 0
  };

//3D OBJECTS VARIABLES

var dino;

// Materials
var blackMat = new THREE.MeshPhongMaterial({
    color: 0x100707,
    shading:THREE.FlatShading,
  });

var brownMat = new THREE.MeshPhongMaterial({
    color: 0xb44b39,
    shininess:0,
    shading:THREE.FlatShading,
  });

var greenMat = new THREE.MeshPhongMaterial({
    color: 0x7abf8e,
    shininess:0,
    shading:THREE.FlatShading,
  });

  var pinkMat = new THREE.MeshPhongMaterial({
    color: 0xdc5f45,//0xb43b29,//0xff5b49,
    shininess:0,
    shading:THREE.FlatShading,
  });

  var lightBrownMat = new THREE.MeshPhongMaterial({
    color: 0xe07a57,
    shading:THREE.FlatShading,
  });

  var whiteMat = new THREE.MeshPhongMaterial({
    color: 0xa49789,
    shading:THREE.FlatShading,
  });
  var skinMat = new THREE.MeshPhongMaterial({
    color: 0x347C2C,
    shading:THREE.FlatShading
  });

var darkGreenMat = new THREE.MeshPhongMaterial({
    color: 0x254117,
    shininess:0,
    shading:THREE.FlatShading,
  });

// OTHER VARIABLES

var PI = Math.PI;

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function initScreenAnd3D() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  windowHalfX = WIDTH / 2;
  windowHalfY = HEIGHT / 2;

  scene = new THREE.Scene();

  scene.fog = new THREE.Fog(0xd6eae6, 160,350);

  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 50;
  nearPlane = 1;
  farPlane = 2000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );
  camera.position.x = 0;
  camera.position.z = cameraPosGame;
  camera.position.y = 30;
  camera.lookAt(new THREE.Vector3(0, 30, 0));

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
  document.addEventListener('mousedown', handleMouseDown, false);
  document.addEventListener("touchend", handleMouseDown, false);

  /*
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  //controls.minPolarAngle = -Math.PI / 2;
  //controls.maxPolarAngle = Math.PI / 2;
  //controls.noZoom = true;
  controls.noPan = true;
  //*/

  clock = new THREE.Clock();

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

  floorShadow = new THREE.Mesh(new THREE.SphereGeometry(floorRadius, 50, 50), new THREE.MeshPhongMaterial({
    color: 0x7abf8e,
    specular:0x000000,
    shininess:1,
    transparent:true,
    opacity:.5
  }));
  //floorShadow.rotation.x = -Math.PI / 2;
  floorShadow.receiveShadow = true;

  floorGrass = new THREE.Mesh(new THREE.SphereGeometry(floorRadius-.5, 50, 50), new THREE.MeshBasicMaterial({
    color: 0x7abf8e
  }));
  //floor.rotation.x = -Math.PI / 2;
  floorGrass.receiveShadow = false;

  floor = new THREE.Group();
  floor.position.y = -floorRadius;

  floor.add(floorShadow);
  floor.add(floorGrass);
  scene.add(floor);

}

Dino = function() {
  this.status = "running";
  this.runningCycle = 0;
  this.mesh = new THREE.Group();
  this.body = new THREE.Group();
  var torsoGeom = new THREE.CubeGeometry(15,20,15, 1);
  this.torso = new THREE.Mesh(torsoGeom, darkGreenMat);
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
  //this.pawBUL.castShadow = true;
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

  //this.body.position.y = 6 + Math.sin(t - Math.PI/2)*amp;
  this.body.rotation.x = .2 + Math.sin(t - Math.PI/2)*amp*.1;

  //this.torso.rotation.x =  Math.sin(t - Math.PI/2)*amp*.1;
  //this.torso.position.y =  7 + Math.sin(t - Math.PI/2)*amp*.5;

  //this.pawFR.rotation.x = Math.sin(t)*Math.PI/4;
  //this.pawFR.position.y = -5.5 - Math.sin(t);
  //this.pawFR.position.z = 7.5 + Math.cos(t);

  //this.pawFL.rotation.x = Math.sin(t+.4)*Math.PI/4;
  //this.pawFL.position.y = -5.5 - Math.sin(t+.4);
  //this.pawFL.position.z = 7.5 + Math.cos(t+.4);
  this.pawBUL.rotation.x = - 1 + Math.sin(t+2)*Math.PI/10;
  this.pawBLL.rotation.x = 0.7 + Math.sin(t+2)*Math.PI/4;

  //this.pawBUL.position.y = -5.5 - Math.sin(t+3.8);
  //this.pawBUL.position.z = -7.5 + Math.cos(t+3.8);

  this.pawBUR.rotation.x = - 1 + Math.sin(t+6)*Math.PI/10;
  this.pawBLR.rotation.x = 0.7 + Math.sin(t+6)*Math.PI/4;

  this.footR.rotation.z = Math.sin(t + Math.PI/2)*amp*.1;
  this.footL.rotation.z = Math.sin(t + Math.PI/2)*amp*.1;
  //this.pawBUR.position.y = -5.5 - Math.sin(t+3.4);
  //this.pawBUR.position.z = -7.5 + Math.cos(t+3.4);

  //this.torso.rotation.x = Math.sin(t)*Math.PI/8;
  //this.torso.position.y = 3-Math.sin(t+Math.PI/2)*3;

  //this.head.position.y = 5-Math.sin(t+Math.PI/2)*2;
  //this.head.rotation.x = -.1+Math.sin(-t-1)*.4;
  this.head.rotation.x = -0.5 + Math.sin(t + Math.PI/2)*amp*.1;
  this.mouth.rotation.x = .2 + Math.sin(t+Math.PI+.3)*.4;

  //this.tail.rotation.x = .2 + Math.sin(t-Math.PI/2);

  //this.eyeR.scale.y = .5 + Math.sin(t+Math.PI)*.5;

}

Dino.prototype.jump = function(){
  if (this.status == "jumping") return;
  this.status = "jumping";
  var _this = this;
  var totalSpeed = 2 / speed;
  var jumpHeight = 45;

  /*TweenMax.to(this.pawBUL.rotation, totalSpeed, {x:"+=.7", ease:Back.easeOut});
  TweenMax.to(this.pawBUR.rotation, totalSpeed, {x:"-=.7", ease:Back.easeOut});

  TweenMax.to(this.mouth.rotation, totalSpeed, {x:.5, ease:Back.easeOut});
  */
  TweenMax.to(this.mesh.position, totalSpeed/2, {y:jumpHeight, ease:Power2.easeOut});
  TweenMax.to(this.mesh.position, totalSpeed/2, {y:0, ease:Power4.easeIn, delay:totalSpeed/2, onComplete: function(){
    //t = 0;
    _this.status="running";
  }});

}

function createDino() {
  dino = new Dino();
  dino.mesh.scale.set(0.5,0.5,0.5);
  dino.mesh.rotation.y = Math.PI/2 + 0.3;
  dino.mesh.position.x = -70;
  dino.mesh.position.y = -3;
  scene.add(dino.mesh);
  //dino.nod();
}

Cactus = function() {
  this.angle = 0;
  //this.status="ready";
  this.mesh = new THREE.Group();
  var bodyGeom = new THREE.CubeGeometry(6, 36,6,1);
  this.body = new THREE.Mesh(bodyGeom, skinMat);
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
  this.mesh.traverse(function(object) {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
}

Cactus.prototype.nod = function( i){
  console.log("i ="+i);
  var _this = this;
  var speed = .1 + i*Math.random()*.5;
  var angle = -Math.PI/4 + i*Math.random()*Math.PI/2;
}

function createCactus(){
  for (var i = 0; i<numCactus; i++){
    cactuses[i] = new Cactus();
    cactuses[i].mesh.position.y = floorRadius+4;
    //cactuses[i].mesh.position.x = 4*i;
    //cactuses[i].nod(i);
    scene.add(cactuses[i].mesh);
  }
}

function updateFloorRotation(){
  floorRotation += delta*.03 * speed;
  floorRotation = floorRotation%(Math.PI*2);
  floor.rotation.z = floorRotation;
}

function updateCactusPosition(){
  for (var i = 0; i<numCactus; i++){
    if (floorRotation+cactuses[i].angle > 2.5 ){
      cactuses[i].angle = -floorRotation + Math.random()*.8;
      //cactus.body.rotation.y = Math.random() * Math.PI*2;
    }
    cactuses[i].mesh.rotation.z = floorRotation + cactuses[i].angle - Math.PI/2;
    cactuses[i].mesh.position.y = -floorRadius + Math.sin(floorRotation+cactuses[i].angle) * (floorRadius+3);
    cactuses[i].mesh.position.x = Math.cos(floorRotation+cactuses[i].angle) * (floorRadius+3);
  }
}

function updateLevel(){
  if (speed >= maxSpeed) return;
  level++;
  speed += 2;
}

function updateDistance(){
  distance += delta*speed;
  var d = distance/2;
  fieldDistance.innerHTML = Math.floor(d);
}

function checkCollision(){
  var dm;
  for (var i = 0; i<numCactus; i++){
    dm = dino.mesh.position.clone().sub(cactuses[i].mesh.position.clone());
    if(dm.length() < collisionCactus){
      gameOver();
    }
  }
}

function gameOver(){
  fieldGameOver.className = "show";
  gameStatus = "gameOver";
  TweenMax.to(this, 1, {speed:0});
  TweenMax.to(camera.position, 3, {z:cameraPosGameOver, y: 60, x:-30});
  cactus.mesh.visible = false;
  clearInterval(levelInterval);
}

function handleMouseDown(event){
  if (gameStatus == "play") dino.jump();
  else if (gameStatus == "readyToReplay"){
    replay();
  }
}

function loop(){
  delta = clock.getDelta();
  updateFloorRotation();

  if (gameStatus == "play"){

    if (dino.status == "running"){
    dino.run();
    }
    updateDistance();
    updateCactusPosition();
    checkCollision();
    /*updateMonsterPosition();
    updateCarrotPosition();
    */
  }
  render();
  requestAnimationFrame(loop);
}

function render(){
  renderer.render(scene, camera);
}

window.addEventListener('load', init, false);

function init(event){
  initScreenAnd3D();
  createLights();
  createFloor()
  createDino();
  /*createMonster();
  createFirs();
  createCarrot();
  createBonusParticles();*/
  createCactus();
  initUI();
  //resetGame();
  updateLevel();
  levelInterval = setInterval(updateLevel, levelUpdateFreq);
  loop();
  //setInterval(dino.blink.bind(dino), 3000);
}

function initUI(){
  fieldDistance = document.getElementById("distValue");
  fieldGameOver = document.getElementById("gameoverInstructions");

}
