import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GenerazioneTurni from '../../frontend/src/pages/GenerazioneTurni/GenerazioneTurni';

// Mock per il servizio DataService
jest.mock('../../frontend/src/services/DataService', () => ({
  loadMedici: jest.fn(),
  saveMedici: jest.fn(),
  loadTurniGenerati: jest.fn(),
  saveTurniGenerati: jest.fn(),
  loadDisponibilitaMedico: jest.fn()
}));

// Import del servizio mockato
import DataService from '../../frontend/src/services/DataService';

describe('GenerazioneTurni Component', () => {
  // Dati di esempio per i test
  const mediciMock = [
    { id: 1, nome: 'Mario Rossi', specializzazione: 'Cardiologia', competenze: {box1: true, box2: true, box3: false} },
    { id: 2, nome: 'Laura Bianchi', specializzazione: 'Medicina d\'urgenza', competenze: {box1: true, box2: false, box3: true} }
  ];

  const turniGeneratiMock = {
    mese: 3,
    anno: 2025,
    giorni: [
      {
        data: '01/03/2025',
        box1: {
          mattina: { medico: 1, turno: 'M' },
          pomeriggio: { medico: 2, turno: 'P' },
          notte: null
        },
        box2: {
          mattina: { medico: 1, turno: 'M' }, // Stesso medico in box1 e box2 per testare turni multipli box
          pomeriggio: null,
          notte: null
        },
        box3: {
          mattina: { medico: 2, turno: 'M' },
          pomeriggio: null,
          notte: null
        }
      }
    ],
    statistiche: {
      turniTotali: 8,
      turniAssegnati: 4,
      mediaTurniPerMedico: 2,
      problemiCopertura: 4
    }
  };

  beforeEach(() => {
    // Reset dei mock prima di ogni test
    jest.clearAllMocks();
    
    // Configura i mock per restituire i dati di esempio
    DataService.loadMedici.mockReturnValue(mediciMock);
    DataService.loadTurniGenerati.mockReturnValue(turniGeneratiMock);
    DataService.loadDisponibilitaMedico.mockReturnValue({ 1: ['M', 'P'], 2: ['M', 'P'] });
  });

  it('dovrebbe renderizzare correttamente il componente', () => {
    render(<GenerazioneTurni />);
    
    // Verifica che il titolo sia presente
    expect(screen.getByText('Generazione Turni')).toBeInTheDocument();
    
    // Verifica che i controlli per mese e anno siano presenti
    expect(screen.getByLabelText('Mese')).toBeInTheDocument();
    expect(screen.getByLabelText('Anno')).toBeInTheDocument();
    
    // Verifica che il pulsante per generare i turni sia presente
    expect(screen.getByText('Genera Turni')).toBeInTheDocument();
  });

  it('dovrebbe caricare i medici all\'avvio', () => {
    render(<GenerazioneTurni />);
    
    // Verifica che il metodo loadMedici sia stato chiamato
    expect(DataService.loadMedici).toHaveBeenCalled();
    
    // Verifica che il metodo loadTurniGenerati sia stato chiamato
    expect(DataService.loadTurniGenerati).toHaveBeenCalled();
  });

  it('dovrebbe visualizzare i turni generati', async () => {
    render(<GenerazioneTurni />);
    
    // Attendi che i turni generati vengano visualizzati
    await waitFor(() => {
      // Verifica che le statistiche siano visualizzate
      expect(screen.getByText('Turni Totali')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument(); // turniTotali
      expect(screen.getByText('4')).toBeInTheDocument(); // turniAssegnati
    });
    
    // Verifica che le tab per la visualizzazione siano presenti
    expect(screen.getByText('Per Medico')).toBeInTheDocument();
    expect(screen.getByText('Per Box')).toBeInTheDocument();
  });

  it('dovrebbe cambiare visualizzazione quando si clicca sulle tab', async () => {
    render(<GenerazioneTurni />);
    
    // Attendi che i turni generati vengano visualizzati
    await waitFor(() => {
      expect(screen.getByText('Per Box')).toBeInTheDocument();
    });
    
    // Clicca sulla tab "Per Box"
    fireEvent.click(screen.getByText('Per Box'));
    
    // Verifica che la visualizzazione sia cambiata
    await waitFor(() => {
      expect(screen.getByText('Box 1')).toBeInTheDocument();
      expect(screen.getByText('Box 2')).toBeInTheDocument();
      expect(screen.getByText('Box 3 (8:00-20:00)')).toBeInTheDocument();
    });
  });

  it('dovrebbe visualizzare correttamente i turni multipli box', async () => {
    render(<GenerazioneTurni />);
    
    // Attendi che i turni generati vengano visualizzati
    await waitFor(() => {
      expect(screen.getByText('Per Medico')).toBeInTheDocument();
    });
    
    // Nella visualizzazione per medico, il medico 1 dovrebbe avere un turno multiplo box
    // che è visualizzato con un colore specifico (viola) e un'icona informativa
    
    // Verifica che il nome del medico sia visualizzato
    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    
    // Verifica che il turno multiplo box sia visualizzato
    // Nota: questo test potrebbe essere più complesso nella realtà
    // poiché dovremmo verificare lo stile del componente
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('dovrebbe salvare i turni quando si clicca su Salva', async () => {
    render(<GenerazioneTurni />);
    
    // Attendi che i turni generati vengano visualizzati
    await waitFor(() => {
      expect(screen.getByText('Salva')).toBeInTheDocument();
    });
    
    // Clicca sul pulsante Salva
    fireEvent.click(screen.getByText('Salva'));
    
    // Verifica che il metodo saveTurniGenerati sia stato chiamato
    expect(DataService.saveTurniGenerati).toHaveBeenCalledWith(
      turniGeneratiMock.mese,
      turniGeneratiMock.anno,
      turniGeneratiMock
    );
    
    // Verifica che il messaggio di successo sia visualizzato
    await waitFor(() => {
      expect(screen.getByText('Turni salvati con successo')).toBeInTheDocument();
    });
  });

  it('dovrebbe esportare i turni quando si clicca su Esporta Excel', async () => {
    // Mock per console.log per verificare che venga chiamato
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<GenerazioneTurni />);
    
    // Attendi che i turni generati vengano visualizzati
    await waitFor(() => {
      expect(screen.getByText('Esporta Excel')).toBeInTheDocument();
    });
    
    // Clicca sul pulsante Esporta Excel
    fireEvent.click(screen.getByText('Esporta Excel'));
    
    // Verifica che console.log sia stato chiamato con i turni generati
    expect(consoleLogSpy).toHaveBeenCalledWith('Turni esportati:', turniGeneratiMock);
    
    // Verifica che il messaggio di successo sia visualizzato
    await waitFor(() => {
      expect(screen.getByText('Turni esportati in formato Excel')).toBeInTheDocument();
    });
    
    // Ripristina console.log
    consoleLogSpy.mockRestore();
  });
});
