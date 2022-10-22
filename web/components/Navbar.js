import { createRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import cubeNav from '../public/cube-nav.png';
import Button from '../components/Button';
import ThemeToggle from '../components/ThemeToggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../components/providers/AuthProvider';

const NavLink = ({ href, children, disabled, current }) => {
  let className = 'py-2 md:ml-5 block md:inline ';
  if (current) className += 'text-blue-600 dark:text-blue-400 hover:underline';
  else if (disabled) className += 'text-zinc-500';
  else className += 'text-zinc-900 dark:text-zinc-300 hover:underline';

  return (
    <li className={className}>
      <Link href={disabled ? '#' : href}>
        <a>{children}</a>
      </Link>
    </li>
  );
};

const Navbar = ({ current }) => {
  const [collapse, setCollapse] = useState(true);
  const menu = createRef();

  const auth = useAuth();

  useEffect(() => {
    if (collapse) {
      menu.current.classList.add('hidden');
    } else {
      menu.current.classList.remove('hidden');
    }
  }, [collapse]);

  return (
    <div className="py-3 px-4 md:px-5 bg-zinc-200 dark:bg-zinc-900 shadow-lg flex flex-wrap items-center justify-between">
      <div className="flex items-center">
        <Image
          src={cubeNav}
          alt="Cube With Me logo"
          width={30}
          height={30}
        />
        <h1 className="inline text-2xl ml-3 font-bold m-0 dark:text-zinc-100">
          <Link href="/">
            <a>Cube With Me</a>
          </Link>
        </h1>
      </div>
      <div>
        <Button
          variant="white"
          className="md:hidden border border-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          onClick={() => setCollapse(!collapse)}
        >
          <FontAwesomeIcon
            icon={faBars}
            className="text-zinc-800 dark:text-zinc-200"
          />
        </Button>
      </div>
      <div
        className="inline-flex hidden w-full md:block md:w-auto"
        ref={menu}
      >
        <ul className="list-none w-full md:flex">
          <NavLink
            href="/rooms"
            current={current == 'rooms'}
          >
            Rooms
          </NavLink>
          <NavLink
            href="#"
            disabled
          >
            Tournaments
          </NavLink>
          {auth.loggedIn && (
            <NavLink
              current={current == 'profile'}
              href={`/user/${auth.payload.username}`}
            >
              Profile
            </NavLink>
          )}
          <div className="flex justify-between items-center mt-2 md:mt-0">
            {auth.loggedIn ? (
              <div>
                <Button
                  as="a"
                  className="md:ml-5"
                  onClick={auth.logOut}
                  variant="neutral"
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <div>
                <Link
                  href="/login"
                  passHref
                >
                  <Button
                    as="a"
                    className="md:ml-5"
                  >
                    Log In
                  </Button>
                </Link>
                <Link
                  href="/signup"
                  passHref
                >
                  <Button
                    as="a"
                    className="ml-3"
                    variant="green"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            <ThemeToggle />
          </div>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
