// Single source of truth for business details (NAP), navigation and contact links.
// Anything marked TODO is waiting for confirmation from Eyal and must not be invented.

export const SITE = {
  name: 'לומרה',
  nameEn: 'Lumera',
  legalName: 'לומרה סמארט בע״מ',
  legalNameEn: 'Lumera Smart Ltd',
  tagline: 'בית חכם אלחוטי, בלי חציבות',
  url: 'https://lumera-hs.co.il',
  locale: 'he_IL',
  phoneDisplay: '054-236-3473',
  phoneHref: 'tel:+972542363473',
  phoneE164: '+972542363473',
  whatsappNumber: '972542363473',
  // TODO: confirm the public e-mail address. The old site listed info@lumera.co.il,
  // but lumera.co.il belongs to another business, so no address is shown for now.
  email: '',
  address: {
    locality: 'חיפה',
    neighborhood: 'דניה',
    postalCode: '3491236',
    region: 'מחוז חיפה',
    country: 'IL',
  },
  appUrl: 'https://app.lumera-hs.co.il',
  toolUrl: '/tool/',
  social: {
    facebook: 'https://www.facebook.com/61582238582080',
    youtube: 'https://www.youtube.com/channel/UCaQ3-EcKnHWqvBtOrdZIswA',
    linkedin: 'https://www.linkedin.com/in/lumera-home-simplicity-8870963a1/',
    // TODO: Instagram handle
    instagram: '',
  },
} as const;

/** WhatsApp deep link with a prefilled message, so we know which page a lead came from. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export const SOLUTIONS: NavItem[] = [
  { label: 'מתגים חכמים', href: '/switches/', description: 'מסך מגע עם כיתוב בעברית ועיצוב שמתחלף' },
  { label: 'תאורה מגנטית וחכמה', href: '/lighting/', description: 'פסי צבירה שקועים בגבס, ספוטים ונברשות' },
  { label: 'שמע נסתר ומולטירום', href: '/audio/', description: 'רמקולים שקועים בתקרה ובקיר' },
  { label: 'אבטחה ובקרת כניסה', href: '/security/', description: 'מצלמות, מנעול חכם, חיישנים' },
  { label: 'אקלים, הצללה ואנרגיה', href: '/climate/', description: 'מזגנים, חימום תת־רצפתי, דוד ותריסים' },
  { label: 'תשתית בלי חציבות', href: '/infrastructure/', description: 'איך החשמל והשליטה נפרדים' },
];

export const PROFESSIONALS: NavItem[] = [
  { label: 'אדריכלים ומעצבי פנים', href: '/professionals/architects/' },
  { label: 'יזמים וקבלנים', href: '/professionals/developers/' },
  { label: 'חשמלאים ומתקינים', href: '/professionals/electricians/' },
];

export const MAIN_NAV: NavItem[] = [
  { label: 'פתרונות', href: '/#solutions' },
  { label: 'לאנשי מקצוע', href: '/professionals/' },
  { label: 'אודות', href: '/about/' },
  { label: 'צור קשר', href: '/contact/' },
];

export const LEGAL_NAV: NavItem[] = [
  { label: 'הצהרת נגישות', href: '/accessibility/' },
  { label: 'מדיניות פרטיות', href: '/privacy/' },
];
