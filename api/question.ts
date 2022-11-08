import { sets, getQuestion, Set } from "../data/index";
export default function handler(req, res) {
  if (!req.body || !req.body.sets) {
    res.status(400).send("Missing sets");
    return;
  }

  const { sets: requestedSets }: { sets: string[] } = req.body;
  const filteredSets: Set[] = requestedSets.filter(function isSet(
    set: string
  ): set is Set {
    return sets.includes(set);
  });
  if (filteredSets.length === 0) {
    res.status(400).send("No valid sets provided");
    return;
  }
  getQuestion(filteredSets).then((question) => {
    res.status(200).json(question);
  });
}
