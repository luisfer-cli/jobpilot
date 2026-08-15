use super::{AiProvider, ChatRequest};
use serde_json::json;

pub struct OpenRouter {
    client: reqwest::Client,
}

impl OpenRouter {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
        }
    }
}

impl AiProvider for OpenRouter {
    async fn chat(&self, req: ChatRequest) -> Result<String, String> {
        let body = json!({
            "model": req.model,
            "messages": [
                { "role": "system", "content": req.system },
                { "role": "user", "content": req.user }
            ],
            "response_format": { "type": "json_object" }
        });

        let resp = self
            .client
            .post("https://openrouter.ai/api/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", req.api_key))
            .header("Content-Type", "application/json")
            .header("HTTP-Referer", "https://jobpilot.local")
            .header("X-Title", "JobPilot")
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Error de red: {e}"))?;

        let status = resp.status();
        let text = resp
            .text()
            .await
            .map_err(|e| format!("Error leyendo respuesta: {e}"))?;

        if !status.is_success() {
            return Err(format!("OpenRouter devolvió {status}: {text}"));
        }

        let parsed: serde_json::Value =
            serde_json::from_str(&text).map_err(|e| format!("Respuesta inválida: {e}"))?;

        let content = parsed["choices"][0]["message"]["content"]
            .as_str()
            .ok_or_else(|| "La respuesta no contiene contenido".to_string())?;

        Ok(content.to_string())
    }
}
