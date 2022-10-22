import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

const mailer = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  auth:
    process.env.NODE_ENV === 'production'
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      : undefined
});

const confirmEmail = async (to: string, confirm: string): Promise<void> => {
  const message: Mail.Options = {
    from: 'Cube With Me <no-reply@cubewithme.com>',
    to,
    subject: 'Confirm Your Email',
    text: `Please confirm your email ${process.env.APP_URL}/verify?id=${confirm}`
  };

  return new Promise((res, rej) => {
    mailer.sendMail(message, (err, _info) => {
      if (err) {
        rej(err);
      } else {
        res();
      }
    });
  });
};

export default mailer;
export { confirmEmail };
