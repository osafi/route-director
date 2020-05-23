import express, { Request } from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || '8080';
app.use(bodyParser.json());

const routeMap: { [key: string]: string } = {};

app.post('/routes', (request: Request, response) => {
  routeMap[request.body.path] = request.body.target;
  return response.send();
});
app.get('/routes', (_, response) => {
  return response.json(routeMap);
});

app.get('*', (request, response) => {
  const redirect = routeMap[request.url];
  if (!redirect) {
    response.send(`route '${request.url}' not configured`);
  } else {
    response.redirect(307, redirect);
  }
});

app.listen(port, (err) => {
  if (err) return console.error(err);
  return console.log(`Server is listening on ${port}`);
});
