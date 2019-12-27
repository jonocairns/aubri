## Aubri

A place to store your audiobooks

## Development

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
