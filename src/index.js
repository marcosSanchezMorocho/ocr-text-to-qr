import "./style.css";
import { createWorker } from 'tesseract.js';
import QRCode from 'qrcode';

const cameraBtn = document.querySelector(".cameraBtn");

cameraBtn.addEventListener("click",()=>{getMedia({video:true, audio:false})})

async function getMedia(constraints) {
  console.log("We are so in!");
  let stream = null;
  try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      /* use the stream */
  } catch (err) {
      /* handle the error */
      console.log(err);
  }
}

(async () => {

  const worker = await createWorker('eng');
  const testImg = document.querySelector("#test");
  const ret = await worker.recognize(testImg);
  const canvas = document.querySelector("#qrCanvas");
  console.log(ret.data.text);
  QRCode.toCanvas(canvas,ret.data.text, (error)=>{
    if (error) 
      console.error(error);
  })
  await worker.terminate();
})();



