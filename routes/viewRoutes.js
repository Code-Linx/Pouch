const express = require('express');
const viewcontroller = require('../controllers/viewController');

const router = express.Router();

// Route for the overview page (Publicly accessible)
router.get('/', viewcontroller.getOverview);

// Route for the login page
router.get('/login', viewcontroller.loginForm);

// Route for the signup page
router.get('/signup', viewcontroller.signUpForm);

router.get('/dash', viewcontroller.userDashboard);

router.get('/premium', viewcontroller.renderpage);

module.exports = router;
