"use client";

import { useState, useRef, useEffect } from 'react';
import Image from "next/image";

const playlist = [
  {
    titulo: "Vai no Trem",
    artista: "Grafith",
    imagem: "https://images.suamusica.com.br/0TuhmKXaHQKLijDISpQBHQevI00=/500x500/filters:format(webp)/287882/4594298/cd_cover.png",
    src: "/Vai no Trem.mp3"
  },
  {
    titulo: "Outra Música (Exemplo)",
    artista: "Artista 2",
    imagem: "https://placehold.co/500x500/e74c3c/FFF?text=Musica+2",
    src: "/Vai no Trem.mp3" 
  },
  {
    titulo: "Mais Uma (Exemplo)",
    artista: "Artista 3",
    imagem: "https://placehold.co/500x500/3498db/FFF?text=Musica+3",
    src: "/Vai no Trem.mp3" 
  }
];

export default function Home() {
  const [faixaAtual, setFaixaAtual] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isScrubbing, setIsScrubbing] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const musica = playlist[faixaAtual];

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
  }, [faixaAtual, isScrubbing]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  const handleScrubbing = (e: MouseEvent) => {
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
  };

  const handleScrubEnd = () => {
    setIsScrubbing(false);
  };

  useEffect(() => {
    if (isScrubbing) {
      window.addEventListener('mousemove', handleScrubbing);
      window.addEventListener('mouseup', handleScrubEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleScrubbing);
      window.removeEventListener('mouseup', handleScrubEnd);
    };
  }, [isScrubbing, duration]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const proximaMusica = () => setFaixaAtual((prev) => (prev + 1) % playlist.length);
  const musicaAnterior = () => setFaixaAtual((prev) => (prev - 1 + playlist.length) % playlist.length);
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  const handleScrubStart = (e: React.MouseEvent<HTMLDivElement>) => {
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
        <Image src={musica.imagem} alt={musica.titulo} className="player-image" width={500} height={500} priority key={musica.imagem} />
      </div>
      <div className="song-info">
        <h2 className="song-title">{musica.titulo}</h2>
        <p className="song-artist">{musica.artista}</p>
      </div>
      <div>
        <audio key={musica.src} ref={audioRef} src={musica.src} onEnded={proximaMusica}></audio>
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
      <div className="volume-container">
        <button className="control-btn" onClick={decreaseVolume}><i className="fas fa-volume-down"></i></button>
        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="volume-slider" />
        <button className="control-btn" onClick={increaseVolume}><i className="fas fa-volume-up"></i></button>
        <span style={{ color: '#bdc3c7', minWidth: '45px', textAlign: 'left' }}>{Math.round(volume * 100)}%</span>
      </div>
      <div className="controls">
        <button className="control-btn" onClick={musicaAnterior}><i className="fas fa-step-backward"></i></button>
        <button className="control-btn play-btn" onClick={togglePlayPause}><i className={isPlaying ? "fas fa-pause" : "fas fa-play"}></i></button>
        <button className="control-btn" onClick={proximaMusica}><i className="fas fa-step-forward"></i></button>
      </div>
      <div style={{ textAlign: 'center', paddingBottom: '20px', color: '#7f8c8d', fontSize: '14px' }}>
        <p>{isPlaying ? "Áudio tocando" : "Áudio pausado"}</p>
      </div>
    </div>
  );
}