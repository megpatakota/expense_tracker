# expense_tracker

# create a tracker
python manage.py startapp tracker  

# apply migrations
python manage.py makemigrations
python manage.py migrate

# run the django app locally
python manage.py runserver

Recreate the database (this is the simplest approach since you're still in development):
bash
# Delete the existing database
rm db.sqlite3

# Remove any existing migrations
rm -rf tracker/migrations/00*