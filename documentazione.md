# Documentazione Software Gestione Turni

## Introduzione

Il Software Gestione Turni è un'applicazione completa per la gestione dei turni di lavoro in diverse strutture. L'applicazione supporta la gestione di più ambienti indipendenti (es. "Turni Pronto Soccorso", "Turni Reparto", "Turni Vaticano"), ognuno con la propria configurazione personalizzata di box/postazioni, tipi di turno e personale.

## Funzionalità principali

### Gestione multi-ambiente

- **Creazione e configurazione di ambienti**: Possibilità di creare più ambienti indipendenti, ognuno con le proprie configurazioni.
- **Personalizzazione per ambiente**: Ogni ambiente può avere il proprio set di box/postazioni e tipi di turno con orari specifici.
- **Selezione ambiente**: Selettore di ambiente nel menu principale per passare facilmente da un ambiente all'altro.
- **Indipendenza tra ambienti**: Ogni ambiente ha i propri medici, disponibilità e impostazioni.

### Gestione medici

- **Anagrafica medici**: Gestione completa dei dati anagrafici dei medici.
- **Competenze per box**: Configurazione delle competenze dei medici per i box specifici dell'ambiente selezionato.
- **Priorità**: Impostazione della priorità (alta/bassa) per ogni medico.
- **Monte ore**: Configurazione del monte ore mensile per ogni medico.
- **Ore fisse**: Possibilità di impostare un numero di ore fisse mensili per i medici.

### Gestione disponibilità

- **Disponibilità mensile**: Gestione delle disponibilità su base mensile (non settimanale).
- **Tipi di turno supportati**: Supporto per tutti i tipi di turno (M, P, MP, N, MN, PN, MPN).
- **Disponibilità combinate**: Le disponibilità combinate (es. MN) indicano che il medico è disponibile per entrambi i turni singoli.

### Gestione turni fissi

- **Sequenze personalizzate**: Configurazione di sequenze di turni fissi personalizzate per ogni medico.
- **Data di inizio**: Impostazione della data di inizio della sequenza di turni fissi.

### Generazione automatica turni

- **Rispetto dei vincoli**: Generazione automatica dei turni rispettando i vincoli (max 12 ore consecutive, smonto dopo notte).
- **Copertura personalizzabile**: Configurazione dei requisiti di copertura per ogni box e fascia oraria.
- **Ottimizzazione**: Algoritmi di ottimizzazione per la distribuzione equa dei turni.

### Gestione ferie e permessi

- **Ferie**: Gestione delle ferie dei medici.
- **Permessi 104**: Gestione dei permessi 104.
- **Altri permessi**: Gestione di altri tipi di permessi.
- **Conteggio ore**: Conteggio automatico delle ore di ferie e permessi (6 ore al giorno).

### Visualizzazione turni

- **Vista per medico**: Visualizzazione dei turni con i medici in riga e i giorni in colonna.
- **Colori per box**: Box evidenziati da colori diversi (Box 1, Box 2, Box 3).
- **Turni multipli box**: Visualizzazione speciale (colore viola) quando un medico lavora in più box nello stesso giorno.
- **Tooltip informativi**: Tooltip che mostrano in quali box il medico sta lavorando.

### Altre funzionalità

- **Salvataggio automatico**: Salvataggio automatico dei dati ad ogni cambio di schermata.
- **Esportazione in Excel**: Possibilità di esportare i turni in formato Excel.
- **Riepilogo ore**: Visualizzazione del riepilogo delle ore lavorate per ogni medico.

## Architettura del sistema

### Frontend

- **Framework**: React con Material UI per l'interfaccia utente.
- **Gestione stato**: Utilizzo di React Hooks e Context API per la gestione dello stato.
- **Routing**: React Router per la navigazione tra le pagine.
- **Comunicazione API**: Axios per le chiamate API al backend.
- **Persistenza locale**: LocalStorage per la persistenza dei dati locali.

### Backend

- **Framework**: Node.js con Express per il server.
- **Database**: Sequelize ORM per PostgreSQL.
- **API RESTful**: API RESTful per la comunicazione con il frontend.
- **Autenticazione**: JWT per l'autenticazione degli utenti.

## Modelli dati

### Ambiente

```javascript
{
  id: String,
  nome: String,
  descrizione: String,
  box: [
    {
      nome: String,
      colore: String
    }
  ],
  tipiTurno: [
    {
      codice: String,
      descrizione: String,
      oraInizio: String,
      oraFine: String,
      colore: String
    }
  ],
  requisitiCopertura: [
    {
      box: String,
      fasce: [
        {
          oraInizio: String,
          oraFine: String,
          numMedici: Number
        }
      ]
    }
  ]
}
```

### Medico

```javascript
{
  id: String,
  nome: String,
  cognome: String,
  ambienteId: String,
  competenze: [String],
  priorita: String,
  minOreMensili: Number,
  maxOreMensili: Number,
  oreFisse: Boolean
}
```

### Disponibilità

```javascript
{
  id: String,
  medicoId: String,
  ambienteId: String,
  mese: Number,
  anno: Number,
  disponibilita: {
    // Mappa giorno -> disponibilità
    // es. "1": ["M", "P"], "2": ["N"]
  }
}
```

### Pianificazione Turni

```javascript
{
  id: String,
  ambienteId: String,
  mese: Number,
  anno: Number,
  giorni: {
    // Mappa giorno -> box -> fascia -> medico
    // es. "1": { "Box 1": { "M": "med1", "P": "med2" } }
  },
  statistiche: {
    // Statistiche sulla pianificazione
  },
  parametriGenerazione: {
    // Parametri utilizzati per la generazione
  }
}
```

### Turni Fissi

```javascript
{
  id: String,
  medicoId: String,
  ambienteId: String,
  sequenza: [String],
  dataInizio: Date
}
```

### Ferie e Permessi

```javascript
{
  id: String,
  medicoId: String,
  ambienteId: String,
  dataInizio: Date,
  dataFine: Date,
  tipo: String,
  oreGiornaliere: Number,
  note: String
}
```

## API

### Ambienti

- `GET /api/ambienti`: Recupera tutti gli ambienti
- `GET /api/ambienti/:id`: Recupera un ambiente specifico
- `POST /api/ambienti`: Crea un nuovo ambiente
- `PUT /api/ambienti/:id`: Aggiorna un ambiente esistente
- `DELETE /api/ambienti/:id`: Elimina un ambiente
- `POST /api/ambienti/default`: Crea un ambiente di default

### Medici

- `GET /api/medici`: Recupera tutti i medici dell'ambiente corrente
- `GET /api/medici/:id`: Recupera un medico specifico
- `POST /api/medici`: Crea un nuovo medico
- `PUT /api/medici/:id`: Aggiorna un medico esistente
- `DELETE /api/medici/:id`: Elimina un medico

### Disponibilità

- `GET /api/disponibilita/:medicoId/:mese/:anno`: Recupera le disponibilità di un medico per un mese specifico
- `GET /api/disponibilita/medici/:mese/:anno`: Recupera le disponibilità di tutti i medici per un mese specifico
- `POST /api/disponibilita`: Salva le disponibilità di un medico

### Pianificazione Turni

- `GET /api/pianificazione/:mese/:anno`: Recupera la pianificazione per un mese specifico
- `POST /api/pianificazione`: Salva una pianificazione
- `PUT /api/pianificazione/:mese/:anno/:giorno/:box/:fascia`: Aggiorna un turno specifico

### Turni Fissi

- `GET /api/turniFissi/:medicoId`: Recupera i turni fissi di un medico
- `GET /api/turniFissi`: Recupera tutti i turni fissi
- `POST /api/turniFissi`: Salva i turni fissi di un medico
- `DELETE /api/turniFissi/:medicoId`: Elimina i turni fissi di un medico

### Ferie e Permessi

- `GET /api/feriePermessi/:medicoId`: Recupera le ferie e i permessi di un medico
- `GET /api/feriePermessi/periodo/:dataInizio/:dataFine`: Recupera le ferie e i permessi per un periodo specifico
- `POST /api/feriePermessi`: Salva ferie o permessi
- `PUT /api/feriePermessi/:id`: Aggiorna ferie o permessi
- `DELETE /api/feriePermessi/:id`: Elimina ferie o permessi

### Riepilogo Ore

- `GET /api/riepilogoOre/:medicoId/:mese/:anno`: Calcola le ore lavorate da un medico in un mese

## Guida all'uso

### Configurazione iniziale

1. Accedere alla pagina "Impostazioni" e selezionare la tab "Ambienti".
2. Creare un nuovo ambiente specificando nome, descrizione, box e tipi di turno.
3. Configurare i requisiti di copertura per ogni box e fascia oraria.

### Gestione medici

1. Selezionare l'ambiente desiderato dal menu principale.
2. Accedere alla pagina "Medici".
3. Aggiungere i medici specificando nome, cognome, competenze, priorità e monte ore.
4. Per i medici con ore fisse, attivare l'opzione "Ore fisse" e specificare il numero di ore mensili.

### Gestione disponibilità

1. Selezionare l'ambiente desiderato dal menu principale.
2. Accedere alla pagina "Disponibilità".
3. Selezionare il medico, il mese e l'anno.
4. Specificare le disponibilità per ogni giorno del mese.

### Gestione turni fissi

1. Selezionare l'ambiente desiderato dal menu principale.
2. Accedere alla pagina "Turni Fissi".
3. Selezionare il medico.
4. Specificare la sequenza di turni fissi e la data di inizio.

### Generazione turni

1. Selezionare l'ambiente desiderato dal menu principale.
2. Accedere alla pagina "Generazione".
3. Selezionare il mese e l'anno.
4. Configurare i parametri di generazione.
5. Avviare la generazione automatica dei turni.

### Gestione ferie e permessi

1. Selezionare l'ambiente desiderato dal menu principale.
2. Accedere alla pagina "Ore Fisse/Permessi".
3. Selezionare il medico.
4. Aggiungere ferie o permessi specificando tipo, data inizio, data fine e note.

### Visualizzazione turni

1. Selezionare l'ambiente desiderato dal menu principale.
2. Accedere alla pagina "Pianificazione".
3. Selezionare il mese e l'anno.
4. Visualizzare i turni nella tabella.
5. Utilizzare i filtri per visualizzare i turni per medico o per box.

## Risoluzione problemi

### Problemi comuni

- **Ambiente non selezionato**: Assicurarsi di aver selezionato un ambiente dal menu principale.
- **Medici non visualizzati**: Verificare che i medici siano stati associati all'ambiente corrente.
- **Errori nella generazione turni**: Verificare che i requisiti di copertura siano configurati correttamente e che ci siano sufficienti medici disponibili.

### Contatti

Per assistenza tecnica, contattare il supporto all'indirizzo support@softwaregestioneturni.it.
