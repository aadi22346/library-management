import chromadb

# Initialize client and get collection
client = chromadb.PersistentClient(
    path="D:\\CITL project\\library-management\\backend\\db_storage"
)
collection = client.get_collection("books")

def search_books(query_text, n_results=5):
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results,
        include=['documents', 'metadatas']
    )
    return results['documents'][0], results['metadatas'][0]

# Search for books
search_query = "Romance"
books, metadata = search_books(search_query)
print(f"\nSearch Results for '{search_query}':")
for i, (book, meta) in enumerate(zip(books, metadata), 1):
    print(f"{i}. {book}")
    print(f"   Genres: {meta['genres']}")