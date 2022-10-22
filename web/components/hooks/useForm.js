import { useState } from 'react';

const useForm = initialValues => {
  const [values, setValues] = useState(initialValues);

  return [
    values,
    e => {
      // console.log(e)
      if (e.target.type === 'checkbox') {
        setValues({
          ...values,
          [e.target.name]: e.target.checked
        });
      } else {
        setValues({
          ...values,
          [e.target.name]: e.target.value
        });
      }
    },
    (name, val) => {
      setValues({
        ...values,
        [name]: val
      });
    }
  ];
};

export default useForm;
