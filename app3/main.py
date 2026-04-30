from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic import BaseModel
import chromadb
import uuid

app = FastAPI()

class ChunkRequest(BaseModel):
    text: str
    chunk_size: int = 300
    chunk_overlap: int = 50

chroma_client = chromadb.Client()
collection = chroma_client.create_collection(name = "documents")

@app.post("/chunk")
def chunk(request: ChunkRequest):
    with open("sample.txt") as f:
        text = f.read()
    splitter = RecursiveCharacterTextSplitter(
        chunk_size = 300,
        chunk_overlap = 50
        )
    chunks = splitter.split_text(text)
    # chunk_list = []
    # for chunk in chunks:
    #     dictionary = {
    #         "chunk": chunk, 
    #         "len": len(chunk)
    #     }
    #     chunk_list.append(dictionary)
    # return chunk_list

    ids = []
    documents = []

    for chunk in chunks:
        ids.append(str(uuid.uuid4()))
        documents.append(chunk)

    collection.add(
        ids=ids,
        documents=documents
    )
    return collection.get()


#3rd app, load same article (lighthouse document, or any document I want (a specific doc, hardcoded)), 
# but chunk hard code 300 cs, 50 overlap, 
# make chromadb database with those chunks (the documents are the chunks), set up search
# iuf someone asks a question, comes back with top5 chinks related to that question

#bonus: use llm to actually answer a question


app.mount("/", StaticFiles(directory="static", html=True), name="static")