# 📚 Library Management System (Python + MySQL)

A **menu-driven Library Management System** built using **Python** and **MySQL**, designed to manage books, users, borrowing, returns, and fines efficiently. This project is ideal for **college DBMS / Python mini-projects** and beginner-to-intermediate backend practice.

---

## 🚀 Features

### 📖 Book Management

* Add new books
* View all books
* View available books
* Update book details
* Search books by title, author, or genre
* Delete books

### 👤 User Management

* Register users (members/admins)
* View all registered users

### 🔄 Borrow & Return System

* Borrow books with availability checks
* Return books
* Automatic fine calculation for late returns
* Track borrowing history

### ⏰ Overdue Tracking

* View overdue books
* Display fines for overdue returns

---

## 🛠️ Technologies Used

* **Python 3**
* **MySQL**
* **mysql-connector-python**
* **Datetime module**

---

## 🗂️ Database Structure

### `books` Table

| Column             | Description           |
| ------------------ | --------------------- |
| id                 | Book ID (Primary Key) |
| title              | Book title            |
| author             | Author name           |
| isbn               | Unique ISBN           |
| genre              | Book genre            |
| quantity           | Total copies          |
| available_quantity | Available copies      |

### `users` Table

| Column  | Description           |
| ------- | --------------------- |
| id      | User ID (Primary Key) |
| name    | User name             |
| address | Address               |
| contact | Contact number        |
| role    | member / admin        |

### `borrowings` Table

| Column      | Description         |
| ----------- | ------------------- |
| id          | Borrowing ID        |
| user_id     | Foreign Key (users) |
| book_id     | Foreign Key (books) |
| issue_date  | Issue date          |
| return_date | Return date         |
| fine        | Fine amount         |

---

## 📁 Project Structure

```
library-management-system/
│
├── main.py          # Main Python file (entry point)
├── README.md        # Project documentation
```

---

## ▶️ How to Run the Project

### 1️⃣ Prerequisites

* Python 3 installed
* MySQL installed and running
* MySQL database named **`library`**

### 2️⃣ Install Required Package

```bash
pip install mysql-connector-python
```

### 3️⃣ Configure Database

Update the credentials in `main.py` if needed:

```python
host='localhost'
user='root'
password='1234'
database='library'
```

### 4️⃣ Run the Program

```bash
python main.py
```

---

## 📋 Menu Options

```
1. Add a new book
2. View all books
3. View available books
4. Update book details
5. Search books
6. Delete a book
7. Register a new user
8. View all users
9. Borrow a book
10. Return a book
11. View overdue books and fines
12. Exit
```

---

## 💰 Fine Policy

* Loan period: **14 days**
* Fine: **1 unit per day after due date**

---

## 🔐 Notes

* ISBN is unique for each book
* User IDs and Book IDs are auto-generated
* One active borrowing per user per book
* Tables are automatically created if they don’t exist

---

## 🎓 Use Case

* College Mini Project
* DBMS Project
* Python + MySQL Practice
* Console-based Management System

---

## 📌 Future Enhancements

* Login system (Admin/User)
* GUI (Tkinter / Web App)
* Password authentication
* Reports & analytics
* Backup & restore system

---

## 👨‍💻 Author

**[BAIRABOINA LOKESH KUMAR YADAV](https://github.com/BairaboinaLokeshKumarYadav/)**

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and feel free to fork and improve it!

