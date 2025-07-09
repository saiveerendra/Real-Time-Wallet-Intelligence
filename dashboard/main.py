import streamlit as st
import pandas as pd
import sqlite3

st.set_page_config(layout="wide")
st.title("TokenWise — Real-Time Wallet Intelligence on Solana")

#Connect to the SQLite DB 
@st.cache_resource
def get_connection():
    return sqlite3.connect("../backend/tokenwise.db")

#Load data from DB 
@st.cache_data(ttl=120)  #cache for every 2 mins
def load_data():
    conn = get_connection()
    df = pd.read_sql_query("SELECT * FROM transactions", conn)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    return df

df = load_data()


st.subheader("Buy vs Sell Overview")
action_counts = df['action'].value_counts()
st.bar_chart(action_counts)

# Protocol usage
st.subheader("Protocol Usage")
protocol_counts = df['protocol'].value_counts()
st.bar_chart(protocol_counts)

# Most active wallets
st.subheader("Most Active Wallets")
wallet_counts = df['wallet'].value_counts().head(10)
st.dataframe(wallet_counts.rename("Transaction Count"))

# Time filtering
st.subheader("Filter by Time")
start_date = st.date_input("Start date", df['timestamp'].min().date())
end_date = st.date_input("End date", df['timestamp'].max().date())

filtered = df[
    (df['timestamp'] >= pd.to_datetime(start_date)) &
    (df['timestamp'] <= pd.to_datetime(end_date))
]
st.write("Filtered Transactions", filtered)
