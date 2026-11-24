import { useEffect, useRef, useState } from 'react';
import { createTajScene } from './scene/createScene.js';
import { VIEWPOINTS, viewFromHash } from './viewpoints.js';
import Overlay from './ui/Overlay.jsx';
import './ui/overlay.css';

const isDark = () => document.documentElement.dataset.theme === 'dark';

export default function App() {
  const mountRef = useRef(null);
  const apiRef = useRef(null);
  const [view, setView] = useState(() => viewFromHash(window.location.hash) || 'facade');
  const [night, setNight] = useState(isDark);
  const [touring, setTouring] = useState(false);

  function goTo(id) {
    if (window.location.hash === '#' + id) {
      setView(id);
      apiRef.current?.setView(id);
    } else {
      window.location.hash = id;
    }
  }

  function toggleNight() {
    document.documentElement.dataset.theme = isDark() ? 'light' : 'dark';
  }

  useEffect(() => {
    const api = createTajScene(mountRef.current, {
      initialView: view,
      night: isDark(),
      onTourChange: setTouring,
    });
    apiRef.current = api;

    const onHash = () => {
      const v = viewFromHash(window.location.hash);
      if (v) {
        setView(v);
        api.setView(v);
      }
    };
    const observer = new MutationObserver(() => {
      const d = isDark();
      setNight(d);
      api.setNight(d);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const onKey = (e) => {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      const i = parseInt(e.key, 10);
      if (i >= 1 && i <= VIEWPOINTS.length) goTo(VIEWPOINTS[i - 1].id);
      else if (e.key === 'n' || e.key === 'N') toggleNight();
      else if (e.key === 'v' || e.key === 'V') api.toggleTour();
    };

    window.addEventListener('hashchange', onHash);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('keydown', onKey);
      observer.disconnect();
      api.dispose();
      apiRef.current = null;
    };
    // la scène n'est créée qu'une fois
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={'taj-root' + (night ? ' night' : '')}>
      <div className="taj-canvas" ref={mountRef} />
      <Overlay
        view={view}
        night={night}
        touring={touring}
        onView={goTo}
        onNight={toggleNight}
        onTour={() => apiRef.current?.toggleTour()}
      />
    </div>
  );
}
