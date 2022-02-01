const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const videoContainer = document.getElementById("videoContainer");
const fullScreenBtn = document.getElementById("fullScreen");
const videoController = document.getElementById("videoController");

video.volume = 0.5;
let timeOutId = null;

const handleVolumeChange = (event) => {
  const { value: volume } = event.target;
  video.volume = volume;

  if (volume == 0) {
    video.muted = true;
    muteBtn.className = "fas fa-volume-mute";
  } else {
    video.muted = false;
    muteBtn.className = "fas fa-volume-up";
  }
};

const handleMute = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtn.className = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : video.volume == 0 ? 0.5 : video.volume;
  video.volume = video.muted
    ? video.volume
    : video.volume == 0
    ? 0.5
    : video.volume;
};

const videoPlay = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtn.className = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handlePlayClick = (e) => {
  videoPlay();
};

const formatTime = (seconds) => {
  return new Date(seconds * 1000).toISOString().substring(14, 19);
};

const handleMeta = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};
const handleTime = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimeline = (event) => {
  const { value } = event.target;
  video.currentTime = value;
};

let videoStatus = false;

const handleTimelineMousedown = () => {
  videoStatus = video.paused ? false : true;
  video.pause();
};
const handleTimelineMouseup = () => {
  if (videoStatus) {
    video.play();
  } else {
    video.pause();
  }
};

const handleFullScreen = () => {
  if (document.fullscreenElement) {
    fullScreenBtn.className = "fas fa-compress";
  } else {
    fullScreenBtn.className = "fas fa-expand";
  }
};

const handleFullScreenBtn = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    videoContainer.requestFullscreen();
  }
};

const handleKey = (event) => {
  if (event.code === "KeyF" && !document.fullscreenElement) {
    videoContainer.requestFullscreen();
  }
  console.log(event);
  if (event.code === "Space") {
    videoPlay();
  }
};

const handleMouseMove = () => {
  clearTimeout(timeOutId);
  videoController.classList.add("showing");
  timeOutId = setTimeout(
    () => videoController.classList.remove("showing"),
    3000
  );
};
const handleMouseLeave = () => {
  videoController.classList.remove("showing");
};

//video에 mouseleave하면 컨트롤러 사라짐
//video 위에서 마우스 움직이지 않으면 컨트롤러 사라짐
//video 위에 있더라도 컨트롤러 위에 있으면 컨트롤러 사라지지 않음

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
timeline.addEventListener("input", handleTimeline);
timeline.addEventListener("mousedown", handleTimelineMousedown);
timeline.addEventListener("mouseup", handleTimelineMouseup);
video.addEventListener("loadedmetadata", handleMeta);
video.addEventListener("timeupdate", handleTime);
video.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("mousemove", handleMouseMove);
fullScreenBtn.addEventListener("click", handleFullScreenBtn);
document.addEventListener("fullscreenchange", handleFullScreen);
document.addEventListener("keydown", handleKey);

if (video.readyState == 4) {
  handleMeta();
}
