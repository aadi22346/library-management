# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the Pipfile and Pipfile.lock into the container
COPY Pipfile Pipfile.lock ./

# Install pipenv
RUN pip install pipenv

# Install any needed packages specified in Pipfile.lock
RUN pipenv install --deploy --ignore-pipfile

# Copy the current directory contents into the container at /app
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define environment variable
ENV FLASK_APP=routes.py

# Run the application
CMD ["pipenv", "run", "flask", "run", "--host=0.0.0.0"]