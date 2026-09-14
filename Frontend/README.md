# React + Vite Frontend

The Frontend application is a simple React + Vite static site that makes an api call to the Fast API backend application.

Be sure to create a .env file in the `Frontend` directory and add the url for the fast api app like in the .env.example file or in the code block below:

```
VITE_PROD_API_URL=
VITE_DEV_API_URL="http://localhost:8000"
VITE_DEPLOY_ENVIRONMENT="dev"
```

To run the React frontend on a local server:
1. cd into the `Frontend` directory
2. run `npm install` to install app dependencies
3. run `npm run dev` as a start command.
