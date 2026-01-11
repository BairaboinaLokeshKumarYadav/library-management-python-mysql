# Import necessary modules
import mysql.connector  
import datetime 

# Connect to the MySQL database
# The database 'library' should exist; if not, create it manually or add code to create it.
connection = mysql.connector.connect(
    host='localhost', # host name of MySQL
    user='your_username', # user name of MySQL
    password='your_password', # MySQL password
    database='library' # database name 
)
cursor = connection.cursor()

# Create tables if they don't exist
# Books table: stores book details
cursor.execute('''
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    genre VARCHAR(100),
    quantity INT NOT NULL,
    available_quantity INT NOT NULL
)
''')

# Users table: stores user/member details with auto-increment ID
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact VARCHAR(20),
    role VARCHAR(20) DEFAULT 'member'  -- Default role is 'member', can be 'admin'
)
''')

# Borrowings table: tracks borrowing transactions
cursor.execute('''
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
''')

# Commit the table creations
connection.commit()

# Main program loop for menu-driven interface
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
        # Add a new book
        book_title = input("\nEnter book title: ")
        book_author = input("Enter book author: ")
        book_isbn = input("Enter book ISBN: ")
        book_genre = input("Enter book genre: ")
        book_quantity = int(input("Enter book quantity: "))
        book_available_quantity = book_quantity  # Initially, all are available
        
        cursor.execute('''
        INSERT INTO books (title, author, isbn, genre, quantity, available_quantity)
        VALUES (%s, %s, %s, %s, %s, %s)
        ''', (book_title, book_author, book_isbn, book_genre, book_quantity, book_available_quantity))
        connection.commit()
        print("\nBook added successfully.")
    
    elif choice == '2':
        # View all books
        cursor.execute('SELECT * FROM books')
        books = cursor.fetchall()
        if books:
            print("\nAll Books:")
            for book in books:
                print("\nID:" ,{book[0]}, 'Title:' ,{book[1]}, 'Author:' ,{book[2]}, 'ISBN:' ,{book[3]}, 'Genre:' ,{book[4]}, 'Quantity:' ,{book[5]}, 'Available:' ,{book[6]})
        else:
            print("\nNo books in the library.")
    
    elif choice == '3':
        # View available books (where available_quantity > 0)
        cursor.execute('SELECT * FROM books WHERE available_quantity > 0')
        books = cursor.fetchall()
        if books:
            print("\nAvailable Books:")
            for book in books:
                print("\nID:" ,{book[0]}, 'Title:' ,{book[1]}, 'Author:' ,{book[2]}, 'ISBN:' ,{book[3]}, 'Genre:' ,{book[4]}, 'Available:' ,{book[6]})
        else:
            print("\nNo available books.")
    
    elif choice == '4':
        # Update book details (e.g., quantity when borrowed/returned)
        book_id = int(input("\nEnter book ID to update: "))
        new_quantity = int(input("Enter new total quantity: "))
        new_available = int(input("Enter new available quantity: "))
        
        cursor.execute('''
        UPDATE books SET quantity = %s, available_quantity = %s WHERE id = %s
        ''', (new_quantity, new_available, book_id))
        connection.commit()
        print("\nBook updated successfully.")
    
    elif choice == '5':
        # Search books by title, author, or keywords
        search_term = input("\nEnter search term (title, author, or keyword): ")
        cursor.execute('''
        SELECT * FROM books WHERE title LIKE %s OR author LIKE %s OR genre LIKE %s
        ''', ('%' + search_term + '%', '%' + search_term + '%', '%' + search_term + '%'))
        books = cursor.fetchall()
        if books:
            print("\nSearch Results:")
            for book in books:
                print("\nID:" ,{book[0]}, "Title:" ,{book[1]}, "Author:" ,{book[2]}, 'ISBN:' ,{book[3]}, 'Genre:' ,{book[4]}, 'Quantity:' ,{book[5]}, 'Available:' ,{book[6]})
        else:
            print("\nNo books found matching the search term.")
    
    elif choice == '6':
        # Delete a book record
        book_id = int(input("\nEnter book ID to delete: "))
        cursor.execute('DELETE FROM books WHERE id = %s', (book_id,))
        connection.commit()
        print("\nBook deleted successfully.")
    
    elif choice == '7':
        # Register a new user (ID is auto-generated)
        user_name = input("\nEnter user name: ")
        user_address = input("Enter user address: ")
        user_contact = input("Enter user contact: ")
        user_role = input("Enter user role (member/admin, default is member): ") or 'member'
        
        cursor.execute('''
        INSERT INTO users (name, address, contact, role)
        VALUES (%s, %s, %s, %s)
        ''', (user_name, user_address, user_contact, user_role))
        connection.commit()
        print("\nUser registered successfully. User ID is auto-generated.")
    
    elif choice == '8':
        # View all users
        cursor.execute('SELECT * FROM users')
        users = cursor.fetchall()
        if users:
            print("\nAll Users:")
            for user in users:
                print("\nID:" ,{user[0]}, "Name:" ,{user[1]}, "Address:" ,{user[2]}, "Contact:" ,{user[3]}, "Role:" ,{user[4]})
        else:
            print("\nNo users registered.")
    
    elif choice == '9':
        # Borrow a book
        user_id = int(input("\nEnter user ID: "))
        book_id = int(input("Enter book ID to borrow: "))
        
        # Check if book is available
        cursor.execute('SELECT available_quantity FROM books WHERE id = %s', (book_id,))
        result = cursor.fetchone()
        if result and result[0] > 0:
            # Decrement available quantity
            cursor.execute('UPDATE books SET available_quantity = available_quantity - 1 WHERE id = %s', (book_id,))
            # Log the borrowing
            issue_date = datetime.date.today()
            cursor.execute('''
            INSERT INTO borrowings (user_id, book_id, issue_date)
            VALUES (%s, %s, %s)
            ''', (user_id, book_id, issue_date))
            connection.commit()
            print("\nBook borrowed successfully.")
        else:
            print("\nBook not available.")
    
    elif choice == '10':
        # Return a book
        user_id = int(input("\nEnter user ID: "))
        book_id = int(input("Enter book ID to return: "))
        
        # Find the borrowing record (assuming one active per user-book)
        cursor.execute('''
        SELECT id, issue_date FROM borrowings WHERE user_id = %s AND book_id = %s AND return_date IS NULL
        ''', (user_id, book_id))
        borrowing = cursor.fetchone()
        if borrowing:
            borrowing_id = borrowing[0]
            issue_date = borrowing[1]  # MySQL returns date as datetime.date
            return_date = datetime.date.today()
            days_overdue = (return_date - issue_date).days - 14  # Assume 14 days loan period
            fine = max(0, days_overdue * 1.0)  # Fine of 1 unit per day overdue
            
            # Update borrowing record
            cursor.execute('''
            UPDATE borrowings SET return_date = %s, fine = %s WHERE id = %s
            ''', (return_date, fine, borrowing_id))
            # Increment available quantity
            cursor.execute('UPDATE books SET available_quantity = available_quantity + 1 WHERE id = %s', (book_id,))
            connection.commit()
            print("\nBook returned. Fine:" ,{fine})
        else:
            print("\nNo active borrowing found for this user and book.")
    
    elif choice == '11':
        # View overdue books and fines
        today = datetime.date.today()
        cursor.execute('''
        SELECT b.id, u.name, bk.title, b.issue_date, b.fine
        FROM borrowings b
        JOIN users u ON b.user_id = u.id
        JOIN books bk ON b.book_id = bk.id
        WHERE b.return_date IS NULL AND DATEDIFF(%s, b.issue_date) > 14
        ''', (today,))
        overdues = cursor.fetchall()
        if overdues:
            print("\nOverdue Books:")
            for overdue in overdues:
                print("Borrowing ID:" ,{overdue[0]}, "User:" ,{overdue[1]}, "Book:" ,{overdue[2]}, "Issue Date:" ,{overdue[3]}, "Fine:" ,{overdue[4]})
        else:
            print("\nNo overdue books.")
    
    elif choice == '12':# Exit the program
        print("\nExiting the system.")
        break
    
    else:
        print("\nInvalid choice. Please try again.")

# Close the database connection
cursor.close()
connection.close()
