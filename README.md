# JobMatchMini

This project is a Django REST API with a React Native mobile frontend, PostgreSQL, and OpenSearch integration.

## Running Locally with Docker Compose

1. **Update the docker-compose with Amazon Key and secret**
   

2. **Build and start all services:**
   ```sh
   docker-compose up --build
   ```
   This will start:
   - PostgreSQL (port 5432)
   - OpenSearch (port 9200)
   - Django backend (port 8000)

3. **Access the API:**
   - Visit [http://localhost:8000/](http://localhost:8000/) for the Django API.
   - OpenSearch is available at [http://localhost:9200/](http://localhost:9200/)
   - PostgreSQL is available at `localhost:5432` (see `.env` for credentials)
   4. **Create a superuser using Poetry:**
      ```sh
      docker-compose exec web poetry run python manage.py createsuperuser
      ```
4. **Stopping services:**
   ```sh
   docker-compose down
   ```

---

## Running Locally Without Docker (using Poetry)

1. **Install Poetry:**
   ```sh
   pip install poetry
   ```

2. **Install dependencies:**
   ```sh
   cd backend
   poetry install
   ```

3. **Set up environment variables:**
   - Copy or create a `.env` file in the `backend/` directory with your settings.

4. **Start PostgreSQL and OpenSearch:**
   - You can use Docker for just the dependencies:
     ```sh
     docker-compose up postgres opensearch
     ```
   - Or use your own local installations.

5. **Run migrations:**
   ```sh
   poetry run python manage.py migrate
   ```

6. **Create a superuser (optional):**
   ```sh
   poetry run python manage.py createsuperuser
   ```

7. **Run the development server:**
   ```sh
   poetry run python manage.py runserver 0.0.0.0:8000
   ```

8. **Access the API:**
   - Visit [http://localhost:8000/](http://localhost:8000/)
   ## Available APIs


   ### Authentication
   - **POST** `/api/login/`
      - Request:
      ```json
      {
         "email": "user@example.com",
         "password": "string"
      }
      ```
      - Response:
      ```json
      {
         "refresh": "<refresh_token>",
         "access": "<access_token>",
         "user_type": "USER" // or "ADMIN" or "PUBLIC"
      }
      ```
   - **POST** `/api/register/`
      - Request:
      ```json
      {
         "email": "user@example.com",
         "password": "string",
         "first_name": "John",
         "last_name": "Doe",
         "contact_number": "1234567890"
      }
      ```
      - Response: User object (see below)

   ### User
   - **GET** `/api/me/`
      - Get current user details (auth required)
      - Response:
      ```json
      {
         "email": "user@example.com",
         "first_name": "John",
         "last_name": "Doe",
         "contact_number": "1234567890",
         "user_type": "USER"
      }
      ```
   - **PUT** `/api/me/`
      - Update current user profile (auth required)
      - Request:
      ```json
      {
         "first_name": "John",
         "last_name": "Doe",
         "contact_number": "1234567890"
      }
      ```
   - **DELETE** `/api/me/`
      - Delete current user account (auth required)
      - Response: `{ "detail": "User deleted successfully." }`
   - **POST** `/api/change-password/`
      - Change password (auth required)
      - Request:
      ```json
      {
         "current_password": "string",
         "new_password": "string"
      }
      ```
      - Response: `{ "detail": "Password updated successfully." }`

   ### CVs
   - **POST** `/api/me/cvs/upload/`
      - Upload a CV file (auth required, max 2MB)
      - Request: multipart/form-data with `file`
      - Response:
      ```json
      {
         "id": 1,
         "file_url": "https://...",
         "file_name": "resume.pdf",
         "presigned_url": "https://...",
         "uploaded_at": "2025-09-27T12:34:56Z"
      }
      ```
   - **GET** `/api/me/cvs/`
      - List all CVs for current user (auth required)
      - Response: Array of CV objects as above

   ### Jobs
   - **GET** `/api/jobs/`
      - Query params: `search`, `location`, `employment_type`, `tags`
      - Response (paginated):
      ```json
      {
         "count": 1,
         "next": null,
         "previous": null,
         "results": [
            {
               "id": 1,
               "title": "Software Engineer",
               "company": "Acme Corp",
               "description": "...",
               "location": "Remote",
               "tags": ["python", "django"],
               "employment_type": "Full-time",
               "created_at": "2025-09-27T12:34:56Z"
            }
         ]
      }
      ```
   - **POST** `/api/jobs/` (admin only)
      - Request:
      ```json
      {
         "title": "string",
         "company": "string",
         "description": "string",
         "location": "string",
         "tags": ["string", "string"],
         "employment_type": "Full-time"  // or "Contract"
      }
      ```
   - **GET** `/api/jobs/{id}/`
      - Response: Job object as above
   - **PUT** `/api/jobs/{id}/` (admin only)
      - Request: Same as POST
   - **DELETE** `/api/jobs/{id}/` (admin only)

   ### Applications
   - **GET** `/api/applications/`
      - List all job applications for the authenticated user (user role) or all applications (admin).
      - Response: Array of application objects (see below)
   - **POST** `/api/jobs/{job_id}/apply/`
      - Apply to a job (user role only).
      - Request body:
      ```json
      {
         "cv_id": 1,           // (optional) integer, ID of user's CV to attach
         "note": "string"      // (optional) string, note to employer (max 500 chars)
      }
      ```
      - Response:
      ```json
      {
         "id": 1,
         "user": 2,
         "user_email": "user@example.com",
         "user_first_name": "John",
         "user_last_name": "Doe",
         "user_contact_number": "1234567890",
         "job": 3,
         "job_title": "Software Engineer",
         "cv": 1,
         "cv_url": "https://...",
         "cv_presigned_url": "https://...",
         "cv_file_name": "resume.pdf",
         "note": "Looking forward to this opportunity!",
         "applied_at": "2025-09-27T12:34:56Z"
      }
      ```
   - **GET** `/api/applications/{id}/`
      - Retrieve a specific job application (user can only access their own, admin can access all).
   - **DELETE** `/api/applications/{id}/`
      - Delete a job application (user can only delete their own, admin can delete any).


   ### Jobs
   - **GET** `/api/jobs/`
      - Query params: `search`, `location`, `employment_type`, `tags`
   - **POST** `/api/jobs/`
      ```json
      {
         "title": "string",
         "company": "string",
         "description": "string",
         "location": "string",
         "tags": ["string", "string"],
         "employment_type": "Full-time"  // or "Contract"
      }
      ```
   - **GET** `/api/jobs/{id}/`
   - **PUT** `/api/jobs/{id}/`
      ```json
      {
         "title": "string",
         "company": "string",
         "description": "string",
         "location": "string",
         "tags": ["string", "string"],
         "employment_type": "Full-time"  // or "Contract"
      }
      ```
   - **DELETE** `/api/jobs/{id}/`


   ### Applications
   - **POST** `/api/jobs/{job_id}/apply/`
      - Apply to a job (user role only).
      - Request body:
      ```json
      {
         "cv_id": 1,           // (optional) integer, ID of user's CV to attach
         "note": "string"      // (optional) string, note to employer (max 500 chars)
      }
      ```
      - Response:
      ```json
      {
         "id": 1,
         "user": 2,
         "user_email": "user@example.com",
         "user_first_name": "John",
         "user_last_name": "Doe",
         "user_contact_number": "1234567890",
         "job": 3,
         "job_title": "Software Engineer",
         "cv": 1,
         "cv_url": "https://...",
         "cv_presigned_url": "https://...",
         "cv_file_name": "resume.pdf",
         "note": "Looking forward to this opportunity!",
         "applied_at": "2025-09-27T12:34:56Z"
      }
      ```
   - **GET** `/api/jobs/{id}/applicants`
      - Retrieve a specific job application (user can only access their own, admin can access all).
   

---

## Mobile App

- The mobile app is in the `mobile/` directory and can be run with Expo.
- See the `mobile/README.md` for setup instructions.

---

## Notes
- Make sure your `.env` variables match your local or Docker Compose setup.
- For production, use strong secrets and secure your environment variables.
- For OpenSearch, you may need to adjust credentials and security settings for local use.

---

## Troubleshooting
- If you encounter database or OpenSearch connection errors, check that the services are running and the environment variables are correct.
- For Docker Compose, use `docker-compose logs` to view service logs.
