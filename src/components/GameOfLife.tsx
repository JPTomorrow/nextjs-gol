import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  scene,
  camera,
  renderer,
  gameCanvas,
  initRenderer,
} from "../three-lib/ThreeGlobals";

// data about the game structure
const gridDimensions = { x: 48, y: 35 };
const cubeSize = { x: 1.5, y: 1.5, z: 0.01 };
const gridPadding = 0.3;
const updateInterval = 150;

// colors of the cells
const deadColor = new THREE.Color(0, 0.5, 1);
const aliveColor = new THREE.Color(1, 0, 0);

// objects that need to remain alive in each scene
var cameraControls = undefined;
const raycaster = new THREE.Raycaster();

const makeCubes = () => {
  const xStartPos = -42;
  let xPos = xStartPos;
  let yPos = 31;

  const cubes = [];

  for (let i = 0; i < gridDimensions.y; i++) {
    let xArr = [];
    for (let j = 0; j < gridDimensions.x; j++) {
      const geometry = new THREE.BoxGeometry(
        cubeSize.x,
        cubeSize.y,
        cubeSize.z
      );
      const material = new THREE.MeshBasicMaterial({ color: deadColor });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(xPos, yPos, 0);
      xArr.push(cube);
      xPos += cubeSize.x + gridPadding;
    }
    yPos -= cubeSize.y + gridPadding;
    xPos = xStartPos;
    cubes.push(xArr);
  }

  return cubes;
};

const cubes = makeCubes();

const clearLiveCubes = () => {
  cubes.forEach((y) => y.forEach((x) => x.material.color.set(deadColor)));
  renderer?.render(scene, camera);
};

const OnClickSetAliveState = (event: MouseEvent) => {
  // get mouse position
  event.preventDefault();
  if (!gameCanvas) return;
  const rect = gameCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const mouse = new THREE.Vector2();
  mouse.x = (x / gameCanvas.clientWidth) * 2 - 1;
  mouse.y = -(y / gameCanvas.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // get intersects
  var intersects = raycaster.intersectObject(scene, true);

  // set alive state
  if (intersects.length > 0) {
    var cube = intersects[0]?.object as THREE.Mesh<
      THREE.BoxGeometry,
      THREE.MeshBasicMaterial
    >;
    const isDead = cube.material.color.equals(deadColor);

    if (isDead) {
      cube.material.color.set(aliveColor);
    } else {
      cube.material.color.set(deadColor);
    }

    renderer?.render(scene, camera);
  }
};

const initGame = () => {
  // setup renderer
  initRenderer();
  renderer?.setSize(800, 600);
  camera.position.z = 37;

  // add cubes to scene and redraw
  cubes.forEach((x) => x.forEach((y) => scene.add(y)));
  renderer?.render(scene, camera);

  // setup camera controls
  if (!gameCanvas) return;
  cameraControls = new OrbitControls(camera, gameCanvas);
  cameraControls.enableDamping = true;
  cameraControls.dampingFactor = 0.25;
  cameraControls.enableZoom = false;
  cameraControls.addEventListener("change", () =>
    renderer?.render(scene, camera)
  );

  // set up click alive update
  gameCanvas?.addEventListener("click", OnClickSetAliveState, false);
};

interface Coordinates {
  x: number;
  y: number;
}

// get all of the adjacent cubes to the current cube
const getNeighbors = (
  x: number,
  y: number
): THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>[] => {
  const idxs: Coordinates[] = [
    {
      x: x == 0 ? gridDimensions.x - 1 : x - 1,
      y: y == 0 ? gridDimensions.y - 1 : y - 1,
    }, // top left
    {
      x: x,
      y: y == 0 ? gridDimensions.y - 1 : y - 1,
    }, // top center
    {
      x: x == gridDimensions.x - 1 ? 0 : x + 1,
      y: y == 0 ? gridDimensions.y - 1 : y - 1,
    }, // top right
    {
      x: x == 0 ? gridDimensions.x - 1 : x - 1,
      y: y,
    }, // middle left
    {
      x: x == gridDimensions.x - 1 ? 0 : x + 1,
      y: y,
    }, // middle right
    {
      x: x == 0 ? gridDimensions.x - 1 : x - 1,
      y: y == gridDimensions.y - 1 ? 0 : y + 1,
    }, // bottom left
    {
      x: x,
      y: y == gridDimensions.y - 1 ? 0 : y + 1,
    }, // bottom center
    {
      x: x == gridDimensions.x - 1 ? 0 : x + 1,
      y: y == gridDimensions.y - 1 ? 0 : y + 1,
    }, // bottom right
  ];

  return idxs.map(
    (coords) =>
      cubes[coords.y]![coords.x] as THREE.Mesh<
        THREE.BoxGeometry,
        THREE.MeshBasicMaterial
      >
  );
};

// get the number of alive neighbors for a given cube
const getAliveCount = (
  neighbors: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>[]
) => {
  var aliveCount = 0;
  neighbors.forEach((cube) => {
    if (cube.material.color.equals(aliveColor)) {
      aliveCount += 1;
    }
  });
  return aliveCount;
};

// get the next color state for a cube
const getNextState = (isAlive: boolean, aliveCount: number) => {
  if (isAlive && aliveCount < 2) {
    return deadColor;
  }
  if (isAlive && (aliveCount == 2 || aliveCount == 3)) {
    return aliveColor;
  }
  if (isAlive && aliveCount > 3) {
    return deadColor;
  }
  if (!isAlive && aliveCount == 3) {
    return aliveColor;
  }
  return deadColor;
};

// update the game state
const updateGame = () => {
  // iterate over all cubes
  var colorResults = [];
  for (var y = 0; y < cubes.length; y++) {
    var arr = cubes[y]!;
    var xArr = [];
    for (var x = 0; x < arr.length; x++) {
      const currentCube = arr[x];
      const neighbors = getNeighbors(x, y);
      const aliveCount = getAliveCount(neighbors);
      const isAlive = currentCube?.material.color.equals(aliveColor) as boolean;
      const nextState = getNextState(isAlive, aliveCount);
      xArr.push(nextState);
    }
    colorResults.push(xArr);
  }

  for (var x = 0; x < cubes.length; x++) {
    var arr = cubes[x]!;
    for (var y = 0; y < arr.length; y++) {
      const currentCube = arr[y];
      const nextState = colorResults[x]![y] as THREE.Color;
      currentCube?.material.color.set(nextState);
    }
  }

  renderer?.render(scene, camera);
};

// kick the game off update in intervals
var intervalId: NodeJS.Timer | undefined = undefined;
const startGame = () =>
  (intervalId = setInterval(() => {
    updateGame();
  }, updateInterval));

const resetGame = () => {
  if (intervalId) clearInterval(intervalId);
  clearLiveCubes();
};

export { initGame, startGame, resetGame };
