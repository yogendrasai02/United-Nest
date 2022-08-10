# Instructions to run the app locally

- Clone the repo (or) download as a zip file.

- Run `npm install` command in the terminal (at the root level) to install all the dependencies from `package.json` file.

- Add a `config.env` file (at the root level) and add the following Environment Variables:
    - `NODE_ENV="development"`
    - `PORT=4000` You can specify any port number here.

- Start the app by running the following command in the terminal (at the root level): `npm start` (or) `npm run start`.
    - To start in production: `npm run start:prod`.
    - These scripts are available in `package.json` file.

- Use either Postman or Chrome to send the requests.

- To access Swagger Documentation (Documentation of the United Nest's Backend API), run the app and goto `/api-docs` URL.