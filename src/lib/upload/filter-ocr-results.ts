export const OCRBlacklistedCharacters = "`~|_®™";

const numbersRegex = /^\d{1,2}[:;.]\s*/i;

export function filterQuestionForPrefixes(text: string) {
  const teamRegex = /^[tT][eE][aA][mM]\s+[A-Z][:;]?\s*/;
  const tossupRegex = /^toss-?up[:;]?\s*/i;

  return text
    .replace(numbersRegex, "")
    .replace(teamRegex, "")
    .replace(tossupRegex, "");
}

export function filterAnswerForPrefixes(text: string) {
  const answerRegex = /^answer[:;]?\s*/i;
  return text.replace(numbersRegex, "").replace(answerRegex, "");
}
