export function requireLogin(req, res, next) {
  if (!req.session.user) {
    req.session.error = 'Please login first.';
    return res.redirect('/login');
  }
  next();
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      req.session.error = 'You are not allowed to access that page.';
      return res.redirect('/login');
    }
    next();
  };
}
