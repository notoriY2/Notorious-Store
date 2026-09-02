import { useRef, useState } from 'react';

export const useSwipeToDismiss = (onDismiss: () => void, threshold = 120) => {
  const startY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setDragY(delta);
  };

  const onTouchEnd = () => {
    if (dragY > threshold) {
      onDismiss();
    }
    setDragY(0);
    startY.current = null;
  };

  return { dragY, onTouchStart, onTouchMove, onTouchEnd };
};