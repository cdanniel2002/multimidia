"use client";

import { useState, useRef, useEffect, useCallback } from 'react';

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      if (!isScrubbing) {
        setCurrentTime(video.currentTime);
      }
    };
    
    const handleLoadedMetadata = () => setDuration(video.duration);
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [isScrubbing]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleScrubStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(clickPosition * duration, duration));
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
    setIsScrubbing(true);
  };

  const handleScrubbing = useCallback((e: MouseEvent) => {
    const progressBar = document.querySelector('.progress-bar-background') as HTMLDivElement;
    if (isScrubbing && progressBar) {
      const rect = progressBar.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      const newTime = Math.max(0, Math.min(clickPosition * duration, duration));
      
      if (videoRef.current) {
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    }
  }, [isScrubbing, duration]);

  const handleScrubEnd = useCallback(() => {
    setIsScrubbing(false);
    if (isPlaying && videoRef.current) {
        videoRef.current.play();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isScrubbing) {
      window.addEventListener('mousemove', handleScrubbing);
      window.addEventListener('mouseup', handleScrubEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleScrubbing);
      window.removeEventListener('mouseup', handleScrubEnd);
    };
  }, [isScrubbing, handleScrubbing, handleScrubEnd]);

  return (
    <div className="video-player-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          src="/video_teste.mp4" 
          className="video-screen"
          onClick={togglePlayPause}
          onEnded={() => setIsPlaying(false)}
        ></video>
      </div>

      <div className="controls-overlay">
        <div className="progress-section">
            <span className="time-text">{formatTime(currentTime)}</span>
            <div className="progress-bar-background" onMouseDown={handleScrubStart}>
                <div className="progress-bar" style={{ width: `${(currentTime / duration) * 100 || 0}%` }}></div>
            </div>
            <span className="time-text">{formatTime(duration)}</span>
        </div>

        <div className="buttons-row">
            <div className="volume-control">
                <button className="icon-btn" onClick={toggleMute}>
                     <i className={isMuted ? "fas fa-volume-mute" : "fas fa-volume-up"}></i>
                </button>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={isMuted ? 0 : volume} 
                    onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }} 
                    className="volume-slider" 
                />
            </div>

            <button className="play-btn-large" onClick={togglePlayPause}>
                <i className={isPlaying ? "fas fa-pause" : "fas fa-play"}></i>
            </button>

            <div style={{ width: '150px' }}></div> 
        </div>
      </div>
    </div>
  );
}