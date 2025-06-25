# UCampus Authentication API

## Setup Instructions (with Laravel Sail)

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd ucampus
   ```

2. **Copy and configure environment file:**
   ```bash
   cp .env.example .env
   # Edit .env as needed (DB, mail, etc.)
   ```

3. **Install Sail (if not already installed):**
   ```bash
   composer require laravel/sail --dev
   php artisan sail:install
   ```

4. **Start Sail containers:**
   ```bash
   ./vendor/bin/sail up -d
   ```

5. **Install PHP dependencies (inside Sail):**
   ```bash
   ./vendor/bin/sail composer install
   ```

6. **Install Node dependencies (inside Sail):**
   ```bash
   ./vendor/bin/sail npm install
   # or
   ./vendor/bin/sail yarn install
   ```

7. **Generate application key:**
   ```bash
   ./vendor/bin/sail artisan key:generate
   ```

8. **Run migrations:**
   ```bash
   ./vendor/bin/sail artisan migrate
   ```

9. **(Optional) Seed the database:**
   ```bash
   ./vendor/bin/sail artisan db:seed
   ```

10. **Access the application:**
    - By default, your app will be available at [http://localhost](http://localhost)

---

## Frontend Setup (React + TypeScript)

The frontend is built with React, TypeScript, TanStack Query, and Redux Toolkit.

### Key Features:
- **TanStack Query (React Query)**: For server state management and caching
- **Redux Toolkit**: For client state management
- **TypeScript**: For type safety
- **Axios**: For HTTP requests with interceptors
- **Tailwind CSS**: For styling

### Project Structure:
```
resources/ts/
├── api/
│   ├── client.ts          # Axios client with interceptors
│   └── auth.ts            # Authentication API functions
├── components/            # Reusable React components
├── hooks/
│   └── useAuth.ts         # Custom authentication hook
├── pages/                 # Page components
├── store/
│   ├── index.ts           # Redux store configuration
│   └── authSlice.ts       # Authentication Redux slice
├── types/
│   └── auth.ts            # TypeScript interfaces
├── utilities/             # Utility functions
├── App.tsx                # Main App component
└── index.tsx              # Entry point with providers
```

### Development:
```bash
# Start development server
./vendor/bin/sail npm run dev

# Build for production
./vendor/bin/sail npm run build

# Type checking
./vendor/bin/sail npm run types

# Linting
./vendor/bin/sail npm run lint
```

### Usage Examples:

**Using the useAuth hook:**
```typescript
import { useAuth } from './hooks/useAuth';

function LoginForm() {
  const { login, isLoading, loginError } = useAuth();
  
  const handleSubmit = (credentials) => {
    login(credentials);
  };
  
  return (
    // Your form JSX
  );
}
```

**Using Redux store:**
```typescript
import { useSelector, useDispatch } from 'react-redux';
import { login } from './store/authSlice';

function Component() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  // Use dispatch(login(credentials)) for login
}
```

---

## How to Use `auth_api.http` for Authentication API Testing

You do **not** need to write or edit any authentication routes yourself. All necessary routes are already set up in the project.

To test the authentication API, use the provided `auth_api.http` file (or similar) with a tool like the [VS Code REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) or [JetBrains HTTP Client](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html):

1. **Open `auth_api.http` in your editor.**
2. **Run the desired request** by clicking the "Send Request" link above each HTTP block.
3. **Extract tokens automatically:**
   - The file is set up to extract the token from the login/register response and use it in subsequent requests (e.g., for profile or logout).
   - Make sure to run the login or register request first, then run the profile or logout request.
4. **Modify request bodies as needed** to test different users or credentials.
5. **Check responses** for success messages, tokens, and user data.

**Example workflow:**
- Register a user → Login with that user → Use the returned token to get the profile or logout.

**Tip:**
- If you get a "No value is resolved for given JSONPath" error, ensure you are referencing the correct variable (e.g., `{{login.response.body.data.token}}`) and that you have run the login request first.

---

## Authentication API Usage

### 1. Register
- **Endpoint:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "dob": "1990-01-01",
    "location": "New York",
    "phone": "1234567890"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Registration successful",
    "data": {
      "user": { /* user fields */ },
      "token": "<API_TOKEN>"
    }
  }
  ```

### 2. Login
- **Endpoint:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "login": "johndoe", // or email or phone
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "data": {
      "user": { /* user fields */ },
      "token": "<API_TOKEN>"
    }
  }
  ```

### 3. Logout
- **Endpoint:** `POST /api/auth/logout`
- **Headers:**
  - `Authorization: Bearer <API_TOKEN>`
- **Response:**
  ```json
  {
    "message": "Logged out successfully",
    "data": null
  }
  ```

### 4. Get Profile
- **Endpoint:** `GET /api/auth/profile`
- **Headers:**
  - `Authorization: Bearer <API_TOKEN>`
- **Response:**
  ```json
  {
    "message": "Profile retrieved successfully",
    "data": { /* user fields */ }
  }
  ```

---

## Notes
- All endpoints return JSON.
- Use the token from the login/register response as a Bearer token for authenticated requests.
- You can use tools like Postman, Insomnia, or VS Code REST Client to test the API.
- For Google login, see the `/api/auth/login/google` endpoint (implementation may require additional setup).

---

## Troubleshooting
- If you get a 401 Unauthorized, ensure you are sending the correct Bearer token.
- If migrations fail, check your database configuration in `.env`.
- If you need to run any Artisan, Composer, or npm/yarn command, prefix it with `./vendor/bin/sail`.

---

## License
MIT

## Telegram Bot Git Notifier Addded

- when you commit and pushed, telegram bot will send message in the group
- we can track who is making commit right now
- new update has come