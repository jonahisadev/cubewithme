const Input = ({
  id,
  label,
  value,
  type,
  onChange,
  onKeyDown,
  placeholder,
  className,
  disabled,
  ref
}) => {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="text-md"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        className={`${
          disabled
            ? '!bg-zinc-200 dark:!bg-zinc-500 dark:placeholder:!text-zinc-400 hover:cursor-not-allowed'
            : ''
        } block w-full py-1 px-2 rounded-md text-zinc-900 bg-zinc-50 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-900 dark:placeholder:text-zinc-600`}
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
};

export default Input;
