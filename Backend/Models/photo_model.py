from pydantic import BaseModel


class Photo(BaseModel):
    timestamp_ms: int
    base64: str

