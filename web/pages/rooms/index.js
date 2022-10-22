import Navbar from '@/components/Navbar';
import Button from '@/components/Button';
import Modal, { useModal } from '@/components/Modal';
import RadioGroup from '@/components/Radio';
import Input from '@/components/Input';
import Title from '@/components/Title';
import useForm from '@/hooks/useForm';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import useFetch from '@/hooks/useFetch';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faFrown } from '@fortawesome/free-solid-svg-icons';

const RoomPage = () => {
  const modal = useModal(false);
  const [values, handleChange] = useForm({
    title: '',
    password: '',
    privacy: 'public'
  });

  const router = useRouter();
  const toast = useToast();
  const auth = useAuth();
  const { data, loading, error } = useFetch(
    {
      method: 'get',
      url: '/api/rooms'
    },
    15 * 1000
  );

  const createRoom = async () => {
    auth.preFetch().then(() => {
      axios
        .post(
          '/api/rooms',
          {
            title: values.title,
            password: values.password,
            is_public: values.privacy === 'public'
          },
          auth.withCreds({})
        )
        .then(res => {
          router.push(res.data.rel);
        })
        .catch(err => {
          if (err.response) {
            toast.addToast({
              title: 'Error',
              text: err.response.data.reason,
              variant: 'error',
              delay: 5000
            });
          } else {
            console.error(err);
          }
        });
    });
  };

  return (
    <>
      <Title>Rooms</Title>
      <Navbar current="rooms" />
      <div>
        <h1 className="text-center text-3xl font-semibold mt-3">
          Active Rooms
        </h1>
        <div className="text-center mt-3">
          <Button
            disabled={!auth.loggedIn}
            onClick={modal.open}
          >
            Create Room
          </Button>
          {!auth.loggedIn && (
            <p className="italic text-center text-sm mt-1">
              You must be logged in to create a room
            </p>
          )}
          <div className="mt-5">
            {loading && (
              <div className="text-3xl text-center">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin"
                />
              </div>
            )}
            {error && (
              <p className="text-center">There was a problem loading rooms.</p>
            )}
            {data &&
              data.rooms.length > 0 &&
              data.rooms.map(room => (
                <div
                  className="bg-zinc-100 dark:bg-zinc-900 p-4 mb-3 rounded shadow-lg w-[95%] md:w-3/4 mx-auto flex flex-col md:flex-row items-center"
                  key={room.id}
                >
                  <h2 className="text-center md:text-left text-2xl font-bold md:ml-2 grow">
                    {room.title}
                  </h2>
                  <div className="mt-3 md:mt-0">
                    <span className="mr-3 text-xl">
                      {room.player_count} &frasl; 10
                    </span>
                    <Link
                      href={`/rooms/${room.short_id}`}
                      passHref
                    >
                      <Button
                        as="a"
                        className={room.player_count == 10 && 'hidden'}
                      >
                        Join
                      </Button>
                    </Link>
                    <Link
                      href={`/rooms/${room.short_id}?spectate=true`}
                      passHref
                    >
                      <Button
                        as="a"
                        onClick={() => {}}
                        className="ml-2 border-none"
                        variant="neutral"
                      >
                        Spectate
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            {data && data.rooms.length === 0 && (
              <p className="italic">
                <span className="mr-1.5">There are no rooms</span>
                <FontAwesomeIcon icon={faFrown} />
              </p>
            )}
          </div>
        </div>
      </div>
      <Modal
        title="Create Room"
        modal={modal}
        canClose={true}
      >
        <div className="relative h-full">
          <RadioGroup
            name="privacy"
            onChange={handleChange}
            value={values.privacy}
            options={[
              { title: 'Public', value: 'public' },
              { title: 'Private', value: 'private' }
            ]}
          />
          <Input
            id="title"
            label="Title"
            value={values.title}
            onChange={handleChange}
            placeholder="My Room"
            className="mt-2"
          />
          {values.privacy === 'private' && (
            <Input
              id="password"
              type="password"
              label="Password (optional)"
              value={values.password}
              onChange={handleChange}
              placeholder="SomethingSuperSecret123"
              className="mt-2"
            />
          )}
          <div className="absolute bottom-12 w-full text-center">
            <Button
              className="!bg-green-600 hover:!bg-green-500"
              onClick={createRoom}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RoomPage;
