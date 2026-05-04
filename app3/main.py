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

@app.post("/chunk")
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

#Chromadb
chroma_client = chromadb.Client()
collection = chroma_client.create_collection(name = "documents")    # a collection is kinda like a table

with open("sample.txt") as f:
    text = f.read()

docs = chunk(ChunkRequest(text=text))
collection.add(
    ids = [str(doc) for doc in range(len(docs))],
    documents = [doc["chunk"] for doc in docs]
)

#endpoints to get the docs n search
@app.get("/documents")
def get_documents():
    results = collection.get()
    my_list = []
    for i in range(len(results["ids"])):
        my_dict = {"id": results["ids"][i],
                   "document": results["documents"][i]
                   }
        my_list.append(my_dict)
    return my_list

@app.get("/search")
def get_search(query: str):
    results = collection.query(query_texts = [query], n_results = 5)
    my_list = []
    for i in range(5):
        my_dict = {
                   "id": results["ids"][0][i],
                   "document": results["documents"][0][i],
                   "distance": results["distances"][0][i]
        }
        my_list.append(my_dict)
    return my_list






#3rd app, load same article (lighthouse document, or any document I want (a specific doc, hardcoded)), 
# but chunk hard code 300 cs, 50 overlap, 
# make chromadb database with those chunks (the documents are the chunks), set up search
# iuf someone asks a question, comes back with top5 chunks related to that question

#bonus: use llm to actually answer a question


app.mount("/", StaticFiles(directory="static", html=True), name="static")