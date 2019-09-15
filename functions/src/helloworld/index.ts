import { Request, Response } from "express";

const helloHttp = (req: Request, res: Response) => res.send("hello world");

export {
  helloHttp,
}
