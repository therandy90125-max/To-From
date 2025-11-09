import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const AUDIO_SRC = '/audio/mozart-sonata21.mp3';

export default function BackgroundMusic() {
  const { t } = useLanguage();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorKey, setErrorKey] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0.35;

    const handleError = () => setErrorKey('musicFileMissing');
    const handlePlay = () => setErrorKey(null);

    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audioRef.current = null;
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) {
      setErrorKey('musicFileMissing');
      return;
    }

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
        setErrorKey(null);
      }
    } catch (err) {
      if (err?.name === 'NotAllowedError') {
        setErrorKey('musicAutoplayBlocked');
      } else {
        setErrorKey('musicFileMissing');
      }
      setIsPlaying(false);
    }
  };

  return (
    <div className="background-music-controller">
      <button
        type="button"
        className={`music-toggle ${isPlaying ? 'playing' : ''}`}
        onClick={togglePlay}
      >
        {isPlaying ? t('pauseMusic') : t('playMusic')}
      </button>
      <div className="music-hints">
        {errorKey === 'musicFileMissing' && (
          <p className="music-hint">
            {t('musicFileMissing')}
            <br />
            <span className="music-hint-path">{t('musicHintProvideFile')}</span>
          </p>
        )}
        {errorKey === 'musicAutoplayBlocked' && (
          <p className="music-hint">{t('musicAutoplayBlocked')}</p>
        )}
      </div>
    </div>
  );
}

