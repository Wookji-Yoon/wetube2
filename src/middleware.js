export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {};
  next();
};

export const privateOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return res.direct("/login");
  } else {
    next();
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return res.redirect("/");
  } else {
    next();
  }
};
