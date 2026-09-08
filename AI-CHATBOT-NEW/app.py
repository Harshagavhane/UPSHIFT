import streamlit as st

st.title("Simple AI Chatbot 🤖")

user_input = st.text_input("Ask something")

if user_input:
    st.write("You said:", user_input)