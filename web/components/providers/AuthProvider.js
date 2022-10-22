import axios from 'axios';
import Cookies from 'js-cookie';
import { decode } from 'jsonwebtoken';
import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const AuthContext = createContext({
  token: null,
  payload: null,
  loggedIn: null,
  isReady: false,

  setToken: _ => {},
  preFetch: async _ => {},
  logOut: _ => {},
  withCreds: _ => {}
});

const AuthProvider = ({ children }) => {
  const context = useContext(AuthContext);
  const [payload, setPayload] = useState(context.payload);
  const [loggedIn, setLoggedIn] = useState(context.loggedIn);
  const [isReady, setIsReady] = useState(context.isReady);
  const token = useRef();
  const router = useRouter();

  const setToken = tok => {
    if (!tok) {
      window.localStorage.removeItem('_st');
    } else {
      window.localStorage.setItem('_st', tok);
    }
    token.current = tok;
  };

  const withCreds = (opts = {}) => {
    if (!token.current) return { ...opts };

    return {
      ...opts,
      withCredentials: true,
      headers: {
        ...opts.headers,
        Authorization: `Bearer ${token.current}`
      }
    };
  };

  const preFetch = async () => {
    if (!token.current) {
      return;
    }
    // Check if our token is expired
    if (Date.now() >= decode(token.current).exp * 1000) {
      // Refresh
      let res;
      try {
        res = await axios.post(
          '/api/auth/refresh',
          {},
          {
            withCredentials: true
          }
        );
      } catch (err) {
        const reason = err.response.data.reason;
        console.error('Auth refresh failed: ' + reason);
      }

      // Make sure we're good
      if (!res.data.ok) {
        console.error('Auth refresh failed: ' + res.data.reason);
        return;
      }

      // Set values
      const jwt = res.data.accessToken;
      token.current = jwt;
    }
  };

  const logOut = () => {
    Cookies.remove('_sid');
    token.current = null;
    router.push('/');
  };

  useEffect(() => {
    setIsReady(true);
  }, [loggedIn]);

  // We need loggedIn to always reflect token state
  useEffect(() => {
    // The token could be expired here, but any routes that will
    // require a valid token will preFetch to refresh the it
    setLoggedIn(!!token.current && !!Cookies.get('_sid'));

    if (token.current) {
      setPayload(decode(token.current).user);
    }
  }, [token.current]);

  // Load up the token from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      token.current = window.localStorage.getItem('_st');
    } else {
      token.current = null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token: token.current,
        setToken,
        preFetch,
        loggedIn,
        payload,
        logOut,
        withCreds,
        isReady
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
