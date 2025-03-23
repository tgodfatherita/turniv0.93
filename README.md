# Software Gestione Turni - Multi-ambiente

Questo software permette la gestione completa dei turni di lavoro in diverse strutture, con supporto per più ambienti indipendenti.

## Caratteristiche principali

- **Gestione multi-ambiente**: Possibilità di creare e gestire più ambienti indipendenti (es. "Turni Pronto Soccorso", "Turni Reparto", "Turni Vaticano")
- **Personalizzazione per ambiente**: Ogni ambiente può avere il proprio set di box/postazioni e tipi di turno con orari specifici
- **Gestione medici**: Anagrafica completa con competenze specifiche per ambiente
- **Gestione disponibilità**: Disponibilità mensili per ogni medico
- **Generazione automatica turni**: Rispetto dei vincoli e requisiti di copertura
- **Gestione ore fisse e permessi**: Conteggio automatico delle ore, inclusi permessi e ferie
- **Visualizzazione avanzata**: Supporto per turni multipli box con tooltip informativi

## Requisiti di sistema

- Node.js 14.x o superiore
- PostgreSQL 12.x o superiore
- Browser web moderno (Chrome, Firefox, Edge)

## Installazione

### Backend

1. Navigare nella directory `backend`
2. Installare le dipendenze:
   ```
   npm install
   ```
3. Configurare il database in `config/config.js`
4. Avviare il server:
   ```
   npm start
   ```

### Frontend

1. Navigare nella directory `frontend`
2. Installare le dipendenze:
   ```
   npm install
   ```
3. Avviare l'applicazione:
   ```
   npm start
   ```

## Documentazione

Per informazioni dettagliate su tutte le funzionalità, consultare il file `documentazione.md`.

## Test

Per eseguire i test:

1. Navigare nella directory principale
2. Eseguire:
   ```
   npm test
   ```

## Licenza

Tutti i diritti riservati.
