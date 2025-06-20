import express, { Request, RequestHandler, Response } from "express";
import cors from "cors";
import { CLIENT_URL} from '../../../libs/Utils';

const app = express();
app.use(cors({ credentials: true, origin: CLIENT_URL }));
const port = 3001;

app.get("/ping", (req: Request, res: Response) => {
  res.send("pong");
});

app.get("/add", ((req: Request, res: Response) => {
  const a = Number(req.query.a);
  const b = Number(req.query.b);

  if (isNaN(a) || isNaN(b)) {
    return res.status(400).send("Invalid numbers");
  }
  console.log("Result add", a + b);
  res.send({ result: a + b });
}) as RequestHandler);

app.get("/divide", ((req: Request, res: Response) => {
  const a = Number(req.query.a);
  const b = Number(req.query.b);

  if (isNaN(a) || isNaN(b)) {
    return res.status(400).send("Invalid numbers");
  }

  if (b === 0) {
    return res.status(400).send("Division by zero");
  }

  res.send({ result: a + b });
}) as RequestHandler);

app.get("/multiply", ((req: Request, res: Response) => {
  const a = Number(req.query.a); //
  const b = Number(req.query.b); //

  if (isNaN(a) || isNaN(b)) {
    return res.status(400).send("Invalid numbers");
  }

  res.send({ result: a * b });
}) as RequestHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;
