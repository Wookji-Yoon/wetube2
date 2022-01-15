import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";

  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username or email is already taken",
    });
  }

  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

//로그인 페이지입니다//
export const getLogin = (req, res) => {
  return res.render("login.pug", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const pageTitle = "Login";
  const { username, password } = req.body;
  const user = await User.findOne({ username, githubOnly: false });

  //계정 있는지 확인
  if (!user) {
    return res.status(400).render("login.pug", {
      pageTitle,
      errorMessage: "There is no such an account",
    });
  }
  //PW 확인
  const checkPW = await bcrypt.compare(password, user.password);
  if (!checkPW) {
    return res.status(400).render("login.pug", {
      pageTitle,
      errorMessage: "Wrong Password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseURL = "https://github.com/login/oauth/authorize?";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalURL = baseURL + params;
  return res.redirect(finalURL);
};

export const finishGithubLogin = async (req, res) => {
  //1. code로 token을 받아오는 단계
  const baseURL = "https://github.com/login/oauth/access_token?";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalURL = baseURL + params;
  const data = await fetch(finalURL, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });
  const json = await data.json();

  //2. token으로 user 데이터와 email data 받아오는 단계
  if ("access_token" in json) {
    const { access_token } = json;
    const apiURL = "https://api.github.com";
    const userData = await (
      await fetch(`${apiURL}/user`, {
        headers: { Authorization: `token ${access_token}` },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiURL}/user/emails`, {
        headers: { Authorization: `token ${access_token}` },
      })
    ).json();
    //2-1. 받아온 emaildata에서 email 하나 선택
    const emailOBj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    console.log(email);
    if (!emailOBj) {
      return res.direct("/login");
    }

    //3. 주어진 data 바탕으로 로그인
    //3.1 email이 존재하면(즉, 이미 PW와 함께 우리 사이트에서 계정을 생성한 사람이면) 바로 로그인시켜주고,
    //3.2 email이 없으면 새롭게 만들어서 로그인시켜주는 것임
    let user = await User.findOne({ email: emailOBj.email });
    if (!user) {
      user = await User.create({
        name: userData.name,
        avatarURL: userData.avatar_url,
        username: userData.login,
        email: emailOBj.email,
        password: "",
        githubOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const edit = (req, res) => res.send("Edit User");
export const see = (req, res) => res.send("See User");
