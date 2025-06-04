from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    message: str = Field(example="Hola!")

class ChatResponse(BaseModel):
    response: str