import pandas as pd
import chromadb
from sentence_transformers import SentenceTransformer
from tqdm import tqdm
import uuid
import ast

# Step 1: Load the dataset
df_books = pd.read_csv(
    "D:\\CITL project\\library-management\\backend\\updated_books_new.csv", sep=","
)

# Step 2: Drop rows with empty required columns
required_columns = ["cover_image_uri", "book_title", "book_details", "author", "num_pages", "genres"]
df_books = df_books.dropna(subset=required_columns)

# Step 3: Parse the genres field to ensure it is a list and filter out rows with empty genres
df_books['genres'] = df_books['genres'].apply(lambda x: ast.literal_eval(x) if isinstance(x, str) else x)
df_books = df_books[df_books['genres'].apply(lambda x: len(x) > 0)]

# Step 4: Convert genres list to a single string
df_books['genres'] = df_books['genres'].apply(lambda x: ', '.join(x))

# Step 5: Reset index after filtering
df_books = df_books.reset_index(drop=True)

# Display the titles of invalid books
invalid_books = df_books[df_books['genres'].apply(lambda x: len(x) == 0)]
if not invalid_books.empty:
    print("Books that have been dropped due to empty genres:")
    for title in invalid_books['book_title']:
        print(title)

# Proceed with valid books
df_books = df_books.reset_index(drop=True)

# Initialize the SentenceTransformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Generate embeddings for each book with progress tracking
tqdm.pandas()
df_books['embedding'] = df_books.progress_apply(
    lambda row: model.encode(f"{row['book_title']} {str(row['genres'])}").tolist(), axis=1
)

# Initialize ChromaDB Client
client = chromadb.PersistentClient(
    path="D:\\CITL project\\library-management\\backend\\db_storage"
)

try:
    collection = client.get_collection("books")
except chromadb.errors.InvalidCollectionException:
    collection = client.create_collection(
        name="books",
        metadata={"description": "Books collection"}
    )

# Add books to the collection with progress tracking
batch_size = 100
for i in tqdm(range(0, len(df_books), batch_size), desc="Adding books to ChromaDB"):
    batch = df_books.iloc[i:i + batch_size]
    ids = [str(uuid.uuid4()) for _ in range(len(batch))]  # Generate unique IDs
    documents = batch['book_title'].tolist()
    metadatas = batch.apply(lambda row: {
        'author': row['author'],
        'num_pages': row['num_pages'],
        'cover_image_uri': row['cover_image_uri'],
        'book_details': row['book_details'],
        'genres': row['genres'],
        'format': row['format']
    }, axis=1).tolist()
    embeddings = batch['embedding'].tolist()

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas
    )
    print(f"Added batch {i//batch_size + 1} of {(len(df_books) + batch_size - 1)//batch_size}")

print("All books have been added to the collection.")

# Search function
def search_books(query_text, n_results=5):
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results,
        include=['documents', 'metadatas']
    )
    return results['documents'][0], results['metadatas'][0]

# Example usage
search_query = "fantasy"
documents, metadatas = search_books(search_query)
print("Search results:")
for doc, meta in zip(documents, metadatas):
    print(f"""
    Title: {doc}
    Author: {meta['author']}
    Pages: {meta['num_pages']}
    Cover: {meta['cover_image_uri']}
    Details: {meta['book_details']}
    Genres: {meta['genres']}
    """)
