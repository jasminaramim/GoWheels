import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { apiRouter } from '../src/server/routes/api.ts';

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Mount API endpoints
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);
app.use('/v1', apiRouter);
app.use('/', apiRouter);

export default app;
