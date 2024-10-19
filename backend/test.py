import chromadb
import ast  # For safely evaluating string representations of lists

# Initialize client and get collection
client = chromadb.PersistentClient(
    path="D:\\CITL project\\library-management\\backend\\db_storage"
)
collection = client.get_collection("books")

def search_books(book_name):
    results = collection.query(
        query_texts=[book_name],
        n_results=1,
        include=['documents', 'metadatas']
    )
    if results['documents'][0]:
        document = results['documents'][0][0]
        metadata = results['metadatas'][0][0]
        # Safely convert string representation of list to actual list
        genre = ast.literal_eval(metadata['genres']) if metadata['genres'] else []
        return document, genre
    else:
        return None, None

def gen_similar_books(search_query):
    results = collection.query(
        query_texts=[search_query],
        n_results=6,  # Increased to 6 to account for possible self-match
        include=['documents', 'metadatas']
    )
    return results['documents'][0], results['metadatas'][0]

# Main script
book_name = input("Enter the name of the book: ")
book, genres = search_books(book_name)

if book:
    print(f"\nSearch result of the book {book_name}:")
    print(f"book: {book}")
    print(f"genres: {genres}")
    
    if genres:  # Check if genres list is not empty
        # Generate similar books based on the first genre
        search_query = genres[0]  # Use the first genre for the search query
        similar_books, similar_metadata = gen_similar_books(search_query)
        
        print(f"\nSimilar books in the '{search_query}' genre:")
        count = 1
        for b, meta in zip(similar_books, similar_metadata):
            # Skip the original book
            if b == book_name:
                continue
            if count > 5:  # Only show 5 results
                break
            print(f"{count}. {b}")
            genres_list = ast.literal_eval(meta['genres']) if meta['genres'] else []
            print(f"   Genres: {genres_list}")
            count += 1
    else:
        print("No genres found for this book")
else:
    print("The book is not present in the database")