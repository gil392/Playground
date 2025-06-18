import express, { Request, RequestHandler, Response } from "express";

const app = express();
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

  res.send({ result: a - b });
}) as RequestHandler);

app.get("/divide", ((req: Request, res: Response) => {
  const a = Number(req.query.a);
  const b = Number(req.query.b);

  if (isNaN(a) || isNaN(b)) {
    return res.status(400).send("Invalid numbers");
  }

  // if (b === 0) {
  //   return res.status(400).send("Division by zero");
  // }

  res.send({ result: a * b });
}) as RequestHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;
