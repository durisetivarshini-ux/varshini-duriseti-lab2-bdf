const path = require("path");
const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const databasePath = path.join(__dirname, "books.db");
let database;

app.use(express.json());

function isValidBookDetails(book) {
  return (
    book &&
    typeof book.title === "string" &&
    book.title.trim() !== "" &&
    typeof book.author === "string" &&
    book.author.trim() !== "" &&
    Number.isInteger(book.price) &&
    book.price >= 0 &&
    Number.isInteger(book.pages) &&
    book.pages > 0
  );
}

// Get all books
app.get("/books", async (request, response) => {
  try {
    const books = await database.all("SELECT * FROM book ORDER BY id");
    response.status(200).json(books);
  } catch (error) {
    console.error("Could not get books:", error.message);
    response.status(500).json({ error: "Could not get books" });
  }
});

// Get one book by its ID
app.get("/books/:bookId", async (request, response) => {
  const bookId = Number(request.params.bookId);

  if (!Number.isInteger(bookId) || bookId < 1) {
    response.status(404).json({ error: "Book not found" });
    return;
  }

  try {
    const book = await database.get("SELECT * FROM book WHERE id = ?", [
      bookId,
    ]);

    if (!book) {
      response.status(404).json({ error: "Book not found" });
      return;
    }

    response.status(200).json(book);
  } catch (error) {
    console.error("Could not get the book:", error.message);
    response.status(500).json({ error: "Could not get the book" });
  }
});

// Add a new book
app.post("/books", async (request, response) => {
  if (!isValidBookDetails(request.body)) {
    response.status(400).json({ error: "Please provide valid book details" });
    return;
  }

  const { title, author, price, pages } = request.body;

  try {
    // The ? marks keep user input separate from SQL and help prevent SQL injection.
    const result = await database.run(
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
      [title.trim(), author.trim(), price, pages],
    );

    response.status(201).json({
      message: "Book added successfully",
      bookId: result.lastID,
    });
  } catch (error) {
    console.error("Could not add the book:", error.message);
    response.status(500).json({ error: "Could not add the book" });
  }
});

// Update a book by its ID
app.put("/books/:bookId", async (request, response) => {
  const bookId = Number(request.params.bookId);

  if (!Number.isInteger(bookId) || bookId < 1) {
    response.status(404).json({ error: "Book not found" });
    return;
  }

  if (!isValidBookDetails(request.body)) {
    response.status(400).json({ error: "Please provide valid book details" });
    return;
  }

  const { title, author, price, pages } = request.body;

  try {
    const result = await database.run(
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?",
      [title.trim(), author.trim(), price, pages, bookId],
    );

    if (result.changes === 0) {
      response.status(404).json({ error: "Book not found" });
      return;
    }

    response.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    console.error("Could not update the book:", error.message);
    response.status(500).json({ error: "Could not update the book" });
  }
});

// Delete a book by its ID
app.delete("/books/:bookId", async (request, response) => {
  const bookId = Number(request.params.bookId);

  if (!Number.isInteger(bookId) || bookId < 1) {
    response.status(404).json({ error: "Book not found" });
    return;
  }

  try {
    const result = await database.run("DELETE FROM book WHERE id = ?", [
      bookId,
    ]);

    if (result.changes === 0) {
      response.status(404).json({ error: "Book not found" });
      return;
    }

    response.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Could not delete the book:", error.message);
    response.status(500).json({ error: "Could not delete the book" });
  }
});

// Show JSON errors for invalid JSON and other request errors.
app.use((error, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error.status === 400) {
    response.status(400).json({ error: "Invalid JSON request body" });
    return;
  }

  console.error("Request failed:", error.message);
  response.status(500).json({ error: "Something went wrong" });
});

// Connect to the database first, then start the server.
async function initializeDBAndServer() {
  try {
    database = await sqlite.open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Could not connect to the database:", error.message);
    process.exitCode = 1;
  }
}

initializeDBAndServer();
