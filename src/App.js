import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import { TrackballControls } from "./three.js-master/examples/jsm/controls/TrackballControls";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "./three.js-master/examples/jsm/renderers/CSS3DRenderer";
import Lightbox from "./Lightbox";

const apikey = process.env.REACT_APP_PEXELS_API_KEY;
const url = `https://api.pexels.com/v1/curated?per_page=50`;

function App() {
  const [getdata, setGetdata] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [filterBlur, setFilterBlur] = useState(false);

  const closeLightbox = () => {
    setOpenLightbox(false);
    setFilterBlur(false);
  };

  const fetchPhotos = async () => {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: apikey,
      },
    });
    const images = await res.json();
    setGetdata(images.photos);
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const canvasRef = useRef();
  useEffect(() => {
    let camera, scene, renderer;
    let controls;

    const objects = [];
    const targets = { table: [], sphere: [], helix: [], grid: [] };

    init();
    animate();

    function init() {
      camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      camera.position.z = 3000;

      scene = new THREE.Scene();

      // table

      for (let i = 0; i < getdata.length; i++) {
        const element = document.createElement("div");
        element.className = "element";

        const image = document.createElement("img");
        image.src = getdata[i].src.landscape;
        image.className = "img";
        image.addEventListener("click", (e) => {
          setPhoto(e.target.src);
          setOpenLightbox(true);
          setFilterBlur(true);
        });
        element.appendChild(image);

        const objectCSS = new CSS3DObject(element);
        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;
        scene.add(objectCSS);

        objects.push(objectCSS);

        //

        const object = new THREE.Object3D();
        object.position.x = (i % 10) * 400 - 1900;
        object.position.y = -Math.floor(i / 10) * 400 + 800;

        targets.table.push(object);
      }

      // sphere

      const vector = new THREE.Vector3();

      for (let i = 0, l = objects.length; i < l; i++) {
        const phi = Math.acos(-1 + (2 * i) / l);
        const theta = Math.sqrt(l * Math.PI) * phi;

        const object = new THREE.Object3D();

        object.position.setFromSphericalCoords(800, phi, theta);

        vector.copy(object.position).multiplyScalar(2);

        object.lookAt(vector);

        targets.sphere.push(object);
      }

      // helix

      for (let i = 0, l = objects.length; i < l; i++) {
        const theta = i * 0.35 + Math.PI;
        const y = -(i * 15) + 450;

        const object = new THREE.Object3D();

        object.position.setFromCylindricalCoords(900, theta, y);

        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;

        object.lookAt(vector);

        targets.helix.push(object);
      }

      // grid

      for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();

        object.position.x = (i % 5) * 400 - 800;
        object.position.y = -(Math.floor(i / 5) % 5) * 400 + 800;
        object.position.z = Math.floor(i / 25) * 1000 - 2000;

        targets.grid.push(object);
      }

      //

      renderer = new CSS3DRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      canvasRef.current.appendChild(renderer.domElement);

      //

      controls = new TrackballControls(camera, renderer.domElement);
      controls.minDistance = 500;
      controls.maxDistance = 6000;
      controls.addEventListener("change", render);

      const buttonTable = document.getElementById("table");
      buttonTable.addEventListener("click", function () {
        transform(targets.table, 2000);
      });

      const buttonSphere = document.getElementById("sphere");
      buttonSphere.addEventListener("click", function () {
        transform(targets.sphere, 2000);
      });

      const buttonHelix = document.getElementById("helix");
      buttonHelix.addEventListener("click", function () {
        transform(targets.helix, 2000);
      });

      const buttonGrid = document.getElementById("grid");
      buttonGrid.addEventListener("click", function () {
        transform(targets.grid, 2000);
      });

      transform(targets.table, 2000);

      //

      window.addEventListener("resize", onWindowResize);
    }

    function transform(targets, duration) {
      TWEEN.removeAll();

      for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const target = targets[i];

        new TWEEN.Tween(object.position)
          .to(
            {
              x: target.position.x,
              y: target.position.y,
              z: target.position.z,
            },
            Math.random() * duration + duration
          )
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();

        new TWEEN.Tween(object.rotation)
          .to(
            {
              x: target.rotation.x,
              y: target.rotation.y,
              z: target.rotation.z,
            },
            Math.random() * duration + duration
          )
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();
      }

      new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);

      render();
    }

    function animate() {
      requestAnimationFrame(animate);

      TWEEN.update();

      controls.update();
    }

    function render() {
      renderer.render(scene, camera);
    }
    return () => canvasRef.current.removeChild(renderer.domElement);
  }, [getdata]);

  return (
    <div className="App">
      <div
        className={`${filterBlur ? "canvas blur" : "canvas"}`}
        ref={canvasRef}
      ></div>
      <div id="menu">
        <button id="table">TABLE</button>
        <button id="sphere">SPHERE</button>
        <button id="helix">HELIX</button>
        <button id="grid">GRID</button>
      </div>

      <Lightbox
        photo={photo}
        openLightbox={openLightbox}
        closeLightbox={closeLightbox}
      />
    </div>
  );
}

export default App;
