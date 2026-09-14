# Python Fast API Server

To run locally:

1. cd into the `Backend` directory.

2. Create a python virtual env and install the dependencies from the `requirements.txt` file.

```commandline
python -m venv env

# please be sure to start your virtual environment before running the install command


pip install -r requirements.txt --only-binary :all:
```

3. Create a .env file in the `Backend/` directory. It should be based on .env.example or the code block below. Fill in your desired port number and CORS origins.

```commandline
PYTHON_VERSION=3.13
PORT=3000
# CORS origins
ORIGINS=["http://localhost", "*"]

```

4. Start the server in dev mode locally:

```commandline
 python -m uvicorn api.main:app --reload --port 3000
```
