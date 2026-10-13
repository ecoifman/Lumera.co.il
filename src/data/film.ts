// The Lumera explainer film (70 seconds): what the site shows, and its transcript.
// Encoded files come from scripts/build-film-media.py; durations and the desktop
// reframing track are written to film.json by that script.
// The transcript was read from the captions burned into the film. Lines marked
// 'screen' are titles that appear on screen rather than narration.
import filmData from './film.json';

export interface TranscriptLine {
  kind: 'speech' | 'screen';
  text: string;
}

const seconds = filmData.film?.duration ?? 70.87;
const minutes = Math.floor(Math.round(seconds) / 60);
const rest = Math.round(seconds) % 60;

export const FILM = {
  title: 'לומרה – הבית שלך, בגרסה הכי טובה שלו',
  description:
    'סרטון ההסבר של לומרה: בית חכם שמתעורר בקצב שלך, שליטה מהטלפון גם מרחוק, זיהוי בכניסה, מסך בקרה מרכזי, מתגים מעוצבים וחיישני קרבה. בלי לשבור קירות ובלי לסבך את התשתית.',
  durationLabel: `${minutes}:${String(rest).padStart(2, '0')}`,
  isoDuration: `PT${minutes}M${rest}S`,
  poster: '/media/film-poster.jpg',
  sources: {
    large: '/media/film-1080.mp4',
    small: '/media/film-720.mp4',
  },
  // Published on the site with the new build.
  uploadDate: '2026-10-13T08:00:00+03:00',
  ambient: {
    duration: filmData.ambient?.duration ?? 30,
    desktopTrack: (filmData.ambient?.desktopTrack ?? [[0, 50]]) as [number, number][],
    wide: [
      ['/media/hero-d.webm', 'video/webm'],
      ['/media/hero-d.mp4', 'video/mp4'],
    ] as [string, string][],
    stacked: [
      ['/media/hero-m.webm', 'video/webm'],
      ['/media/hero-m.mp4', 'video/mp4'],
    ] as [string, string][],
  },
  transcript: [
    { kind: 'speech', text: 'תשכחו ממה שידעתם על בית חכם. ברוכים הבאים ל־LUMERA.' },
    { kind: 'speech', text: 'עם LUMERA, הבית מתעורר בדיוק בקצב שלך.' },
    { kind: 'screen', text: 'בלי לשבור קירות. בלי לסבך את התשתית.' },
    {
      kind: 'speech',
      text: 'בעזרת המערכת החכמה של לומרה תוכל להגדיר תרחישים שבהם תוכל לשלוט בבית, כמו למשל לנעול אותו בלחיצה אחת, גם מרחוק, כשאתה לא בבית.',
    },
    { kind: 'speech', text: 'יש לך שליטה על הבית שלך כשאתה צריך אותו. חוסך לך זמן יקר בכל יום מחדש,' },
    { kind: 'screen', text: 'LUMERA, תדליקי את הבוילר.' },
    { kind: 'speech', text: 'ומאפשר לך נוחות ללא פשרות.' },
    {
      kind: 'speech',
      text: 'הוא מזהה אותך כשאתה מגיע, ומקבל את פניך בחוויה שאתה מעצב. זו הטכנולוגיה המתקדמת ביותר, במינימום מאמץ.',
    },
    { kind: 'speech', text: 'מסך הבקרה המרכזי מאפשר לך שליטה על האורות ושליטה בכל חדרי הבית.' },
    {
      kind: 'speech',
      text: 'בעזרת הייחודיות של לומרה תוכל להתאים אישית מתגים מעוצבים שמשתלבים בכל חלל, ומעניקים לבית שדרוג יוקרתי ופונקציונלי.',
    },
    {
      kind: 'speech',
      text: 'חיישני קרבה מאפשרים הדלקה אוטומטית לזמן מוגדר. אין צורך לחפש מתגים בחושך. מתקדמים לבית חכם של LUMERA.',
    },
    { kind: 'speech', text: 'כי בסוף היום, יוקרה היא לא רק עיצוב. היא הדרך שבה הבית שלך משרת אותך.' },
    { kind: 'speech', text: 'הבית שלך, בגרסה הכי טובה שלו.' },
    { kind: 'screen', text: 'LUMERA · Home Simplicity' },
  ] as TranscriptLine[],
};

/** Plain-text transcript for structured data. */
export const FILM_TRANSCRIPT_TEXT = FILM.transcript
  .map((l) => (l.kind === 'screen' ? `[על המסך: ${l.text}]` : l.text))
  .join(' ');
