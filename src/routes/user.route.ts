import { IUser, User } from '$models';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';

const routes = Router();

routes.get('/user', (_req, res) => {
  return User;
});

/**
 * @route POST /create-user
 * @param {IUser} req.body - The User model
 */
routes.post(
  '/user',

  body('email').trim().isEmail().notEmpty().escape(),
  body('password').trim().isLength({ min: 6 }).notEmpty().escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const userParams: IUser = {
      email: req.body.email,
      password: req.body.password,
      role: 'user',
      // todos: [],
    };

    const newUser = new User(userParams);

    newUser
      .save()
      .then(savedUser => res.status(201).json({ message: 'User created', id: savedUser._id }))
      .catch(err => next(err));
  },
);

export const userRoute = routes;
