import getpass
import hashlib

# User database (you should replace this with a database or more secure storage)
user_db = {}

def create_account():
    username = input("Enter your username: ")
    password = getpass.getpass("Enter your password: ")
    
    # Hash the password before storing it (use a strong hashing algorithm in practice)
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    # Store the username and hashed password in the database
    user_db[username] = hashed_password
    print("Account created successfully.")

def login():
    username = input("Enter your username: ")
    password = getpass.getpass("Enter your password: ")
    
    # Retrieve the hashed password from the database
    stored_password = user_db.get(username)
    
    if stored_password:
        # Verify the password by hashing the input and comparing it with the stored hash
        input_hashed_password = hashlib.sha256(password.encode()).hexdigest()
        if input_hashed_password == stored_password:
            print("Login successful.")
        else:
            print("Login failed. Incorrect password.")
    else:
        print("Login failed. User not found.")

def main():
    while True:
        print("\nOptions:")
        print("1. Create an account")
        print("2. Login")
        print("3. Exit")
        choice = input("Enter your choice: ")
        
        if choice == '1':
            create_account()
        elif choice == '2':
            login()
        elif choice == '3':
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
