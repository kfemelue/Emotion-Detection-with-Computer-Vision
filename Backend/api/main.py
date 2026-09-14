import os
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.photo_model import Photo
import services.emotion_service as emotions

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

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/analyze")
async def analyze_photo(photo: Photo):
    id = uuid.uuid7()
    data = photo.base64
    await emotions.decode_image(data)
    predictions = await emotions.get_predictions_from_image(f"./temp_{id}.jpeg")
    results = await predictions.get_emotions_dict()
    os.remove(f"./temp_{id}.jpeg")
    # return json.dumps(results)
    return results
