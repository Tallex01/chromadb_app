from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic import BaseModel
import chromadb

app = FastAPI()

class ChunkRequest(BaseModel):
    text: str
    chunk_size: int = 300
    chunk_overlap: int = 50

chroma_client = chromadb.Client()
collection = chroma_client.create_collection(name = "documents")

collection.add(
    ids = [],
    documents = []
)

@app.post('/chunk')
def chunk(request: ChunkRequest):

    my_list = []
    splitter = RecursiveCharacterTextSplitter(
        chunk_size = 300,
        chunk_overlap = 50
        )
    result = splitter.split_text(request.text)
    for chunk in result:
        my_list.append({
            "Chunk": chunk,
            "Length": len(chunk)
        })
    return my_list




#3rd app, load same article (lighthouse document, or any document I want (a specific doc, hardcoded)), 
# but chunk hard code 300 cs, 50 overlap, 
# make chromadb database with those chunks (the documents are the chunks), set up search
# iuf someone asks a question, comes back with top5 chinks related to that question

#bonus: use llm to actually answer a question


app.mount("/", StaticFiles(directory="static", html=True), name="static")