export function sanitizeString(test: string): string {
  return test
    .replace("’", "'")
    .replace("œ", "oe")
    .replace(/<br\/>custom_language: true/g, "")
    .replace(/<br\/>language: \w*/g, "")
    .replace(/<br\/>mc_cid: \w*/g, "")
    .replace(/<br\/>_af: \w*/g, "")
    .replace(/<br\/>created_at: \d*/g, "")
    .replace(/<br\/>date: [\d|/]*/g, "")
    .trim();
}

export function splitString(text: string, maxWidth: number): Array<string> {
  function splitOne(line: string): Array<string> {
    if (line.length <= maxWidth) {
      return [line];
    }

    let strings: Array<string> = [];
    let currentString = "";
    line.split(" ").forEach((word) => {
      if (word.length > maxWidth) {
        const splited = word.match(new RegExp(`.{1,${maxWidth}}`, "g"));
        if (splited) {
          strings.push(...splited);
        }
      } else if (currentString.length + word.length > maxWidth) {
        strings.push(currentString.trim());
        currentString = word + " ";
      } else {
        currentString += word + " ";
      }
    });

    if (currentString.length > 0) {
      strings.push(currentString.trim());
    }

    return strings;
  }
  return text.split("\n").flatMap((line) => splitOne(line));
}
