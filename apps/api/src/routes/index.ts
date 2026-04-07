import { Router } from 'express';
import { authRouter } from './auth';
import { groupRouter } from './groups';
import { recipeRouter } from './recipes';
import { usersRouter } from './users';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/groups', groupRouter);
apiRouter.use('/recipes', recipeRouter);
