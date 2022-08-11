# Instructions to run the application locally

- Clone the repo (or) download as a zip file.

- Run `npm install` command in the terminal (at the root level) to install all the dependencies from `package.json` file.

- Add a `config.env` file (at the root level) and add the following Environment Variables:
    - `NODE_ENV="development"`
    - `PORT=4000` You can specify any port number here.

- Start the server by running the following command in the terminal (at the root level): `npm run start:dev`.
    - To start in production: `npm run start:prod`.
    - These scripts are available in `package.json` file.

- To debug the application in NDB Chromium Console, run the command `npm run debug`.

- Use either Postman or Chrome to send the requests.

- To access Swagger Documentation (Documentation of the United Nest's Backend API), run the application and goto `/api-docs` URL.