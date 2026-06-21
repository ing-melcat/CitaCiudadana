import { useState, useEffect } from 'react';

interface HeuristicRule {
  specialty: string;
  keywords: string[];
  weight: number;
}

export const useHeuristics = (symptoms: string) => {
  const [suggestedSpecialty, setSuggestedSpecialty] = useState<string>('');

  useEffect(() => {
    if (!symptoms || symptoms.trim().length < 3) {
      setSuggestedSpecialty('');
      return;
    }

    const text = symptoms.toLowerCase();
    let bestMatch = '';
    let maxWeight = 0;

    const rules: HeuristicRule[] = [
      { specialty: 'Odontología', keywords: ['diente', 'muela', 'encia', 'dental', 'caries', 'dolor de muela', 'sangrado', 'sarro', 'boca', 'picado'], weight: 3 },
      { specialty: 'Psicología', keywords: ['triste', 'ansiedad', 'depresion', 'estres', 'dormir', 'angustia', 'panico', 'llorar', 'insomnio', 'miedo'], weight: 3 },
      { specialty: 'Pediatría', keywords: ['niño', 'bebe', 'hijo', 'hija', 'fiebre niño', 'vacuna', 'pediatria', 'recien nacido', 'crecimiento'], weight: 3 },
      { specialty: 'Oftalmología', keywords: ['ojo', 'vista', 'lentes', 'borroso', 'ceguera', 'ver mal', 'lagañas', 'rojo', 'ardor', 'cataratas'], weight: 3 },
      { specialty: 'Cardiología', keywords: ['corazon', 'pecho', 'taquicardia', 'presion alta', 'presion baja', 'infarto', 'palpitaciones', 'hipertension'], weight: 3 },
      { specialty: 'Dermatología', keywords: ['piel', 'grano', 'mancha', 'acne', 'comezon', 'alergia piel', 'sarpullido', 'lunar', 'caspa'], weight: 3 },
      { specialty: 'Gastroenterología', keywords: ['estomago', 'panza', 'diarrea', 'vomito', 'nauseas', 'indigestion', 'gastritis', 'ardor', 'agruras'], weight: 3 },
      { specialty: 'Ginecología', keywords: ['embarazo', 'regla', 'menstruacion', 'utero', 'ovarios', 'mujer', 'colicos', 'anticonceptivo'], weight: 3 },
      { specialty: 'Traumatología', keywords: ['hueso', 'fractura', 'esguince', 'torcedura', 'golpe', 'caida', 'rodilla', 'espalda', 'articulacion'], weight: 3 },
      { specialty: 'Médico General', keywords: ['fiebre', 'dolor de cabeza', 'gripe', 'tos', 'cuerpo cortado', 'malestar', 'mareo', 'debilidad', 'fatiga'], weight: 1 }
    ];

    rules.forEach(rule => {
      let score = 0;
      rule.keywords.forEach(kw => {
        // Use word boundary regex for more accurate matching when possible
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(text) || text.includes(kw)) {
          score += rule.weight;
        }
      });

      if (score > maxWeight) {
        maxWeight = score;
        bestMatch = rule.specialty;
      }
    });

    setSuggestedSpecialty(bestMatch);
  }, [symptoms]);

  return { suggestedSpecialty };
};
