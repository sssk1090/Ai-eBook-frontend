import React, { createContext, useContext, useState } from "react";

const BookContext = createContext();

export const BookProvider = ({ children }) => {
  const [currentBook, setCurrentBook] = useState(null);

  const [chapters, setChapters] = useState([]);

  const [selectedChapter, setSelectedChapter] = useState(null);

  // Set complete book
  const setBook = (book) => {
    setCurrentBook(book);

    if (book?.chapters) {
      setChapters(book.chapters);
    }
  };

  // Update book information
  const updateBook = (updatedBook) => {
    setCurrentBook(updatedBook);

    if (updatedBook?.chapters) {
      setChapters(updatedBook.chapters);
    }
  };

  // Add a new chapter
  const addChapter = (chapter) => {
    setChapters((prevChapters) => [
      ...prevChapters,
      chapter,
    ]);
  };

  // Update existing chapter
  const updateChapter = (chapterIndex, updatedChapter) => {
    setChapters((prevChapters) =>
      prevChapters.map((chapter, index) =>
        index === chapterIndex
          ? updatedChapter
          : chapter
      )
    );
  };

  // Delete chapter
  const deleteChapter = (chapterIndex) => {
    setChapters((prevChapters) =>
      prevChapters.filter(
        (_, index) => index !== chapterIndex
      )
    );
  };

  // Clear current book
  const clearBook = () => {
    setCurrentBook(null);
    setChapters([]);
    setSelectedChapter(null);
  };

  const value = {
    currentBook,
    setCurrentBook,
    chapters,
    setChapters,
    selectedChapter,
    setSelectedChapter,
    setBook,
    updateBook,
    addChapter,
    updateChapter,
    deleteChapter,
    clearBook,
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};

// Custom hook
export const useBook = () => {
  return useContext(BookContext);
};