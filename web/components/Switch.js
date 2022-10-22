import styles from './Switch.module.css'

const Switch = ({ id, value, label, onChange, className }) => {
  return (
    <div className={`inline-flex ${className}`}>
      <input
        id={id}
        name={id}
        type="checkbox"
        className={styles['react-switch-checkbox']}
        onChange={onChange}
        checked={value}
      />
      <label
        htmlFor={id}
        className={styles['react-switch-label']}
        style={{background: value && '#0284C7' }}
      >
        <span
          className={styles['react-switch-button']}
        />
      </label>
      <label className="ml-2 text-sm">{label}</label>
    </div>
  );
};

export default Switch;
