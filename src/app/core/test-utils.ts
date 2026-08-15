import type { QuestionType, TechnicalTest, TestQuestion } from "./models";

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: "Opción única",
  multiple_choice: "Selección múltiple",
  true_false: "Verdadero / Falso",
  short_answer: "Respuesta corta",
  coding: "Programación",
};

const KNOWN_TYPES: QuestionType[] = [
  "single_choice",
  "multiple_choice",
  "true_false",
  "short_answer",
  "coding",
];

export function parseTechnicalTest(content: string): TechnicalTest {
  let v: Record<string, unknown> = {};
  try {
    v = JSON.parse(content || "{}");
  } catch {
    v = {};
  }

  const rawQuestions = (v["questions"] as Array<Record<string, unknown>>) ?? [];

  const questions: TestQuestion[] = rawQuestions.map((q) => {
    const rawType = String(q["questionType"] ?? q["type"] ?? "short_answer");
    const type = (KNOWN_TYPES as string[]).includes(rawType)
      ? (rawType as QuestionType)
      : "short_answer";
    const options = (q["options"] as string[]) ?? (type === "true_false" ? ["Verdadero", "Falso"] : []);
    return {
      questionType: type,
      question: (q["question"] as string) ?? "",
      options,
      correctAnswers: (q["correctAnswers"] as string[]) ?? [],
      hint: (q["hint"] as string) ?? "",
      explanation: (q["explanation"] as string) ?? "",
    };
  });

  // Compatibilidad con el formato anterior que traía un reto de código separado.
  const codingChallenge = (v["codingChallenge"] as string) ?? "";
  if (codingChallenge && codingChallenge.trim()) {
    questions.push({
      questionType: "coding",
      question: codingChallenge,
      options: [],
      correctAnswers: [],
      hint: "",
      explanation: "",
    });
  }

  return {
    title: (v["title"] as string) ?? "",
    estimatedTime: (v["estimatedTime"] as string) ?? "",
    instructions: (v["instructions"] as string) ?? "",
    questions,
  };
}
