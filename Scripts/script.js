const chunks = {


}
function badrng(max,min) {
  max += 1
  return Math.floor(Math.random() * (max - min) ) + min
}
class invSprite {
  constructor (path="Gs",ending=".png",max=9,forward=true,hold=7,id="blah") {
    this.hold = hold
    this.path = path
    this.ending = ending
    this.forward = forward
    this.framesElapsed = 0
    if (!forward) {
      this.max = 0
      this.frame = max
      this.adding = -1
      this.lastFrame = max
    } else {
      this.max = max
      this.adding = 1
      this.frame = 0
    }
    this.domElement = document.createElement("img")
    this.domElement.className = "item"
    this.domElement.id = id
    this.parent = NaN
  }
  add(child=false) {
    if (!child) {
      this.parent = document.body
      document.body.appendChild(this.domElement)
      return
    }
    this.parent = child
    child.holds = this.domElement.id
    child.appendChild(this.domElement)
  }
  remove() {
    this.parent.holds = ""
    this.domElement.remove()
  }
  frameUpd() {
    this.framesElapsed ++
    if (this.framesElapsed % this.hold == 0) {
      this.frame += this.adding
      if (this.forward) {
        if (this.frame >= this.max) {
          this.frame = 1
        }
      } else {
        if (this.frame <= this.max) {
          this.frame = this.lastFrame
        }
      }
      const path = this.path + this.frame + this.ending
      this.domElement.src = path
    }
  }
}
class Enemy {
  constructor (health, defense, parent, spawnDelay) {
    this.maxHealth = health
    this.health = health
    this.defense = defense
    this.origin = parent.position
    this.spawnLocations = []    
    this.parent = parent
    this.spawnDelay = spawnDelay
    this.calculateSpawnPositions()
  }
  calculateSpawnPositions() {
    for (let x = 0; x < 5;x ++) {
      this.spawnLocations.push(new THREE.Vector3(this.origin.x + badrng(2,0),this.origin.y, this.origin.z + badrng(2,0)))
    }
  }
  takeDamage(player,scene) {
    const reduction = 1 - (this.defense / (this.defense + 100))
    const presentable = Math.floor((reduction * 100) * 1000) / 1000 + "%"
    const weapon = player.equipped.weapon
    const stats = player.profileStats
    const dmg = weapon.dmg
    const isCrit = badrng(100,1) <= player.profileStats.cc
    let damage
    if (!isCrit) {
      damage = calculateDamage(dmg ,stats.str,0,player.levels.Combat.level * 4 / 10 + weapon.bm, weapon.pm)
    } else {
      damage = calculateDamage(dmg ,stats.str,stats.cd,player.levels.Combat.level * 4 / 10 + weapon.bm, weapon.pm)
    }
    const final = reduction * damage
    this.health -= final
    if (this.health <= 0) {
      scene.remove(this.parent)
      player.levels.Combat.addExp(this.maxHealth / 100)
      setTimeout(() => {
        this.health = this.maxHealth
        const vec3 = this.spawnLocations[badrng(this.spawnLocations.length - 1,0)]
        this.parent.position.set(vec3.x,vec3.y,vec3.z)
        scene.add(this.parent)
      },this.spawnDelay)
    }
    return final
  }
}
class Enchantment {
  constructor (name,effect,level=1) {
    this.effect = effect
    this.name = name
    this.level = level
  }
}
class Weapon {
  constructor (name="Wood Sword", description="If you are reading this, I'm sorry...", dmg=1, str=0, cd=0, enchants=[], cc=0, bm=0,pm=0) {
    this.name = name
    this.description = description
    this.dmg = dmg
    this.cc = cc
    this.str = str
    this.cd = cd
    this.bm = bm / 10
    this.pm = pm / 10
    this.enchantments = enchants
    this.useEnchants()
  }
  useEnchants() {
    for (let x = 0; x < this.enchantments.length; x ++) {
      this.enchantments[x].effect(this)
    }
  }
}
const baseCd = 50
const baseStr = 0
class Skill {
  constructor (name,description,startExp) {
    this.name = name
    this.description = description
    this.nextLevelExp = startExp
    this.currentExp = 0
    this.tnl = startExp
    this.level = 0
    this.cumulative = 0
  }
  levelUp() {
    if (this.level >= 50) {
      this.level = 50
      this.nextLevelExp = 999 * 99999
      this.currentExp = 0
      return
    }
    this.level += 1
    const lvlText = initText()
    lvlText.funText(`${this.name} LEVEL UP!! Level ${this.level}`)
    setTimeout(() => {
      lvlText.remove()
      this.displayingText = false
    },1500)
    this.calcNextLevelExp()
    this.calcTNL()
    console.log(this.tnl)
    console.log(this.nextLevelExp)
    console.log("level " + this.level)
    if (this.tnl <= 0) this.levelUp()
  }
  addExp(exp) {
    this.currentExp += exp
    this.cumulative += exp
    this.calcTNL()
    if (this.currentExp >= this.nextLevelExp) {
      this.currentExp -= this.nextLevelExp
      this.levelUp()
    }
  }
  calcNextLevelExp() {
    this.nextLevelExp = (this.nextLevelExp * 1.32)
  }
  calcTNL() {
    this.tnl = this.nextLevelExp - this.currentExp
  }
}
const skills = [
  new Skill("Combat","How good you are at fighting",1000),
  new Skill("Foraging","How good you are at cutting down trees",1000),
]
class Armor {
  constructor(name="The Armor",description="The Armor of all armor",defense=0,health=0,str=0,cd=0,cc=0) {
    this.name = name
    this.description = description
    this.defense = defense
    this.health = health
    this.str = str
    this.cd = cd
    this.cc = cc
    this.isArmor = true
  }
}
class Player {
  constructor (maxHealth,defense) {
    this.inventory = {

    }
    this.equipped = {
      weapon: gs,
      helmet: nh,
      chestplate: 0,
      leggings: 0,
      boots: 0,
    }
    this.levels = {
    
    }
    this.initLevels()
    this.stats = {
      str: 0,
      cd: 50,
      maxHp: maxHealth,
      def: defense,
      cc: 25,
    }
    this.profileStats = {
      str: 0,
      cd: 0,
      maxHealth: 0,
      defense: 0,
      cc: 0,
      clear: function() {
        this.str = 0
        this.cd = 50
        this.health = 0
        this.defense = 0
        this.cc = 0
      }
    }
    this.health = maxHealth
    this.updateProfileStats()
  }
  initLevels() {
    for (let i = 0; i < skills.length; i++) {
      this.levels[skills[i].name] = skills[i]
    }
  }
  updateProfileStats() {
    this.profileStats.clear()
    let strBuff = 0
    let cdBuff = 0
    let ccBuff = 0
    let hpBuff = 0
    let defBuff = 0
    console.log(this.equipped)
    for (let x in this.equipped) {
      const item = this.equipped[x]
      if (item.str) strBuff += item.str
      if (item.cd) cdBuff += item.cd
      if (item.cc) ccBuff += item.cc
      if (item.isArmor) {
        hpBuff += item.health
        defBuff += item.defense
      }
    }
    strBuff += this.stats.str
    cdBuff += this.stats.cd
    ccBuff += this.stats.cc
    hpBuff += this.stats.maxHp
    defBuff += this.stats.def
    this.profileStats.str += strBuff
    this.profileStats.cd += cdBuff
    this.profileStats.cc += ccBuff
    this.profileStats.maxHealth += hpBuff
    this.health = this.profileStats.maxHealth
    this.profileStats.defense += defBuff
    console.log("Str: " + strBuff + " Cd: " + cdBuff + " Cc : " + ccBuff + " Hp: " + hpBuff + " Def: " + defBuff)
  }
}
const ofa = new Enchantment("One for All",function (weapon) {
  weapon.cd = weapon.cd * (5 * this.level)
  weapon.str = weapon.str * (5 * this.level)
  weapon.dmg = weapon.dmg * (5 * this.level)
})
const sharpness = new Enchantment("Sharpness", function (weapon) {
  weapon.bm += 1.5 * this.level 
})
const gs = new Weapon("Giant's Sword","A sword once wielded by only by giants and now, you.",550,60,40,[ofa],100)
console.log(gs.cc)
const nh = new Armor("Necron's Helmet","The helmet of a god (little g)",120,300,50,500,0)
const player = new Player(100,100)
const fists = new Weapon("Fists","literally just your hands",0,0,0)
const ld = new Weapon ("Livid Dagger","A small dagger that always strikes true",230,150,200,[],100)
const weapons = {
  "GS": gs,
  "fists": fists,
}

const blocks = {
  grass : {
    array: [],
    length: 0,
  },
  stone : {
    array: [],
    length: 0,
  },
  dirt : {
    array: [],
    length: 0,
  }
}
let prevpos;
function start(newx,newy,newz, maxx, maxy, maxz) {
const chunkWidth = 16
const chunkHeight = -4
const chunkDepth = 16
const buildHeight = 10
const gravity = 1.5
class Chunk {
  constructor(x=0,y=0,z=0) {
    const xsign = -(x / -x) || 1
    const ysign = -(x / -x) || 1
    const zsign = -(x / -x) || 1
    x += xsign
    y += ysign
    z += zsign
    const position = {
      x: x,
      y: y,
      z: z,
    }
    this.position = position
    this.maxX = (this.position.x * chunkWidth) || (chunkWidth * xsign)
    this.startX = this.maxX - ((chunkWidth * 2) * xsign)
    this.maxY = (this.position.y * chunkHeight) || (chunkHeight * ysign)
    this.startY = this.maxY - ((this.maxY + 1) * ysign)
    this.maxZ = (this.position.z * chunkDepth) || (chunkDepth * zsign)
    this.startZ = this.maxZ - ((chunkDepth * 2) * zsign)
    this.dirtInstances = [


    ]
    this.grassInstances = [


    ]
    this.stoneInstances = [


    ]
    this.allObjs = {


    }
    this.blocksLoaded = 0
    this.totalBlocks = ((Math.abs(this.maxX) + Math.abs(this.startX)) * (Math.abs(this.maxZ) + Math.abs(this.startZ))) * (Math.abs(this.maxY) + Math.abs(this.startY))  
    this.currentLoadPos = {
      x: this.startX,
      y: this.startY,
      z: this.startZ,
    }
    this.loadedChunk = false
    this.rendered = false
    const val = `X${this.position.x}Y${this.position.y}Z${this.position.z}`
    chunks[val] = this
  this.load = function () {
    this.rendered = true
    if (this.loadedChunk) {
      this.addInstance(this.stoneInstances,"stone")
      this.addInstance(this.dirtInstances,"dirt")
      this.addInstance(this.grassInstances,"grass")
    } else {
      this.loadBlocks()
      this.addInstance(this.stoneInstances,"stone")
      this.addInstance(this.dirtInstances,"dirt")
      this.addInstance(this.grassInstances,"grass")
    }
    console.log("chunk loaded")
  }
  this.unload = function() {
    blocks.grass.array.slice(this.grassInstances)
    blocks.stone.array.slice(this.stoneInstances)
    blocks.dirt.array.slice(this.dirtInstances)
    this.rendered = false
  }
  this.addInstance = function (array,name) {
    blocks[name].length += array.length
    for (let i = 0; i < array.length; i++) {
      blocks[name].array.push(array[i])
    }
  }
  this.makeBlock = function() {
    const val = `X${this.currentLoadPos.x}Y${this.currentLoadPos.y}Z${this.currentLoadPos.z}`
    if (this.currentLoadPos.y > -3) {
      this.dirtInstances.push(val)
    } else {
      this.stoneInstances.push(val)
    }
  }
  this.getPositionFromString = function (str) {
    const x = parseInt(str.split("Y")[0].replace("X",""))
    const y = parseInt(str.split("Z")[0].split("Y")[1])
    const z = parseInt(str.split("Z")[1].replace("Z",""))
    const returnVal = {
      x: x,
      y: y,
      z: z,
    }
    return returnVal
  }
  this.loadBlocks = function() {
    while (this.currentLoadPos.z <= this.maxZ) {
      while (this.currentLoadPos.x <= this.maxX) {
        const val = `X${this.currentLoadPos.x}Y${this.currentLoadPos.y}Z${this.currentLoadPos.z}`
        this.allObjs[val] = this.makegrass()
        this.blocksLoaded ++
        while (this.currentLoadPos.y >= this.maxY) {
          const valY = `X${this.currentLoadPos.x}Y${this.currentLoadPos.y}Z${this.currentLoadPos.z}`
          if (this.allObjs[valY]) {


          } else {
            this.allObjs[valY] = this.makeBlock()
            this.blocksLoaded ++
        }
          this.currentLoadPos.y --;
        }
        this.currentLoadPos.y = this.startY;
      this.currentLoadPos.x ++;
      }
      this.currentLoadPos.x = this.startX;
      this.currentLoadPos.z ++;
    }
  }
  this.makegrass = function () {
    const rng = badrng(300,1)
    if (rng == 20) {
      //maketree(this.currentLoadPos.x,this.currentLoadPos.y + 2,this.currentLoadPos.z)
    }
    //console.log(this.currentLoadPos)
    const val = `X${this.currentLoadPos.x}Y${this.currentLoadPos.y + 1}Z${this.currentLoadPos.z}`
    this.grassInstances.push(val)
  }  
  this.checkThingAbove = function (obj) {
    const x = obj.position.x
    const xpos = obj.position.x + 1
    const xneg = obj.position.x - 1
    const y = obj.position.y
    const ypos = obj.position.y + 1
    const yneg = obj.position.y - 1
    const z = obj.position.z
    const zpos = obj.position.z + 1
    const zneg = obj.position.z - 1


    function repeatVal(x,y,z) {
      return `X${x}Y${y}Z${z}`
    }
    const val = [repeatVal(xneg,y,z),repeatVal(x,y,zneg),repeatVal(x,yneg,z),repeatVal(x,ypos,z),repeatVal(xpos,y,z),repeatVal(x,y,zpos)]
    let canHide = true
    for (let i = 0; i < val.length; i++) {
      if (!this.allObjs[val[i]]) {
        canHide = false
        break;
      }
    }
    const block = `X${obj.position.x}Y${obj.position.y}Z${obj.position.z}`
    if (canHide) {
      this.allObjs[block].visible = false
    } else {
      this.allObjs[block].visible = true
    }
  }
  const chunkVal = `X${this.position.x}Y${this.position.y}Z${this.position.Z}`
  chunks[chunkVal] = this
 }
}
  document.body.style.background = "black"
  const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,.1,50);
    camera.velocity = {
      y: 0
    }
    let pixelRatio = window.devicePixelRatio
    let AA = true
    if (pixelRatio > 1) {
            AA = false
    }
    const renderer = new THREE.WebGLRenderer({
      antialias: AA,
      powerPreference: "high-performance",
    });
    let loader = new THREE.GLTFLoader();
  scene.background = new THREE.Color(0,170,255)


renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)
function onWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
                width = window.innerWidth / 2
                height = window.innerHeight / 2
            }
window.addEventListener("resize", onWindowResize, false);
const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load(file("bozo.jpg"))
const texture2 = textureLoader.load(file("top.jpg"))
const texture3 = textureLoader.load(file("side.jpg"))
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const stonetexture = textureLoader.load(file("stone.jpg"))
const irontexture = textureLoader.load(file("ironore.jpg"))
const toplogtexture = textureLoader.load(file("oaktop.jpg"))
const leftlogtexture = textureLoader.load(file("oakleft.jpg"))
const oakleaftexture = textureLoader.load(file("oakleaf.png"))
const grass = [
            new THREE.MeshBasicMaterial( { map: texture3} ),
            new THREE.MeshBasicMaterial( { map: texture3} ),
            new THREE.MeshBasicMaterial( { map: texture2} ),
            new THREE.MeshBasicMaterial( { map: texture} ),
            new THREE.MeshBasicMaterial( { map: texture3} ),
            new THREE.MeshBasicMaterial( { map: texture3} ),
]
const actualoakleaf = new THREE.MeshBasicMaterial( { map: oakleaftexture} )
const oaklog = [


  new THREE.MeshBasicMaterial( { map: leftlogtexture} ),
  new THREE.MeshBasicMaterial( { map: leftlogtexture} ),
  new THREE.MeshBasicMaterial( { map: toplogtexture} ),
  new THREE.MeshBasicMaterial( { map: toplogtexture} ), //bottom
  new THREE.MeshBasicMaterial( { map: leftlogtexture} ),
  new THREE.MeshBasicMaterial( { map: leftlogtexture} ),
]
const stone = new THREE.MeshBasicMaterial( { map: stonetexture} )
const iron = new THREE.MeshBasicMaterial( {map: irontexture})
const dirt = new THREE.MeshBasicMaterial( { map: texture} )
//const light = new THREE.SpotLight();
//const group = new THREE.Group()
//light.position.y = 10
//light.intensity = .5
camera.position.z = 0;
camera.rotation.x = 0
let candestroyblocks = true

function createDiv(id) {
  const div = document.createElement("div")
  div.id = id
  document.body.appendChild(div)
  return div
}
function locked(mouse) {
  if (mouse) {
    const div = createDiv("mouselock")
  } else {
    const div = document.querySelector("#mouselock")
    if (div) div.remove()
  }
}
function switchSlots(slot) {
  const selector = document.querySelector("#slot" + slot)
  let prevSelected;
  if (slot != selected) prevSelected = document.querySelector("#slot" + selected)
  selected = slot
  setTimeout (() => {
    player.equipped.weapon = weapons[selector.holds] || weapons.fists
    player.updateProfileStats()
    selector.style.borderColor = "limegreen"
    if (prevSelected) prevSelected.style.borderColor = ""
  })
  
}
const clock = new THREE.Clock()
let selected = 1
switchSlots(1)
document.addEventListener("keydown",(event) => {
  const keyism = event.key
  switch (parseInt(keyism)) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:      
      switchSlots(keyism)
      break;
  }
  if (keyism != " " || camera.isInAir) return
  camera.velocity.y = .3
  camera.isInAir = true
})
camera.position.y = 3
camera.isInAir = false
camera.isInAir = true
function animate() {
  requestAnimationFrame(animate)
  const movething = mover.move()
  const moved = movething.bool || blockChanged || camera.isInAir
  if (moved) {
    blockChanged = false
    castGround(mover,movething)
  }
  const delta = clock.getDelta()
  if (camera.isInAir) {
    camera.velocity.y -= gravity * delta
    camera.position.y += camera.velocity.y
    const grounded = cameraGrounded(y)
    if (camera.position.y < grounded && !somethingAbove) {
      camera.isInAir = false
      camera.position.y = grounded
    }
  }
 
  renderer.render(scene,camera)
  /*if (zombie) {
    zombie.children[0].children[0].children[0].rotation.y = -camera.rotation.y
  } */
  //console.log("Scene polycount:", renderer.info.render.triangles)
  //console.log("Active Drawcalls:", renderer.info.render.calls)
  //console.log("Textures in Memory", renderer.info.memory.textures)
  //console.log("Geometries in Memory", renderer.info.memory.geometries)
}
const groundCaster = new THREE.Raycaster()
groundCaster.far = 3
groundCaster.near = 0
const groundDirection = new THREE.Vector3(0,-1,0)
const headDirection = new THREE.Vector3(0,1,0)
const camHeight = 1.5
let y;
let blockChanged = false;
let somethingAbove = false;
function castGround(move,bools) {
  const rayPosition = camera.position
  groundCaster.set(rayPosition,groundDirection)
  const intersects = groundCaster.intersectObjects(scene.children)
  //const intersects2 = groundCaster.intersectObjects(scene.children)
 
  if (!intersects[0]) {
    camera.isInAir = true
    y = -100
    return
  }
 
  /* const point = intersects[0].point.y
  const distance = rayPosition.y - point
  console.log(distance)
  if (distance <= camHeight && camera.velocity.y >= 0) {
    camera.position.y = point + camHeight
    camera.isInAir = false
    camera.velocity.y = 0
    console.log("hello")
  } else if (distance > camHeight + .1) {
    camera.isInAir = true
  } */
  const distance = intersects[0].distance
  const point = intersects[0].point.y
  y = point
  if (distance < .6) {
    somethingAbove = true
    if (bools.forward.bool) {
      move.forward(camera,-bools.forward.amt)
    }
    if (bools.strafe.bool) {
      move.strafe(camera,-bools.strafe.amt)
    }
    camera.isInAir = false
  }
  else if (distance < 1.5 - .1 && point == y) {
    const height = cameraGrounded(point)
    console.log(height)
    camera.position.y = height
    somethingAbove = false
    camera.velocity.y = 0
    camera.isInAir = false
    return
  } else {
    camera.isInAir = true
    somethingAbove = false
  }
}
function cameraGrounded(point=0) {
  const val = ((point * 10) + (camHeight * 10)) / 10
  return val
}
function makeiron(posx=0,posy=0,posz=0) {
  const newdirt = new THREE.Mesh(geometry, iron)
  newdirt.position.set(posx,posy,posz)
  newdirt.name = "ironore"
  scene.add(newdirt)
}
function makeText(text) {
  let textThing = initText()
  textThing.innerHTML = text
  textThing.id = "dmgText"
  textThing.style.top = `${badrng(80,20)}%`
  textThing.style.left = `${badrng(80,20)}%`
  setTimeout(() => {textThing.remove()},500)
}
/*function makeText(text,position) {
  const letters = Array.from(text)
  console.log(position)
  position.y += 2
  return new Promise((resolve,reject) => {
    const tMeshes = []
    textLoader.load(file("font.json"), (font) => {
    for (let x = 0; x < letters.length; x ++) {
      const textGeometry = new THREE.TextGeometry(text,{
        font: font,
        size: .05,
        height: .05,
      curveSegments: 20,
      bevelEnabled: false,
      bevelThickness: 1,
      bevelSize: 0,
      bevelOffset: 2,
      bevelSegments: 15,
    })
    let textureToUse;
    let chance = badrng(3,1)
    switch (chance) {
      case 1:
        textureToUse = yellow
        break;
      case 2:
        textureToUse = red
        break;
      case 3:
        textureToUse = white;
        break;
    }
    const tMesh = new THREE.Mesh(textGeometry,red)
    scene.add(tMesh)
    tMesh.position.set(position.x,position.y,position.z)
    tMeshes.push(tMesh)
  }
    for (let x = 0; x < tMeshes.length; x++) {
      tMeshes[x].rotation.y = camera.rotation.y
    }
      setTimeout(() => {
      for (let x = 0; x < tMeshes.length; x ++) {
          scene.remove(tMeshes[x])
      }
      },2500)
    console.log("hello?")
    resolve(tMeshes[0])
  })
  })
} */
//let text = makeText("10,000,000",new THREE.Vector3(0,2,-2))
function maketree(posx=0,posy=1,posz=0,woodType = "oak",treeType=1) {
  switch( treeType ) {
    case 1:
      let height = 4
      for (let i = 0;i < height;i++) {
        switch( woodType ) {
          case "oak":
            makeoaklog(posx,posy,posz)
            posy += 1
        }
      }
      setLeavesAroundTree(posx,posy,posz)
  }
}
function setLeavesAroundTree(posx=0,posy=0,posz=0) {
  let leavesdone = false
  const originposx = posx
  const originposy = posy
  const originposz = posz
  let layer = 1
  let canupdatepos = true
  let iteration = 0
  function dothething() {
    if (canupdatepos) {
      switch(layer) {
      case 1:
        iteration = 0
        posy -= 2
        posx -= 1
        break;
      case 2:
        iteration = 0
        posx = originposx
        posy = originposy
        posz = originposz
        posx -= 1
        posy -= 1
        break;
      }
      canupdatepos = false
    }
  iteration += 1
  switch(iteration) {
    case 1:
      makeoakleaf(posx,posy,posz)
      posz += 1
      if (layer == 1) {
        makeoakleaf(posx,posy,posz)
      }
      break;
    case 2:
      posx += 1
      makeoakleaf(posx,posy,posz)
      break;
    case 3:
      posx += 1
      if (layer == 1) {
      makeoakleaf(posx,posy,posz)
      }
      break;
    case 4:
      posz -= 1
      makeoakleaf(posx,posy,posz)
      break;
    case 5:
      posz -= 1
      if (layer == 1) {
      makeoakleaf(posx,posy,posz)
      }
      break;
    case 6:
      posx -= 1
      makeoakleaf(posx,posy,posz)
      break;
    case 7:
      posx -= 1
      if (layer == 1) {
      makeoakleaf(posx,posy,posz)
      }
      break;
    default:
      layer += 1
      canupdatepos = true
      if (layer == 3) {
      leavesdone = true
      posx = originposx
      posy = originposy
      posz = originposz
      makeoakleaf(posx,posy,posz)
      }
      break;
  }
  if (leavesdone == false) {
    dothething()
  }
}
  dothething()
}
function makeoakleaf(posx=0,posy=0,posz=0) {
  const newdirt = new THREE.Mesh(geometry, actualoakleaf)
  newdirt.position.set(posx,posy,posz)
  newdirt.name = "oakleaf"
  //spin(newdirt, .1)
  scene.add(newdirt)
}
function makeoaklog(posx,posy,posz) {
if (posx == undefined) {
  posx = 0
  }
  if (posy == undefined) {
  posy = 3
  }
  if (posz == undefined) {
    posz = 0
  }
  const newdirt = new THREE.Mesh(geometry, oaklog)
  newdirt.position.set(posx,posy,posz)
  newdirt.name = "oaklog"
  //spin(newdirt, .1)
  scene.add(newdirt)
}
function makestone(posx,posy,posz) {
  if (posx == undefined) {
  posx = 0
  }
  if (posy == undefined) {
  posy = 0
  }
  if (posz == undefined) {
    posz = 0
  }
  const newdirt = new THREE.Mesh(geometry, stone)
  newdirt.position.set(posx,posy,posz)
  newdirt.name = "stone"
  //spin(newdirt, .1)
  scene.add(newdirt)
  return newdirt
}
function makedirt(posx,posy,posz) {
  if (posx == undefined) {
  posx = 0
  }
  if (posy == undefined) {
  posy = 0
  }
  if (posz == undefined) {
    posz = 0
  }
  const newdirt = new THREE.Mesh(geometry, dirt)
  newdirt.position.set(posx,posy,posz)
  //spin(newdirt, .1)
  newdirt.name = "dirt"
  scene.add(newdirt)
  return newdirt
}
function makegrass(posx,posy,posz) {
  if (posx == undefined) {
  posx = 0
  }
  if (posy == undefined) {
  posy = 0
  }
  if (posz == undefined) {
    posz = 0
  }
  const newdirt = new THREE.Mesh(geometry, grass)
  newdirt.position.set(posx,posy,posz)
  scene.add(newdirt)
  return newdirt
}
function spin(obj,speed) {
  obj.rotation.y += speed
  spin2()
  function spin2() {
  requestAnimationFrame(spin2)
  obj.rotation.y += speed
  }
}
const mover = initMovement(camera,renderer.domElement,mouselock,scene)
function mouselock(lock) {
  if (lock) {
    const div = makeDiv("mouselock")
  } else {
    const div = document.querySelector("#mouselock")
    setTimeout(() => {
      div.remove()
    },10)
  }
}
function makeDiv(id) {
  const div = document.createElement("div")
  div.id = id
  document.body.appendChild(div)
  return div
}
const chunk = new Chunk(0,0,0)
/* const chunk2 = new Chunk(2,0,0)
const chunk3 = new Chunk(-2,0,0)
const chunk4 = new Chunk(-2,0,-2)
const chunk5 = new Chunk(0,0,-2)
const chunk6 = new Chunk(2,0,-2)
const chunk7 = new Chunk(-2,0,2)
const chunk8 = new Chunk(0,0,2)
const chunk9 = new Chunk(2,0,2) */
for (let i in chunks) {
  const chunkThing = chunks[i]
  chunkThing.load()
  //chunkThing.update()
}
let zombie = addZombie().then((zombieMesh) => {
  zombie = zombieMesh
  zombieMesh.position = camera.position
  scene.add(zombieMesh)
  zombieMesh.scale.x = .89
  zombieMesh.scale.y = .89
  zombieMesh.scale.z = .89
  zombieMesh.position.x += 2
  zombieMesh.position.z += 2
  zombieMesh.position.y += .5
  zombieMesh.entity = new Enemy(1000000,0,zombieMesh,2500)
  return zombieMesh
})
console.log(zombie)
async function addZombie() {
  return new Promise((resolve, reject) => {
    loader.load(file("zombie.glb"), (gltf) => {
      const zombie = gltf.scene;
      resolve(zombie);
    }, undefined, (error) => {
      reject(error);
    });
  });
}
updateChunks()
function updateChunks() {
  const grassInstance = new THREE.InstancedMesh(geometry,grass,blocks.grass.length)
  const dirtInstance = new THREE.InstancedMesh(geometry,dirt,blocks.dirt.length)
  const stoneInstance = new THREE.InstancedMesh(geometry,stone,blocks.stone.length)
  const posify = chunk.getPositionFromString
  const dummy = new THREE.Object3D()
  for (let x = 0; x < blocks.grass.length; x++) {
    const position = posify(blocks.grass.array[x])
    dummy.position.set(position.x,position.y,position.z)
    dummy.matrixNeedsUpdate = true
    dummy.updateMatrix()
    grassInstance.setMatrixAt(x,dummy.matrix)
    grassInstance.instanceMatrix.needsUpdate = true
  }
  for (let x = 0; x < blocks.stone.length; x++) {
    const position = posify(blocks.stone.array[x])
    dummy.position.set(position.x,position.y,position.z)
    dummy.matrixNeedsUpdate = true
    dummy.updateMatrix()
    stoneInstance.setMatrixAt(x,dummy.matrix)
    stoneInstance.instanceMatrix.needsUpdate = true
  }
  for (let x = 0; x < blocks.dirt.length; x++) {
    const position = posify(blocks.dirt.array[x])
    dummy.position.set(position.x,position.y,position.z)
    dummy.matrixNeedsUpdate = true
    dummy.updateMatrix()
    dirtInstance.setMatrixAt(x,dummy.matrix)
    dirtInstance.instanceMatrix.needsUpdate = true
  }
  scene.add(grassInstance)
  scene.add(stoneInstance)
  scene.add(dirtInstance)
}
function brokegrass() {
 scene.remove(cube)
}
function brokedirt() {
 scene.remove(cube2)
}
animate()
      const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


var dirtcount = 0
var stonecount = 0
var ironorecount = 0
function convertPositionToString(ohYeah) {
  const toReturn = `X${ohYeah.x}Y${ohYeah.y}Z${ohYeah.z}`
}
const disposibles = {
  "grass": [],
  "stone": [],
  "dirt": [],
}
function onPointerMove( event ) {


  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components


  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;


}
let intersects;
let width = window.innerWidth / 2
let height = window.innerHeight / 2


document.addEventListener( 'pointermove', onPointerMove );


document.addEventListener("click", function(event) {
  if (camera.mouseLocked) {
    pointer.x = ( width / window.innerWidth ) * 2 - 1;
    pointer.y = - ( height / window.innerHeight ) * 2 + 1;
  }
  raycaster.setFromCamera( pointer, camera );
  // calculate objects intersecting the picking ray
  intersects = raycaster.intersectObjects( scene.children );
  if (intersects.length < 1) return
  if (intersects[0].distance > 5) {
    return
  }
  if (event.shiftKey) {
    const intersect = intersects[0]
    const dummy = new THREE.Vector3()
    const matrix = new THREE.Matrix4()
    const disposible = disposibles["grass"][0]
    if (disposible.length < 1) return
    const parent = disposible.parent
    const id = disposible.instId
    dummy.copy(intersect.face.normal)
    matrix.matrixAutoUpdate = false
    matrix.setPosition(dummy)
    console.log(matrix)
    parent.setMatrixAt(id,matrix)
    parent.instanceMatrix.needsUpdate = true
    return
  }
  if (!candestroyblocks) return
  let block = intersects[0]
  if (block) block = block.object
  if (block["parent"]["parent"]) {
    if (block.parent.parent.parent.parent.isGroup) {
      block = block.parent.parent.parent.parent
      let tPos = new THREE.Vector3(block.position.x,block.position.y,block.position.z)
      let damage = block.entity.takeDamage(player,scene)
      let dmgStr = dmgToString(Math.floor(damage))
      makeText(dmgStr,tPos)
      return
    }
  }
  if (block.isInstancedMesh) {
    const id = intersects[0].instanceId
    const dummy = new THREE.Object3D()
    const matrix = new THREE.Matrix4()
    block.getMatrixAt(id,matrix)
    matrix.setPosition(new THREE.Vector3(0,10000,0))
    matrix.matrixAutoUpdate = false
    dummy.position = new THREE.Vector3(0,10000000,0)
    dummy.updateMatrix()
    block.setMatrixAt(id,matrix)
    block.instanceMatrix.needsUpdate = true
    const obj = {
      parent: block,
      instId: id,
    }
    disposibles["grass"].push(obj)
    blockChanged = true
    return
  }
  if (intersects[0].object.name == "iron") {
    ironorecount += 1
  } else if (intersects[0].object.name == "stone") {
    stonecount += 1
  } else if (intersects[0].object.name == "dirt") {
    dirtcount += 1
  }
  candestroyblocks = false
  setTimeout(() => {
    candestroyblocks = true
  },100)
  scene.remove(intersects[0].object)
})


}

