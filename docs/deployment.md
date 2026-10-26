# GoWheels Deployment & Operations Guide

## Environment Variables
See `.env.example` for reference:
- `PORT`: Server listening port (default: 3000)
- `NODE_ENV`: 'development' or 'production'
- `MONGODB_URI`: MongoDB connection string (e.g. MongoDB Atlas cluster)
- `JWT_SECRET`: Secret key for signing session tokens
- `FRONTEND_URL`: URL of the frontend for CORS in multi-origin setups

## Running Locally / Development
```bash
npm install
npm run dev
```
Dev server starts on `http://localhost:3000` with hot full-stack integration.

## Database Seeding
To populate MongoDB Atlas with initial fleet and admin accounts:
```bash
npm run seed
```

## Production Build & Run
```bash
npm run build
npm start
```

## Default Accounts
- **Admin**: `admin@gowheels.com` / `Admin@12345`
- **Customer**: `customer@gowheels.com` / `Customer@12345`
