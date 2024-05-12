import bcrypt
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['laboratory']
collection = db['User']

# Sample user data
username = 'wick'
password = 'admin'

# Hash the password
hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

# Check if the user already exists
existing_user = collection.find_one({'username': username})

if existing_user:
    print('User already exists')
else:
    # Insert the new user into the database
    user_data = {'username': username, 'password': hashed_password}
    collection.insert_one(user_data)
    print('User added successfully')
