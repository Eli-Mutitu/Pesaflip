This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Authentication API

The project includes an authentication system with the following endpoints:

### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "phone_number": "+254712345678",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password",
  "business_name": "Acme Business",
  "business_type": "Retail"
}
```

### Login with existing account
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone_number": "+254712345678",
  "password": "secure_password"
}
```

### Get current user profile (protected)
```http
GET /api/auth/me
Authorization: Bearer your_jwt_token
```

All authentication endpoints return a JWT token that should be included in the `Authorization` header for protected routes.

## Oracle Database Configuration

The authentication system uses Oracle19c for data storage. To configure the database connection, set up the following environment variables:

```
DB_USER=your_oracle_username
DB_PASSWORD=your_oracle_password
DB_HOST=your_oracle_host
DB_PORT=1521
DB_SERVICE=your_oracle_service_name
ORACLE_CLIENT_PATH=/path/to/oracle/client/lib

JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=7d
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
