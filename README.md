![Imgur](https://i.imgur.com/377ZQbs.png)

![](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2Fjonosma%2Fpledges&style=plastic)

![](https://github.com/jonocairns/aubri/workflows/CI/CD%20(client/server)/badge.svg)

A place to store your audiobooks

[Installing on unraid](https://github.com/jonocairns/aubri/wiki/Installing-on-Unraid)

## Development

[![GitHub issues](https://img.shields.io/github/issues/jonocairns/aubri.svg?maxAge=60&style=plastic&logo=github)](https://github.com/jonocairns/aubri/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/jonocairns/aubri.svg?maxAge=60&style=plastic&logo=github)](https://github.com/jonocairns/aubri/pulls)

[![Docker release](https://img.shields.io/badge/jonocairns-aubri:latest-blue.svg?colorB=1488C6&maxAge=60&style=plastic&logo=docker)](https://hub.docker.com/r/jonocairns/aubri)

### Requirements

1. Docker
2. nodejs
3. yarn
4. Auth0 account (set client in `./client/.env`)
5. install FFMPEG

Getting started:

1. Clone the repository
2. In the root folder run `docker-compose up`, this will spin up postgres (note: you may need to login (localhost:8080) to create a perminant login first)
3. Open 2 terminals, one in `./client` and one in `./server`.
4. Run `yarn install` in both client and server folders.
5. Copy the `.env.example` to `.env` and set all the variables (in both client and server)
6. Add audio books to `./server/data`
7. Run `yarn start` in both client and server


