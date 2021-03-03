import axios from "axios";
import {
    showAlert
} from './alerts';



export const bookTour = async tourId => {
    const stripe = Stripe('pk_test_h2Fd8UQv9XzyeXZOYM2JDlks');
    try {
        const session = await axios(`http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourId}`);

        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        showAlert('error', err)
    }

};