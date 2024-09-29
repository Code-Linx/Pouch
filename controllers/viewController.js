exports.getOverview = (req, res) => {
  res.render('overview', { title: 'Overview' });
};

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.signUpForm = (req, res) => {
  res.render('signup', { title: 'Signup' });
};

exports.userDashboard = (req, res) => {
  res.render('dash', { title: 'Dashboard' });
};

exports.renderpage = (req, res) => {
  try {
    res.status(200).render('premium', {
      title: 'Subscribe to Premium',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};
