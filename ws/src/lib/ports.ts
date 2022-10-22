const start = 20000;
const g_ports: number[] = [];

const take = (): number => {
  console.log('ports.take()');
  console.log(g_ports);

  if (g_ports.length === 0) {
    g_ports.push(start);
    console.log(start);
    return start;
  }

  let search = start;
  for (let i = 0; i < g_ports.length; i++) {
    if (g_ports[i] !== search) {
      g_ports.splice(i, 0, search);
      console.log(search);
      return search;
    }
    search++;
  }

  console.log(search);
  g_ports.splice(g_ports.length, 0, search);
  return search;
};

const give = (port: number) => {
  const idx = g_ports.findIndex(x => x === port);
  if (idx >= 0) {
    g_ports.splice(idx, 1);
  }
  console.log('ports.give() -> ' + port);
  console.log(g_ports);
};

export default {
  take,
  give
};
