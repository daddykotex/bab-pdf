export function sanitizeString(test: string): string {
  return test
    .replace("’", "'")
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    )
    .replace(/\uFE0F/g, "")
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
        strings.push(...splited);
      }
      if (currentString.length + word.length > maxWidth) {
        strings.push(currentString);
        currentString = word;
      } else {
        currentString += " " + word;
      }
    });

    return strings;
  }
  return text.split("\n").flatMap((line) => splitOne(line));
}
