import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader';
import React, { useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';

export default function App() {
  const mount = useRef();

  const onProgress = function (xhr) {
    if (xhr.lengthComputable) {
      const percentComplete = (xhr.loaded / xhr.total) * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  };

  const onError = function () {};

  useEffect(() => {
    const mainScene = new THREE.Scene();

    const mainCamera = new THREE.PerspectiveCamera(
      20,
      window.innerWidth / window.innerHeight,
      0.1,
      20,
    );
    mainCamera.position.z = 10;

    // Add Point Lights

    const backLight = new THREE.PointLight(0x00cdac, .7, 20);
    backLight.position.set(-5, 5, -5);
    mainScene.add(backLight);

    const fillLight = new THREE.PointLight(0x02aab0, 0.7, 20);
    fillLight.position.set(-5, 0, 5);
    mainScene.add(fillLight);

    const keyLight = new THREE.PointLight(0x00cdac, .5, 20);
    keyLight.position.set(5, 0, 0);
    mainScene.add(keyLight);

    // Create Renderer

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.current.appendChild(renderer.domElement);

    // Placeholder 3D Cube

    // const geometry = new THREE.BoxGeometry();
    // const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    // const cube = new THREE.Mesh(geometry, material);
    // mainScene.add(cube);

    // Load 3d model

    const modelContainer = new THREE.Group();
    mainScene.add(modelContainer);

    const manager = new THREE.LoadingManager();
    manager.addHandler(/\.dds$/i, new DDSLoader());

    new MTLLoader(manager).load('./untitled.mtl', function (materials) {
      materials.preload();

      new OBJLoader(manager).setMaterials(materials).load(
        './untitled.obj',
        function (object) {
          modelContainer.add(object);
        },
        onProgress,
        onError,
      );
    });

    // Handle Window Resize

    function resizeRenderer() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      mainCamera.aspect = window.innerWidth / window.innerHeight;
      mainCamera.updateProjectionMatrix();
    }
    window.addEventListener('resize', debounce(resizeRenderer, 50));

    // Render Scene

    const onDocumentMouseMove = (event) => {
      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
    };

    document.addEventListener('mousemove', onDocumentMouseMove);

    let mouseX = 0;
    let mouseY = 0;

    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const clock = new THREE.Clock();

    function render() {
      targetX = mouseX * 0.00015;
      targetY = mouseY * 0.00015;

      const delta = clock.getDelta();

      // modelContainer.rotation.x += delta * 0.5;
      // modelContainer.rotation.y += delta * 0.5;

      modelContainer.rotation.y += 0.5 * (targetX - modelContainer.rotation.y);
      modelContainer.rotation.x += 0.5 * (targetY - modelContainer.rotation.x);

      renderer.render(mainScene, mainCamera);

      requestAnimationFrame(render);
    }

    render();
  }, []);

  return <div ref={mount} />;
}
