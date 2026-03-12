export const CONFIG = {
  tournaments: {
    spring: {
      id: 'spring',
      name: 'Великолепие весны',
      dates: '20-21 марта 2026',
      url: 'https://script.google.com/macros/s/AKfycbxdOJX7rRP6VN7XHc42K4IKAHgAsmrNyspUawqogNQqcb55aIpR6zt7aj7nBtiRMr6_/exec',
      emoji: '🌸',
    },
    lada: {
      id: 'lada',
      name: 'Весенний кубок Лады',
      dates: '4-5 апреля 2026',
      url: 'https://script.google.com/macros/s/AKfycbyIc6RrFxY0AR-JYEInS8wv1tRqiAKQXBHuzr_r5722v6Q5oVxqwsDKAc9ZvdcwdRji/exec',
      emoji: '🏆',
    },
  },
  maxGymnasts: {
    group: 6,
    pairs: { двойки: 2, тройки: 3 },
  },
  programs: {
    lada: {
      individual: [
        { value: 'МС', label: 'Программа МС (Женщины, 16 лет и старше, 2010 г.р. и ст.)' },
        { value: 'КМС', label: 'Программа КМС (Юниорки, 14-15 лет, 2011-2012 г.р.)' },
        { value: 'I разряд', label: 'Программа I разряда (Девочки, 12-13 лет, 2013-2014 г.р.)' },
        { value: 'II разряд', label: 'Программа II разряда (Девочки, 11 лет, 2015 г.р.)' },
        { value: 'III разряд', label: 'Программа III разряда (Девочки, 10 лет, 2016 г.р.)' },
        { value: 'I юношеский', label: 'Программа I юношеского разряда (Девочки, 9 лет, 2017 г.р.)' },
        { value: 'II юношеский', label: 'Программа II юношеского разряда (Девочки, 8 лет, 2018 г.р.)' },
        { value: 'III юношеский', label: 'Программа III юношеского разряда (Девочки, 7 лет, 2019 г.р.)' },
        { value: 'Юный гимнаст', label: 'Юный гимнаст (Девочки, 6 лет и младше, 2020 г.р. и младше)' },
      ],
      ofp: [
        { value: '2020 и младше', label: 'Для участниц 2020 г.р. и младше' },
        { value: '2017-2019', label: 'Для участниц 2017-2019 г.р.' },
      ],
    },
  },
  categories: ['Категория A', 'Категория A+', 'Категория B', 'Категория C'],
  ranks: ['МС', 'КМС', '1 разряд', '2 разряд', '3 разряд', '1 юношеский', '2 юношеский', '3 юношеский', 'б/р'],
  divisions: [
    '1 дивизион 2020 и младше', '1 дивизион 2019', '1 дивизион 2018',
    '1 дивизион 2017', '1 дивизион 2016', '1 дивизион 2015',
    '1 дивизион 2014', '1 дивизион 2013', '1 дивизион 2012',
    '1 дивизион 2011 и старше',
    '2 дивизион 2020 и младше', '2 дивизион 2019', '2 дивизион 2018',
    '2 дивизион 2017', '2 дивизион 2016', '2 дивизион 2015',
    '2 дивизион 2014', '2 дивизион 2013', '2 дивизион 2012',
    '2 дивизион 2011 и старше',
    '3 дивизион 2020 и младше', '3 дивизион 2019', '3 дивизион 2018',
    '3 дивизион 2017', '3 дивизион 2016', '3 дивизион 2015',
    '3 дивизион 2014', '3 дивизион 2013', '3 дивизион 2012',
    '3 дивизион 2011 и старше',
  ],
};

export const PROGRAM_TYPES = {
  individual: 'Индивидуальная программа',
  group: 'Групповое упражнение',
  pairs: 'Двойки и тройки',
  ofp: 'ОФП',
} as const;

export type TournamentId = keyof typeof CONFIG.tournaments;
export type FormType = keyof typeof PROGRAM_TYPES;

export interface Gymnast {
  id: string;
  fio: string;
  birth_year: string;
  division?: string;
  program?: string;
  rank?: string;
  category?: string;
}

export interface FormData {
  city: string;
  organization: string;
  coaches: string;
  team_name?: string;
  program?: string;
  program_subtype?: string;
  category?: string;
  gymnasts: Gymnast[];
}
