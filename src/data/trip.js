// Mondo 4 "La Trasferta": suitcase items, transport, prices.

export const SUITCASE_SIZE = 6;

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
export const DEFAULT_SUITCASE = ['laptop', 'phone', 'charger', 'toothbrush', 'underwear', 'idcard'];

export const TRANSPORT = {
  train: { label: 'TRENO', budget: 300, timeBonus: 0 },
  plane: { label: 'AEREO', budget: 180, timeBonus: 60 }   // faster: extra seconds on the ground leg
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
