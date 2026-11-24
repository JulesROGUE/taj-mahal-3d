import { VIEWPOINTS } from '../viewpoints.js';

export default function Overlay({ view, night, touring, onView, onNight, onTour }) {
  return (
    <>
      <section className="taj-card" aria-label="Taj Mahal">
        <div className="taj-kicker">Agra, Inde · 1632–1653</div>
        <h1>Taj Mahal</h1>
        <p className="taj-sub">Mausolée de marbre blanc élevé par Shah Jahan pour Mumtaz Mahal.</p>
        <dl className="taj-facts">
          <div>
            <dt>73 m</dt>
            <dd>hauteur totale</dd>
          </div>
          <div>
            <dt>95,5 m</dt>
            <dd>côté du socle</dd>
          </div>
          <div>
            <dt>23 m</dt>
            <dd>coupole, sur un tambour de 12 m</dd>
          </div>
          <div>
            <dt>4 × 40 m</dt>
            <dd>minarets à trois balcons</dd>
          </div>
        </dl>
        <div className="taj-note">Reproduction stylisée, modélisée en code</div>
      </section>

      <div className="taj-help">Glisser : tourner · Molette : zoomer · Clic droit : déplacer</div>

      <nav className="taj-bar" aria-label="Points de vue">
        {VIEWPOINTS.map((v, i) => (
          <button key={v.id} className={view === v.id ? 'on' : ''} onClick={() => onView(v.id)} title={'Touche ' + (i + 1)}>
            <span className="taj-key">{i + 1}</span> {v.label}
          </button>
        ))}
        <span className="taj-sep" />
        <button onClick={onNight} title="Touche N">{night ? 'Jour' : 'Nuit'}</button>
        <button className={touring ? 'on' : ''} onClick={onTour} title="Touche V">
          {touring ? 'Arrêter la visite' : 'Visite'}
        </button>
      </nav>
    </>
  );
}
