# expense_tracker

# create a tracker
python manage.py startapp tracker  

# Remove any existing migrations
rm tracker/migrations/0*.py    
rm -rf tracker/migrations/00*

# Delete the existing database
rm db.sqlite3

# apply migrations
python manage.py makemigrations
python manage.py migrate

# run the django app locally
python manage.py runserver


rm tracker/migrations/0*.py    
rm -rf tracker/migrations/00*
rm db.sqlite3
python manage.py makemigrations
python manage.py migrate
python manage.py runserver