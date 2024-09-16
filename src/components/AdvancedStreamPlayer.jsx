import { useRef, useEffect, useState } from "react";
import Hls from "hls.js";

const AdvancedLiveStreamPlayer = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);
  const streamUrl =
    "https://st3.1ten.live/memfs/3af832e1-c6ac-4f78-81c8-cdda2f9594b4.m3u8";

  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        videoRef.current.muted = true; // Mute the video to bypass autoplay restrictions
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.log("Autoplay prevented:", err);
          });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("Network error - Please check your connection");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("Media error - Unsupported format");
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setError("An unknown error occurred");
              break;
          }
        }
      });

      const handleLatency = () => {
        const video = videoRef.current;
        if (video && hls.liveSyncPosition) {
          const currentLatency = video.currentTime - hls.liveSyncPosition;
          setLatency(currentLatency.toFixed(2));
        }
      };

      const intervalId = setInterval(handleLatency, 1000);

      return () => {
        clearInterval(intervalId);
        hls.destroy();
      };
    }
  }, [streamUrl]);

  const togglePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="max-w-screen-md mx-auto my-10">
      <h1 className="text-center text-2xl font-bold mb-4">
        Advanced Live Stream
      </h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {isLoading && <p className="text-center">Loading stream...</p>}

      <div className="relative pb-9/16 bg-black">
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          playsInline // Ensures proper behavior on iOS
          muted // Ensures autoplay works across browsers
        />
      </div>

      <div className="flex justify-between items-center mt-4">
        {/* <button
          onClick={togglePlayPause}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          {isPlaying ? "Pause" : "Play"}
        </button> */}
        <p className="text-gray-500">
          Latency: {latency ? `${latency} seconds` : "Calculating..."}
        </p>
      </div>
    </div>
  );
};

export default AdvancedLiveStreamPlayer;
