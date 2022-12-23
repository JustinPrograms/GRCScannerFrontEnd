(() => {


  const width = 320; // We will scale the photo width to this
  let height = 0; // This will be computed based on the input stream

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  let streaming = false;

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.

  let video = null;
  let canvas = null;
  let photo = null;
  let startbutton = null;
  let recycling = [];
  let compost = [];
  let compostCounter = 0;
  let recyclingCounter = 0;
  //let garbageCounter = 0;
  recycling = ["Water bottle", "Bottle", "Plastic bottle", "Bottle cap", "Glass bottle", "Bagged packaged goods", "Packaged goods", "Plastic", "Bottled and jarred packaged goods", "Canned packaged goods", "Transparent material", "Paper", "Cardboard", "Glass", "Metal", "Aluminium", "Steel", "Tires", "Boxed packaged goods"]
  compost = ["Food", "Bread", "Diaper", "Plant", "Soil"]
  function showViewLiveResultButton() {
    if (window.self !== window.top) {
      // Ensure that if our document is in a frame, we get the user
      // to first open it in its own tab or window. Otherwise, it
      // won't be able to request permission for camera access.
      document.querySelector(".contentarea").remove();
      const button = document.createElement("button");
      button.textContent = "View live result of the example code above";
      document.body.append(button);
      button.addEventListener("click", () => window.open(location.href));
      return true;
    }
    return false;
  }

  function startup() {
    if (showViewLiveResultButton()) {
      return;
    }
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    photo = document.getElementById("photo");
    startbutton = document.getElementById("startbutton");

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error(`An error occurred: ${err}`);
      });

    video.addEventListener(
      "canplay",
      (ev) => {
        if (!streaming) {
          height = video.videoHeight / (video.videoWidth / width);

          if (isNaN(height)) {
            height = width / (4 / 3);
          }

          video.setAttribute("width", width);
          video.setAttribute("height", height);
          canvas.setAttribute("width", width);
          canvas.setAttribute("height", height);
          streaming = true;
        }
      },
      false
    );

    startbutton.addEventListener(
      "click",
      (ev) => {
        takepicture();
        ev.preventDefault();
      },
      false
    );

    clearphoto();
  }

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    const context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  }

  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takepicture() {
    const context = canvas.getContext("2d");
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);


      const dataUrl = canvas.toDataURL("image/png");

      photo.setAttribute("src", dataUrl);

      var data = dataUrl.split(',');
      data = data[1]
      console.log("Data: ", data);


      const apiKey = '';
      const visionApiUrl = '';

      const request = {
        requests: [
          {
            image: {
              content: data,
            },
            features: [
              {
                type: 'OBJECT_LOCALIZATION',
              },
            ],
          },
        ],
      };

      // var arrayCounter = 0;
      const objects = [];

      fetch(`${visionApiUrl}?key=${apiKey}`, {
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Something went wrong');
          }
        })
        .then(data => {

          // The API response is stored in the "data" variable
          console.log(JSON.stringify(data));
          for (let i = 0; i < data.responses[0].localizedObjectAnnotations.length; i++) {
            // Get the current annotation
            const annotation = data.responses[0].localizedObjectAnnotations[i];
            // Print the name of the annotation to the console
            console.log(annotation.name);
            objects[i] = annotation.name;
          }

          var arrayCounter = 0;
          console.log("Objects: ", objects);
          arrayCounter = objects.length;
          console.log("Length of objects array: ", arrayCounter);
          recycling = ["Water bottle", "Bottle", "Plastic bottle", "Bottle cap", "Glass bottle", "Bagged packaged goods", "Packaged goods", "Plastic", "Bottled and jarred packaged goods", "Canned packaged goods", "Transparent material", "Paper", "Cardboard", "Glass", "Metal", "Aluminium", "Steel", "Tires", "Boxed packaged goods"]
          compost = ["Food", "Bread", "Diaper", "Plant", "Soil"]

          console.log("Length of objects array: ", arrayCounter);

          for (let i = 0; i < arrayCounter; i++) {
            for (let j = 0; j < recycling.length; j++) {
              if (objects[i] == recycling[j]) {
                recyclingCounter++;
              }
            }
            for (let k = 0; k < compost.length; k++) {
              if (objects[i] == compost[k]) {
                compostCounter++;
              }
            }
          }

          let temp = arrayCounter;
          console.log("temp: ", temp, " Objects.length: ", objects.length)
          temp = temp - recyclingCounter;
          temp = temp - compostCounter;

          console.log("Recycling: ", recyclingCounter, " Compost: ", compostCounter, " Garbage: ", temp)

          var food = 0
          var packagedGoods = 0

          if ((recyclingCounter > 0) && (compostCounter > 0)) {
            for (let i = 0; i < objects.length; i++) {
              if (objects[i] == 'Food') {
                food++;
              }
              if (objects[i] == 'Packaged goods') {
                packagedGoods++;
              }
            }
            if (food > 0 && packagedGoods > 0) {
              document.getElementById("results").innerHTML = "Packaged goods goes into recycling and food goes into compost";
            } else if (food > 0) {
              document.getElementById("results").innerHTML = "Food goes into compost";
            } else if (packagedGoods > 0) {
              document.getElementById("results").innerHTML = "Packaged goods goes into recycling";
            } else {
              document.getElementById("results").innerHTML = "Recycling and Compost";
            }
          } else if (recyclingCounter > 0) {
            document.getElementById("results").innerHTML = "Recycling";
          } else if (compostCounter > 0) {
            document.getElementById("results").innerHTML = "Compost";
          } else {
            document.getElementById("results").innerHTML = "Garbage";
          }





          // //Working sort
          // if((recyclingCounter>0) && (compostCounter>0)){
          //   document.getElementById("results").innerHTML = "Recycling and Compost";
          // }else if(recyclingCounter>0){
          //   document.getElementById("results").innerHTML = "Recycling";
          // }else if(compostCounter>0){
          //   document.getElementById("results").innerHTML = "Compost";
          // }else{
          //   document.getElementById("results").innerHTML = "Garbage";
          // }

          temp = 0;
          recyclingCounter = 0;
          compostCounter = 0;
          food = 0
          packagedGoods = 0
          objects = [];

          //}

        })
        .catch(error => {
          console.error(error);
        });




    } else {
      clearphoto();

    }
  }



  // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener("load", startup, false);



})();

