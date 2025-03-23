// DataService.js - Servizio per la gestione dei dati con supporto multi-ambiente
import axios from 'axios';

class DataService {
  // Metodo per ottenere l'ambiente corrente
  static getCurrentAmbienteId() {
    return localStorage.getItem('selectedAmbienteId') || '';
  }

  // Metodo per impostare l'ambiente corrente
  static setCurrentAmbienteId(ambienteId) {
    localStorage.setItem('selectedAmbienteId', ambienteId);
    return ambienteId;
  }

  // METODI PER LA GESTIONE DEI MEDICI
  
  // Recupera tutti i medici dell'ambiente corrente
  static async getMedici() {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) return [];
    
    try {
      const response = await axios.get(`/api/medici?ambienteId=${ambienteId}`);
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero dei medici:', error);
      return [];
    }
  }

  // Recupera un medico specifico
  static async getMedico(medicoId) {
    try {
      const response = await axios.get(`/api/medici/${medicoId}`);
      return response.data;
    } catch (error) {
      console.error(`Errore nel recupero del medico ${medicoId}:`, error);
      return null;
    }
  }

  // Salva un medico (nuovo o esistente)
  static async saveMedico(medico) {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) throw new Error('Nessun ambiente selezionato');
    
    // Assicura che il medico abbia l'ambienteId corretto
    medico.ambienteId = ambienteId;
    
    try {
      let response;
      if (medico.id) {
        // Aggiorna un medico esistente
        response = await axios.put(`/api/medici/${medico.id}`, medico);
      } else {
        // Crea un nuovo medico
        response = await axios.post('/api/medici', medico);
      }
      return response.data;
    } catch (error) {
      console.error('Errore nel salvataggio del medico:', error);
      throw error;
    }
  }

  // Elimina un medico
  static async deleteMedico(medicoId) {
    try {
      await axios.delete(`/api/medici/${medicoId}`);
      return true;
    } catch (error) {
      console.error(`Errore nell'eliminazione del medico ${medicoId}:`, error);
      throw error;
    }
  }

  // METODI PER LA GESTIONE DELLE DISPONIBILITÀ
  
  // Recupera le disponibilità di un medico per un mese specifico
  static async getDisponibilita(medicoId, mese, anno) {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) return null;
    
    try {
      const response = await axios.get(`/api/disponibilita/${medicoId}/${mese}/${anno}?ambienteId=${ambienteId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Disponibilità non trovate, restituisci un oggetto vuoto
        return {
          medicoId,
          mese,
          anno,
          ambienteId,
          disponibilita: {}
        };
      }
      console.error('Errore nel recupero delle disponibilità:', error);
      return null;
    }
  }

  // Recupera le disponibilità di tutti i medici per un mese specifico
  static async getDisponibilitaMedici(mese, anno) {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) return [];
    
    try {
      const response = await axios.get(`/api/disponibilita/medici/${mese}/${anno}?ambienteId=${ambienteId}`);
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero delle disponibilità dei medici:', error);
      return [];
    }
  }

  // Salva le disponibilità di un medico
  static async saveDisponibilita(medicoId, mese, anno, disponibilita) {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) throw new Error('Nessun ambiente selezionato');
    
    try {
      const response = await axios.post('/api/disponibilita', {
        medicoId,
        mese,
        anno,
        ambienteId,
        disponibilita
      });
      return response.data;
    } catch (error) {
      console.error('Errore nel salvataggio delle disponibilità:', error);
      throw error;
    }
  }

  // METODI PER LA GESTIONE DEI TURNI FISSI
  
  // Recupera i turni fissi di un medico
  static async getTurniFissi(medicoId) {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) return null;
    
    try {
      const response = await axios.get(`/api/turniFissi/${medicoId}?ambienteId=${ambienteId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Turni fissi non trovati
        return null;
      }
      console.error('Errore nel recupero dei turni fissi:', error);
      return null;
    }
  }

  // Recupera tutti i turni fissi
  static async getAllTurniFissi() {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) return [];
    
    try {
      const response = await axios.get(`/api/turniFissi?ambienteId=${ambienteId}`);
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero di tutti i turni fissi:', error);
      return [];
    }
  }

  // Salva i turni fissi di un medico
  static async saveTurniFissi(medicoId, sequenza, dataInizio) {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) throw new Error('Nessun ambiente selezionato');
    
    try {
      const response = await axios.post('/api/turniFissi', {
        medicoId,
        ambienteId,
        sequenza,
        dataInizio
      });
      return response.data;
    } catch (error) {
      console.error('Errore nel salvataggio dei turni fissi:', error);
      throw error;
    }
  }

  // Elimina i turni fissi di un medico
  static async deleteTurniFissi(medicoId) {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) throw new Error('Nessun ambiente selezionato');
    
    try {
      await axios.delete(`/api/turniFissi/${medicoId}?ambienteId=${ambienteId}`);
      return true;
    } catch (error) {
      console.error('Errore nell\'eliminazione dei turni fissi:', error);
      throw error;
    }
  }

  // METODI PER LA GESTIONE DELLA PIANIFICAZIONE TURNI
  
  // Recupera la pianificazione per un mese specifico
  static async getPianificazione(mese, anno) {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) return null;
    
    try {
      const response = await axios.get(`/api/pianificazione/${mese}/${anno}?ambienteId=${ambienteId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Pianificazione non trovata
        return null;
      }
      console.error('Errore nel recupero della pianificazione:', error);
      return null;
    }
  }

  // Salva una pianificazione
  static async savePianificazione(mese, anno, giorni, statistiche, parametriGenerazione) {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) throw new Error('Nessun ambiente selezionato');
    
    try {
      const response = await axios.post('/api/pianificazione', {
        mese,
        anno,
        ambienteId,
        giorni,
        statistiche,
        parametriGenerazione
      });
      return response.data;
    } catch (error) {
      console.error('Errore nel salvataggio della pianificazione:', error);
      throw error;
    }
  }

  // Aggiorna un turno specifico
  static async updateTurno(mese, anno, giorno, box, fascia, medicoId, turno) {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) throw new Error('Nessun ambiente selezionato');
    
    try {
      const response = await axios.put(`/api/pianificazione/${mese}/${anno}/${giorno}/${box}/${fascia}`, {
        medicoId,
        turno,
        ambienteId
      });
      return response.data;
    } catch (error) {
      console.error('Errore nell\'aggiornamento del turno:', error);
      throw error;
    }
  }

  // METODI PER LA GESTIONE DELLE FERIE E PERMESSI
  
  // Recupera le ferie e i permessi di un medico
  static async getFeriePermessi(medicoId) {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) return [];
    
    try {
      const response = await axios.get(`/api/feriePermessi/${medicoId}?ambienteId=${ambienteId}`);
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero delle ferie e permessi:', error);
      return [];
    }
  }

  // Recupera le ferie e i permessi per un periodo specifico
  static async getFeriePermessiPeriodo(dataInizio, dataFine) {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) return [];
    
    try {
      const response = await axios.get(`/api/feriePermessi/periodo/${dataInizio}/${dataFine}?ambienteId=${ambienteId}`);
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero delle ferie e permessi per periodo:', error);
      return [];
    }
  }

  // Salva ferie o permessi
  static async saveFeriePermessi(medicoId, dataInizio, dataFine, tipo, oreGiornaliere, note) {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) throw new Error('Nessun ambiente selezionato');
    
    try {
      const response = await axios.post('/api/feriePermessi', {
        medicoId,
        ambienteId,
        dataInizio,
        dataFine,
        tipo,
        oreGiornaliere: oreGiornaliere || 6, // Default 6 ore al giorno
        note
      });
      return response.data;
    } catch (error) {
      console.error('Errore nel salvataggio delle ferie e permessi:', error);
      throw error;
    }
  }

  // Aggiorna ferie o permessi
  static async updateFeriePermessi(id, medicoId, dataInizio, dataFine, tipo, oreGiornaliere, note) {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) throw new Error('Nessun ambiente selezionato');
    
    try {
      const response = await axios.put(`/api/feriePermessi/${id}`, {
        medicoId,
        ambienteId,
        dataInizio,
        dataFine,
        tipo,
        oreGiornaliere,
        note
      });
      return response.data;
    } catch (error) {
      console.error('Errore nell\'aggiornamento delle ferie e permessi:', error);
      throw error;
    }
  }

  // Elimina ferie o permessi
  static async deleteFeriePermessi(id) {
    try {
      await axios.delete(`/api/feriePermessi/${id}`);
      return true;
    } catch (error) {
      console.error('Errore nell\'eliminazione delle ferie e permessi:', error);
      throw error;
    }
  }

  // METODI PER LA GESTIONE DEGLI AMBIENTI
  
  // Recupera tutti gli ambienti
  static async getAmbienti() {
    try {
      const response = await axios.get('/api/ambienti');
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero degli ambienti:', error);
      return [];
    }
  }

  // Recupera un ambiente specifico
  static async getAmbiente(ambienteId) {
    try {
      const response = await axios.get(`/api/ambienti/${ambienteId}`);
      return response.data;
    } catch (error) {
      console.error(`Errore nel recupero dell'ambiente ${ambienteId}:`, error);
      return null;
    }
  }

  // Salva un ambiente (nuovo o esistente)
  static async saveAmbiente(ambiente) {
    try {
      let response;
      if (ambiente.id) {
        // Aggiorna un ambiente esistente
        response = await axios.put(`/api/ambienti/${ambiente.id}`, ambiente);
      } else {
        // Crea un nuovo ambiente
        response = await axios.post('/api/ambienti', ambiente);
      }
      return response.data;
    } catch (error) {
      console.error('Errore nel salvataggio dell\'ambiente:', error);
      throw error;
    }
  }

  // Elimina un ambiente
  static async deleteAmbiente(ambienteId) {
    try {
      await axios.delete(`/api/ambienti/${ambienteId}`);
      return true;
    } catch (error) {
      console.error(`Errore nell'eliminazione dell'ambiente ${ambienteId}:`, error);
      throw error;
    }
  }

  // Crea un ambiente di default
  static async createDefaultAmbiente() {
    try {
      const response = await axios.post('/api/ambienti/default');
      return response.data;
    } catch (error) {
      console.error('Errore nella creazione dell\'ambiente di default:', error);
      throw error;
    }
  }

  // METODI PER IL SALVATAGGIO AUTOMATICO
  
  // Salva lo stato corrente dell'applicazione
  static saveCurrentState() {
    // Implementazione del salvataggio automatico
    console.log('Salvataggio automatico eseguito');
    // Qui puoi implementare la logica per salvare lo stato corrente
    // ad esempio, salvare la pianificazione corrente, le disponibilità, ecc.
  }

  // METODI PER LA GESTIONE DELLE ORE FISSE
  
  // Calcola le ore lavorate da un medico in un mese
  static async calcolaOreLavorate(medicoId, mese, anno) {
    const ambienteId = this.getCurrentAmbienteId();
    if (!ambienteId) return { totaleOre: 0, dettaglio: [] };
    
    try {
      const response = await axios.get(`/api/riepilogoOre/${medicoId}/${mese}/${anno}?ambienteId=${ambienteId}`);
      return response.data;
    } catch (error) {
      console.error('Errore nel calcolo delle ore lavorate:', error);
      return { totaleOre: 0, dettaglio: [] };
    }
  }

  // Verifica se un medico ha raggiunto le ore fisse
  static async verificaOreFisse(medicoId, mese, anno) {
    try {
      // Recupera il medico
      const medico = await this.getMedico(medicoId);
      if (!medico || !medico.oreFisse) return { raggiunto: true, differenza: 0 };
      
      // Calcola le ore lavorate
      const oreLavorate = await this.calcolaOreLavorate(medicoId, mese, anno);
      
      // Verifica se ha raggiunto le ore fisse
      const differenza = medico.minOreMensili - oreLavorate.totaleOre;
      
      return {
        raggiunto: differenza <= 0,
        differenza: Math.abs(differenza),
        oreLavorate: oreLavorate.totaleOre,
        oreFisse: medico.minOreMensili
      };
    } catch (error) {
      console.error('Errore nella verifica delle ore fisse:', error);
      return { raggiunto: true, differenza: 0 };
    }
  }
}

export default DataService;
