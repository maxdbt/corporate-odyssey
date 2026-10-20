import Phaser from 'phaser';

// Situational quizzes (GDD section 5). Effects use the GameScene.applyEffects() keys.

export const QUIZZES = {
  1: {
    title: 'IL VENERDI\' SERA ALLE 18:30',
    question: 'Il capo ti scrive "Ti rubo solo un minuto".\nCosa fai?',
    choices: [
      {
        label: 'Rispondi subito.',
        effects: { stress: 40, euro: 20 },
        outcome: 'Il "minuto" dura due ore...\nSTRESS +40%   BONUS +20 EUR'
      },
      {
        label: 'Fingi che sia saltata la connessione.',
        effects: { stressSet: 0, vacationDays: -1 },
        outcome: 'Nessuno sospetta nulla, ma devi recuperare.\nSTRESS AZZERATO   -1 GIORNO DI FERIE'
      },
      {
        label: 'Spegni il PC e scappi.',
        effects: { hp: 20, nextLevelEnemySpeed: 1.15 },
        outcome: 'Libertà! Ma lunedì saranno tutti più nervosi.\nSALUTE MENTALE +20%\nNEMICI DEL PROSSIMO LIVELLO +15% VELOCI'
      }
    ]
  },
  2: {
    title: 'LA MACCHINA DEL CAFFE\'',
    question: 'Il collega logorroico ti blocca\nper parlarti del suo weekend.',
    choices: [
      {
        label: 'Ascolti per educazione.',
        effects: { stress: 25, timer: -10 },
        outcome: '...e poi il cugino del cognato...\nSTRESS +25%   -10 SECONDI SUL TIMER'
      },
      {
        label: 'Fingi una chiamata sul telefono.',
        effects: { stress: 5, tickets: -1 },
        outcome: 'Scappi, ma ti cade un buono pasto.\nSTRESS +5%   -1 BUONO PASTO'
      },
      {
        label: 'Gli versi il caffè caldo sui piedi.',
        effects: { stress: -10, colleaguesHostile: true },
        outcome: 'Che soddisfazione... ma ora ti odiano tutti.\nSTRESS -10%\nI COLLEGHI TI ATTACCANO A VISTA!'
      }
    ]
  },
  3: {
    title: 'IL BUG IN PRODUZIONE',
    question: 'C\'è un bug critico in produzione\na 10 minuti dal rilascio.',
    choices: [
      {
        label: 'Fai un fix veloce senza testare.',
        effects: { spawnBugs: 3 },
        outcome: 'Il fix ha generato altri bug!\n+3 NEMICI "BUG DI SISTEMA"'
      },
      {
        label: 'Chiedi aiuto al team.',
        effects: { stress: 10, weapon: 'www' },
        outcome: 'Insieme si vince!\nSTRESS +10%   ATTACCO CODICE/WWW ATTIVO'
      },
      {
        label: 'Dai la colpa al reparto IT.',
        effects: { hp: -15, promotion: 5 },
        outcome: 'Funziona... ma la coscienza pesa.\nSALUTE MENTALE -15%\nPROMOZIONE (INVINCIBILITA\') PER 5 SECONDI'
      }
    ]
  },
  4: {
    title: 'LA RIUNIONE DELLE 9:00',
    question: 'Una call "veloce" di allineamento\nsenza agenda. Sei il decimo invitato.',
    choices: [
      {
        label: 'Partecipi con la telecamera accesa.',
        effects: { stress: 30, euro: 15 },
        outcome: 'Annuisci per un\'ora intera.\nSTRESS +30%   BONUS +15 EUR'
      },
      {
        label: 'Entri, muto, e fai altro.',
        effects: { stress: 5, timer: -15 },
        outcome: 'Ti chiamano per nome. Panico.\nSTRESS +5%   -15 SECONDI SUL TIMER'
      },
      {
        label: 'Rifiuti: "Mandatemi un recap".',
        effects: { hp: 15, nextLevelEnemySpeed: 1.1 },
        outcome: 'Il recap non arriverà mai.\nSALUTE MENTALE +15%\nNEMICI DEL PROSSIMO LIVELLO +10% VELOCI'
      }
    ]
  },
  5: {
    title: 'RISPONDI A TUTTI',
    question: 'Qualcuno ha risposto a tutti\nsu una mail inviata a 3000 persone.',
    choices: [
      {
        label: 'Rispondi a tutti: "Toglietemi!".',
        effects: { stress: 20, spawnBugs: 2 },
        outcome: 'Anche tu fai parte del problema ora.\nSTRESS +20%   +2 NEMICI "BUG DI SISTEMA"'
      },
      {
        label: 'Crei una regola che archivia tutto.',
        effects: { stress: -15, weapon: 'email' },
        outcome: 'Pace interiore. Inbox Zero.\nSTRESS -15%   ATTACCO E-MAIL ATTIVO'
      },
      {
        label: 'Ti metti a leggerle tutte.',
        effects: { hp: -10, euro: 10 },
        outcome: 'Hai scoperto tre pettegolezzi utili.\nSALUTE MENTALE -10%   BONUS +10 EUR'
      }
    ]
  },
  6: {
    title: 'LA PAUSA PRANZO',
    question: 'Sono le 13:00. Il tuo capo\nti chiede "Hai un attimo?".',
    choices: [
      {
        label: 'Salti il pranzo.',
        effects: { hp: -20, euro: 25 },
        outcome: 'Lo stomaco brontola, il conto no.\nSALUTE MENTALE -20%   BONUS +25 EUR'
      },
      {
        label: 'Mangi davanti al PC.',
        effects: { stress: 15, tickets: 1 },
        outcome: 'Briciole nella tastiera per sempre.\nSTRESS +15%   +1 BUONO PASTO'
      },
      {
        label: '"Sono già in mensa!" e scappi.',
        effects: { stressSet: 0, colleaguesHostile: true },
        outcome: 'Hai preso l\'ultima lasagna.\nSTRESS AZZERATO\nI COLLEGHI TI ATTACCANO A VISTA!'
      }
    ]
  },
  7: {
    title: 'IL BADGE NON FUNZIONA',
    question: 'Sono le 8:59, il tornello\nnon legge il tuo badge.',
    choices: [
      {
        label: 'Scavalchi il tornello.',
        effects: { hp: 10, nextLevelEnemySpeed: 1.15 },
        outcome: 'Agile! Ma la sicurezza ti osserva.\nSALUTE MENTALE +10%\nNEMICI DEL PROSSIMO LIVELLO +15% VELOCI'
      },
      {
        label: 'Chiami la reception.',
        effects: { stress: 20, timer: -20 },
        outcome: 'Musica d\'attesa per 20 minuti.\nSTRESS +20%   -20 SECONDI SUL TIMER'
      },
      {
        label: 'Torni a casa: smart working!',
        effects: { stress: -20, vacationDays: -1 },
        outcome: 'Il divano ti accoglie.\nSTRESS -20%   -1 GIORNO DI FERIE'
      }
    ]
  },
  8: {
    title: 'LA STAMPANTE INCEPPATA',
    question: 'Devi stampare il contratto.\nLa stampante dice "PC LOAD LETTER".',
    choices: [
      {
        label: 'La prendi a calci.',
        effects: { stress: -15, spawnBugs: 2 },
        outcome: 'Liberatorio. Ma ora è posseduta.\nSTRESS -15%   +2 NEMICI "BUG DI SISTEMA"'
      },
      {
        label: 'Apri un ticket all\'IT.',
        effects: { stress: 10, weapon: 'teams' },
        outcome: 'L\'IT ti scrive su Teams. Ora sai come fare.\nSTRESS +10%   ATTACCO TEAMS ATTIVO'
      },
      {
        label: 'Firmi tutto in digitale.',
        effects: { euro: 15, hp: -5 },
        outcome: 'Hai salvato un albero e il contratto.\nBONUS +15 EUR   SALUTE MENTALE -5%'
      }
    ]
  },
  9: {
    title: 'IL COMPLEANNO IN UFFICIO',
    question: 'Raccolta soldi per il regalo\na un collega che non conosci.',
    choices: [
      {
        label: 'Metti 20 euro.',
        effects: { euro: -20, hp: 15 },
        outcome: 'Torta gratis e sorrisi.\n-20 EUR   SALUTE MENTALE +15%'
      },
      {
        label: 'Fingi di aver già dato.',
        effects: { stress: 15, tickets: 1 },
        outcome: 'Il senso di colpa ti segue.\nSTRESS +15%   +1 BUONO PASTO RISPARMIATO'
      },
      {
        label: 'Ti mangi metà torta.',
        effects: { hp: 25, colleaguesHostile: true },
        outcome: 'Delizioso. Imperdonabile.\nSALUTE MENTALE +25%\nI COLLEGHI TI ATTACCANO A VISTA!'
      }
    ]
  },
  10: {
    title: 'LA VALUTAZIONE ANNUALE',
    question: 'Il capo ti chiede di autovalutarti\nda 1 a 10.',
    choices: [
      {
        label: 'Ti dai 10.',
        effects: { stress: 25, promotion: 4 },
        outcome: 'Coraggioso. Ti credono, per ora.\nSTRESS +25%\nPROMOZIONE (INVINCIBILITA\') PER 4 SECONDI'
      },
      {
        label: 'Ti dai 7, onesto.',
        effects: { euro: 10, stress: 5 },
        outcome: '"Margini di miglioramento".\nBONUS +10 EUR   STRESS +5%'
      },
      {
        label: 'Ti dai 3, per umiltà.',
        effects: { hp: -15, vacationDays: 1 },
        outcome: 'Ti mandano in ferie a "ricaricarti".\nSALUTE MENTALE -15%   +1 GIORNO DI FERIE'
      }
    ]
  },
  11: {
    title: 'IL PROGETTO URGENTISSIMO',
    question: 'Ti arriva un progetto "per ieri"\nalle 17:55.',
    choices: [
      {
        label: 'Resti fino a mezzanotte.',
        effects: { stress: 45, euro: 30 },
        outcome: 'Consegnato. Nessuno lo aprirà.\nSTRESS +45%   BONUS +30 EUR'
      },
      {
        label: 'Lo deleghi allo stagista.',
        effects: { stress: -10, spawnBugs: 3 },
        outcome: 'Lo stagista ha fatto del suo meglio...\nSTRESS -10%   +3 NEMICI "BUG DI SISTEMA"'
      },
      {
        label: '"Ci guardo domattina".',
        effects: { hp: 15, timer: -15 },
        outcome: 'Domattina arriva prima del previsto.\nSALUTE MENTALE +15%   -15 SECONDI SUL TIMER'
      }
    ]
  },
  12: {
    title: 'IL WI-FI E\' CADUTO',
    question: 'Tutto l\'ufficio è offline.\nI colleghi vagano senza meta.',
    choices: [
      {
        label: 'Usi l\'hotspot del telefono.',
        effects: { euro: -10, weapon: 'www' },
        outcome: 'Giga finiti, ma sei operativo.\n-10 EUR   ATTACCO CODICE/WWW ATTIVO'
      },
      {
        label: 'Vai a prendere un caffè.',
        effects: { stress: -20, weapon: 'coffee' },
        outcome: 'Il caffè cura tutto.\nSTRESS -20%   ATTACCO CAFFE\' ATTIVO'
      },
      {
        label: 'Riavvii il router di nascosto.',
        effects: { hp: 10, nextLevelEnemySpeed: 1.1 },
        outcome: 'Eroe anonimo. Ma l\'IT indaga.\nSALUTE MENTALE +10%\nNEMICI DEL PROSSIMO LIVELLO +10% VELOCI'
      }
    ]
  },
  13: {
    title: 'IL TEAM BUILDING',
    question: 'Sabato obbligatorio di rafting\n"per fare squadra".',
    choices: [
      {
        label: 'Partecipi con entusiasmo.',
        effects: { stress: 20, hp: 10 },
        outcome: 'Sei caduto in acqua tre volte.\nSTRESS +20%   SALUTE MENTALE +10%'
      },
      {
        label: 'Ti inventi un matrimonio.',
        effects: { stressSet: 0, vacationDays: -1 },
        outcome: 'Auguri agli sposi immaginari!\nSTRESS AZZERATO   -1 GIORNO DI FERIE'
      },
      {
        label: 'Organizzi tu, ma in pizzeria.',
        effects: { euro: -15, promotion: 5 },
        outcome: 'Sei il nuovo idolo del piano.\n-15 EUR\nPROMOZIONE (INVINCIBILITA\') PER 5 SECONDI'
      }
    ]
  },
  14: {
    title: 'L\'ORARIO DI USCITA',
    question: 'Sono le 18:00. Il capo è ancora\nalla scrivania e ti guarda.',
    choices: [
      {
        label: 'Resti finché non esce lui.',
        effects: { stress: 30, euro: 10 },
        outcome: 'Esce alle 21. Era su YouTube.\nSTRESS +30%   BONUS +10 EUR'
      },
      {
        label: 'Lasci la giacca sulla sedia ed esci.',
        effects: { hp: 20, timer: -10 },
        outcome: 'Il trucco più vecchio del mondo.\nSALUTE MENTALE +20%   -10 SECONDI SUL TIMER'
      },
      {
        label: 'Saluti ad alta voce: "Buona serata!".',
        effects: { stress: -10, colleaguesHostile: true },
        outcome: 'Tutti si girano. Nessuno ricambia.\nSTRESS -10%\nI COLLEGHI TI ATTACCANO A VISTA!'
      }
    ]
  },
  15: {
    title: 'IL FILE EXCEL CONDIVISO',
    question: 'Qualcuno ha cancellato le tue formule\nnel file "DEFINITIVO_v7_OK".',
    choices: [
      {
        label: 'Ripristini la versione precedente.',
        effects: { stress: 10, weapon: 'clock' },
        outcome: 'Hai riavvolto il tempo!\nSTRESS +10%   ATTACCO OROLOGIO ATTIVO'
      },
      {
        label: 'Rifai tutto a mano.',
        effects: { hp: -20, euro: 20 },
        outcome: 'Tre ore di CERCA.VERT.\nSALUTE MENTALE -20%   BONUS +20 EUR'
      },
      {
        label: 'Blocchi il file con password.',
        effects: { stress: -15, spawnBugs: 2 },
        outcome: 'Nessuno può più lavorare. Nemmeno tu.\nSTRESS -15%   +2 NEMICI "BUG DI SISTEMA"'
      }
    ]
  },
  16: {
    title: 'IL MICROONDE IN MENSA',
    question: 'Fila di 12 persone al microonde.\nIl tuo pranzo si raffredda.',
    choices: [
      {
        label: 'Aspetti il tuo turno.',
        effects: { timer: -15, hp: 10 },
        outcome: 'Pazienza zen raggiunta.\n-15 SECONDI SUL TIMER   SALUTE MENTALE +10%'
      },
      {
        label: 'Mangi freddo.',
        effects: { stress: 15, tickets: 1 },
        outcome: 'Pasta fredda: è quasi un\'insalata.\nSTRESS +15%   +1 BUONO PASTO'
      },
      {
        label: 'Scaldi il pesce e te ne vai.',
        effects: { stressSet: 0, colleaguesHostile: true },
        outcome: 'L\'odore resterà per settimane.\nSTRESS AZZERATO\nI COLLEGHI TI ATTACCANO A VISTA!'
      }
    ]
  },
  17: {
    title: 'IL CLIENTE AL TELEFONO',
    question: 'Il cliente chiama per la quinta volta\n"solo per una piccola modifica".',
    choices: [
      {
        label: 'Accetti, sorridendo.',
        effects: { stress: 35, euro: 25 },
        outcome: 'La modifica era rifare tutto.\nSTRESS +35%   BONUS +25 EUR'
      },
      {
        label: 'Gli mandi il preventivo.',
        effects: { euro: 15, nextLevelEnemySpeed: 1.15 },
        outcome: 'Ha pagato. Ed è furioso.\nBONUS +15 EUR\nNEMICI DEL PROSSIMO LIVELLO +15% VELOCI'
      },
      {
        label: 'Fingi di essere la segreteria.',
        effects: { stress: -10, hp: -5 },
        outcome: '"Biiip. Lasciate un messaggio".\nSTRESS -10%   SALUTE MENTALE -5%'
      }
    ]
  },
  18: {
    title: 'L\'AGGIORNAMENTO DI WINDOWS',
    question: 'Il PC si riavvia da solo:\n"Aggiornamento 1 di 47".',
    choices: [
      {
        label: 'Aspetti fissando lo schermo.',
        effects: { timer: -20, stress: -10 },
        outcome: 'Quasi meditazione.\n-20 SECONDI SUL TIMER   STRESS -10%'
      },
      {
        label: 'Prendi il portatile del collega.',
        effects: { weapon: 'teams', colleaguesHostile: true },
        outcome: 'Funziona! Lui non è d\'accordo.\nATTACCO TEAMS ATTIVO\nI COLLEGHI TI ATTACCANO A VISTA!'
      },
      {
        label: 'Stacchi la spina.',
        effects: { hp: 10, spawnBugs: 3 },
        outcome: 'Il sistema non l\'ha presa bene.\nSALUTE MENTALE +10%   +3 NEMICI "BUG DI SISTEMA"'
      }
    ]
  }
};

export const QUIZ_IDS = Object.keys(QUIZZES).map(Number);

// Shuffled deck: each terminal shows a different quiz, no repeats until all have been seen.
let deck = [];
let lastId = null;
export function nextQuizId() {
  if (!deck.length) {
    deck = Phaser.Utils.Array.Shuffle([...QUIZ_IDS]);
    if (deck.length > 1 && deck[deck.length - 1] === lastId) deck.unshift(deck.pop());
  }
  lastId = deck.pop();
  return lastId;
}
