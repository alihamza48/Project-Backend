const HttpError = require("../models/http-error");
const uuid = require("uuid");
const { validationResult } = require("express-validator");
const User = require("../models/user-schema");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Ali Hamza",
    email: "test@test.com",
    password: "tester",
  },
];

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (error) {
    return next(new HttpError("Could not Get any Users", 500));
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs, check your inputs", 422));
  }

  const { name, email, password, places } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError("Signing Up failed, try again", 500));
  }
  if (existingUser) {
    return next(new HttpError("User already exists", 422));
  }

  const createdUser = new User({
    name,
    email,
    image:
      "https://images.pexels.com/photos/257499/pexels-photo-257499.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    password,
    places,
  });

  try {
    await createdUser.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError("User Sign Up failed, Try again.", 500));
  }

  res.status(201).json({ users: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError("E-mail doesnt exists, try again", 500));
  }

  if (!existingUser || existingUser.password !== password) {
    return next(new HttpError("Entered credentials are not correct", 401));
  }
  res.json({
    message: "LOGGED IN!!",
    user: existingUser.toObject({ getters: true }),
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
