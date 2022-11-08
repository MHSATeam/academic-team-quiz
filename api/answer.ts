import { getAnswer } from "../public/data";
export default function handler(req, res) {
  const { id }: { id: number } = req.body;
  if (id !== 0 && !id) {
    res.status(400).send("No id provided");
    return;
  }
  if (typeof id !== "number") {
    res.status(400).send("Id is not a string");
    return;
  }
  try {
    getAnswer(id).then((answer) => {
      res.json({ term: answer });
    });
  } catch (error) {
    res.status(400).send("Question not found");
    return;
  }
}
