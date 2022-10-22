import Navbar from '@/components/Navbar';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Title from '@/components/Title';
import useForm from '@/hooks/useForm';
import { useToast } from '@/providers/ToastProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/router';
import axios from 'axios';

const Login = () => {
  const [values, handleChange] = useForm({
    username: '',
    password: ''
  });
  const router = useRouter();
  const toast = useToast();
  const auth = useAuth();

  const handleForm = () => {
    axios
      .post('api/auth/login', values)
      .then(res => {
        const data = res.data;
        if (data.ok) {
          toast.addToast({
            title: 'Success',
            text: 'Successfully logged in!',
            variant: 'success',
            delay: 3000
          });
          auth.setToken(data.accessToken);
          router.push('/rooms');
        }
      })
      .catch(err => {
        toast.addToast({
          title: 'Error',
          text: err.response.data.reason,
          variant: 'error',
          delay: 5000
        });
      });
  };

  return (
    <>
      <Title>Log In</Title>
      <Navbar />
      <div>
        <div className="mt-5 w-[95%] md:w-1/3 mx-auto rounded-md bg-zinc-200 dark:bg-zinc-900 p-2 shadow-md">
          <h2 className="text-center text-xl font-bold">Log In</h2>
          <Input
            id="username"
            label="Username"
            placeholder="hpotter"
            value={values.username}
            onChange={handleChange}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Voldemort123!"
            value={values.password}
            onChange={handleChange}
            className="mt-2"
          />
          <div className="text-center">
            <Button
              onClick={handleForm}
              className="mt-3"
              variant="green"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
