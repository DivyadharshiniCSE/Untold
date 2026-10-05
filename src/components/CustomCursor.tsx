import { useEffect, useState } from 'react';

type CursorState = 'default' | 'open' | 'view';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [state, setState] = useState<CursorState>('default');
  const [visible, setVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none) and (pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    if (isTouch) return;

    const move = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);

      const target = e.target as HTMLElement;
      if (target.closest('[data-cursor="open"]')) {
        setState('open');
      } else if (target.closest('[data-cursor="view"]')) {
        setState('view');
      } else if (target.closest('a, button, [role="button"]')) {
        setState('default');
      } else {
        setState('default');
      }
    };

    const leave = () => setVisible(false);

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);
    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', leave);
    };
  }, [isTouch]);

  if (isTouch || !visible) return null;

  const labels: Record<CursorState, string> = {
    default: '',
    open: 'OPEN',
    view: 'VIEW',
  };

  const sizes: Record<CursorState, number> = {
    default: 8,
    open: 60,
    view: 60,
  };

  const size = sizes[state];
  const label = labels[state];

  return (
    <div
      className="custom-cursor flex items-center justify-center rounded-full"
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
        background: state === 'default' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)',
        border: state === 'default' ? 'none' : '1px solid rgba(255,255,255,0.5)',
        backdropFilter: state === 'default' ? 'none' : 'blur(2px)',
      }}
    >
      {label && (
        <span className="text-[9px] font-body tracking-widest text-white/80 uppercase">
          {label}
        </span>
      )}
    </div>
  );
}
