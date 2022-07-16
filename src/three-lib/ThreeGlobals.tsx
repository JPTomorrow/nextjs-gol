// need to stay alive forever
import * as THREE from "three";

let scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, 4 / 3, 0.1, 10000);
var gameCanvas: HTMLCanvasElement | null = null;
var renderer: THREE.WebGLRenderer | undefined = undefined;

const initRenderer = () => {
  gameCanvas = document.getElementById(
    "game-of-life-canvas"
  ) as HTMLCanvasElement;
  renderer = new THREE.WebGLRenderer({
    canvas: gameCanvas,
    alpha: true,
  });
};

const destroyGame = (): void => {
  scene = new THREE.Scene();
  gameCanvas = null;
  renderer = undefined;
};

// import an .obj model
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

type ModelImportProps = {
  fileName: string;
  material?: THREE.MeshStandardMaterial;
  scale?: number;
  position?: number;
  name?: string;
};

const objImport = (options: ModelImportProps) => {
  const modelName = options.name
    ? options.name
    : options.fileName.split(".")[0];

  let loader = new OBJLoader();
  loader.setPath("/src/assets/");
  loader.load(options.fileName, (obj) => {
    let object = obj;

    const scaleVal = options.scale ? options.scale : 30;
    const scale = {
      x: scaleVal,
      y: scaleVal,
      z: scaleVal,
    };

    const position = {
      x: options.position ? options.position : 0,
      y: options.position ? options.position : 0,
      z: options.position ? options.position : -100,
    };

    object.scale.set(scale.x, scale.y, scale.z);
    object.position.set(position.x, position.y, position.z);
    object.name = modelName;

    // change material of mesh on object
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = options.material
          ? options.material
          : new THREE.MeshStandardMaterial({
              color: "black",
            });
        child.material = mat;
      }
    });

    scene.add(object);
    renderer?.render(scene, camera);
  });
};

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const gltfImport = (options: ModelImportProps) => {
  // separate filename from any sub folder provided in string
  let fn = options.fileName;
  let addedPath = "";
  if (fn.includes("/")) {
    const split = fn.split("/");
    fn = split[split.length - 1];
    addedPath = split.slice(0, split.length - 1).join("/") + "/";
  }

  const loader = new GLTFLoader();
  loader.setPath("/src/assets/" + addedPath);
  loader.load(fn, (gltf) => {
    gltf.scene.scale.set(50, 50, 50);
    gltf.scene.rotateY(160);
    scene.add(gltf.scene);
    renderer?.render(scene, camera);
  });
};

export {
  scene,
  camera,
  renderer,
  gameCanvas,
  initRenderer,
  destroyGame,
  objImport,
  gltfImport,
};

export type { ModelImportProps };
