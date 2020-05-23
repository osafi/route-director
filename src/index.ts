import { makeApp } from './Service';

const port = process.env.PORT || '8080';
const app = makeApp('user', 'password');

app.listen(port, (err) => {
  if (err) return console.error(err);
  return console.log(`Server is listening on ${port}`);
});
