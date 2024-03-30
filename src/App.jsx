import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRating, setSelectedRating] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [minimumVal, setMinVal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
    
    const handleSearch = (event) => {
      event.preventDefault(); // Prevent form submission
      const searchData = event.target.searchQuery.value;
      setSearch(searchData);
    };

    function computeStats(filteredBooks) {
      let sum = 0;
      let count = 0;
      let minimum = Number.MAX_VALUE; // Impossible rating and guaranteed to pass with any value
    

      books.forEach(book => {
        if (typeof book.ratings === 'number') {
          sum += book.ratings;
          count++;
          minimum = (minimum>book.ratings)?book.ratings:minimum;
        }
      });
      
      if (count === 0) {
        return { averageRating: 0, minimumRating: 0};
      }

      return { averageRating: sum/count, minimumRating: minimum};
    }
    const handleRatingChange = (event) => {
      const rating = parseInt(event.target.value); // Convert to integer
      setSelectedRating(rating);
     
    };

    function getTotalNumberOfBooks(filteredBooks) {
      return filteredBooks.length;
    }  

    useEffect(() => {
      setIsLoading(true); // Set loading state when starting data fetch
    
      let searchParam = search.replace(/ /g, " ");
      fetch('https://openlibrary.org/search.json?q=' + searchParam)
        .then(response => response.json())
        .then(data => {
          const booksData = data.docs
            .map(book => ({
              title: book.title,
              author: book.author_name ? book.author_name.join(', ') : 'Unknown Author',
              publisher: book.publisher ? book.publisher[0] : 'Unknown Publisher',
              publishDate: book.publish_date ? book.publish_date[0] : 'Unknown Publish Date',
              ratings: book.ratings_average ? book.ratings_average : 'No Ratings Available'
            }))
            .filter(book => {
              if (selectedRating) {
                return parseFloat(book.ratings) >= selectedRating;
              } else {
                return true;
              }
            });
    
          const { averageRating, minimumRating } = computeStats(booksData);
          setBooks(booksData);
          setAverageRating(averageRating);
          setMinVal(minimumRating);
          setIsLoading(false); // Set loading state to false after data fetch
        });
    }, [search, selectedRating]);
  return (
    <>
    <div>
        <h2>Average Rating: {averageRating}</h2>
        <h2>Total Number of Books: {getTotalNumberOfBooks(books)}</h2>
        <h2>Minimum Rating: {minimumVal}</h2>
      </div>
    <form onSubmit={handleSearch}>
        <input
          type="text"
          name="searchQuery"
          placeholder="Enter your search query"
        />
        <button type="submit">Search</button>
      </form>

    <form>
        <label>
          Filter by Ratings:
          <select value={selectedRating || ""} onChange={handleRatingChange}>
            <option value="">All Ratings</option>
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating}>{rating} stars</option>
            ))}
          </select>
        </label>
      </form>  
    
    <div>
      <h1>Books Information</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Publisher</th>
            <th>Publish Date</th>
            <th>Ratings</th>
          </tr>
        </thead>
        <tbody>
          {search !== "" ? (
            books.map((book, index) => (
              <tr key={index}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.publisher}</td>
                <td>{book.publishDate}</td>
                <td>{book.ratings}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No search results found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </>
  );
  
}

export default App;
