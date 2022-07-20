// callback: launched if a face is detected or lost.

function detect_callback(faceIndex, isDetected) {
  var loading = document.getElementById("loading_ff");
  if (isDetected) {
    console.log("INFO in detect_callback(): DETECTED");
    loading.style.display = "none";
  } else {
    console.log("INFO in detect_callback(): LOST");
    loading.style.display = "block";
  }
}

// build the 3D. called once when Jeeliz Face Filter is OK
function init_threeScene(spec) {
  console.log("-----init_threeScene", new Date());
  var threeStuffs = JeelizThreeHelper.init(spec, detect_callback);

  const light = new THREE.PointLight(0xffffff, 1, 1000);
  light.position.set(0, 0, 0);
  threeStuffs.scene.add(light);

  const light2 = new THREE.AmbientLight(0xffffff, 2, 100);
  light.position.set(0, 0, 25);
  threeStuffs.scene.add(light);

  // console.log(spec);

  setInterval(() => {
    var loader = new THREE.GLTFLoader();
    var id = sessionStorage.getItem("id");
    // console.log(threeStuffs.faceObject);

    var modelPath = "/necklaces/necklace" + id + ".glb";

    loader.load(modelPath, function (gltf) {
      gltf.scene.scale.multiplyScalar(1);
      gltf.scene.position.set(0.25, -1.75, -2.5);
      threeStuffs.faceObject.add(gltf.scene);

      setTimeout(() => {
        threeStuffs.faceObject.remove(gltf.scene);
      }, 999);
    });
  }, 1000);

  document
    .getElementById("photo-button")
    .addEventListener("click", function () {
      //  alert("screenshot")
      saveAsImage();
    });

  function saveAsImage() {
    var imgData = threeStuffs.renderer.domElement.toDataURL("image/jpeg", 0.5);
    var img = new Image();
    img.onload = function () {
      var c = document.createElement("canvas");
      c.width = this.width;
      c.height = this.height;
      var ctx = c.getContext("2d");

      // ctx.lineWidth = 10;
      // ctx.strokeStyle="red";
      // ctx.strokeRect(0,0, this.width, this.height);

      ctx.scale(-1, 1);
      ctx.drawImage(this, -this.width, 0);

      this.onload = undefined;
      // target.src = c.toDataURL();
      var imgMain = c.toDataURL("image/jpeg", 0.5);
      //  console.log("canvas img", imgMain)
      var a = document.getElementById("descarga-link");
      a.href = imgMain;
      let randomFile = Math.random().toString(26).slice(6);
      a.download = randomFile;
      a.click();
    };
    img.src = imgData;
  }

  //CREATE THE CAMERA
  THREECAMERA = JeelizThreeHelper.create_camera();
} // end init_threeScene()

// launched by body.onload():
function main() {
  console.log("-----main");

  JeelizResizer.size_canvas({
    canvasId: "jeeFaceFilterCanvas",
    callback: function (isError, bestVideoSettings) {
      init_faceFilter(bestVideoSettings);
    },
  });
}

function init_faceFilter(videoSettings) {
  console.log("-----init_faceFilter", new Date());

  JEELIZFACEFILTER.init({
    followZRot: true,
    canvasId: "jeeFaceFilterCanvas",
    NNCPath: "neuralNets/", // root of NN_DEFAULT.json file
    maxFacesDetected: 1,
    callbackReady: function (errCode, spec) {
      if (errCode) {
        console.log("AN ERROR HAPPENS. ERR =", errCode);
        return;
      }

      console.log("INFO: JEELIZFACEFILTER IS READY");
      // var isDetectedCheck = setInterval(() => {
      //   if (isDetected) {

      //     clearInterval(isDetectedCheck);
      //   }
      // },1000)

      init_threeScene(spec);
    },

    // called at each render iteration (drawing loop):
    callbackTrack: function (detectState) {
      JeelizThreeHelper.render(detectState, THREECAMERA);
    },
  }); //end JEELIZFACEFILTER.init call
}
