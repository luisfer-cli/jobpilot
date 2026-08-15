import { Injectable } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";
import type {
  AtsAnalysis,
  CoverLetter,
  CvData,
  GeneratedCv,
  JobOfferStructured,
  TechnicalTest,
} from "./models";

@Injectable({ providedIn: "root" })
export class AiService {
  async testConnection(apiKey: string, model: string): Promise<string> {
    return invoke<string>("test_connection", { apiKey, model });
  }

  async parseJobOffer(
    apiKey: string,
    model: string,
    text: string,
  ): Promise<JobOfferStructured> {
    return invoke<JobOfferStructured>("parse_job_offer", { apiKey, model, text });
  }

  async generateCv(
    apiKey: string,
    model: string,
    cvData: CvData,
    offer: JobOfferStructured,
  ): Promise<GeneratedCv> {
    return invoke<GeneratedCv>("generate_cv", { apiKey, model, cvData, offer });
  }

  async generateCoverLetter(
    apiKey: string,
    model: string,
    cvData: CvData,
    offer: JobOfferStructured,
  ): Promise<CoverLetter> {
    return invoke<CoverLetter>("generate_cover_letter", { apiKey, model, cvData, offer });
  }

  async generateTechnicalTest(
    apiKey: string,
    model: string,
    offer: JobOfferStructured,
  ): Promise<TechnicalTest> {
    return invoke<TechnicalTest>("generate_technical_test", { apiKey, model, offer });
  }

  async generateTestFromTopic(
    apiKey: string,
    model: string,
    topic: string,
  ): Promise<TechnicalTest> {
    return invoke<TechnicalTest>("generate_test_from_topic", { apiKey, model, topic });
  }

  async analyzeAts(
    apiKey: string,
    model: string,
    cvData: CvData,
    offer: JobOfferStructured,
  ): Promise<AtsAnalysis> {
    return invoke<AtsAnalysis>("analyze_ats", { apiKey, model, cvData, offer });
  }
}
