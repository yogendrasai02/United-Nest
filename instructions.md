# Instructions to run the application locally

- Clone the repo (or) download as a zip file.

- Run `npm install` command in the terminal (at the root level) to install all the dependencies from `package.json` file.

- Add a `config.env` file (at the root level) and add the following Environment Variables:
    - `NODE_ENV="development"`
    - `PORT=4000` (You can specify any port number here)
    - `DB_URL_DEVELOPMENT` (Create a MongoDB ATLAS database, get it's connection URL with a `<password>` placeholder instead of the actual user access password)
    - `DB_PASSWORD_DEVELOPMENT` (For that database, add a user for access, specify that password here. The code will replace the `<password>` placeholder in the DB URL, as defined above)
    - `JWT_SECRET_KEY` (Must use the **same** secret key consistently for the entire team all the time)
    - `JWT_EXPIRES_IN` (set it to `24h`)

- Entire working `config.env` file looks like this:
```
NODE_ENV="development"
PORT=4000
DB_URL_DEVELOPMENT="......"
DB_PASSWORD_DEVELOPMENT="......"
DB_URL_PRODUCTION="......"
DB_PASSWORD_PRODUCTION="......"
JWT_SECRET_KEY="......"
JWT_EXPIRES_IN="......"
JWT_EXPIRES_IN_MILLISECONDS="......"    # x hours in milliseconds
# for DEV, emails endup in MAILTRAP inbox
EMAIL_HOST_DEVELOPMENT="smtp.mailtrap.io"
EMAIL_PORT_DEVELOPMENT="465"
EMAIL_USERNAME_DEVELOPMENT="......"
EMAIL_PASSWORD_DEVELOPMENT="......"
# for PROD, send REAL emails
EMAIL_HOST_PRODUCTION="smtp-relay.sendinblue.com"
EMAIL_PORT_PRODUCTION="587"
EMAIL_USERNAME_PRODUCTION="......"
EMAIL_PASSWORD_PRODUCTION="......"
CLOUDINARY_CLOUD_NAME="......"
CLOUDINARY_API_KEY="......"
CLOUDINARY_API_SECRET="......"
PHOTOS_FOLDER_NAME="......"
VIDEOS_FOLDER_NAME="......"
TWILIO_ACCOUNT_SID="......"
TWILIO_API_KEY_SID="......"
TWILIO_API_KEY_SECRET="......"
TWILIO_ACCESS_TOKEN_EXPIRES_IN_SECONDS="......"
SIGHTENGINE_IMAGE_MODERATION_API_URL="https://api.sightengine.com/1.0/check.json"
SIGHTENGINE_IMAGE_MODERATION_API_USERNAME="......"
SIGHTENGINE_IMAGE_MODERATION_API_SECRET="......"
```

- Start the server by running the following command in the terminal (at the root level): `npm run start:dev`.
    - To start in production: `npm run start:prod`.
    - These scripts are available in `package.json` file.

- To debug the application in NDB Chromium Console, run the command `npm run debug`.

- Use either Postman or Chrome to send the requests.

- To access Swagger Documentation (Documentation of the United Nest's Backend API), run the application and goto `/api-docs` URL.
