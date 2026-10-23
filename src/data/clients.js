// Trip finale (NegotiationScene): client, room, consultants and boss depend on the ground leg you crossed
// (GameState.trip.leg = theme of the ground leg). The boss projectiles carry corporate bad luck: when one hits
// you, a random CURSES line shows up.

export const CURSES = [
  'LA CALL DELLE 18\nDI VENERDI\'',
  'IL CAMPIONATO DI\nPADEL AZIENDALE',
  'IL MEETING DELLE\n7 DI MATTINA',
  'L\'AUDIT DI QUALITA\'',
  'LA CHIUSURA\nDEL BILANCIO',
  'IL PROGETTO\nSFIDANTE',
  'LA GRANDE\nOPPORTUNITA\'',
  'IL TEAM BUILDING\nDI DOMENICA',
  'LE FERIE\nRIMANDATE',
  'IL REPLY ALL\nA 400 PERSONE',
  'LA RIORGANIZZAZIONE',
  'LA VALUTAZIONE\nDI FINE ANNO',
  'IL NUOVO\nGESTIONALE',
  'LA CENA AZIENDALE\nCON KARAOKE',
  'IL FILE\nDEFINITIVO_V27',
  'IL CORSO\nOBBLIGATORIO ONLINE'
];

export const CLIENTS = {
  desert: {
    room: 'temple', client: 'client_pharaoh', label: 'IL FARAONE', who: 'Il faraone', hud: 'IL FARAONE',
    arrive: 'SEI ARRIVATO NEL TEMPIO\nDEL CLIENTE FARAONE!', hint: '#3a2a10',
    consultant: ['cons_egypt1', 'cons_egypt2'],
    consultLines: ['PER RA, CHE SINERGIE!', 'E\' SCRITTO NEI GEROGLIFICI', 'LA PIRAMIDE NON E\' SCALABILE'],
    boss: {
      name: 'LA MUMMIA', tex: ['boss_mummy1', 'boss_mummy2'], attack: 'orb', hit: 'MALEDIZIONE ANTICA!',
      intro: '"ED ECCO IL MIO SUPER CONSULENTE:\nLA MUMMIA!"\nLANCIA MALEDIZIONI ANTICHE: SCHIVALE!\nEMAIL (C) O SALTALE IN TESTA',
      won: 'LA MUMMIA TORNA NEL SARCOFAGO!', lost: 'LA MUMMIA TI HA MALEDETTO L\'AGENDA',
      lines: ['ARGH... CI AGGIORNIAMO\nTRA TREMILA ANNI', 'LA MALEDIZIONE\nE\' NEL DECK...']
    }
  },
  glacier: {
    room: 'ice', client: 'client_penguin', label: 'IL PINGUINO', who: 'Il pinguino', hud: 'IL PINGUINO',
    arrive: 'SEI ARRIVATO NEL TEMPIO DI GHIACCIO\nDEL CLIENTE PINGUINO!', hint: '#1a3a6a',
    consultant: ['cons_coat1', 'cons_coat2'],
    consultLines: ['CHE FREDDO... DI BUDGET', 'CONGELIAMO IL PROGETTO', 'ROMPIAMO IL GHIACCIO!'],
    boss: {
      name: 'L\'ORSO POLARE', tex: ['boss_bear1', 'boss_bear2'], attack: 'fish', hit: 'PESCE PADULO!', shotLabel: 'PESCE PADULO',
      intro: '"ED ECCO IL MIO SUPER CONSULENTE:\nL\'ORSO POLARE!"\nLANCIA PESCI PADULI: PORTANO SVENTURA!\nEMAIL (C) O SALTAGLI IN TESTA',
      won: 'L\'ORSO VA IN LETARGO!', lost: 'L\'ORSO TI HA RIEMPITO DI PESCI PADULI',
      lines: ['GRRR... MANDAMI\nUN RECAP', 'IL PESCE E\'\nFRESCHISSIMO!']
    }
  },
  sea: {
    room: 'sea', client: 'client_mermaid', label: 'LA SIRENETTA', who: 'La sirenetta', hud: 'LA SIRENETTA',
    arrive: 'SEI ARRIVATO NEL PALAZZO\nDELLA CLIENTE SIRENETTA!', hint: '#ffffff',
    consultant: ['cons_diver1', 'cons_diver2'],
    consultLines: ['BLUB... ALLINEIAMOCI', 'ANDIAMO IN PROFONDITA\'', 'SIAMO SULLA STESSA ONDA'],
    boss: {
      name: 'IL POLIPO GIGANTE', tex: ['boss_octopus1', 'boss_octopus2'], attack: 'crab', hit: 'SVENTURA MARINA!',
      intro: '"ED ECCO IL MIO SUPER CONSULENTE:\nIL POLIPO GIGANTE!"\nLANCIA GRANCHI E CONCHIGLIE DELLA SVENTURA!\nEMAIL (C) O SALTAGLI IN TESTA',
      won: 'IL POLIPO FUGGE IN UNA NUVOLA D\'INCHIOSTRO!', lost: 'IL POLIPO TI HA PIZZICATO OVUNQUE',
      lines: ['OTTO BRACCIA,\nOTTO RIUNIONI', 'HO GIA\' MANDATO\nOTTO MAIL']
    }
  }
};
