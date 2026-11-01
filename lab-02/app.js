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
    book !== null &&
    typeof book === "object" &&
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

function asyncHandler(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

function getBookId(request, response, next) {
  const bookId = Number(request.params.bookId);
  if (!Number.isInteger(bookId) || bookId < 1) {
    response.status(404).json({ error: "Book not found" });
    return;
  }
  request.bookId = bookId;
  next();
}

app.get(
  "/books",
  asyncHandler(async (request, response) => {
    const books = await database.all("SELECT * FROM book ORDER BY id");
    response.status(200).json(books);
  }),
);

app.get(
  "/books/:bookId",
  getBookId,
  asyncHandler(async (request, response) => {
    const book = await database.get("SELECT * FROM book WHERE id = ?", [
      request.bookId,
    ]);
    if (!book) {
      response.status(404).json({ error: "Book not found" });
      return;
    }
    response.status(200).json(book);
  }),
);

app.post(
  "/books",
  asyncHandler(async (request, response) => {
    const { title, author, price, pages } = request.body;
    if (!isValidBookDetails(request.body)) {
      response.status(400).json({
        error:
          "Provide a non-empty title and author, a non-negative integer price, and a positive integer pages value",
      });
      return;
    }

    // SQL injection is unsafe input changing a query; ? placeholders keep input as data.
    const result = await database.run(
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
      [title.trim(), author.trim(), price, pages],
    );
    response.status(201).json({
      message: "Book added successfully",
      bookId: result.lastID,
    });
  }),
);

app.put(
  "/books/:bookId",
  getBookId,
  asyncHandler(async (request, response) => {
    const { title, author, price, pages } = request.body;
    if (!isValidBookDetails(request.body)) {
      response.status(400).json({
        error:
          "Provide a non-empty title and author, a non-negative integer price, and a positive integer pages value",
      });
      return;
    }

    // SQL injection is unsafe input changing a query; ? placeholders keep input as data.
    const result = await database.run(
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?",
      [title.trim(), author.trim(), price, pages, request.bookId],
    );
    if (result.changes === 0) {
      response.status(404).json({ error: "Book not found" });
      return;
    }
    response.status(200).json({ message: "Book updated successfully" });
  }),
);

app.delete(
  "/books/:bookId",
  getBookId,
  asyncHandler(async (request, response) => {
    const result = await database.run("DELETE FROM book WHERE id = ?", [
      request.bookId,
    ]);
    if (result.changes === 0) {
      response.status(404).json({ error: "Book not found" });
      return;
    }
    response.status(200).json({ message: "Book deleted successfully" });
  }),
);

app.use((error, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }
  const statusCode =
    Number.isInteger(error.status) && error.status >= 400 && error.status < 500
      ? error.status
      : 500;
  if (statusCode === 500) {
    console.error(error);
  }
  const message =
    statusCode === 400
      ? "Invalid request body"
      : "An internal server error occurred";
  response.status(statusCode).json({ error: message });
});

async function initializeDBAndServer() {
  try {
    database = await sqlite.open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    const port = Number(process.env.PORT) || 3000;
    const server = app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
    server.on("error", (error) => {
      console.error("Could not start the server:", error.message);
      database.close();
      process.exitCode = 1;
    });
  } catch (error) {
    console.error("Could not initialize the database or server:", error.message);
    if (database) {
      await database.close();
    }
    process.exitCode = 1;
  }
}

initializeDBAndServer();
