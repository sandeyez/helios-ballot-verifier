## Implementation of the Helios Ballot Verifier

This repository contains the implementation that belongs to my Master thesis _"Simplifying Ballot Verification in Helios: A User-Friendly Approach Using Verifiable Computing"_, carried out at the University of Amsterdam.

---
**NOTE** The code in this repository is purely written for demonstration and proof-of-concept purposes.

---

### Setup instructions
In order to get the code to run, the following prerequisites must be fulfilled:

- Docker must be installed on your system. [[MacOS](https://docs.docker.com/desktop/setup/install/mac-install/)] [[Windows](https://docs.docker.com/desktop/setup/install/windows-install/)] [[Various Linux distros](https://docs.docker.com/desktop/setup/install/linux/)]
- The Docker container with the PostreSQL database must be running. It can be started using ```docker compose up -d``` and stopped with ```docker compose down```. [[Docs](https://docs.docker.com/compose/)]
- NodeJS and NPM (Node Package Manager) must be installed on your system. [[Instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)].
- The dependencies of the project must be installed, using ```npm install```. [[Instructions](https://docs.npmjs.com/cli/v8/commands/npm-install)]
- Create a ```.env``` file and paste the contents from ```.env.example``` inside it. This file is used to set the environment variables for the project.
- Finally, the project can be started using ```npm run dev```.

### Contents
The code in this repository builds an interactive web-app, to test out the concepts discussed in my thesis. The following functionality is included:

- Creation and deletion of random ballots in the database.
- Merkle Trees
  1. Construction of a tree
  2. Generation of (non-)membership proofs
  3. Verification of proofs
- Radix Trees
  1. Construction of a tree
  2. Generation of (non-)membership proofs
  3. Verification of proofs

### Overview
Because the verification follows of a client/server-architecture, a full-stack JS framework was used. Because of my own experience, I have selected [Remix](https://remix.run/), which runs on [React](https://react.dev/). 
All routes are created in the ```/routes/__frontend``` folder, and all server API routes are present in the ```/routes/api``` folder. 

Several React UI components are created, with the base elements coming from [ShadCN](https://ui.shadcn.com/). All selfmade components have been provided with JSDocs to explain their goal and workings.

Finally, [Prisma](https://www.prisma.io/) is used as an ORM for the database, providing better DX and typing when working with PostreSQL.

---
For any questions, please reach me at <sander.van.werkhooven@student.uva.nl>.
