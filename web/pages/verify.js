import Title from '@/components/Title';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

const Verify = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!user && !error) {
      return;
    }

    setLoading(false);
  }, [user, error]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const { id } = router.query;
    axios
      .post(
        '/api/users/verify',
        {
          confirm: id
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      .then(res => {
        setUser(res.data.user);
      })
      .catch(err => {
        setError(err.response.data.reason);
      });
  }, [router.isReady]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Title>Verify Account</Title>
      <Navbar />
      <div>
        {error ? (
          <>
            <p className="text-lg text-center mt-5">{error}</p>
          </>
        ) : (
          <div className="text-center mt-5">
            <p className="text-xl font-bold">Hey, {user.username}!</p>
            <p className="text-lg">
              Thanks for confirming your email. You can{' '}
              <Link
                href="/login"
                passHref
              >
                <a className="text-blue-500 underline cursor-pointer">log in</a>
              </Link>{' '}
              now.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Verify;
