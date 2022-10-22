import Navbar from '@/components/Navbar';
import Title from '@/components/Title';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useToast } from '@/providers/ToastProvider';
import { useRouter } from 'next/router';
import useForm from '@/hooks/useForm';
import axios from 'axios';

const Signup = () => {
  const [values, handleChange] = useForm({
    username: '',
    email: '',
    pass1: '',
    pass2: ''
  });
  const toast = useToast();
  const router = useRouter();

  const handleForm = async () => {
    axios
      .post('/api/users', { ...values })
      .then(res => {
        console.log(res);
        if (res.data.ok) {
          toast.addToast({
            title: 'Success',
            text: 'Successfully signed up! Please confirm your email before signing in',
            variant: 'success',
            delay: 5000
          });
          router.push('/login');
        }
      })
      .catch(err => {
        console.log(err.response.data);
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
      <Title>Sign Up</Title>
      <Navbar />
      <div>
        <div className="mt-5 w-[95%] md:w-1/3 mx-auto rounded-md shadow-md bg-zinc-200 dark:bg-zinc-900 p-2">
          <h2 className="text-center text-xl font-bold">Sign Up</h2>
          <Input
            id="username"
            label="Username"
            placeholder="hpotter"
            value={values.username}
            onChange={handleChange}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="harry@hogwarts.co.uk"
            value={values.email}
            onChange={handleChange}
            className="mt-2"
          />
          <Input
            id="pass1"
            label="Password"
            type="password"
            placeholder="Voldemort123!"
            value={values.pass1}
            onChange={handleChange}
            className="mt-2"
          />
          <Input
            id="pass2"
            label="Confirm Password"
            type="password"
            placeholder="Voldemort123!"
            value={values.pass2}
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

export default Signup;
