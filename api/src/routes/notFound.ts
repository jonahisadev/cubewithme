import { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404);

  const err = `The resource '${req.method} ${req.path}' could not be found`;

  if (req.accepts('json')) {
    res.json({
      ok: false,
      reason: err
    });
    return;
  }

  res.send(err);

  next();
}
