"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from "next/image";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      if (!isScrubbing) {
        setCurrentTime(audio.currentTime);
      }
    };
    const handleLoadedMetadata = () => setDuration(audio.duration);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    if (audio.readyState >= 1) {
      handleLoadedMetadata();
    }
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [isScrubbing]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleScrubbing = useCallback((e: MouseEvent) => {
    const progressBar = document.querySelector('.progress-bar-background') as HTMLDivElement;
    if (isScrubbing && progressBar) {
      const rect = progressBar.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      const newTime = Math.max(0, Math.min(clickPosition * duration, duration));
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    }
  }, [isScrubbing, duration]);

  const handleScrubEnd = useCallback(() => {
    setIsScrubbing(false);
  }, []);

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

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

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
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
    setIsScrubbing(true);
  };

  const increaseVolume = () => setVolume((prev) => Math.min(prev + 0.01, 1));
  const decreaseVolume = () => setVolume((prev) => Math.max(prev - 0.01, 0));

  return (
    <div className="music-player">
      <div className="player-image-container">
        <Image 
          src="https://images.suamusica.com.br/0TuhmKXaHQKLijDISpQBHQevI00=/500x500/filters:format(webp)/287882/4594298/cd_cover.png" 
          alt="Capa da Música" 
          className="player-image"
          width={500}
          height={500}
          priority
        />
      </div>
      <div className="song-info">
        <h2 className="song-title">Vai no Trem</h2>
        <p className="song-artist">Grafith</p>
      </div>
      <div>
        <audio
          ref={audioRef}
          src="/Vai no Trem.mp3"
          onEnded={() => setIsPlaying(false)}
        ></audio>
      </div>
      <div className="progress-container">
        <div className="progress-bar-background" onMouseDown={handleScrubStart}>
            <div className="progress-bar" style={{ width: `${(currentTime / duration) * 100 || 0}%` }}></div>
        </div>
      </div>
      <div className="timestamps">
        <span className="current-time">{formatTime(currentTime)}</span>
        <span className="total-time">{formatTime(duration)}</span>
      </div>

      <div className="all-controls-container">
        <div className="volume-container">
          <button className="control-btn vol-down" onClick={decreaseVolume}><i className="fas fa-volume-down"></i></button>
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="volume-slider" />
          <div className="volume-right-group">
            <button className="control-btn vol-up" onClick={increaseVolume}><i className="fas fa-volume-up"></i></button>
            <span className="volume-percentage">{Math.round(volume * 100)}%</span>
          </div>
        </div>
        <div className="controls">
          <button className="control-btn btn-prev"><i className="fas fa-step-backward"></i></button>
          <button className="control-btn play-btn" onClick={togglePlayPause}><i className={isPlaying ? "fas fa-pause" : "fas fa-play"}></i></button>
          <button className="control-btn btn-next"><i className="fas fa-step-forward"></i></button>
          <button className="control-btn btn-mute" onClick={toggleMute}>
            <i className={isMuted ? "fas fa-volume-mute" : "fas fa-volume-up"}></i>
          </button>
        </div>
      </div>
      
      <div className="status-text">
        <p>{isPlaying ? "Áudio tocando" : "Áudio pausado"}</p>
      </div>
    </div>
  );
}