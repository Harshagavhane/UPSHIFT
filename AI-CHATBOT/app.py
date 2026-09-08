import streamlit as st
from langchain_community.llms import Ollama
from langchain_community.document_loaders import PyPDFLoader
from langchain.vectorstores import Chroma
from langchain.embeddings import OllamaEmbeddings
from langchain.text_splitter import CharacterTextSplitter

st.title("PDF AI Chatbot")

uploaded_file = st.file_uploader("Upload a PDF", type="pdf")

if uploaded_file:
    with open("temp.pdf", "wb") as f:
        f.write(uploaded_file.read())

    loader = PyPDFLoader("temp.pdf")
    documents = loader.load()

    text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = text_splitter.split_documents(documents)

    embeddings = OllamaEmbeddings(model="llama3")
    db = Chroma.from_documents(docs, embeddings)

    query = st.text_input("Ask a question about the PDF")

    if query:
        results = db.similarity_search(query)
        context = results[0].page_content

        llm = Ollama(model="llama3")
        answer = llm.invoke(context + query)

        st.write(answer)