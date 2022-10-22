import { useState, useCallback } from 'react';

const Popover = ({ popover, children }) => {
  if (!popover.show) {
    return <div className="absolute hidden" />;
  }

  return (
    <div
      className="absolute z-30 bg-zinc-300 dark:bg-zinc-700 dark:border-none rounded-md shadow-lg p-2"
      style={{
        top: popover.position.y,
        left: popover.position.x,
        width: popover.size.width,
        height: popover.size.height
      }}
    >
      <div className="relative h-full">
        {children}
        <div className="absolute -right-0 -bottom-8 pointer-events-none">
          <div className="w-8 overflow-hidden inline-block">
            <div className="h-5 w-5 bg-zinc-300 dark:bg-zinc-700 -rotate-45 transform origin-top-left"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const usePopover = ({ state }) => {
  const [show, setShow] = useState(state || false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 180, height: 120 });

  const toggle = useCallback(() => {
    setShow(!show);
  }, [show, setShow]);

  const open = useCallback(() => {
    setShow(true);
  }, [setShow]);

  const close = useCallback(() => {
    setShow(false);
  }, [setShow]);

  return { show, toggle, open, close, position, setPosition, size, setSize };
};

export default Popover;
