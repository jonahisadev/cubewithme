import { createRoom } from '../src/lib'

createRoom().then(room => {
  console.log(`Created web socket on ${room.port}`);
})
