import "./style.css";
import { createWorker } from 'tesseract.js';
import QRCode from 'qrcode';

const allowBtn = document.querySelector("#allowBtn");
const cameraDiv = document.querySelector("#camera");
const video = document.querySelector("#cameraVideo");
const captureBtn = document.querySelector("#captureBtn");
const photoCanvas = document.querySelector("#photoCanvas");
const photo = document.querySelector("#photo");
const text = document.querySelector("#ocr-text");

const width = 640;
let height = 0;
let streaming = false;

(()=> {
  const vh = window.innerHeight;
  const header = document.getElementById('mainHeader');
  const headerHeight = header ? header.offsetHeight : 0;

  document.body.style.height = vh + "px";
  document.querySelector("main").style.height = (vh - headerHeight) + 'px';
})()

allowBtn.addEventListener("click",()=>{
  navigator.mediaDevices
    .getUserMedia({ video: {facingMode: "environment"}, audio: false })
    .then((stream) => {
      cameraDiv.classList.toggle("hidden");
      allowBtn.classList.toggle("hidden");
      document.querySelector("main div").classList.add("camera-active");
      document.querySelector("#camera").classList.add("camera-active");
      video.srcObject = stream;
      video.play();
    })
    .catch((err) => {
      console.error(`An error occurred: ${err}`);
    });
});

video.addEventListener("canplay", (ev) => {
  if (!streaming) {
    height = video.videoHeight / (video.videoWidth / width);
    video.setAttribute("width", width);
    video.setAttribute("height", height);
    photoCanvas.setAttribute("width", width);
    photoCanvas.setAttribute("height", height);
    streaming = true;
  }
});

captureBtn.addEventListener("click", (ev) => {
  takePicture();
  ev.preventDefault();
});

function clearPhoto() {
  const context = photoCanvas.getContext("2d", { willReadFrequently: true });
  context.fillStyle = "#aaaaaa";
  context.fillRect(0, 0, photoCanvas.width, photoCanvas.height);
  const data = photoCanvas.toDataURL("image/png");
  photo.setAttribute("src", data);
}
clearPhoto();

function takePicture() {
  const context = photoCanvas.getContext("2d", { willReadFrequently: true });
  if (width && height) {
    photoCanvas.width = width;
    photoCanvas.height = height;
    context.drawImage(video, 0, 0, width, height);
    preprocess(photoCanvas);

    const data = photoCanvas.toDataURL("image/png");
    photo.setAttribute("src", data);

    cameraDiv.classList.toggle("hidden");
    document.querySelector("main div").classList.remove("camera-active");
    document.querySelector("#camera").classList.remove("camera-active");
    allowBtn.classList.toggle("hidden");
    displayQr();
  } else {
    clearPhoto();
  }
}

async function displayQr() {
  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789'
  });

  document.body.appendChild(photoCanvas)
  const ret = await worker.recognize(photoCanvas);
  await worker.terminate();

  const rawText = ret.data.text;
  

  const matches = rawText.match(/\b991\d{14}\b/g);
  const qrContainer = document.querySelector("#qrContainer");
  qrContainer.innerHTML = "";

  if (matches) {
    matches.forEach((code) => {
      const canvas = document.createElement("canvas");
      const pText = document.createElement("p");
      pText.textContent = code;
      pText.classList.add("qr-text")
      qrContainer.appendChild(canvas);
      qrContainer.appendChild(pText);
      QRCode.toCanvas(canvas, code, { width: 250 }, (error) => {
        if (error) console.error(error);
      });
    });
  } else {
    text.textContent = "Número no encontrado, inténtalo otra vez";
  }
}

function toGrayscale(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
    data[i] = data[i+1] = data[i+2] = gray;
  }
  ctx.putImageData(imgData, 0, 0);
}

function increaseContrast(canvas, factor = 1.4) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const midpoint = 128;
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let v = data[i + c];
      v = midpoint + (v - midpoint) * factor;
      data[i + c] = Math.max(0, Math.min(255, v));
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function applyBlur(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.filter = 'blur(1px)';
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';
}

function preprocess(canvas) {
  toGrayscale(canvas);
  applyBlur(canvas);
  return canvas;
}
