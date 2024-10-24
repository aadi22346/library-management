import React, { useState, useCallback, useEffect, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { Search as SearchIcon } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  num_pages: number;
  cover_image_uri: string;
  book_details: string;
  genres: string[] | string;
  available: boolean;
}

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/search?q=${encodeURIComponent(query.trim())}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Search failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid response format from server');
      }

      setSearchResults(data.results);
      setError(null);
    } catch (err: unknown) {
      console.error('Search error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during search');
      }
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce((query: string) => performSearch(query), 300),
    [performSearch]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    if (!e.target.value.trim()) {
      setSearchResults([]);
      setError(null);
    }
  };

  const formatGenre = (genre: string | string[]): string => {
    if (Array.isArray(genre)) {
      return genre.join(', ');
    }
    try {
      const parsed = JSON.parse(genre);
      return Array.isArray(parsed) ? parsed.join(', ') : genre;
    } catch {
      return genre.replace(/[[\]'"]/g, '').split(',')[0].trim();
    }
  };

  const handleViewDetails = async (book: Book) => {
    try {
      // Ensure genres is an array
      const genresArray = Array.isArray(book.genres) 
        ? book.genres 
        : typeof book.genres === 'string'
        ? book.genres.split(',').map(g => g.trim())
        : [];

      // Store the view in search history
      const response = await fetch(`http://localhost:5000/api/store_search_history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'test_user',
          book_title: book.title,
          genres: genresArray
        }),
        credentials: 'include' // Important for maintaining session
      });

      if (!response.ok) {
        console.error('Failed to store search history');
      }

      // Force a recommendations refresh by adding a timestamp
      const timestamp = new Date().getTime();
      window.location.href = `/book/${encodeURIComponent(book.title)}?t=${timestamp}`;
    } catch (err) {
      console.error('Error storing search history:', err);
      window.location.href = `/book/${encodeURIComponent(book.title)}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Search Books</h1>
      
      <div className="relative mb-8">
        <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <SearchIcon className="w-5 h-5 text-gray-400 ml-3" aria-hidden="true" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search by title, author, or genre..."
            className="flex-grow p-3 pl-2 focus:outline-none rounded-md"
            aria-label="Search books"
          />
          {isLoading && (
            <div className="mr-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        
        {(searchResults.length > 0 || error || (searchTerm.trim() !== '' && !isLoading)) && (
          <div className="absolute w-full mt-2 bg-white rounded-md shadow-lg border border-gray-200 max-h-[70vh] overflow-y-auto z-10">
            {error ? (
              <div className="p-4 text-red-600" role="alert">
                <p>Error: {error}</p>
                <p className="text-sm mt-1">Please try again or refine your search.</p>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((book) => (
                <div 
                  key={book.id || book.title} 
                  className="p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex"
                >
                  <div className="w-1/4 flex-shrink-0">
                    {book.cover_image_uri && (
                      <div className="aspect-w-2 aspect-h-3 relative">
                        <img 
                          src={book.cover_image_uri} 
                          alt={`Cover of ${book.title}`} 
                          className="rounded-lg object-contain w-full h-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-book-cover.jpg';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="w-3/4 pl-6">
                    <h2 className="text-lg font-semibold text-gray-900">{book.title}</h2>
                    <p className="text-sm text-gray-600 mt-1">Author: {book.author || 'Unknown'}</p>
                    {book.num_pages && (
                      <p className="text-sm text-gray-600 mt-1">Pages: {book.num_pages}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">Genre: {formatGenre(book.genres)}</p>
                    {book.book_details && (
                      <p className="text-sm text-gray-600 mt-1">Details: {book.book_details}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-sm font-medium ${book.available ? 'text-green-600' : 'text-red-600'}`}>
                        {book.available ? 'Available' : 'Not Available'}
                      </p>
                      <button 
                        onClick={() => handleViewDetails(book)} 
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        aria-label={`View details for ${book.title}`}
                        type="button"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : searchTerm.trim() !== '' ? (
              <div className="p-4 text-gray-500 text-center">
                No books found matching "{searchTerm}". Try adjusting your search terms.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;