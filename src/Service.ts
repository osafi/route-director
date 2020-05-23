import bodyParser from 'body-parser';
import express, { Request } from 'express';
import basicAuth from 'express-basic-auth';

export const makeApp = (
  adminUser: string,
  adminPassword: string,
  routeMap: Map<string, string> = new Map(),
): express.Express => {
  const app = express();

  app.use(bodyParser.json());

  const auth = basicAuth({
    users: { [adminUser]: adminPassword },
  });

  app.post('/routes', auth, (request: Request, response) => {
    const path = request.body?.path;
    const target = request.body?.target;

    if (!path || !target) {
      response
        .status(400)
        .send("expecting object with 'path' and 'target' keys");
    } else {
      routeMap.set(request.body.path, request.body.target);
      response.status(200).send();
    }
  });

  app.get('/routes', (_, response) => {
    return response.json(Object.fromEntries(routeMap));
  });

  app.get('*', (request, response) => {
    const redirect = routeMap.get(request.url);
    if (!redirect) {
      response.status(400).send(`route '${request.url}' not configured`);
    } else {
      response.redirect(307, redirect);
    }
  });

  return app;
};
