// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiResponse, NextApiRequest } from "next";
import logger from "pino";

const log = logger();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  log.info({ query: req.query });
  res.status(200).json({ name: "John Doe" });
}
