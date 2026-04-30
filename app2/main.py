from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic import BaseModel

app = FastAPI()

class ChunkRequest(BaseModel):
    text: str
    chunk_size: int = 200
    chunk_overlap: int = 20

@app.post('/chunk')
def chunk(request: ChunkRequest):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=request.chunk_size,
        chunk_overlap=request.chunk_overlap
    )
    result = splitter.split_text(request.text)
    chunk_list = []
    for chunk in result:
        dictionary = {
            "chunk": chunk, 
            "len": len(chunk)
        }
        chunk_list.append(dictionary)
    return chunk_list

app.mount("/", StaticFiles(directory="static", html=True), name="static")