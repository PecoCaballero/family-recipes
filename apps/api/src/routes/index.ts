import { Router } from 'express';
import { groupRouter } from './groups';
import { recipeRouter } from './recipes';
import { usersRouter } from './users';
import { invitationRouter } from './invitations';

export const apiRouter = Router();

apiRouter.use('/users', usersRouter);
apiRouter.use('/groups', groupRouter);
apiRouter.use('/groups/:id/invitations', invitationRouter);
apiRouter.use('/recipes', recipeRouter);
