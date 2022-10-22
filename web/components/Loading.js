import Title from './Title';
import Navbar from './Navbar';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Loading = () => {
  return (
    <>
      <Title>Loading...</Title>
      <Navbar />
      <div className="absolute h-screen w-full left-0 top-0 bg-black/50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-4xl animate-spin"
          />
        </div>
      </div>
    </>
  );
};

export default Loading;
