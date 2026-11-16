/**
 * Starter content for Ultimate Rovers, Ogbomoso.
 *
 * The squad (names, numbers, positions, nationality) comes from the club's team list. Everything
 * else is realistic sample content to replace in the admin: player dates of birth, heights,
 * previous clubs, opponents, staff, partners, honours, history, prices and stories are invented.
 */

export type Group = 'goalkeeper' | 'defender' | 'midfielder' | 'forward'

/** [squad number, first name(s), surname, position group], as split from the team list. */
export const squad: Array<[number, string, string, Group]> = [
  [1, 'Afeez', 'Badmus', 'goalkeeper'],

  [2, 'Damilare', 'Adigun', 'defender'],
  [3, 'Taiwo', 'Babasola', 'defender'],
  [5, 'Oluwaseun John', 'Akinola', 'defender'],
  [6, 'Adewale', 'Adebisi Jr', 'defender'],
  [13, 'Stephen', 'Kolawole', 'defender'],
  [21, 'Adebayo', 'Ajileye', 'defender'],
  [22, 'Agbaraoluwa', 'Adewuyi', 'defender'],
  [23, 'Ridwan', 'Adesina', 'defender'],
  [25, 'Cornelius', 'Ajani', 'defender'],
  [55, 'Obaloluwa', 'John', 'defender'],
  [56, 'Abdulqudus', 'Ekisola', 'defender'],

  [4, 'Azeez', 'Mascherano', 'midfielder'],
  [8, 'Oluwatimilehin', 'Ajimo', 'midfielder'],
  [10, 'Olashile', 'Awere', 'midfielder'],
  [12, 'Micheal Ayomide', 'Fatokun', 'midfielder'],
  [14, 'Clement B.', 'Bolaji', 'midfielder'],
  [16, 'Emmanuel', 'Ogbe', 'midfielder'],
  [18, 'Ayoola', 'Abiona', 'midfielder'],
  [20, 'Gift Ayodele', 'Jayeola', 'midfielder'],
  [28, 'Kehinde', 'Adedeji', 'midfielder'],
  [29, 'Waliu Olalekan', 'Giwa', 'midfielder'],
  [37, 'Kehinde', 'Quyum', 'midfielder'],
  [39, 'Hamzat', 'Bolaji', 'midfielder'],
  [85, 'Seleem', 'Okunlola', 'midfielder'],
  [88, 'Goodness', 'Akinloye', 'midfielder'],

  [7, 'Oluwadamilare', 'Olaide', 'forward'],
  [9, 'Loving', 'Aderogba', 'forward'],
  [11, 'Oluwafemi', 'Olaoke', 'forward'],
  [17, 'Sunday', 'Olabanjo', 'forward'],
  [19, 'Richard', 'Taiwo', 'forward'],
  [27, 'Godwin A.', 'Ajala', 'forward'],
  [30, 'Isreal', 'Ojo', 'forward'],
  [33, 'Islam Olaide', 'Mustapha', 'forward'],
  [40, 'Faruq Ifakorede', 'Odedele', 'forward'],
  [45, 'Richard Olayemi', 'Ogunkunle', 'forward'],
  [47, 'Ifeoluwa', 'Daniel', 'forward'],
  [60, 'Emmanuel', 'Mensah', 'forward'],
  [77, 'Waliyi', 'Alayande', 'forward'],
  [79, 'Adedamola David', 'Babatope', 'forward'],
  [98, 'Abiodun', 'Ogunleye', 'forward'],
  [99, 'Glory', 'Olaifa', 'forward'],
]

/** Sample position names per group, used for the player's specific position. */
export const positionsByGroup: Record<Group, string[]> = {
  goalkeeper: ['Goalkeeper'],
  defender: ['Centre-back', 'Right-back', 'Left-back', 'Centre-back'],
  midfielder: ['Central midfielder', 'Defensive midfielder', 'Attacking midfielder', 'Winger'],
  forward: ['Striker', 'Winger', 'Second striker', 'Striker'],
}

/** Sample previous clubs. Invented names; replace with each player's real history. */
export const previousClubs = [
  'Ogbomoso Youngstars',
  'Oyo Youth Academy',
  'Iseyin Colts',
  'Ibadan Juniors FC',
  'Saki Grassroots FC',
  'Ilorin Starlets',
  'Ogbomoso Rising Stars',
  'Osogbo Youth FC',
]

export const playerQuotes = [
  'Every time we walk out in Ogbomoso, we play for the people who come to watch us.',
  'This club gave me a chance. I want to repay it with goals and hard work.',
  'The supporters push us in the last ten minutes. You can feel it on the pitch.',
  'We train hard all week so that Saturday feels easy.',
  'Wearing this shirt means carrying the whole city with you.',
  'I want to win a trophy here and help the young players coming through.',
]

/**
 * Sample opponents: town, club name, ground. Invented clubs from towns around Oyo State.
 * Index 1 is the next opponent; the order matches the seeded fixtures and the league table.
 */
export const opponents: Array<{ name: string; shortName: string; ground: string }> = [
  { name: 'Oyo Royals FC', shortName: 'Oyo Royals', ground: 'Oyo Township Stadium' },
  { name: 'Iseyin Warriors FC', shortName: 'Iseyin Warriors', ground: 'Iseyin Township Stadium' },
  { name: 'Saki United FC', shortName: 'Saki United', ground: 'Saki Township Stadium' },
  { name: 'Ibadan Comets FC', shortName: 'Ibadan Comets', ground: 'Comets Park, Ibadan' },
  { name: 'Igboho Stars FC', shortName: 'Igboho Stars', ground: 'Igboho Community Pitch' },
  { name: 'Kishi City FC', shortName: 'Kishi City', ground: 'Kishi Township Stadium' },
  { name: 'Igbeti Rangers FC', shortName: 'Igbeti Rangers', ground: 'Igbeti Mini Stadium' },
  { name: 'Eruwa Lions FC', shortName: 'Eruwa Lions', ground: 'Eruwa Township Stadium' },
  { name: 'Okeho Eagles FC', shortName: 'Okeho Eagles', ground: 'Okeho Mini Stadium' },
  { name: 'Igbo-Ora Twins FC', shortName: 'Igbo-Ora Twins', ground: 'Igbo-Ora Township Stadium' },
  { name: 'Lanlate Heroes FC', shortName: 'Lanlate Heroes', ground: 'Lanlate Community Pitch' },
]

/** Names for opponent line-ups, scorers and bookings. */
export const opponentFirstNames = [
  'Tunde',
  'Segun',
  'Kunle',
  'Femi',
  'Bayo',
  'Wale',
  'Dapo',
  'Yinka',
  'Rotimi',
  'Gbenga',
  'Kayode',
  'Lekan',
]
export const opponentSurnames = [
  'Adeyemi',
  'Ogundipe',
  'Olawale',
  'Bello',
  'Afolabi',
  'Oyewole',
  'Lawal',
  'Ogunbiyi',
  'Salami',
  'Oladipo',
  'Akande',
  'Fashola',
  'Adeniran',
  'Oyelaran',
]

export const referees = [
  'Adebayo Ogunmola',
  'Musiliu Oladejo',
  'Kehinde Ayoola',
  'Tajudeen Raji',
  'Samuel Oyeniran',
]

export const HOME_GROUND = 'Nurudeen Grammar School'
export const BIG_GAME_GROUND = 'Soun Stadium'
export const CITY = 'Ogbomoso'
export const HEAD_COACH = 'Babatunde Oyewole'
export const BROADCAST = 'Rovers TV on YouTube'

/** Sample staff by group: [name, role, since year]. Invented; replace with the real people. */
export const people: Record<
  'board' | 'management' | 'technical' | 'investors',
  Array<[string, string, number]>
> = {
  board: [
    ['Alhaji Rasheed Adeoye', 'Chairman', 2016],
    ['Mrs Folasade Oyedokun', 'Vice chairman', 2018],
    ['Mr Olumide Adeleke', 'Director of finance', 2019],
    ['Dr Abiodun Ogunsola', 'Non-executive director', 2021],
    ['Mrs Bukola Ajayi', 'Club secretary', 2017],
  ],
  management: [
    ['Mr Segun Oladokun', 'General manager', 2020],
    ['Mr Kazeem Alabi', 'Team manager', 2019],
    ['Miss Temitope Adewale', 'Head of operations', 2022],
    ['Mr Victor Okonkwo', 'Head of media', 2023],
    ['Mrs Funmilayo Ige', 'Head of commercial', 2022],
    ['Mr Ibrahim Lawal', 'Supporter liaison officer', 2021],
  ],
  technical: [
    [HEAD_COACH, 'Head coach', 2022],
    ['Rafiu Adegoke', 'Assistant coach', 2022],
    ['Taofeek Olayiwola', 'Goalkeeper coach', 2020],
    ['Peter Oyelami', 'Strength and conditioning coach', 2023],
    ['Ayomide Fadare', 'Performance analyst', 2024],
    ['Dr Olufunke Akintola', 'Team doctor', 2021],
    ['Yusuf Abdulrahman', 'Physiotherapist', 2023],
    ['Moses Adeniji', 'Kit manager', 2018],
  ],
  investors: [
    ['Chief Adeyinka Olaniyan', 'Principal investor', 2019],
    ['Mr Babajide Ogunwale', 'Shareholder', 2021],
    ['Mrs Adenike Lasisi', 'Shareholder', 2023],
    ['Prince Oluwaseyi Adebayo', 'Club patron', 2020],
  ],
}

/** Sample partners: [name, tier, blurb, show on Home]. Invented businesses; replace with real ones. */
export const partners: Array<
  [string, 'principal' | 'official' | 'supplier' | 'community', string | null, boolean]
> = [
  [
    'Northgate Motors',
    'principal',
    'Front-of-shirt partner since 2024, backing the club home and away.',
    true,
  ],
  ['Victory Kits', 'official', null, true],
  ['Crystal Spring Water', 'official', null, true],
  ['Swiftlink Internet', 'official', null, true],
  ['Sunrise Pharmacy', 'official', null, false],
  ['Golden Grains Catering', 'supplier', null, false],
  ['Premier Medical Supplies', 'supplier', null, false],
  ['Ace Printing Press', 'supplier', null, false],
  ['Brightlight Electricals', 'supplier', null, false],
  ['Ogbomoso Youth Football Initiative', 'community', null, true],
  ['Clean Streets Ogbomoso', 'community', null, false],
  ['Schools Sports Fund', 'community', null, false],
]

/** Sample honours: [competition, count, years]. */
export const honours: Array<[string, number, string]> = [
  ['Oyo State League', 1, '2023'],
  ['Oyo State FA Cup', 2, '2021, 2024'],
  ['Ogbomoso Unity Cup', 3, '2019, 2022, 2025'],
  ['Oyo State Youth League', 1, '2024'],
]

/** Sample club history for the About page timeline: [year, title, text]. */
export const timeline: Array<[string, string, string]> = [
  [
    '2016',
    'The club is founded',
    'A group of former school players start Ultimate Rovers in Ogbomoso to give local talent a pathway into senior football.',
  ],
  [
    '2017',
    'First competitive season',
    'Rovers enter the local league and finish in the top half at the first attempt.',
  ],
  [
    '2019',
    'A home at Nurudeen Grammar School',
    'The club settles at Nurudeen Grammar School and lifts the Ogbomoso Unity Cup for the first time.',
  ],
  [
    '2023',
    'State league champions',
    'A record-breaking season ends with the Oyo State League title and a big day at Soun Stadium.',
  ],
  [
    '2026',
    'A growing club',
    'A 42-player first team squad, a youth pathway and a supporters base across Ogbomoso.',
  ],
]

export type ArticleCategory =
  'match-report' | 'match-preview' | 'squad-news' | 'club' | 'academy' | 'community'
