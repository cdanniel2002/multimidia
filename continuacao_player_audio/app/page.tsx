"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from "next/image";

const playlist = [
  {
    id: 1,
    titulo: "Vai no Trem",
    artista: "Grafith",
    imagem: "https://images.suamusica.com.br/0TuhmKXaHQKLijDISpQBHQevI00=/500x500/filters:format(webp)/287882/4594298/cd_cover.png",
    src: "/Vai no Trem.mp3"
  },
  {
    id: 2,
    titulo: "Amor dos Outros",
    artista: "Milsinho Toque Dez",
    imagem: "https://images.suamusica.com.br/7yz5SbbA6lCYD9YvqGDF4jlNcBY=/500x500/filters:format(webp)/65016925/4833794/cd_cover.jpg?1",
    src: "/03 - AMOR DOS OUTROS.mp3"
  },
  {
    id: 3,
    titulo: "Foi o Destino",
    artista: "Milsinho Toque Dez",
    imagem: "https://images.suamusica.com.br/7yz5SbbA6lCYD9YvqGDF4jlNcBY=/500x500/filters:format(webp)/65016925/4833794/cd_cover.jpg?1",
    src: "/02 - FOI O DESTINO.mp3"
  }
];

export default function Home() {
  const [faixaAtual, setFaixaAtual] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const musica = playlist[faixaAtual];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.play().catch(error => console.error("Autoplay bloqueado:", error));
    } else {
      audio.pause();
    }
  }, [isPlaying, faixaAtual]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => !isScrubbing && setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    if (audio.readyState >= 1) handleLoadedMetadata();

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [isScrubbing, faixaAtual]);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);
  useEffect(() => { if (audioRef.current) audioRef.current.muted = isMuted; }, [isMuted]);

  const handleScrubbing = useCallback((e: MouseEvent) => {
    const progressBar = document.querySelector('.progress-bar-background') as HTMLDivElement;
    if (isScrubbing && progressBar && duration > 0) {
        const rect = progressBar.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        const newTime = Math.max(0, Math.min(clickPosition * duration, duration));
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    }
  }, [isScrubbing, duration]);

  const handleScrubEnd = useCallback(() => setIsScrubbing(false), []);

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

  const togglePlayPause = () => setIsPlaying(!isPlaying);
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
    if (audioRef.current) {
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }
    setIsScrubbing(true);
  };
  const increaseVolume = () => setVolume((prev) => Math.min(prev + 0.01, 1));
  const decreaseVolume = () => setVolume((prev) => Math.max(prev - 0.01, 0));

  const selecionarMusica = (index: number) => {
    setFaixaAtual(index);
    setIsPlaying(true);
  };

  const proximaMusica = useCallback(() => {
    setFaixaAtual((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  }, []);

  const musicaAnterior = () => {
    setFaixaAtual((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.currentTime + seconds, duration);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const rewindTime = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - seconds, 0);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="main-container">
      <div className="playlist-container">
        <h3>Playlist</h3>
        <ul>
          {playlist.map((item, index) => (
            <li 
              key={item.id} 
              onClick={() => selecionarMusica(index)}
              className={index === faixaAtual ? 'active-track' : ''}
            >
              {item.titulo} - {item.artista}
            </li>
          ))}
        </ul>
      </div>

      <div className="music-player">
        <div className="player-image-container">
          <Image 
            src={musica.imagem} 
            alt={musica.titulo} 
            className="player-image"
            width={500}
            height={500}
            priority
            key={musica.imagem}
          />
        </div>
        <div className="song-info">
          <h2 className="song-title">{musica.titulo}</h2>
          <p className="song-artist">{musica.artista}</p>
        </div>
        <div>
          <audio
            ref={audioRef}
            src={musica.src}
            onEnded={proximaMusica}
            key={musica.src}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
            onCanPlay={() => {
                if (isPlaying) {
                    audioRef.current?.play().catch(error => console.error("Autoplay bloqueado:", error));
                }
            }}
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
            <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }} className="volume-slider" disabled={isMuted} />
            <button className="control-btn vol-up" onClick={increaseVolume}><i className="fas fa-volume-up"></i></button>
            <span className="volume-percentage">{isMuted ? 'Mudo' : `${Math.round(volume * 100)}%`}</span>
          </div>

          <div className="time-controls">
            <button className="control-btn" onClick={() => rewindTime(10)} title="Retroceder 10s">
              <i className="fas fa-undo-alt"></i>
            </button>
            <button className="control-btn" onClick={() => skipTime(10)} title="Avançar 10s">
              <i className="fas fa-redo-alt"></i>
            </button>
          </div>

          <div className="controls">
            <button className="control-btn btn-prev" onClick={musicaAnterior}><i className="fas fa-step-backward"></i></button>
            <button className="control-btn play-btn" onClick={togglePlayPause}><i className={isPlaying ? "fas fa-pause" : "fas fa-play"}></i></button>
            <button className="control-btn btn-next" onClick={proximaMusica}><i className="fas fa-step-forward"></i></button>
            <button className="control-btn btn-mute" onClick={toggleMute}><i className={isMuted ? "fas fa-volume-mute" : "fas fa-volume-off"}></i></button>
          </div>
        </div>
        
        <div className="status-text">
          <p>{isPlaying ? "Áudio tocando" : "Áudio pausado"}</p>
        </div>
      </div>
    </div>
  );
}