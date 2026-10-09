from __future__ import annotations

import datetime
import os
from typing import Iterable, Sequence

try:
    import mysql.connector
    from mysql.connector import Error as MySQLConnectorError
except ModuleNotFoundError:  # pragma: no cover - dependency is optional at import time
    mysql = None
    MySQLConnectorError = RuntimeError


DB_CONFIG = {
    "host": os.getenv("LIBRARY_DB_HOST", "localhost"),
    "user": os.getenv("LIBRARY_DB_USER", "root"),
    "password": os.getenv("LIBRARY_DB_PASSWORD", ""),
    "database": os.getenv("LIBRARY_DB_NAME", "library"),
}


def create_database_if_missing() -> None:
    """Create the configured database if it does not exist."""
    if mysql is None:
        raise RuntimeError("mysql-connector-python is not installed. Run: pip install -r requirements.txt")

    root_config = DB_CONFIG.copy()
    root_config.pop("database", None)
    root_connection = mysql.connector.connect(**root_config)
    try:
        with root_connection.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{DB_CONFIG['database']}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        root_connection.commit()
    finally:
        root_connection.close()


def get_connection():
    """Create and return a database connection for the configured library schema."""
    if mysql is None:
        raise RuntimeError("mysql-connector-python is not installed. Run: pip install -r requirements.txt")

    create_database_if_missing()
    return mysql.connector.connect(**DB_CONFIG)


def initialize_database(connection) -> None:
    """Create the schema used by the library application."""
    with connection.cursor() as cursor:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS books (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                isbn VARCHAR(20) UNIQUE NOT NULL,
                genre VARCHAR(100),
                quantity INT NOT NULL,
                available_quantity INT NOT NULL
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                address TEXT,
                contact VARCHAR(20),
                role VARCHAR(20) DEFAULT 'member'
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS borrowings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                book_id INT NOT NULL,
                issue_date DATE NOT NULL,
                return_date DATE,
                fine DECIMAL(10, 2) DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (book_id) REFERENCES books (id)
            )
            """
        )
    connection.commit()


def print_book_row(book: Sequence[object]) -> None:
    print(
        "ID: {0}, Title: {1}, Author: {2}, ISBN: {3}, Genre: {4}, "
        "Quantity: {5}, Available: {6}".format(*book)
    )


def print_user_row(user: Sequence[object]) -> None:
    print(
        "ID: {0}, Name: {1}, Address: {2}, Contact: {3}, Role: {4}".format(*user)
    )


def print_overdue_row(overdue: Sequence[object]) -> None:
    print(
        "Borrowing ID: {0}, User: {1}, Book: {2}, Issue Date: {3}, Fine: {4}".format(
            *overdue
        )
    )


def register_book(connection) -> None:
    title = input("\nEnter book title: ")
    author = input("Enter book author: ")
    isbn = input("Enter book ISBN: ")
    genre = input("Enter book genre: ")
    quantity = int(input("Enter book quantity: "))

    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO books (title, author, isbn, genre, quantity, available_quantity)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (title, author, isbn, genre, quantity, quantity),
        )
    connection.commit()
    print("\nBook added successfully.")


def view_books(connection, *, only_available: bool = False) -> None:
    with connection.cursor() as cursor:
        if only_available:
            cursor.execute("SELECT * FROM books WHERE available_quantity > 0")
        else:
            cursor.execute("SELECT * FROM books")
        books = cursor.fetchall()

    if not books:
        print("\nNo books in the library." if not only_available else "\nNo available books.")
        return

    print("\nAll Books:" if not only_available else "\nAvailable Books:")
    for book in books:
        print_book_row(book)


def update_book(connection) -> None:
    book_id = int(input("\nEnter book ID to update: "))
    new_quantity = int(input("Enter new total quantity: "))
    new_available = int(input("Enter new available quantity: "))

    with connection.cursor() as cursor:
        cursor.execute(
            "UPDATE books SET quantity = %s, available_quantity = %s WHERE id = %s",
            (new_quantity, new_available, book_id),
        )
    connection.commit()
    print("\nBook updated successfully.")


def search_books(connection) -> None:
    search_term = input("\nEnter search term (title, author, or keyword): ")
    like_term = f"%{search_term}%"

    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT * FROM books WHERE title LIKE %s OR author LIKE %s OR genre LIKE %s",
            (like_term, like_term, like_term),
        )
        books = cursor.fetchall()

    if not books:
        print("\nNo books found matching the search term.")
        return

    print("\nSearch Results:")
    for book in books:
        print_book_row(book)


def delete_book(connection) -> None:
    book_id = int(input("\nEnter book ID to delete: "))
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM books WHERE id = %s", (book_id,))
    connection.commit()
    print("\nBook deleted successfully.")


def register_user(connection) -> None:
    name = input("\nEnter user name: ")
    address = input("Enter user address: ")
    contact = input("Enter user contact: ")
    role = input("Enter user role (member/admin, default is member): ") or "member"

    with connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO users (name, address, contact, role) VALUES (%s, %s, %s, %s)",
            (name, address, contact, role),
        )
    connection.commit()
    print("\nUser registered successfully. User ID is auto-generated.")


def view_users(connection) -> None:
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()

    if not users:
        print("\nNo users registered.")
        return

    print("\nAll Users:")
    for user in users:
        print_user_row(user)


def borrow_book(connection) -> None:
    user_id = int(input("\nEnter user ID: "))
    book_id = int(input("Enter book ID to borrow: "))

    with connection.cursor() as cursor:
        cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        if not cursor.fetchone():
            print("\nUser not found.")
            return

        cursor.execute("SELECT available_quantity FROM books WHERE id = %s", (book_id,))
        result = cursor.fetchone()
        if not result:
            print("\nBook not found.")
            return
        if result[0] <= 0:
            print("\nBook not available.")
            return

        cursor.execute(
            "SELECT id FROM borrowings WHERE user_id = %s AND book_id = %s AND return_date IS NULL",
            (user_id, book_id),
        )
        if cursor.fetchone():
            print("\nThis user already has an active borrowing for this book.")
            return

        cursor.execute(
            "UPDATE books SET available_quantity = available_quantity - 1 WHERE id = %s",
            (book_id,),
        )
        cursor.execute(
            "INSERT INTO borrowings (user_id, book_id, issue_date) VALUES (%s, %s, %s)",
            (user_id, book_id, datetime.date.today()),
        )
    connection.commit()
    print("\nBook borrowed successfully.")


def return_book(connection) -> None:
    user_id = int(input("\nEnter user ID: "))
    book_id = int(input("Enter book ID to return: "))

    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT id, issue_date FROM borrowings WHERE user_id = %s AND book_id = %s AND return_date IS NULL",
            (user_id, book_id),
        )
        borrowing = cursor.fetchone()
        if not borrowing:
            print("\nNo active borrowing found for this user and book.")
            return

        borrowing_id, issue_date = borrowing
        return_date = datetime.date.today()
        days_overdue = (return_date - issue_date).days - 14
        fine = max(0.0, days_overdue * 1.0)

        cursor.execute(
            "UPDATE borrowings SET return_date = %s, fine = %s WHERE id = %s",
            (return_date, fine, borrowing_id),
        )
        cursor.execute(
            "UPDATE books SET available_quantity = available_quantity + 1 WHERE id = %s",
            (book_id,),
        )
    connection.commit()
    print(f"\nBook returned. Fine: {fine}")


def view_overdue_books(connection) -> None:
    today = datetime.date.today()
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT b.id, u.name, bk.title, b.issue_date, b.fine
            FROM borrowings b
            JOIN users u ON b.user_id = u.id
            JOIN books bk ON b.book_id = bk.id
            WHERE b.return_date IS NULL AND DATEDIFF(%s, b.issue_date) > 14
            """,
            (today,),
        )
        overdues = cursor.fetchall()

    if not overdues:
        print("\nNo overdue books.")
        return

    print("\nOverdue Books:")
    for overdue in overdues:
        print_overdue_row(overdue)


def run_application() -> None:
    try:
        connection = get_connection()
        initialize_database(connection)
    except (MySQLConnectorError, RuntimeError) as exc:
        print(f"\nUnable to connect to the database: {exc}")
        return

    try:
        while True:
            print("\n-------Library Management System-------")
            print("\n1. Add a new book")
            print("2. View all books")
            print("3. View available books")
            print("4. Update book details")
            print("5. Search books")
            print("6. Delete a book")
            print("7. Register a new user")
            print("8. View all users")
            print("9. Borrow a book")
            print("10. Return a book")
            print("11. View overdue books and fines")
            print("12. Exit")

            choice = input("\nEnter your choice (1-12): ")

            if choice == '1':
                register_book(connection)
            elif choice == '2':
                view_books(connection)
            elif choice == '3':
                view_books(connection, only_available=True)
            elif choice == '4':
                update_book(connection)
            elif choice == '5':
                search_books(connection)
            elif choice == '6':
                delete_book(connection)
            elif choice == '7':
                register_user(connection)
            elif choice == '8':
                view_users(connection)
            elif choice == '9':
                borrow_book(connection)
            elif choice == '10':
                return_book(connection)
            elif choice == '11':
                view_overdue_books(connection)
            elif choice == '12':
                print("\nExiting the system.")
                break
            else:
                print("\nInvalid choice. Please try again.")
    finally:
        connection.close()


if __name__ == "__main__":
    run_application()

