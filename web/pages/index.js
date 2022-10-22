import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/Button';
import Navbar from '@/components/Navbar';
import Title from '@/components/Title';
import { useRouter } from 'next/router';
import {
  faAnglesDown,
  faBolt,
  faCode,
  faComments,
  faCubes,
  faMobileScreenButton,
  faWeightHanging
} from '@fortawesome/free-solid-svg-icons';

const Card = ({ title, icon, children }) => {
  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 w-[95%] md:w-full md:min-h-[300px] mx-auto rounded-md shadow-lg shadow-black/25 p-3">
      <FontAwesomeIcon
        className="text-6xl mx-auto !block dark:text-zinc-400"
        icon={icon}
      />
      <h3 className="uppercase text-center font-black text-xl my-2">{title}</h3>
      <p className="text-lg text-zinc-700 dark:text-zinc-300 text-justify font-bold">
        {children}
      </p>
    </div>
  );
};

const Home = () => {
  const router = useRouter();

  const scrollToFeatures = () => {
    document.getElementById('features').scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <>
      <Title>Home</Title>
      <div className="min-h-screen md:h-screen">
        <Navbar />
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
          <img
            src="https://cubewithme.s3.us-east-2.amazonaws.com/logo256.png"
            className="w-1/3 md:w-[10%] mx-auto mb-3 drop-shadow-xl"
          />
          <h1 className="text-center text-5xl md:text-6xl font-black">
            Cube With Me
          </h1>
          <h2 className="text-center text-xl md:text-2xl p-3 mb-4">
            The <span className="italic">best</span> online solution for
            head-to-head speedcubing
          </h2>
          <div className="text-center">
            <Button
              className="mr-2 cursor-pointer"
              variant="green"
              as="a"
              onClick={() => router.push('/signup')}
            >
              Sign Up
            </Button>
            <Button
              className="mr-2 cursor-pointer"
              variant="blue"
              as="a"
              onClick={() => router.push('/rooms')}
            >
              Rooms
            </Button>
            <Button
              className="cursor-pointer"
              variant="neutral"
              as="a"
              href="https://github.com/jonahisadev/cubewithme"
            >
              <FontAwesomeIcon icon={faGithub} /> GitHub
            </Button>
          </div>
        </div>
        <div className="absolute w-full bg-zinc-300 dark:bg-zinc-900 p-5 bottom-0">
          <p
            className="text-center font-bold text-lg cursor-pointer"
            onClick={scrollToFeatures}
          >
            <span className="mr-3">See Some Features</span>
            <FontAwesomeIcon icon={faAnglesDown} />
          </p>
        </div>
      </div>
      <div className="bg-zinc-300 dark:bg-zinc-900">
        <div
          className="min-h-screen p-3 md:p-5 xl:w-[80%] xl:mx-auto"
          id="features"
        >
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-5">
            Why Cube With Me?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <Card
              title="Fast & Easy"
              icon={faBolt}
            >
              Join your friends in a room with the click of a button! No
              accounts are necessary to join, and you'll be in the action in no
              time!
            </Card>
            <Card
              title="Stable"
              icon={faWeightHanging}
            >
              You shouldn't have to deal with other services always going down,
              breaking in the middle of your games, or just straight up being
              slow. Cube With Me started as a better alternative to those
              services, and it remains a core goal of the website to this day.
            </Card>
            <Card
              title="Mobile Support"
              icon={faMobileScreenButton}
            >
              Cube With Me was developed with a mobile-first mindset. If you
              want to play with your friends on the go, you will be able to do
              so with ease!
            </Card>
            <Card
              title="Every WCA Event Type"
              icon={faCubes}
            >
              Play every official WCA event type with your friends! Whether
              you're into something standard like a 3x3, or more of a challenge
              like the Megaminx, the choice is all yours!
            </Card>
            <Card
              title="Chat"
              icon={faComments}
            >
              Not everyone can hop into VC on Discord, nor do you want your
              channels flooded by everyone playing. If necessary, use the built
              in Cube With Me room chat!
            </Card>
            <Card
              title="Open Source"
              icon={faCode}
            >
              Noticing problems that need fixing? Create an issue on GitHub! Or,
              if you're tech savvy, fix the problem and merge it into the
              codebase. Everybody wins!
            </Card>
          </div>
          <h3 className="text-center text-4xl font-bold mb-3 mt-10">
            Still not convinced?
          </h3>
          <p className="text-center text-xl mb-5">
            Try for yourself. You might like what you see.
          </p>
          <div className="text-center mb-5">
            <Button
              className="mr-2 cursor-pointer"
              variant="green"
              as="a"
              onClick={() => router.push('/signup')}
            >
              Sign Up
            </Button>
            <Button
              className="cursor-pointer"
              variant="blue"
              as="a"
              onClick={() => router.push('/rooms')}
            >
              Rooms
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
