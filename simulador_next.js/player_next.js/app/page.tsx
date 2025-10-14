"use client";

import { useState, useRef, useEffect } from 'react';
import Image from "next/image";

export default function Home() {
  // --- ESTADOS (STATE) ---
  // Guarda o estado de play/pause da música
  const [isPlaying, setIsPlaying] = useState(false);
  // Guarda a duração total da música em segundos
  const [duration, setDuration] = useState(0);
  // Guarda o tempo atual da música em segundos
  const [currentTime, setCurrentTime] = useState(0);
  // Guarda o volume da música (de 0.0 a 1.0)
  const [volume, setVolume] = useState(0.5); // Volume inicial em 50%

  // --- REFERÊNCIA (REF) ---
  // Referência direta para o elemento <audio> no HTML
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- EFEITOS (EFFECTS) ---
  // Efeito para buscar a duração e atualizar o tempo da música
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Função para atualizar o estado do tempo atual
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    // Função para definir a duração total quando os metadados da música carregam
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Função de limpeza: remove os "ouvintes" quando o componente é desmontado
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Efeito para atualizar o volume do áudio sempre que o estado 'volume' mudar
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // --- FUNÇÕES ---
  // Função para tocar ou pausar a música
  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying); // Inverte o estado
  };

  // Função para formatar segundos para o formato MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // --- RENDERIZAÇÃO DO COMPONENTE (JSX) ---
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

      {/* Elemento de áudio, não visível na tela mas controlado pelo código */}
      <div>
        <audio
          ref={audioRef}
          src="/Vai no Trem.mp3"
          onEnded={() => setIsPlaying(false)}
        ></audio>
      </div>

      {/* Barra de Progresso e Tempos */}
      <div className="progress-container">
        <div className="progress-bar-background">
            <div 
              className="progress-bar"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            ></div>
        </div>
      </div>
      <div className="timestamps">
        <span className="current-time">{formatTime(currentTime)}</span>
        <span className="total-time">{formatTime(duration)}</span>
      </div>

      {/* Controle de Volume */}
      <div className="volume-container">
        <i className="fas fa-volume-down" style={{ color: '#bdc3c7' }}></i>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="volume-slider"
        />
        <i className="fas fa-volume-up" style={{ color: '#bdc3c7' }}></i>
      </div>

      {/* Controles Principais */}
      <div className="controls">
        <button className="control-btn"><i className="fas fa-step-backward"></i></button>
        <button className="control-btn play-btn" onClick={togglePlayPause}>
          <i className={isPlaying ? "fas fa-pause" : "fas fa-play"}></i>
        </button>
        <button className="control-btn"><i className="fas fa-step-forward"></i></button>
      </div>
    </div>
  );
}