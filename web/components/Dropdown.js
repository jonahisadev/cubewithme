import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';

function useOutsideAlerter(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}

const Dropdown = ({ className, options, selected, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(selected);
  const wrapper = useRef(null);
  useOutsideAlerter(wrapper, () => setOpen(false));

  className ||= '';

  const toggleOptions = () => {
    setOpen(!open);
  };

  const getOption = value => {
    return options.find(o => o.value === value);
  };

  const handleKeyDown = value => e => {
    switch (e.key) {
      case ' ':
      case 'SpaceBar':
      case 'Enter':
        e.preventDefault();
        setSelectedItem(value);
        setOpen(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setSelectedItem(selected);
  }, [selected]);

  return (
    <div
      className={` ` + className}
      ref={wrapper}
    >
      <div
        className={`w-full bg-zinc-50 dark:bg-zinc-800 rounded-md shadow-md cursor-pointer relative ${
          disabled && '!cursor-not-allowed !text-zinc-500'
        }`}
        onClick={() => {
          if (!disabled) toggleOptions();
        }}
      >
        <button
          disabled={disabled}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={
            `text-lg p-2 rounded-md w-full flex ` +
            (open && 'rounded-t-md outline outline-2 outline-blue-500')
          }
        >
          <span className="flex-grow text-left ml-1 mr-2">
            {getOption(selectedItem).name}
          </span>
          <FontAwesomeIcon
            icon={open ? faAngleUp : faAngleDown}
            className="self-center mr-2"
          />
        </button>
        {open && (
          <ul
            tabIndex={-1}
            role="listbox"
            aria-activedescendant={getOption(selectedItem)}
            className="z-10 absolute w-full bg-zinc-50 dark:bg-zinc-800 shadow-lg rounded-md max-h-48 overflow-y-scroll"
            style={{ transform: 'translate(0, 2px)' }}
          >
            {options.map((option, index) => (
              <li
                id={option.name + option.value}
                tabIndex={0}
                role="option"
                key={index}
                aria-selected={selectedItem == option.value}
                onKeyDown={handleKeyDown(option.value)}
                onClick={() => {
                  setSelectedItem(option.value);
                  onChange(option.value);
                  setOpen(false);
                }}
                className="text-lg px-3 py-2 hover:bg-zinc-100 hover:dark:bg-zinc-700"
              >
                {option.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
