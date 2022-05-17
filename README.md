# node-auth-api
Node User Authorization API

## Follow these steps to setup the project

Step 1: Clone the repo
```bash
git clone https://github.com/predismad/node-auth-api.git
```

Step 2: Go into project directory and install dependencies
```bash
npm install
````

Step 3: Create .env file
```bash
touch .env
```

Step 4: Generate secret key for JWT and copy to clipboard
```bash
npm run key
```

Step 5: Set env variables

```bash
NODE_PORT: 5000
JWT_SECRET: Paste key from step 4
FRONTEND_URL: e.g. http://localhost:8080
ADMIN_MAILS: e.g. 'example@mail.com, example2@mail.com'
```
Sendgrid Credentials

```bash
SENDGRID_API_KEY: API Key created by sendgrid
SENDGRID_EMAIL: E-Mail of verified sendgrid single sender
```
MongoDB Cloud Credentials

```bash
MONGODB_USERNAME: MongoDB User
MONGODB_PASSWORD: MongoDB Password
MONGODB_HOST: URL of mongodb cloud service
MONGODB_NAME: Database name
```

Step 6: Start API server

```bash
npm run dev
```
