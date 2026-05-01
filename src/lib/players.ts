export const CIVIL_WAR_NAMES: string[] = [
  'Ambrose', 'Beauregard', 'Cornelius', 'Dashiell', 'Elias',
  'Fitzgerald', 'Gideon', 'Hiram', 'Ignatius', 'Jasper',
  'Lemuel', 'Montgomery', 'Nathaniel', 'Obadiah', 'Phineas',
  'Quincy', 'Rutherford', 'Solomon', 'Thaddeus', 'Ulysses',
  'Virgil', 'Wellington', 'Zebulon', 'Adelaide', 'Cordelia',
  'Delphine', 'Eugenia', 'Florence', 'Genevieve', 'Harriet',
  'Josephine', 'Lavinia', 'Millicent', 'Nettie', 'Prudence',
  'Rosalie', 'Temperance', 'Viola', 'Winifred', 'Archibald',
];

export function getRandomCivilWarName(): string {
  return CIVIL_WAR_NAMES[Math.floor(Math.random() * CIVIL_WAR_NAMES.length)];
}
