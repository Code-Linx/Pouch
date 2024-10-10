import { register } from './register';
import { login } from './login';
import { premiumPayment } from './stripe';

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const paymentBtn = document.getElementById('payment-checkout');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect the form data
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const userName = document.getElementById('userName').value;
    const DOB = document.getElementById('DOB').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    // Call the register function
    await register(
      firstName,
      lastName,
      userName,
      email,
      DOB,
      password,
      passwordConfirm
    );
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect the form data
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Call the Login function
    await login(email, password);
  });
}

if (paymentBtn) {
  paymentBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent default form action if it's inside a form
    e.target.textContent = 'Processing...';

    try {
      await premiumPayment();
    } catch (err) {
      console.log('Payment error:', err);
      e.target.textContent = 'Upgrade to Premium'; // Reset button text in case of error
    }
  });
}
