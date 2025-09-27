# Use official Python image as base
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y build-essential libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install --upgrade pip && pip install poetry

# Copy only requirements to cache dependencies
COPY pyproject.toml poetry.lock ./

# Install Python dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --only main


# Copy project files
COPY . .

# Remove .env file (environment variables will be set in ECS)
RUN rm -f .env

# Collect static files
RUN python manage.py collectstatic --noinput
# Expose port (default Django port, change if needed)
EXPOSE 8000

# Start server using startup.sh
CMD ["/bin/sh", "startup.sh"]
