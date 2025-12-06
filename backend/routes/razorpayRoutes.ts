import express, { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();


router.post('/order', async (req: Request, res: Response) => {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID as string,
            key_secret: process.env.RAZORPAY_KEY_SECRET as string,
        });

        const { amount } = req.body; // amount in INR (whole rupees)

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.status(201).json(order);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/verify', (req: Request, res: Response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        res.status(200).json({ verified: true });
    } else {
        res.status(400).json({ verified: false, message: 'Payment verification failed' });
    }
});

router.get('/key', (req: Request, res: Response) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
});

export default router;
