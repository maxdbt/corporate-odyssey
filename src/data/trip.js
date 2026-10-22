// Mondo 4 "La Trasferta": suitcase items, transport, prices.

export const SUITCASE_SIZE = 10;

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
  { id: 'swimsuit', label: 'COSTUME' }
];

export const itemLabel = (item, character) =>
  (typeof item.label === 'string' ? item.label : item.label[character] || item.label.man);

export const itemById = (id) => TRIP_ITEMS.find((i) => i.id === id);

// Forgetting these is reported by the suitcase check.
export const ESSENTIALS = ['laptop', 'phone', 'charger', 'toothbrush', 'underwear'];

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
  thief: 40            // stolen by the pickpocket
};
export const TAXI_METER = 1;

// Leftover budget is converted into euro bonus at the end of the trip.
export const BUDGET_TO_EURO = 0.25;

// Food stand menus of the ground legs (FoodScene): one dish is good, one hallucinogenic, one toxic,
// shuffled every time. tex = dish texture generated in gfx/trip.js.
export const FOOD_PRICE = 10;
export const FOOD_MENUS = {
  desert: {
    stand: 'OASI DEL GUSTO',
    cook: '"Benvenuto, viaggiatore! Specialita\' locali. Una e\' squisita... le altre, beh, sono tradizionali."',
    dishes: [
      { tex: 'food_panino', what: 'NEL PANINO', name: 'PANINO ALLA SALSA DI CAMMELLO', text: 'Pane azzimo e una salsa di cui e\' meglio non chiedere la ricetta.' },
      { tex: 'food_cannelloni', what: 'NEI CANNELLONI', name: 'CANNELLONI ALLA SAHARIANA', text: 'Ripieni di cous cous piccante. Si spera.' },
      { tex: 'food_dunette', what: 'NELLE DUNETTE', name: 'DUNETTE DELIZIOSE', text: 'Dolcetti a forma di duna: croccanti di zucchero (e di sabbia).' }
    ]
  }
};
export const FOOD_OUTCOMES = {
  good: { hp: 30, stress: -15, time: 0 },
  trip: { hp: 0, stress: 20, time: -5 },
  toxic: { hp: -20, stress: 10, time: -5 }
};
