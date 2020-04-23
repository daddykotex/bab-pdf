import { sanitizeString, splitString } from "./text";

const tests = [
  ["dummy string", "asd", "asd"],
  [
    "simple",
    "Hope you have a sweet day! Miss you, Ashley <br/>custom_language: true<br/>language: ly23145<br/>created_at: 1586965270<br/>mc_cid: 457403b64c",
    "Hope you have a sweet day! Miss you, Ashley",
  ],
  [
    "date",
    "salut<br/>custom_language: true<br/>language: ly23145<br/>date: 04/20/2020<br/>_af: 0a75dbe7cc71414bd1d1d8257874bb11",
    "salut",
  ],
  [
    "language",
    "De délicieuses gâteries pour ensoleiller nos journées 😊☀️🌈💕<br/>language: ly23145",
    "De délicieuses gâteries pour ensoleiller nos journées",
  ],
  ["language custom", "<br/>custom_language: true<br/>language: ly23145", ""],
  [
    "coeur",
    "merci pour les belles nuits, t’aim ♥️<br/>language: ly23145<br/>custom_language: true",
    "merci pour les belles nuits, t'aim",
  ],
  [
    "large",
    `Ma chère amie, suivant ta belle idée de se remonter le moral à distance, je t'envoie ce petit cadeau à mon tour. 

Prescription : un peu chaque jour.
Pour plus d'efficacité accompagner d'un film, d'un bain moussant ou toute autre activité apaisante de ton choix.

Je pense fort à toi. À bientôt xxx<br/>custom_language: true<br/>language: ly23145<br/>_af: 1cbe12c709583de38f4d4f4147c4b8f9`,
    `Ma chère amie, suivant ta belle idée de se remonter le moral à distance, je t'envoie ce petit cadeau à mon tour. 

Prescription : un peu chaque jour.
Pour plus d'efficacité accompagner d'un film, d'un bain moussant ou toute autre activité apaisante de ton choix.

Je pense fort à toi. À bientôt xxx`,
  ],
  [
    "large2",
    `Salut les copains ! 
Vous me manquez beaucoup en attendant de vous revoir je vous envoie de l'énergie en boîte ! 
Je vous aimes gros .
Bizou à ma poulette Lily .
Xxx
Vanessa<br/>custom_language: true<br/>language: ly23145<br/>created_at: 1586449341<br/>mc_cid: e62373914a`,
    `Salut les copains ! 
Vous me manquez beaucoup en attendant de vous revoir je vous envoie de l'énergie en boîte ! 
Je vous aimes gros .
Bizou à ma poulette Lily .
Xxx
Vanessa`,
  ],
  [
    "large3",
    `T'es belle,
T'es bonne,
T'es fine,
T'es capable!!!

Lâche pas la cousine!!! Je sais que tu travailles fort en ce moment et que tu as pas beaucoup de temps pour toi, alors laisse-toi gâter! 😉

J't'aime fort!! ❤️💜❤️<br/>custom_language: true<br/>language: ly23145`,
    `T'es belle,
T'es bonne,
T'es fine,
T'es capable!!!

Lâche pas la cousine!!! Je sais que tu travailles fort en ce moment et que tu as pas beaucoup de temps pour toi, alors laisse-toi gâter! 

J't'aime fort!!`,
  ],
];

tests.forEach(([name, value, expectation]) => {
  test(`sanitize: ${name}`, () => {
    expect(sanitizeString(value)).toEqual(expectation);
  });
});

test(`splistring: tata`, () => {
  expect(
    splitString("Hope you have a sweet day! Miss you, Ashley ", 40)
  ).toEqual(["Hope you have a sweet day! Miss you,", "Ashley"]);
});
