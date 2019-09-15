import { Request, Response } from "express-serve-static-core";

const helloHttp = (req: Request, res: Response) => res.send("hello world");

export {
  helloHttp,
}
