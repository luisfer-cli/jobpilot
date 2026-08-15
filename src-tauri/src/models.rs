use serde::de::{Deserializer, SeqAccess, Visitor};
use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Profile {
    pub full_name: String,
    pub job_title: String,
    pub email: String,
    pub phone: String,
    pub location: String,
    pub linkedin: String,
    pub website: String,
    pub summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct WorkExperience {
    pub company: String,
    pub role: String,
    pub location: String,
    pub start_date: String,
    pub end_date: String,
    pub current: bool,
    #[serde(deserialize_with = "deserialize_string_list", default)]
    pub description: Vec<String>,
}

/// Acepta un string o una lista de strings (viñetas de logros).
fn deserialize_string_list<'de, D>(deserializer: D) -> Result<Vec<String>, D::Error>
where
    D: Deserializer<'de>,
{
    struct StrListVisitor;
    impl<'de> Visitor<'de> for StrListVisitor {
        type Value = Vec<String>;
        fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
            formatter.write_str("un string o una lista de strings")
        }
        fn visit_str<E>(self, v: &str) -> Result<Vec<String>, E>
        where
            E: serde::de::Error,
        {
            if v.trim().is_empty() {
                Ok(Vec::new())
            } else {
                Ok(vec![v.to_string()])
            }
        }
        fn visit_seq<A>(self, mut seq: A) -> Result<Vec<String>, A::Error>
        where
            A: SeqAccess<'de>,
        {
            let mut out = Vec::new();
            while let Some(v) = seq.next_element::<serde_json::Value>()? {
                match v {
                    serde_json::Value::String(s) => out.push(s),
                    _ => {}
                }
            }
            Ok(out)
        }
    }
    deserializer.deserialize_any(StrListVisitor)
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Education {
    pub institution: String,
    pub degree: String,
    pub field: String,
    pub start_date: String,
    pub end_date: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Skill {
    pub name: String,
    pub level: String,
    pub category: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Language {
    pub name: String,
    pub level: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Certification {
    pub name: String,
    pub issuer: String,
    pub date: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub name: String,
    pub description: String,
    pub link: String,
}

/// Conjunto completo de datos del currículum base del candidato.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CvData {
    pub profile: Profile,
    pub experiences: Vec<WorkExperience>,
    pub education: Vec<Education>,
    pub skills: Vec<Skill>,
    pub languages: Vec<Language>,
    pub certifications: Vec<Certification>,
    pub projects: Vec<Project>,
}

/// Datos estructurados extraídos de una oferta de trabajo.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct JobOfferStructured {
    pub title: String,
    pub company: String,
    pub location: String,
    pub salary: String,
    pub job_type: String,
    pub seniority: String,
    pub description: String,
    pub requirements: Vec<String>,
    pub responsibilities: Vec<String>,
    pub nice_to_have: Vec<String>,
    pub skills: Vec<String>,
    pub application_url: String,
}

/// Currículum especializado generado para una oferta.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GeneratedCv {
    pub full_name: String,
    pub job_title: String,
    pub email: String,
    pub phone: String,
    pub location: String,
    pub linkedin: String,
    pub website: String,
    pub summary: String,
    pub experiences: Vec<WorkExperience>,
    pub education: Vec<Education>,
    pub skills: Vec<String>,
    #[serde(deserialize_with = "deserialize_languages", default)]
    pub languages: Vec<Language>,
    #[serde(deserialize_with = "deserialize_certifications", default)]
    pub certifications: Vec<Certification>,
    pub projects: Vec<Project>,
}

/// Acepta idiomas como lista de strings o de objetos `{name, level}`.
fn deserialize_languages<'de, D>(deserializer: D) -> Result<Vec<Language>, D::Error>
where
    D: Deserializer<'de>,
{
    struct LangVisitor;
    impl<'de> Visitor<'de> for LangVisitor {
        type Value = Vec<Language>;
        fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
            formatter.write_str("una lista de idiomas (string u objeto {name, level})")
        }
        fn visit_seq<A>(self, mut seq: A) -> Result<Vec<Language>, A::Error>
        where
            A: SeqAccess<'de>,
        {
            let mut out = Vec::new();
            while let Some(v) = seq.next_element::<serde_json::Value>()? {
                match v {
                    serde_json::Value::String(s) => {
                        out.push(Language {
                            name: s,
                            level: String::new(),
                        });
                    }
                    serde_json::Value::Object(m) => {
                        let name = m
                            .get("name")
                            .and_then(|x| x.as_str())
                            .unwrap_or_default()
                            .to_string();
                        let level = m
                            .get("level")
                            .and_then(|x| x.as_str())
                            .unwrap_or_default()
                            .to_string();
                        out.push(Language { name, level });
                    }
                    _ => {}
                }
            }
            Ok(out)
        }
    }
    deserializer.deserialize_seq(LangVisitor)
}

/// Acepta certificaciones como lista de strings o de objetos `{name, issuer, date}`.
fn deserialize_certifications<'de, D>(deserializer: D) -> Result<Vec<Certification>, D::Error>
where
    D: Deserializer<'de>,
{
    struct CertVisitor;
    impl<'de> Visitor<'de> for CertVisitor {
        type Value = Vec<Certification>;
        fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
            formatter
                .write_str("una lista de certificaciones (string u objeto {name, issuer, date})")
        }
        fn visit_seq<A>(self, mut seq: A) -> Result<Vec<Certification>, A::Error>
        where
            A: SeqAccess<'de>,
        {
            let mut out = Vec::new();
            while let Some(v) = seq.next_element::<serde_json::Value>()? {
                match v {
                    serde_json::Value::String(s) => {
                        out.push(Certification {
                            name: s,
                            issuer: String::new(),
                            date: String::new(),
                        });
                    }
                    serde_json::Value::Object(m) => {
                        let name = m
                            .get("name")
                            .and_then(|x| x.as_str())
                            .unwrap_or_default()
                            .to_string();
                        let issuer = m
                            .get("issuer")
                            .and_then(|x| x.as_str())
                            .unwrap_or_default()
                            .to_string();
                        let date = m
                            .get("date")
                            .and_then(|x| x.as_str())
                            .unwrap_or_default()
                            .to_string();
                        out.push(Certification { name, issuer, date });
                    }
                    _ => {}
                }
            }
            Ok(out)
        }
    }
    deserializer.deserialize_seq(CertVisitor)
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CoverLetter {
    pub subject: String,
    pub greeting: String,
    pub body: String,
    pub closing: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TestQuestion {
    /// single_choice | multiple_choice | true_false | short_answer | coding
    pub question_type: String,
    pub question: String,
    pub options: Vec<String>,
    pub correct_answers: Vec<String>,
    pub hint: String,
    pub explanation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TechnicalTest {
    pub title: String,
    pub estimated_time: String,
    pub instructions: String,
    pub questions: Vec<TestQuestion>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AtsAnalysis {
    pub score: i64,
    pub matched_keywords: Vec<String>,
    pub missing_keywords: Vec<String>,
    pub suggestions: Vec<String>,
}

#[cfg(test)]
mod tests {
    use super::WorkExperience;

    const BASE: &str =
        r#""company":"A","role":"Dev","location":"","startDate":"","endDate":"","current":false"#;

    #[test]
    fn experience_description_accepts_array() {
        let e: WorkExperience = serde_json::from_str(&format!(
            "{{{BASE},\"description\":[\"logro 1\",\"logro 2\"]}}"
        ))
        .unwrap();
        assert_eq!(e.description, vec!["logro 1", "logro 2"]);
    }

    #[test]
    fn experience_description_accepts_string() {
        let e: WorkExperience =
            serde_json::from_str(&format!("{{{BASE},\"description\":\"prosa antigua\"}}")).unwrap();
        assert_eq!(e.description, vec!["prosa antigua"]);
    }

    #[test]
    fn experience_description_defaults_empty() {
        let e: WorkExperience = serde_json::from_str(&format!("{{{BASE}}}")).unwrap();
        assert!(e.description.is_empty());
    }
}
