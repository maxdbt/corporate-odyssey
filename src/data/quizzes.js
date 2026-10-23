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
  },
  // ---- Trasferta: desert (level4_desert quizSetting)
  19: {
    setting: 'desert',
    title: 'IL MIRAGGIO',
    question: 'All\'orizzonte compare un ufficio climatizzato\ncon tanto di distributore d\'acqua.',
    choices: [
      {
        label: 'Corri verso l\'ufficio.',
        effects: { stress: 15, timer: -15 },
        outcome: 'Era un miraggio. Sabbia, e ancora sabbia.\nSTRESS +15%   -15 SECONDI SUL TIMER'
      },
      {
        label: 'Bevi un sorso e prosegui.',
        effects: { hp: 15 },
        outcome: 'Idratazione prima di tutto.\nSALUTE MENTALE +15%'
      },
      {
        label: 'Scrivi al capo se lo vede anche lui.',
        effects: { stress: 10, timer: -5 },
        outcome: '"Mettiamo una call per approfondire."\nSTRESS +10%   -5 SECONDI SUL TIMER'
      }
    ]
  },
  20: {
    setting: 'desert',
    title: 'LA TEMPESTA DI SABBIA',
    question: 'Si alza una tempesta di sabbia\nproprio durante la call con il cliente.',
    choices: [
      {
        label: 'Ti ripari dietro una duna e aspetti.',
        effects: { stress: -10, timer: -10 },
        outcome: 'Tempesta passata, nervi salvi.\nSTRESS -10%   -10 SECONDI SUL TIMER'
      },
      {
        label: 'Continui la call urlando.',
        effects: { stress: 20, euro: 20 },
        outcome: 'Il cliente apprezza la grinta.\nSTRESS +20%   BONUS +20 EUR'
      },
      {
        label: '"Ti perdo... c\'e\' sabbia nel microfono!"',
        effects: { hp: 15, nextLevelEnemySpeed: 1.1 },
        outcome: 'Call chiusa. Ma il cliente ti aspetta agguerrito.\nSALUTE MENTALE +15%\nNEMICI DEL PROSSIMO LIVELLO +10% VELOCI'
      }
    ]
  },
  21: {
    setting: 'desert',
    title: 'IL MERCANTE DI TAPPETI',
    question: 'Un mercante ti offre un tappeto volante\n"usato pochissimo, prezzo speciale".',
    choices: [
      {
        label: 'Lo compri al volo.',
        effects: { euro: -20, timer: 20 },
        outcome: 'Vola davvero! Per un po\'.\n-20 EUR   +20 SECONDI SUL TIMER'
      },
      {
        label: 'Contratti per un\'ora.',
        effects: { hp: 10, timer: -15 },
        outcome: 'Niente tappeto, ma ti regala un te\' alla menta.\nSALUTE MENTALE +10%   -15 SECONDI SUL TIMER'
      },
      {
        label: 'Rifiuti educatamente.',
        effects: { stress: 5 },
        outcome: 'Ti segue per due chilometri: "prezzo speciale!"\nSTRESS +5%'
      }
    ]
  },
  // ---- Trasferta: glacier (level4_glacier quizSetting)
  22: {
    setting: 'glacier',
    title: 'LO YETI',
    question: 'Uno yeti ti blocca il sentiero\ne ti chiede di compilare un modulo.',
    choices: [
      {
        label: 'Compili il modulo in triplice copia.',
        effects: { hp: 10, timer: -15 },
        outcome: 'Lo yeti approva. La burocrazia funziona anche qui.\nSALUTE MENTALE +10%   -15 SECONDI SUL TIMER'
      },
      {
        label: 'Gli proponi una call la settimana prossima.',
        effects: { stress: -10 },
        outcome: 'Lo yeti accetta e sparisce nella nebbia.\nSTRESS -10%'
      },
      {
        label: 'Scappi scivolando sul ghiaccio.',
        effects: { stress: 15, timer: 10 },
        outcome: 'Fuga a tutta velocita\'. Il cuore un po\' meno.\nSTRESS +15%   +10 SECONDI SUL TIMER'
      }
    ]
  },
  23: {
    setting: 'glacier',
    title: 'LA SEGGIOVIA FERMA',
    question: 'La seggiovia si blocca a trenta metri d\'altezza.\nIl telefono, purtroppo, ha campo.',
    choices: [
      {
        label: 'Ne approfitti per svuotare la casella email.',
        effects: { stress: 10, euro: 20 },
        outcome: 'Inbox zero a trenta metri d\'altezza.\nSTRESS +10%   BONUS +20 EUR'
      },
      {
        label: 'Ti godi il panorama.',
        effects: { hp: 15, timer: -10 },
        outcome: 'Silenzio, montagne, nessuna notifica.\nSALUTE MENTALE +15%   -10 SECONDI SUL TIMER'
      },
      {
        label: 'Chiami il capo per sfogarti.',
        effects: { stress: 15, nextLevelEnemySpeed: 1.1 },
        outcome: '"Visto che hai tempo, ti giro tre task."\nSTRESS +15%\nNEMICI DEL PROSSIMO LIVELLO +10% VELOCI'
      }
    ]
  },
  24: {
    setting: 'glacier',
    title: 'IL SAN BERNARDO',
    question: 'Un San Bernardo ti porta la botticella.\nDentro c\'e\' una chiavetta USB.',
    choices: [
      {
        label: 'La infili subito nel portatile.',
        effects: { stress: 20, timer: -10 },
        outcome: 'Era il report del cliente. Da rifare.\nSTRESS +20%   -10 SECONDI SUL TIMER'
      },
      {
        label: 'Accarezzi il cane e basta.',
        effects: { hp: 15 },
        outcome: 'Il San Bernardo scodinzola. Ti senti meglio.\nSALUTE MENTALE +15%'
      },
      {
        label: 'La giri all\'IT con un ticket.',
        effects: { stress: -5, timer: -5 },
        outcome: 'Ticket aperto. Risposta prevista: primavera.\nSTRESS -5%   -5 SECONDI SUL TIMER'
      }
    ]
  },
  // ---- Trasferta: sea (level4_sea quizSetting)
  25: {
    setting: 'sea',
    title: 'IL PALOMBARO',
    question: 'Un palombaro ti consegna un contratto fradicio.\nL\'inchiostro sta colando.',
    choices: [
      {
        label: 'Firmi lo stesso, a occhio.',
        effects: { stress: 10, euro: 20 },
        outcome: 'Hai firmato qualcosa. Forse un bonus.\nSTRESS +10%   BONUS +20 EUR'
      },
      {
        label: 'Chiedi una copia digitale.',
        effects: { timer: -15, hp: 10 },
        outcome: 'Arriva in PDF... impermeabile.\nSALUTE MENTALE +10%   -15 SECONDI SUL TIMER'
      },
      {
        label: 'Lo usi come aereoplanino subacqueo.',
        effects: { stress: -10, colleaguesHostile: true },
        outcome: 'Divertente. L\'ufficio legale non la pensa cosi\'.\nSTRESS -10%   COLLEGHI OSTILI'
      }
    ]
  },
  26: {
    setting: 'sea',
    title: 'LA CALL SUBACQUEA',
    question: 'Il capo ti chiama in video.\nSei a venti metri di profondita\'.',
    choices: [
      {
        label: 'Rispondi: "Si sente? Blub."',
        effects: { stress: 15, timer: 10 },
        outcome: '"Sei in acquario? Va bene, facciamo veloce."\nSTRESS +15%   +10 SECONDI SUL TIMER'
      },
      {
        label: 'Metti lo sfondo virtuale dell\'ufficio.',
        effects: { stress: -5, timer: -10 },
        outcome: 'Un pesce palla attraversa lo sfondo. Nessuno commenta.\nSTRESS -5%   -10 SECONDI SUL TIMER'
      },
      {
        label: 'Non rispondi: qui sotto non c\'e\' campo.',
        effects: { hp: 15, nextLevelEnemySpeed: 1.1 },
        outcome: 'Pace assoluta. Il capo prende nota.\nSALUTE MENTALE +15%\nNEMICI DEL PROSSIMO LIVELLO +10% VELOCI'
      }
    ]
  },
  27: {
    setting: 'sea',
    title: 'IL BANCO DI SARDINE',
    question: 'Un banco di sardine si muove compatto.\nSembra il reparto marketing.',
    choices: [
      {
        label: 'Ti unisci al banco.',
        effects: { timer: 15, stress: 10 },
        outcome: 'Vai dove vanno tutti. Velocissimo, ma senza idee.\nSTRESS +10%   +15 SECONDI SUL TIMER'
      },
      {
        label: 'Proponi un brainstorming.',
        effects: { stress: -10 },
        outcome: 'Le sardine annuiscono tutte insieme.\nSTRESS -10%'
      },
      {
        label: 'Le aspetti passare.',
        effects: { hp: 10, timer: -10 },
        outcome: 'Ci vogliono dieci minuti. Ma che spettacolo.\nSALUTE MENTALE +10%   -10 SECONDI SUL TIMER'
      }
    ]
  }
};

export const QUIZ_IDS = Object.keys(QUIZZES).map(Number);

// Shuffled deck per setting (level.quizSetting, default 'office'): each terminal shows a different quiz
// that fits the place, no repeats until all of that setting have been seen.
const decks = {};
const lastIds = {};
export function nextQuizId(setting = 'office') {
  const ids = QUIZ_IDS.filter((id) => (QUIZZES[id].setting || 'office') === setting);
  if (!ids.length) return nextQuizId('office');
  let deck = decks[setting];
  if (!deck?.length) {
    deck = decks[setting] = Phaser.Utils.Array.Shuffle([...ids]);
    if (deck.length > 1 && deck[deck.length - 1] === lastIds[setting]) deck.unshift(deck.pop());
  }
  lastIds[setting] = deck.pop();
  return lastIds[setting];
}
