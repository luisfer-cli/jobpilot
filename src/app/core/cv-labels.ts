export interface CvLabels {
  resume: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  languages: string;
  certifications: string;
  projects: string;
  current: string;
  role: string;
  company: string;
  degree: string;
  institution: string;
  portfolio: string;
}

const DEFAULT_LABELS: CvLabels = {
  resume: "Currículum",
  summary: "RESUMEN",
  experience: "EXPERIENCIA",
  education: "EDUCACIÓN",
  skills: "COMPETENCIAS",
  languages: "IDIOMAS",
  certifications: "CERTIFICACIONES",
  projects: "PROYECTOS",
  current: "Actualidad",
  role: "Rol",
  company: "Empresa",
  degree: "Título",
  institution: "Institución",
  portfolio: "Portafolio",
};

const LABELS: Record<string, CvLabels> = {
  español: DEFAULT_LABELS,
  inglés: {
    resume: "Resume",
    summary: "SUMMARY",
    experience: "EXPERIENCE",
    education: "EDUCATION",
    skills: "SKILLS",
    languages: "LANGUAGES",
    certifications: "CERTIFICATIONS",
    projects: "PROJECTS",
    current: "Present",
    role: "Role",
    company: "Company",
    degree: "Degree",
    institution: "Institution",
    portfolio: "Portfolio",
  },
  francés: {
    resume: "Curriculum vitae",
    summary: "RÉSUMÉ",
    experience: "EXPÉRIENCE",
    education: "FORMATION",
    skills: "COMPÉTENCES",
    languages: "LANGUES",
    certifications: "CERTIFICATIONS",
    projects: "PROJETS",
    current: "Actuel",
    role: "Poste",
    company: "Entreprise",
    degree: "Diplôme",
    institution: "Établissement",
    portfolio: "Portfolio",
  },
  alemán: {
    resume: "Lebenslauf",
    summary: "ZUSAMMENFASSUNG",
    experience: "BERUFSERFAHRUNG",
    education: "AUSBILDUNG",
    skills: "KENNTNISSE",
    languages: "SPRACHEN",
    certifications: "ZERTIFIZIERUNGEN",
    projects: "PROJEKTE",
    current: "Heute",
    role: "Position",
    company: "Unternehmen",
    degree: "Abschluss",
    institution: "Einrichtung",
    portfolio: "Portfolio",
  },
  italiano: {
    resume: "Curriculum",
    summary: "RIEPILOGO",
    experience: "ESPERIENZA",
    education: "FORMAZIONE",
    skills: "COMPETENZE",
    languages: "LINGUE",
    certifications: "CERTIFICAZIONI",
    projects: "PROGETTI",
    current: "Attuale",
    role: "Ruolo",
    company: "Azienda",
    degree: "Titolo",
    institution: "Istituto",
    portfolio: "Portfolio",
  },
  portugués: {
    resume: "Currículo",
    summary: "RESUMO",
    experience: "EXPERIÊNCIA",
    education: "FORMAÇÃO",
    skills: "COMPETÊNCIAS",
    languages: "IDIOMAS",
    certifications: "CERTIFICAÇÕES",
    projects: "PROJETOS",
    current: "Atual",
    role: "Cargo",
    company: "Empresa",
    degree: "Formação",
    institution: "Instituição",
    portfolio: "Portfólio",
  },
};

export function labelsFor(language?: string): CvLabels {
  return (language && LABELS[language]) || DEFAULT_LABELS;
}
