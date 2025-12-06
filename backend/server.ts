import express from 'express';
import { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db';
import { errorHandler, notFound } from './middlewares/errorMiddleware';

// Routes
import roomRoutes from './routes/roomRoutes';
import userRoutes from './routes/userRoutes';
import bookingRoutes from './routes/bookingRoutes';
import uploadRoutes from './routes/uploadRoutes';
import razorpayRoutes from './routes/razorpayRoutes';

const app: Application = express();

dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api", (req: Request, res: Response)  => {
    res.status(201).json({ message: "Welcome to Hotel Booking App" });
})

app.use("/api/rooms", roomRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/payment/razorpay", razorpayRoutes);

app.use(errorHandler);
app.use(notFound);

const PORT = process.env.PORT || 5000;

app.listen(PORT, (): void => console.log(`Server is running on PORT ${PORT}`));
