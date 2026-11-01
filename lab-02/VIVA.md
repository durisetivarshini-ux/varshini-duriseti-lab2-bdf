# Lab 2 Viva Questions and Answers

1. **What is SQLite?**  
   SQLite is a small database that stores data in a file.

2. **What is a database?**  
   A database is an organized place to store and find data.

3. **What is a table?**  
   A table stores related data in rows and columns.

4. **What is CRUD?**  
   CRUD means Create, Read, Update, and Delete.

5. **What is the purpose of SQLite?**  
   SQLite stores and manages data without needing a separate database server.

6. **What is the purpose of sqlite3?**  
   The `sqlite3` package lets Node.js use the SQLite database driver.

7. **What is Express.js?**  
   Express.js helps create a web server and define HTTP routes.

8. **What is nodemon?**  
   Nodemon restarts the server when source files change during development.

9. **What is a primary key?**  
   A primary key uniquely identifies each row in a table.

10. **What is SQL injection?**  
    SQL injection is an attack where unsafe input changes the meaning of a database query.

11. **How do placeholders prevent SQL injection?**  
    Placeholders keep user values separate from SQL, so input is treated as data.

12. **Why do we use await for database calls?**  
    `await` waits for a database operation to finish before continuing.

13. **What is initializeDBAndServer()?**  
    It connects to the database and starts the server only after the connection succeeds.

14. **What is GET?**  
    GET requests data from the server.

15. **What is POST?**  
    POST sends data to create a new record.

16. **What is PUT?**  
    PUT updates an existing record.

17. **What is DELETE?**  
    DELETE removes an existing record.

18. **What is the difference between PUT and POST?**  
    POST creates a record; PUT updates a record that already exists.

19. **What is HTTP status code 200?**  
    It means the request succeeded.

20. **What is HTTP status code 201?**  
    It means a new resource was created successfully.

21. **What is HTTP status code 404?**  
    It means the requested resource was not found.

22. **Why do we use SQLite CLI?**  
    We use it to create, inspect, and verify the database with SQL commands.

23. **How do we check whether a book was deleted?**  
    Run a SELECT query for its ID or request that book; it should no longer appear and the API returns 404.
