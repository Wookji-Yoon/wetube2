import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const recordBtn = document.getElementById("recordBtn");
const previewVideo = document.getElementById("preview");

let stream;
let recording;
let videoFile;
let timerId;

const files = {
  input: "recoring.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 1024, height: 576 },
  });
  previewVideo.srcObject = stream;
  previewVideo.play();
  recordBtn.classList.add("showing");
};

const handleButtonText = () => {
  let second = 2;
  recordBtn.disabld = true;
  timerId = setInterval(() => {
    recordBtn.innerText = `Recording... 0:0${second}`;
    second = second - 1;
  }, 1000);
};

const handleStart = () => {
  handleButtonText();

  recording = new MediaRecorder(stream);
  recording.start();
  recording.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    previewVideo.srcObject = null;
    previewVideo.src = videoFile;
    previewVideo.loop = true;
    previewVideo.play();
  };

  setTimeout(() => {
    clearTimeout(timerId);
    recordBtn.removeEventListener("click", handleStart);
    recordBtn.addEventListener("click", handleDownload);
    recordBtn.innerText = "녹화완료! Download!";
    recordBtn.disabled = false;
    recording.stop();
  }, 3500);
};

const handleDownload = async () => {
  recordBtn.disabled = true;
  recordBtn.innerText = "Transcoding...";

  const ffmpeg = createFFmpeg({
    corePath: "/static/ffmpeg-core.js",
    log: true,
  });
  await ffmpeg.load();

  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

  await ffmpeg.run("-i", files.input, "-r", "60", files.output);

  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb
  );

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], {
    type: "image/jpg",
  });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, "My Recording.mp4");
  downloadFile(thumbUrl, "My Thumbnail.jpg");

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  recordBtn.removeEventListener("click", handleDownload);
  recordBtn.addEventListener("click", handleStart);
  recordBtn.innerText = "Record Again!";
  recordBtn.disabled = false;
};

init();

recordBtn.addEventListener("click", handleStart);
