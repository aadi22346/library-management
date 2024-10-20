import pandas as pd
import chromadb
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# Step 1: Load the dataset
df_books = pd.read_csv("D:\\CITL project\\library-management\\backend\\updated_books_new.csv")

# Step 2: Initialize the SentenceTransformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Step 3: Generate embeddings for each book with progress tracking
tqdm.pandas()
df_books['embedding'] = df_books.progress_apply(
    lambda row: model.encode(f"{row['book_title']} {str(row['genres'])}").tolist(), axis=1
)

# Step 4: Initialize ChromaDB Client
client = chromadb.PersistentClient(
    path="D:\\CITL project\\library-management\\backend\\db_storage"
)

# Step 5: Delete existing collection if it exists and create a new one
try:
    client.delete_collection("books")
except:
    pass

collection = client.create_collection(
    name="books",
    metadata={"description": "Book database with embeddings"}
)

# Step 6: Add book data to the collection (batch processing)
batch_size = 500
for i in range(0, len(df_books), batch_size):
    batch = df_books.iloc[i:i + batch_size]
    
    ids = [str(idx) for idx in batch.index]
    embeddings = [emb for emb in batch['embedding']]
    documents = [title for title in batch['book_title']]
    metadatas = [{
        'genres': str(row['genres'])
    } for _, row in batch.iterrows()]
    
    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas
    )
    print(f"Added batch {i//batch_size + 1} of {(len(df_books) + batch_size - 1)//batch_size}")

print("All books have been added to the collection.")

# Step 7: Search function
def search_books(query_text, n_results=5):
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results,
        include=['documents', 'metadatas']
    )
    return results['documents'][0], results['metadatas'][0]

# Example usage:
search_query = "fantasy"
books, metadata = search_books(search_query)
print(f"\nSearch Results for '{search_query}':")
for i, (book, meta) in enumerate(zip(books, metadata), 1):
    print(f"{i}. {book}")
    print(f"   Genres: {meta['genres']}")