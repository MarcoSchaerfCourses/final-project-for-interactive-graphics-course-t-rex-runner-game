function updateObstaclePosition(){
  if (obstacle.status=="flying")return;
  
  // TODO fix this,
  if (floorRotation+obstacle.angle > 2.5 ){
    obstacle.angle = -floorRotation + Math.random()*.3;
    obstacle.body.rotation.y = Math.random() * Math.PI*2;
  }
  
  obstacle.mesh.rotation.z = floorRotation + obstacle.angle - Math.PI/2;
  obstacle.mesh.position.y = -floorRadius + Math.sin(floorRotation+obstacle.angle) * (floorRadius+3);
  obstacle.mesh.position.x = Math.cos(floorRotation+obstacle.angle) * (floorRadius+3);
  
}

function createObstacle(){
  obstacle = new Cactus();
  obstacle.body.rotation.y = -Math.PI/2;
  obstacle.mesh.scale.set(1.1,1.1,1.1);
  obstacle.mesh.position.y = floorRadius+4;
  obstacle.nod();
  scene.add(obstacle.mesh);
}

function createBonusParticles(){
  bonusParticles = new BonusParticles();
  bonusParticles.mesh.visible = false;
  scene.add(bonusParticles.mesh);
  
}


function checkCollision(){
  var db = hero.mesh.position.clone().sub(pterodactyl.mesh.position.clone());
  var dm = hero.mesh.position.clone().sub(obstacle.mesh.position.clone());
  
/* if collision with pterodactyl or cactus then gameOver*/

  if(db.length() < collisionBonus){
    getBonus();
  }
  
  if(dm.length() < collisionObstacle && obstacle.status != "flying"){
    getMalus();
  }
}


function updateDistance(){
  distance += delta*speed;
  var d = distance/2;
  fieldDistance.innerHTML = Math.floor(d);
}

function updateLevel(){
  if (speed >= maxSpeed) return;
  level++;
  speed += 2; 
}


function loop(){
  delta = clock.getDelta();
  updateFloorRotation();
  
  if (gameStatus == "play"){
    
    if (hero.status == "running"){
      hero.run();
    }
    updateDistance();
    updatePterodactylPosition();
    updateObstaclePosition();
    checkCollision();
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
  createBackGround();
  createPterodactyl();
  createBonusParticles();
  createObstacle();
  initUI();
  resetGame();
  loop();
  
}


function resetGame(){
  scene.add(hero.mesh);
  hero.mesh.rotation.y = Math.PI/2;
  hero.mesh.position.y = 0;
  hero.mesh.position.z = 0;
  hero.mesh.position.x = 0;


  speed = initSpeed;
  level = 0;
  distance = 0;
  pterodactyl.mesh.visible = true;
  obstacle.mesh.visible = true;
  gameStatus = "play";
  hero.status = "running";
  hero.nod();
  updateLevel();
  levelInterval = setInterval(updateLevel, levelUpdateFreq);
}

function initUI(){
  fieldDistance = document.getElementById("distValue");
  
}

