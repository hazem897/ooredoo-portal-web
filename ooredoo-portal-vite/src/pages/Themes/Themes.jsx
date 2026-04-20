import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Themes.css';

export default function Themes() {
  const { t } = useLanguage();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [animations, setAnimations] = useState(true);
  const [notifsSon, setNotifsSon] = useState(() => localStorage.getItem('notifsSon') !== 'false');
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('compactMode') === 'true');

  const playTestSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.error("Audio API non supportée", e);
    }
  };

  const handleSoundToggle = (e) => {
    const isChecked = e.target.checked;
    setNotifsSon(isChecked);
    localStorage.setItem('notifsSon', isChecked ? 'true' : 'false');
    
    if (isChecked) {
      playTestSound();
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    if (compactMode) {
      document.documentElement.classList.add('compact-mode');
      localStorage.setItem('compactMode', 'true');
    } else {
      document.documentElement.classList.remove('compact-mode');
      localStorage.setItem('compactMode', 'false');
    }
  }, [compactMode]);

  return (
    <div className="themes-page">
      <div className="themes-header">
        <h1>{t('personnalisation')}</h1>
        <p>{t('themes_desc')}</p>
      </div>

      <div className="themes-grid">
        {/* Paramètres d'apparence */}
        <div className="theme-card">
          <h3>🎨 {t('apparence')}</h3>
          
          <div className="theme-option">
            <div className="theme-option-info">
              <h4>{t('dark_mode')}</h4>
              <p>{t('dark_mode_desc')}</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="theme-option">
            <div className="theme-option-info">
              <h4>{t('animations')}</h4>
              <p>{t('animations_desc')}</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={animations} onChange={e => setAnimations(e.target.checked)} />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Préférences système */}
        <div className="theme-card">
          <h3>⚙️ {t('prefs')}</h3>
          
          <div className="theme-option">
            <div className="theme-option-info">
              <h4>{t('sons')}</h4>
              <p>{t('sons_desc')}</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={notifsSon} onChange={handleSoundToggle} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="theme-option">
            <div className="theme-option-info">
              <h4>{t('compact')}</h4>
              <p>{t('compact_desc')}</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={compactMode} onChange={e => setCompactMode(e.target.checked)} />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
