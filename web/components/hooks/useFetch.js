import axios from 'axios';
import { useState, useEffect } from 'react';

const useFetch = (opts, refetch) => {
  const [data, setData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const interval = null;

  useEffect(() => {
    axios(opts)
      .then(res => {
        setLoading(false);
        setData(res.data);
      })
      .catch(err => {
        setLoading(false);
        setError(err);
      });

    if (refetch) {
      interval = setInterval(() => {
        axios(opts)
          .then(res => {
            setData(res.data);
          })
          .catch(err => {
            setError(err);
          });
      }, refetch);
    }

    return () => {
      if (refetch && interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return { data, loading, error };
};

export default useFetch;
