import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Title from '@/components/Title';
import { useAuth } from '@/components/providers/AuthProvider';

const UserPage = () => {
  const auth = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    axios
      .get(`/api/users/${router.query.username}`)
      .then(res => {
        setUser(res.data.user);
      })
      .catch(err => {
        console.log(err);
      });
  }, [router.isReady]);

  if (!user) {
    return <div>No user</div>;
  }

  return (
    <>
      <Title>Profile</Title>
      <Navbar current="profile" />
      <div className="mt-3 p-3 mx-auto w-[95%] md:w-1/2 bg-zinc-200 dark:bg-zinc-900 rounded-md shadow-md">
        <img
          className="rounded-full w-1/2 md:w-1/3 mx-auto mb-3"
          src={`https://cubewithme.s3.us-east-2.amazonaws.com/images/${user.pfp}`}
        />
        <h1 className="text-xl text-center mb-3 font-semibold">
          {user.username}
        </h1>
        <div className="text-center text-lg">
          {user.bio ? <p>{user.bio}</p> : <p className="italic">No bio.</p>}
        </div>
      </div>
      {auth.loggedIn && user.username === auth.payload.username && (
        <div className="text-center mt-2">
          <Link
            href="/account"
            passHref
          >
            <a className="text-blue-500 underline">Account Settings</a>
          </Link>
        </div>
      )}
    </>
  );
};

export default UserPage;
