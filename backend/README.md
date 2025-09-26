## Project Structure

The project is organized as follows:

```
backend
├── README.md
├── pyproject.toml
├── poetry.lock
├── manage.py
├── config
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── api
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── permissions.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd backend
   ```

2. **Install Poetry:**
   Follow the instructions at [Poetry's official website](https://python-poetry.org/docs/#installation) to install Poetry.

3. **Install dependencies:**
   ```
   poetry install
   ```

4. **Run migrations:**
   ```
   poetry run python manage.py migrate
   ```

5. **Start the development server:**
   ```
   poetry run python manage.py runserver
   ```

## Usage Guidelines

- **Authentication:** Use the `/api/token/` endpoint to obtain a JWT token by providing your email and password.
- **Roles:** The application supports three roles:
  - **PUBLIC:** Access to public endpoints.
  - **USER:** Access to user-specific endpoints.
  - **ADMIN:** Access to admin-specific endpoints.

## Additional Information

- The API is designed to be extensible, allowing you to add more endpoints and functionality as needed.
- For more details on JWT authentication, refer to the [Django REST Framework JWT documentation](https://jpadilla.github.io/django-rest-framework-jwt/).

## License

This project is licensed under the MIT License. See the LICENSE file for more details.