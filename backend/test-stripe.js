import dotenv from 'dotenv';
dotenv.config();
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function test() {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 50000, 
            currency: 'inr',
            automatic_payment_methods: {
                enabled: true,
            },
        });
        console.log("Success! Client Secret:", paymentIntent.client_secret);
    } catch (error) {
        console.error("Stripe Error:", error.message);
    }
}
test();
