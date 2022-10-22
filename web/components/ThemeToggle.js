import { useTheme } from './providers/ThemeProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon } from '@fortawesome/free-solid-svg-icons';

const ThemeToggle = () => {
  const { toggleTheme } = useTheme();

  return (
    <a
      onClick={toggleTheme}
      className="border-2 border-zinc-900 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:border-transparent dark:text-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 px-2.5 py-1.5 ml-3 rounded-md hover:cursor-pointer transition-colors"
    >
      <FontAwesomeIcon icon={faMoon} />
    </a>
  );
};

export default ThemeToggle;
