import { createRef, useCallback, useEffect, useState } from 'react';

const Modal = ({ modal, title, canClose, children }) => {
  const modalContainer = createRef();
  const [closeable, setCloseable] = useState(!!canClose);

  function clickOutside(e) {
    if (!closeable) return;

    const rect = modalContainer.current.getBoundingClientRect();

    if (
      e.clientX >= rect.x &&
      e.clientX <= rect.x + rect.width &&
      e.clientY >= rect.y &&
      e.clientY <= rect.y + rect.height
    ) {
      return;
    }

    modal.close();
  }

  useEffect(() => {
    setCloseable(!!canClose);
  }, [canClose]);

  if (!modal.show) {
    return <div />;
  }

  return (
    <div
      className="absolute top-0 left-0 z-30 w-full h-screen bg-black/[0.45]"
      onClick={clickOutside}
    >
      <div
        className="absolute z-40 w-[95%] h-1/2 min-h-[50%] md:w-1/2 md:h-2/5 md:min-h-[40%] shadow-lg rounded-md px-4 py-2 bg-zinc-100 dark:bg-zinc-800"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        ref={modalContainer}
      >
        <div className="flex items-center">
          <h2 className="text-2xl text-center font-semibold grow">{title}</h2>
          {closeable && (
            <span
              className="text-4xl font-bold hover:cursor-pointer"
              onClick={modal.close}
            >
              &times;
            </span>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

export const useModal = state => {
  const [show, setShow] = useState(state || false);

  const toggle = useCallback(() => {
    setShow(!show);
  }, [show, setShow]);

  const open = useCallback(() => {
    setShow(true);
  }, [setShow]);

  const close = useCallback(() => {
    setShow(false);
  }, [setShow]);

  return { show, toggle, open, close };
};

export default Modal;
