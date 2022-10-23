import { faMessage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import useForm from './hooks/useForm';
import Input from './Input';

const Chat = ({ onSend, messages }) => {
  const [open, setOpen] = useState(false);
  const [notification, setNotification] = useState(false);
  const [values, handleChange] = useForm({
    message: ''
  });

  const toggle = () => {
    setOpen(!open);
  };

  const onKeyDown = e => {
    if (e.key === 'Enter') {
      onSend(values.message);
      handleChange({ target: { name: 'message', value: '' } });
    }
  };

  useEffect(() => {
    if (open) {
      setNotification(false);
    }
  }, [open]);

  useEffect(() => {
    if (!messages) {
      return;
    }

    if (!open) {
      setNotification(true);
    }
  }, [messages]);

  return (
    <>
      {open && (
        <div className="absolute h-full p-3 bottom-0 md:p-0 w-full md:w-auto md:right-10 md:bottom-12">
          <div className="relative h-full">
            <div className="absolute bottom-16 right-0 bg-zinc-200 dark:bg-zinc-900 rounded-md shadow-md h-[80%] w-full md:w-[350px] md:h-[550px] flex flex-col p-2 font-mono">
              <textarea
                className="grow bg-zinc-50 dark:bg-zinc-700 resize-none mb-2 rounded-md p-2"
                resize="none"
                readOnly={true}
                value={messages}
              ></textarea>
              <Input
                id="message"
                value={values.message}
                onChange={handleChange}
                placeholder="Press ENTER to send"
                onKeyDown={onKeyDown}
              />
            </div>
          </div>
        </div>
      )}
      <div className="absolute bottom-5 right-5">
        {notification && (
          <div className="bg-red-500 rounded-full w-4 h-4 absolute -right-0.5 -top-0.5" />
        )}
        <div
          className="rounded-full ml-auto mt-3 w-14 h-14 bg-zinc-200 dark:bg-zinc-900 shadow-md p-4 cursor-pointer"
          onClick={toggle}
        >
          <FontAwesomeIcon
            icon={faMessage}
            className="text-2xl text-blue-500"
          />
        </div>
      </div>
    </>
  );
};

export default Chat;
