import { forwardRef } from 'react';

const styles = {
  blue: {
    bg: 'bg-blue-600',
    hover: 'hover:bg-blue-500'
  },
  green: {
    bg: 'bg-green-600',
    hover: 'hover:bg-green-500'
  },
  white: {
    bg: 'bg-zinc-200',
    hover: 'hover:bg-zinc-300'
  },
  red: {
    bg: 'bg-red-600',
    hover: 'hover:bg-red-500'
  },
  neutral: {
    bg: '!text-zinc-800 dark:!text-zinc-200 !bg-zinc-300 dark:!bg-zinc-700',
    hover: 'hover:!bg-zinc-400 hover:dark:!bg-zinc-600'
  }
};

const Button = forwardRef(
  ({ as, children, className, variant, onClick, href, disabled }, ref) => {
    const Element = as || 'button';
    const style = styles[variant] || styles.blue;

    return (
      <Element
        ref={ref}
        onClick={e => {
          if (!disabled && !!onClick) onClick(e);
        }}
        className={`${style.bg} ${
          style.hover
        } font-semibold hover:cursor-pointer py-2 px-4 rounded-md shadow text-slate-100 transition-all ${
          className || ''
        } ${
          disabled
            ? `!bg-zinc-500 hover:!bg-zinc-500 !text-slate-300 !cursor-not-allowed`
            : ''
        }`}
        href={href}
      >
        {children}
      </Element>
    );
  }
);

export default Button;
