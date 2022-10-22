import {
  useCallback,
  useState,
  useContext,
  createContext,
  useRef
} from 'react';

const variants = {
  default: '!bg-slate-300 dark:!bg-slate-700',
  secondary: '!bg-blue-400 dark:!bg-blue-500',
  success: '!bg-green-400 dark:!bg-green-500 dark:text-zinc-900',
  warning: 'bg-yellow-400 dark:!bg-yellow-500 text-zinc-900',
  error: '!bg-red-400 dark:!bg-red-500'
};

const ToastContext = createContext({
  toasts: [],
  addToast: _ => {}
});

const ToastProvider = ({ children }) => {
  const context = useContext(ToastContext);
  const [toasts, setToasts] = useState(context.toasts);
  const toastRef = useRef(toasts);
  toastRef.current = toasts;

  const removeToast = useCallback(
    id => {
      // Find toast in array
      const copy = [...toastRef.current];
      const index = copy.findIndex(t => t.id === id);
      if (index < 0) return;

      // Remove item
      copy.splice(index, 1);
      setToasts([...copy]);
      toastRef.current = copy;
    },
    [toasts]
  );

  const addToast = useCallback(
    t => {
      const toInsert = { ...t, id: Date.now() };

      if (toInsert.delay) {
        setTimeout(() => {
          removeToast(toInsert.id);
        }, toInsert.delay);
      }

      const newVal = [toInsert, ...toasts];
      setToasts(newVal);
      toastRef.current = newVal;
    },
    [toasts]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast
      }}
    >
      <div className="absolute z-[100] right-4 top-20 h-[90%] w-3/4 md:w-1/4 pointer-events-none">
        <div>
          {toasts.map(t => (
            <div
              key={t.id}
              className={`px-3 opacity-[95%] py-2 mb-3 ${
                variants[t.variant] || variants['default']
              } rounded-md shadow-lg pointer-events-auto`}
            >
              <div className="flex items-center">
                <h3 className="text-lg font-bold grow">{t.title}</h3>
                <span
                  className="text-2xl cursor-pointer"
                  onClick={() => removeToast(t.id)}
                >
                  &times;
                </span>
              </div>
              <p>{t.text}</p>
            </div>
          ))}
        </div>
      </div>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

export const toastError = msg => {
  const toast = useToast();
  toast.addToast({
    title: 'Error',
    text: msg,
    variant: 'error',
    delay: 5000
  });
};

export default ToastProvider;
