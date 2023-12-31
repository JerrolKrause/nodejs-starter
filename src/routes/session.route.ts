import { IUser, User } from '$models';
import { compare, hash } from 'bcryptjs';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { sign } from 'jsonwebtoken';
import { environment } from '../app';

export interface Session {
  username: string;
  password: string;
}

const routes = Router();

/** Create User */
routes.post(
  '/session/signup',
  // Validation
  body('email')
    .trim()
    .isEmail()
    .notEmpty()
    .escape()
    .custom(value => User.findOne({ email: value }).then(user => (user ? Promise.reject('Email address already exists') : Promise.resolve())))
    .normalizeEmail(),
  body('password').trim().escape().isLength({ min: 6 }).notEmpty().escape(),
  (req, res, next) => {
    // Check errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Has pwd
    return hash(req.body.password, 12)
      .then(hashedPwd => {
        const userNew: IUser = {
          email: req.body.email,
          password: hashedPwd,
          role: 'user',
          // todos: [],
        };

        // Create new user
        const newUser = new User(userNew);
        // Save new user, return userId
        return newUser
          .save()
          .then(savedUser => res.status(201).json({ _id: savedUser._id }))
          .catch(err => next(err));
      })
      .catch(err => next(err));
  },
);

/** Log in */
routes.post('/session/login', (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser: IUser | null;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        res.status(401).json({ errors: 'That username and password combination does not exist' });
        return;
      }
      loadedUser = user;
      return compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        return res.status(401).json({ errors: 'That username and password combination does not exist' });
      }
      if (!environment.tokenSecret) {
        return res.status(500).json({ errors: 'Token management configured wrong' });
      }
      const token = sign({ email, id: loadedUser?._id?.toString() }, environment.tokenSecret, { expiresIn: '1h' });
      return res.status(200).json({ token, userId: loadedUser?._id });
    })
    .catch(err => next(err));
});

routes.post('/session/refresh', (req, res) => {});

routes.post('/session/logout', (req, res) => {});

export const sessionRoute = routes;
