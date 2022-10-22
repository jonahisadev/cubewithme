import Navbar from '@/components/Navbar';
import Title from '@/components/Title';
import Input from '@/components/Input';
import useForm from '@/hooks/useForm';
import Button from '@/components/Button';
import { createRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useRouter } from 'next/router';

const Card = ({ title, children }) => {
  return (
    <div className="mx-auto w-[95%] md:w-1/2 p-3 bg-zinc-200 dark:bg-zinc-900 rounded-md shadow-md mb-5">
      <h2 className="text-2xl text-center font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
};

const Account = () => {
  const auth = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [resetPassword, handleResetPassword] = useForm({
    current: '',
    new1: '',
    new2: ''
  });
  const [profile, handleProfile, setProfile] = useForm({
    bio: ''
  });
  const fileUpload = createRef();

  useEffect(() => {
    if (!auth.isReady || !router.isReady) {
      return;
    }

    if (!auth.loggedIn) {
      router.push('/');
    }

    if (auth.payload) {
      setProfile('bio', auth.payload.bio);
    }
  }, [auth.isReady, router.isReady]);

  const submitProfile = () => {
    auth.preFetch().then(() => {
      const formData = new FormData();
      formData.append('bio', profile.bio);
      if (fileUpload.current.files.length > 0)
        formData.append('image', fileUpload.current.files[0]);

      axios
        .put(
          `/api/users/${auth.payload.id}`,
          formData,
          auth.withCreds({
            'Content-Type': 'multipart/form-data'
          })
        )
        .then(_res => {
          toast.addToast({
            title: 'Success',
            text: 'Saved profile',
            delay: 5000,
            variant: 'success'
          });
        })
        .catch(err => {
          console.log(err);
          toast.addToast({
            title: 'Error',
            text: err.response.data.reason,
            delay: 5000,
            variant: 'error'
          });
        });
    });
  };

  const changePassword = () => {
    auth.preFetch().then(() => {
      axios
        .put(
          `/api/users/${auth.payload.id}`,
          { password: resetPassword },
          auth.withCreds({
            'Content-Type': 'multipart/form-data'
          })
        )
        .then(_res => {
          toast.addToast({
            title: 'Success',
            text: 'Successfully reset password',
            delay: 5000,
            variant: 'success'
          });
        })
        .catch(err => {
          console.log(err);
          toast.addToast({
            title: 'Error',
            text: err.response.data.reason,
            delay: 5000,
            variant: 'error'
          });
        });
    });
  };

  if (!auth.isReady) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Title>Account</Title>
      <Navbar />
      <h1 className="text-center text-3xl font-bold my-3">Account</h1>
      <Card title="Profile">
        <div className="mb-2">
          <label
            htmlFor="fileUpload"
            className="block"
          >
            <span className="mr-2">Profile Picture</span>
            <span className="text-xs">(Maximum 2MB, square)</span>
          </label>
          <Button
            className="text-sm"
            variant="neutral"
            onClick={() => fileUpload.current?.click()}
          >
            Choose Image
          </Button>
          <input
            id="fileUpload"
            ref={fileUpload}
            type="file"
            className="hidden"
          />
        </div>
        <div className="mb-2">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={profile.bio}
            onChange={handleProfile}
            className="w-full min-h-[100px] bg-zinc-50 dark:bg-zinc-800 dark:placeholder-zinc-600 rounded-md resize-none p-2"
            placeholder="Write your bio here..."
          />
        </div>
        <div className="text-center">
          <Button onClick={submitProfile}>Save Profile</Button>
        </div>
      </Card>
      <Card title="Reset Password">
        <Input
          id="current"
          type="password"
          value={resetPassword.current}
          onChange={handleResetPassword}
          label="Current Password"
          placeholder="SuperSecretPassword"
          className="mb-2"
        />
        <Input
          id="new1"
          type="password"
          value={resetPassword.new1}
          onChange={handleResetPassword}
          label="New Password"
          placeholder="NewSuperSecretPassword"
          className="mb-2"
        />
        <Input
          id="new2"
          type="password"
          value={resetPassword.new2}
          onChange={handleResetPassword}
          label="Repeat New Password"
          placeholder="NewSuperSecretPassword"
          className="mb-2"
        />
        <div className="text-center">
          <Button onClick={changePassword}>Save Password</Button>
        </div>
      </Card>
    </>
  );
};

export default Account;
