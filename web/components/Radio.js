const RadioGroup = ({ name, value, options, onChange }) => {
  return (
    <div>
      { options.map((option, i) => (
        <div key={i} className="inline">
          <input
            id={`${name}-${i}`}
            className="mr-2"
            type="radio"
            value={option.value}
            name={name}
            checked={value === option.value}
            onChange={onChange}
          />
          <label
            htmlFor={`${name}-${i}`}
            className="mr-4 text-lg"
          >
            {option.title}
          </label>
        </div>
      ))}
    </div>
  );
};

export default RadioGroup;
