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
    try:
        uid = uuid.uuid4()
        data = photo.base64
        await emotions.decode_image(data, uid)
        predictions = await emotions.get_predictions_from_image(f"./temp_{uid}.jpeg")
        results = await predictions.get_emotions_dict()
        os.remove(f"./temp_{uid}.jpeg")
        return results
    except Exception as e:
        print(e)
    # return json.dumps(results)
