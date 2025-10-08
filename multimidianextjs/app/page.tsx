import Image from "next/image";

export default function Home() {
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
        <audio id="audio-player" src="/Vai no Trem.mp3"></audio>
      </div>

      <div className="progress-container">
        <div className="progress-bar"></div>
        <div className="timestamps">
          <span className="current-time">0:00</span>
          <span className="total-time">0:00</span>
        </div>
      </div>

      <div className="controls">
        <button className="control-btn"><i className="fas fa-step-backward"></i></button>
        <button className="control-btn play-btn"><i className="fas fa-play"></i></button>
        <button className="control-btn"><i className="fas fa-step-forward"></i></button>
        <button className="control-btn"><i className="fas fa-volume-up"></i></button>
      </div>
    </div>
  );
}