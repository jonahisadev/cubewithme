<p align="center">
  <a href="https://cubewithme.com" target="_blank">
    <img alt="Cube With Me" src="https://cubewithme.s3.us-east-2.amazonaws.com/cubewithme_banner.jpg" />
  </a>
</p>

<p align="center">
  The best online solution for head-to-head speedcubing.
</p>

------

## Features

* ⚡ **Fast & Easy** - Join a room with one click
* 💪 **Stable** - Built to last
* 📱 **Mobile Support** - Designed with a mobile-first mindset
* 🏁 **Every WCA Event** - Play every officially supported WCA event type
* 💬 **Chat** - Built in text chat support
* 🖥️  **Open Source** - Work to improve the project with the community!

## Project Structure

* **api/**: The REST API responsible for handling interactions with the
database, user authentication, and abstracting web socket brokerage from the
client. This is a simple express application.
* **web/**: The front end part of the application. This runs with React using
Nextjs.
* **ws/**: This is where WebSockets are created and managed.

## Development

### Node.js & Yarn

Firstly, install [Node.js](https://nodejs.org/en/download/). This is needed
to install the packages for the services, all of which run with Node.js. Once
you've installed Node.js, enable [Yarn](https://yarnpkg.com/getting-started/install).

### Docker

Secondly, install [Docker](https://www.docker.com/). This makes it very easy to
locally run the entire stack for local development and testing. Once you've
installed Docker, run the following from the command line:

``` bash
$ docker compose up
```

This should start every part of the stack as well as a couple of utility
services. Open a web browser and navigate to `http://localhost:3000` and
make sure that the landing page loads up.

### Frontend Pages

* Frontend - `http://localhost:3000`
* PostgresSQL Admin Panel - `http://localhost:8910`
* Mailhog - `http://localhost:8025`
