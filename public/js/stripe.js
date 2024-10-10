import axios from 'axios';
import { showAlert } from './alert';
import Stripe from 'stripe';

const stripe = Stripe(
  'pk_test_51PuI0TKBObsdGKbmE4fXdrPfn20y0oE534WOQjY8hva4z6c0ESRYxaC07qcmQ5ac8ihf5FxmhUmOxjooFXso1va5005GKkubml'
);

export const premiumPayment = async () => {
  try {
    // Make the request to get the Stripe session
    const session = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/create-checkout-session',
    });

    console.log('Session:', session); // Ensure session data is being received

    // Redirect the user to the Stripe Checkout page
    await stripe.redirectToCheckout({
      sessionId: session.data.sessionId, // Ensure correct session id is being passed
    });
  } catch (err) {
    console.error(err);
    showAlert('error', err.response.data.message); // Display the error using your alert function
  }
};
