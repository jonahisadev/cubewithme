import Head from 'next/head';

const Title = ({ children }) => {
  return (
    <>
      <Head>
        <title>{`Cube With Me | ${children} `}</title>
      </Head>
    </>
  );
};

export default Title;
