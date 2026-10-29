// Mondo 4 "La Trasferta": suitcase items, transport, prices.

export const SUITCASE_SIZE = 6;
// Extra places bought at the suitcase check, paid from the trip fund (the budget left after the ticket shrinks).
export const EXTRA_SLOTS = 4;
export const EXTRA_SLOT_PRICE = 5;

// Every item can go in the suitcase; tex = `trip_${id}` (16x16, see gfx/trip.js).
// label can depend on the character (man/woman).
export const TRIP_ITEMS = [
  { id: 'laptop', label: 'PORTATILE' },
  { id: 'charger', label: 'CARICABATTERIE' },
  { id: 'phone', label: 'TELEFONO' },
  { id: 'earbuds', label: 'AURICOLARI' },
  { id: 'antacid', label: 'PASTICCHE ACIDITA\'' },
  { id: 'toothpaste', label: 'DENTIFRICIO' },
  { id: 'toothbrush', label: 'SPAZZOLINO' },
  { id: 'underwear', label: { man: 'MUTANDE', woman: 'MUTANDINE' } },
  { id: 'banana', label: 'BANANA' },
  { id: 'umbrella', label: 'OMBRELLO' },
  { id: 'toiletpaper', label: 'CARTA IGIENICA' },
  { id: 'notebook', label: 'QUADERNO' },
  { id: 'sleepmask', label: 'MASCHERINA' },
  { id: 'idcard', label: 'DOCUMENTO' },
  { id: 'adapter', label: 'ADATTATORE' },
  { id: 'cards', label: 'BIGLIETTI VISITA' },
  { id: 'suit', label: { man: 'GIACCA E CRAVATTA', woman: 'BLAZER' } },
  { id: 'dates', label: 'DATTERI' },
  { id: 'swimsuit', label: 'COSTUME' },
  { id: 'jacket', label: 'PIUMINO' }
];

export const itemLabel = (item, character) =>
  (typeof item.label === 'string' ? item.label : item.label[character] || item.label.man);

export const itemById = (id) => TRIP_ITEMS.find((i) => i.id === id);

// Forgetting these is reported by the suitcase check.
export const ESSENTIALS = ['laptop', 'phone', 'charger', 'toothbrush', 'underwear'];

// Suitcase check: a doubt about one item left out, to tempt the player into buying an extra place. Some are really
// useful (on some legs), others are bait (toilet paper is never used).
export const PACKING_HINTS = {
  jacket: 'E se fa freddo? Forse sarebbe utile un piumino.',
  banana: 'Magari una banana per uno spuntino?',
  earbuds: 'Delle cuffiette per rilassarti in viaggio o fare le call?',
  sleepmask: 'Una mascherina per un pisolino durante il viaggio?',
  antacid: 'E se il cibo del viaggio non ti va giu\'? Delle pasticche per l\'acidita\'?',
  umbrella: 'E se piove? O se c\'e\' un sole che spacca? Un ombrello...',
  swimsuit: 'E se l\'hotel ha la piscina? Il costume...',
  dates: 'Qualcosa di energetico per il viaggio? Dei datteri?',
  toothpaste: 'Lo spazzolino senza dentifricio... sicuro?',
  suit: 'Ti presenti al cliente vestito cosi\'? Qualcosa di elegante...',
  idcard: 'E il documento? Ai controlli lo chiedono sempre.',
  adapter: 'E se le prese sono diverse? Un adattatore...',
  cards: 'Dei biglietti da visita per fare colpo sul cliente?',
  notebook: 'Un quaderno per gli appunti della riunione?',
  toiletpaper: 'Carta igienica? In trasferta non si sa mai...'
};

// Used when a stage is started on its own from the menu (debug).
export const DEFAULT_SUITCASE = ['laptop', 'phone', 'charger', 'toothbrush', 'toothpaste', 'underwear', 'idcard', 'suit', 'adapter', 'dates'];

// The administration gives TRIP_FUND for the whole trip; the ticket is paid from it, the rest is the budget.
export const TRIP_FUND = 480;
export const TRANSPORT = {
  train: { label: 'TRENO', cost: 180, budget: TRIP_FUND - 180, timeBonus: 0 },
  plane: { label: 'AEREO', cost: 300, budget: TRIP_FUND - 300, timeBonus: 60 }   // faster: extra seconds on the ground leg
};

export const PRICES = {
  headphones: 35,      // bought on board / at the bar
  sandwichPlane: 15,
  sandwichTrain: 12,
  provisionalId: 60,
  camel: 30,
  moto: 60,
  taxi: 80,            // plus TAXI_METER per second
  thief: 40,           // stolen by the pickpocket
  husky: 30,
  snowmobile: 60,      // plus FUEL_METER per second
  skis: 20,
  submarine: 60,       // plus BATTERY_METER per second
  fins: 15,
  seahorse: 30
};
export const TAXI_METER = 1;
export const FUEL_METER = 1;
export const BATTERY_METER = 1;

// Leftover budget is converted into euro bonus at the end of the trip.
export const BUDGET_TO_EURO = 0.25;

// Food stand menus of the ground legs (FoodScene): one dish is good, one hallucinogenic, one toxic,
// shuffled every time. tex = dish texture generated in gfx/trip.js.
export const FOOD_PRICE = 10;
export const FOOD_MENUS = {
  desert: {
    stand: 'OASI DEL GUSTO',
    place: 'CHIOSCO', ofPlace: 'DEL CHIOSCO', fromPlace: 'DA QUESTO CHIOSCO',
    cook: '"Benvenuto, viaggiatore! Specialita\' locali. Una e\' squisita... le altre, beh, sono tradizionali."',
    dishes: [
      { tex: 'food_panino', what: 'NEL PANINO', name: 'PANINO ALLA SALSA DI CAMMELLO', text: 'Pane azzimo e una salsa di cui e\' meglio non chiedere la ricetta.' },
      { tex: 'food_cannelloni', what: 'NEI CANNELLONI', name: 'CANNELLONI ALLA SAHARIANA', text: 'Ripieni di cous cous piccante. Si spera.' },
      { tex: 'food_dunette', what: 'NELLE DUNETTE', name: 'DUNETTE DELIZIOSE', text: 'Dolcetti a forma di duna: croccanti di zucchero (e di sabbia).' }
    ]
  },
  glacier: {
    stand: 'RIFUGIO STELLA ALPINA',
    place: 'BAITA', ofPlace: 'DELLA BAITA', fromPlace: 'DA QUESTA BAITA',
    sign: 'BAITA DEL RIFUGIO\nSOSTA OBBLIGATA',
    standTex: 'hut',
    cook: '"Benvenuto in quota! Tre specialita\' della casa. Una ti rimette al mondo... le altre ti ci mandano."',
    palette: { bg: 0x9a6a3a, plank: 0x7a4a24, shelf: 0x4a2a10, counter: 0x5a3416, counterTop: 0x7a4a24, counterLine: 0x3a2008 },
    dishes: [
      { tex: 'food_cioccolata', what: 'NELLA CIOCCOLATA', name: 'CIOCCOLATA CALDA DEL RIFUGIO', text: 'Densa come una riunione di tre ore. Con panna.' },
      { tex: 'food_grappa', what: 'NELLA GRAPPA', name: 'GRAPPA AL PINO MUGO', text: 'Distillata dal nonno in cantina. Gradazione: riservata.' },
      { tex: 'food_fonduta', what: 'NELLA FONDUTA', name: 'FONDUTA DELLO YETI', text: 'Formaggio fuso di provenienza misteriosa. Filante.' }
    ]
  },
  sea: {
    stand: 'IL PALOMBARO',
    place: 'SUSHI BAR', ofPlace: 'DEL SUSHI BAR', fromPlace: 'DA QUESTO SUSHI BAR',
    sign: 'SUSHI BAR\nSOSTA OBBLIGATA',
    standTex: 'reef_bar',
    cook: '"Pesce freschissimo: e\' ancora qui intorno! Tre piatti del giorno... di quale giorno, non chiedere."',
    palette: { bg: 0x2a5a7a, plank: 0x1f4a66, shelf: 0x0f2a40, counter: 0x3a6a5a, counterTop: 0x4a8a7a, counterLine: 0x1a3a30 },
    dishes: [
      { tex: 'food_sushi', what: 'NEL SUSHI', name: 'NIGIRI DEL FONDALE', text: 'Pescato a mano, servito in apnea.' },
      { tex: 'food_alghe', what: 'NELLE ALGHE', name: 'INSALATA DI ALGHE', text: 'Raccolte fresche dalla scogliera qui fuori.' },
      { tex: 'food_paranza', what: 'NELLA FRITTURA', name: 'FRITTURA DI PARANZA', text: 'Fritta sott\'acqua. Nessuno sa come.' }
    ]
  }
};
export const FOOD_OUTCOMES = {
  good: { hp: 30, stress: -15, time: 0 },
  trip: { hp: 0, stress: 20, time: -5 },
  toxic: { hp: -20, stress: 10, time: -5 }
};

// Rental kiosk of each ground leg (RentalScene, TripLevel.kiosk). type = Player MOUNTS key,
// dx = where the mount is parked next to the kiosk, msg = extra line when rented.
export const RENTALS = {
  desert: {
    title: 'Noleggio Mezzi del Deserto',
    text: '"Salve viaggiatore! L\'ufficio del cliente e\' ancora lontano. Cosa noleggia?"',
    onFoot: 'controvento...',
    options: [
      { type: 'camel', label: 'DROMEDARIO', note: 'non teme vento e cactus, salta alto', dx: -90 },
      { type: 'moto', label: 'MOTO', note: 'velocissima, ma se urti un cactus cadi', dx: 70 },
      { type: 'taxi', label: 'TAXI', note: `protetto, ma tassametro ${TAXI_METER} €/s`, dx: 130, msg: `TASSAMETRO: ${TAXI_METER} €/s` }
    ]
  },
  glacier: {
    title: 'Noleggio Mezzi della Neve',
    text: '"Benvenuto sul ghiacciaio! Il cliente e\' oltre la bufera. Con cosa ci arriva?"',
    onFoot: 'si scivola parecchio...',
    options: [
      { type: 'husky', label: 'SLITTA CON HUSKY', note: 'non scivola, ma gli husky partono da soli', dx: -100, msg: 'GLI HUSKY ADORANO I PINGUINI!' },
      { type: 'snowmobile', label: 'MOTOSLITTA', note: `veloce, carburante ${FUEL_METER} €/s`, dx: 70, msg: `CARBURANTE: ${FUEL_METER} €/s` },
      { type: 'skis', label: 'SCI', note: 'velocissimi, ma senza freni', dx: 130, msg: 'ATTENZIONE: NIENTE FRENI!' }
    ]
  },
  sea: {
    title: 'Noleggio Mezzi Subacquei',
    text: '"Benvenuto negli abissi! L\'ufficio del cliente e\' oltre le correnti. Come ci arriva?"',
    foot: 'PROSEGUO A NUOTO (gratis)',
    footMsg: 'PROSEGUI A NUOTO...',
    onFoot: 'lento, e le correnti spingono',
    options: [
      { type: 'submarine', label: 'SOTTOMARINO', note: `sali e scendi con SU/GIU', batteria ${BATTERY_METER} €/s`, dx: -100, msg: `SU/GIU' PER SALIRE E SCENDERE\nBATTERIA: ${BATTERY_METER} €/s` },
      { type: 'fins', label: 'PINNE E MASCHERA', note: 'nuoti veloce, ma nessuna protezione', dx: 60, msg: 'BRACCIATE DA CAMPIONE!' },
      { type: 'seahorse', label: 'CAVALLUCCIO MARINO', note: 'immune alle meduse, ma ogni tanto torna indietro', dx: 110, msg: 'NON TEME LE MEDUSE, MA HA PAURA DEGLI SQUALI!' }
    ]
  }
};
