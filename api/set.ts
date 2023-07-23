import { sets } from "../api-lib/_set-list.js";
import { getQuestionSet, Set } from "../api-lib/_utils.js";
export default function handler(req, res) {
  if (!req.body || !req.body.sets) {
    res.status(400).send("Missing sets");
    return;
  }

  const { sets: requestedSets, players }: { sets: string[]; players: number } =
    req.body;
  const filteredSets: Set[] = requestedSets.filter(
    (set: string): set is Set => {
      return sets.includes(set);
    }
  );
  if (filteredSets.length === 0) {
    res.status(400).send("No valid sets provided");
    return;
  }
  getQuestionSet(filteredSets, players).then((questionSet) => {
    res.status(200).json(questionSet);
  });
}
