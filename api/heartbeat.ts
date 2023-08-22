import { VercelResponse } from "@vercel/node";

export default function handler(_req, res: VercelResponse) {
  return res.status(200).json({ alive: true });
}
