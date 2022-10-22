import '../styles/globals.css';
import ThemeProvider from '@/providers/ThemeProvider';
import ToastProvider from '@/providers/ToastProvider';
import AuthProvider from '@/providers/AuthProvider';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Head from 'next/head';
config.autoAddCss = false;

const Application = ({ Component, pageProps }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1, maximum-scale=1"
            />
          </Head>
          <Component {...pageProps} />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default Application;
