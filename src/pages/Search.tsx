import React, { useState, useCallback, useEffect, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  num_pages: number;
  cover_image_uri: string;
  book_details: string;
  genres: string[] | string; // Update type to handle both array and string
  available: boolean;
}

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (query: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Search failed');
      }
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce((query: string) => performSearch(query), 150),
    [performSearch]
  );

  useEffect(() => {
    if (searchTerm.trim()) {
      debouncedSearch(searchTerm);
    } else {
      setSearchResults([]);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const formatGenre = (genres: string[] | string | undefined): string => {
    if (!genres) return 'Genre not available';
    
    if (Array.isArray(genres)) {
      return genres[0] || 'Genre not available';
    }
    
    if (typeof genres === 'string') {
      try {
        // Try to parse if it's a stringified array
        const parsed = JSON.parse(genres.replace(/'/g, '"'));
        return Array.isArray(parsed) ? parsed[0] : genres;
      } catch {
        // If parsing fails, clean up the string
        return genres.replace(/[[\]'"]/g, '').split(',')[0].trim();
      }
    }
    
    return 'Genre not available';
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
                {error}
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((book) => (
                <div 
                  key={book.id} 
                  className="p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex"
                >
                  <div className="w-1/3">
                    {book.cover_image_uri && (
                      <img 
                        src={book.cover_image_uri} 
                        alt={book.title} 
                        className="rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-book.jpg';
                        }}
                      />
                    )}
                  </div>
                  <div className="w-2/3 pl-6">
                    <h2 className="text-lg font-semibold text-gray-900">{book.title}</h2>
                    <p className="text-sm text-gray-600 mt-1">Author: {book.author || 'Unknown'}</p>
                    <p className="text-sm text-gray-600 mt-1">Pages: {book.num_pages || 'N/A'}</p>
                    <p className="text-sm text-gray-600 mt-1">Genre: {formatGenre(book.genres)}</p>
                    <p className="text-sm text-gray-600 mt-1">Details: {book.book_details || 'No details available'}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-sm font-medium ${book.available ? 'text-green-600' : 'text-red-600'}`}>
                        {book.available ? 'Available' : 'Not Available'}
                      </p>
                      <Link 
                        to={`/book/${encodeURIComponent(book.title)}`} 
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        aria-label={`View details for ${book.title}`}
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500 text-center">
                No books found matching your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;