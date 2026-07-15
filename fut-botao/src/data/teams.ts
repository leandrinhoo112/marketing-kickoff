// src/data/teams.ts
export interface Player {
  name: string;
  shortName: string;
  isGoalkeeper: boolean;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  logoUrl: string;
  players: Player[];
}

export const TEAMS: Team[] = [
  {
    id: 'athletico',
    name: 'Athletico Paranaense',
    shortName: 'CAP',
    primaryColor: '#CC0000',
    secondaryColor: '#1a1a1a',
    textColor: '#ffffff',
    logoUrl: '/teams/athletico.png',
    players: [
      { name: 'Santos', shortName: 'Santos', isGoalkeeper: true },
      { name: 'Esquivel', shortName: 'Esquivel', isGoalkeeper: false },
      { name: 'Arthur Dias', shortName: 'A. Dias', isGoalkeeper: false },
      { name: 'Viveros', shortName: 'Viveros', isGoalkeeper: false },
      { name: 'Luiz Gustavo', shortName: 'L. Gustavo', isGoalkeeper: false },
    ],
  },
  {
    id: 'coritiba',
    name: 'Coritiba',
    shortName: 'CFC',
    primaryColor: '#006400',
    secondaryColor: '#ffffff',
    textColor: '#ffffff',
    logoUrl: '/teams/coritiba.png',
    players: [
      { name: 'Pedro Morisco', shortName: 'P. Morisco', isGoalkeeper: true },
      { name: 'Ronier', shortName: 'Ronier', isGoalkeeper: false },
      { name: 'Breno Lopes', shortName: 'B. Lopes', isGoalkeeper: false },
      { name: 'Josué', shortName: 'Josué', isGoalkeeper: false },
      { name: 'Jacy', shortName: 'Jacy', isGoalkeeper: false },
    ],
  },
  {
    id: 'flamengo',
    name: 'Flamengo',
    shortName: 'FLA',
    primaryColor: '#CC0000',
    secondaryColor: '#1a1a1a',
    textColor: '#ffffff',
    logoUrl: '/teams/flamengo.png',
    players: [
      { name: 'Rossi', shortName: 'Rossi', isGoalkeeper: true },
      { name: 'Jorginho', shortName: 'Jorginho', isGoalkeeper: false },
      { name: 'Léo Pereira', shortName: 'L. Pereira', isGoalkeeper: false },
      { name: 'Arrascaeta', shortName: 'Arrascaeta', isGoalkeeper: false },
      { name: 'Pedro', shortName: 'Pedro', isGoalkeeper: false },
    ],
  },
  {
    id: 'saopaulo',
    name: 'São Paulo FC',
    shortName: 'SPFC',
    primaryColor: '#CC0000',
    secondaryColor: '#1a1a1a',
    textColor: '#ffffff',
    logoUrl: '/teams/saopaulo.png',
    players: [
      { name: 'Rafael', shortName: 'Rafael', isGoalkeeper: true },
      { name: 'Lucas', shortName: 'Lucas', isGoalkeeper: false },
      { name: 'Arboleda', shortName: 'Arboleda', isGoalkeeper: false },
      { name: 'Ferreirinha', shortName: 'Ferreirinha', isGoalkeeper: false },
      { name: 'Luciano', shortName: 'Luciano', isGoalkeeper: false },
    ],
  },
  {
    id: 'gremio',
    name: 'Grêmio',
    shortName: 'GRE',
    primaryColor: '#1565C0',
    secondaryColor: '#1a1a1a',
    textColor: '#ffffff',
    logoUrl: '/teams/gremio.png',
    players: [
      { name: 'Weverton', shortName: 'Weverton', isGoalkeeper: true },
      { name: 'Kannemann', shortName: 'Kannemann', isGoalkeeper: false },
      { name: 'Marcos Rocha', shortName: 'M. Rocha', isGoalkeeper: false },
      { name: 'Amuzu', shortName: 'Amuzu', isGoalkeeper: false },
      { name: 'Carlos Vinicius', shortName: 'C. Vinicius', isGoalkeeper: false },
    ],
  },
  {
    id: 'vasco',
    name: 'Vasco da Gama',
    shortName: 'VAS',
    primaryColor: '#1a1a1a',
    secondaryColor: '#ffffff',
    textColor: '#ffffff',
    logoUrl: '/teams/vasco.png',
    players: [
      { name: 'Léo Jardim', shortName: 'L. Jardim', isGoalkeeper: true },
      { name: 'Piton', shortName: 'Piton', isGoalkeeper: false },
      { name: 'Spinelli', shortName: 'Spinelli', isGoalkeeper: false },
      { name: 'Thiago Mendes', shortName: 'T. Mendes', isGoalkeeper: false },
      { name: 'Cuiabano', shortName: 'Cuiabano', isGoalkeeper: false },
    ],
  },
  {
    id: 'sport',
    name: 'Sport Recife',
    shortName: 'SPT',
    primaryColor: '#CC0000',
    secondaryColor: '#1a1a1a',
    textColor: '#ffffff',
    logoUrl: '/teams/sport.png',
    players: [
      { name: 'Thiago Couto', shortName: 'T. Couto', isGoalkeeper: true },
      { name: 'Barletta', shortName: 'Barletta', isGoalkeeper: false },
      { name: 'Zé Lucas', shortName: 'Z. Lucas', isGoalkeeper: false },
      { name: 'Perotti', shortName: 'Perotti', isGoalkeeper: false },
      { name: 'Biel', shortName: 'Biel', isGoalkeeper: false },
    ],
  },
  {
    id: 'inspirar1',
    name: 'Inspirar 1',
    shortName: 'INS 1',
    primaryColor: '#1B365D',
    secondaryColor: '#00A859',
    textColor: '#ffffff',
    logoUrl: '/teams/inspirar1.png',
    players: [
      { name: 'Bruno', shortName: 'Bruno', isGoalkeeper: true },
      { name: 'Edson', shortName: 'Edson', isGoalkeeper: false },
      { name: 'Luiz', shortName: 'Luiz', isGoalkeeper: false },
      { name: 'João', shortName: 'João', isGoalkeeper: false },
      { name: 'Jorge', shortName: 'Jorge', isGoalkeeper: false },
    ],
  },
  {
    id: 'inspirar2',
    name: 'Inspirar 2',
    shortName: 'INS 2',
    primaryColor: '#00A859',
    secondaryColor: '#1B365D',
    textColor: '#ffffff',
    logoUrl: '/teams/inspirar2.png',
    players: [
      { name: 'Vanessa', shortName: 'Vanessa', isGoalkeeper: true },
      { name: 'Leandro', shortName: 'Leandro', isGoalkeeper: false },
      { name: 'Igor', shortName: 'Igor', isGoalkeeper: false },
      { name: 'Yasmim', shortName: 'Yasmim', isGoalkeeper: false },
      { name: 'Mariana', shortName: 'Mariana', isGoalkeeper: false },
    ],
  },
];
