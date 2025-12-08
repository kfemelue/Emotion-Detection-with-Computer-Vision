import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from Models.photo_model import Photo
import Services.emotion_service as emotions

load_dotenv(".env")
app = FastAPI()
origins = os.environ["ORIGINS"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)


@app.post("/analyze")
async def analyze_photo(photo: Photo):
    data = photo.base64
    await emotions.decode_image(data)
    predictions = await emotions.get_predictions_from_image("./temp.jpeg")
    results = await predictions.get_emotions_dict()
    os.remove("./temp.jpeg")
    return json.dumps(results)
