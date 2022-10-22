
const Kbd = ({ children }) => {

  return (
    <span
      className="border px-1 mx-0.5 py-0.5 rounded border-zinc-500 bg-zinc-400 dark:border-zinc-600 dark:bg-zinc-700 font-mono text-sm"
    >
      {children}
    </span>
  )
};

export default Kbd;
