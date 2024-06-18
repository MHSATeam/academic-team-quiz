import { Problem } from "@/src/lib/math/math-types";
import { Deck, randomBool, randomInt } from "@/src/lib/math/utils";
import nerdamer from "nerdamer";

export function playingCardProbability(problem: Problem) {
  const deck = new Deck();
  const withReplacement = randomBool();
  const drawSet = Deck.RandomNonOverlapDrawSet(randomInt(2, 4));
  let drawString = "";
  drawSet
    .map((draw) => Deck.DrawToString(draw))
    .forEach((drawText, index, arr) => {
      if (index !== 0 && drawText === arr[index - 1]) {
        drawString += drawText.slice(drawText.indexOf(" ") + 1);
      } else {
        drawString += drawText;
      }
      if (index < arr.length - 2) {
        drawString += ", then ";
      } else if (index === arr.length - 2) {
        if (arr.length === 2) {
          drawString += " and then ";
        } else {
          drawString += ", and then ";
        }
      }
      if (index + 1 !== arr.length && drawText === arr[index + 1]) {
        drawString += "another ";
      }
    });
  const fractions = [];
  for (let i = 0; i < drawSet.length; i++) {
    const draw = drawSet[i];
    const chances = deck.getCardsOfSubset(Deck.GetDrawSubset(draw)).length;
    const totalCards = deck.cards.length;
    fractions.push(`${chances}/${totalCards}`);
    if (!withReplacement) {
      deck.pullFromDrawParams(draw);
    }
  }

  const nerdString = `(${fractions.join(")*(")})`;
  problem.answers.push(`$${nerdamer(nerdString).toTeX().removeCdot()}$`);

  problem.question = `Given a standard deck of 52 cards. What is the probability of drawing ${drawString}${
    drawSet.length === 1
      ? ""
      : withReplacement
        ? " with replacement"
        : " without replacement"
  }?`;
  return problem;
}
