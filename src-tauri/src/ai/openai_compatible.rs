use super::{AiProvider, ChatRequest};
use serde_json::json;

/// Cliente para cualquier proveedor compatible con la API de OpenAI
/// (`/chat/completions` y `/models`).
pub struct OpenAiCompatible {
    client: reqwest::Client,
}

impl OpenAiCompatible {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
        }
    }

    pub async fn list_models(&self, base_url: &str, api_key: &str) -> Result<Vec<String>, String> {
        let url = format!("{}/models", base_url.trim_end_matches('/'));
        let mut req = self.client.get(&url);
        if !api_key.is_empty() {
            req = req.header("Authorization", format!("Bearer {}", api_key));
        }
        let resp = req.send().await.map_err(|e| format!("Error de red: {e}"))?;

        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        if !status.is_success() {
            return Err(format!("El proveedor devolvió {status}: {text}"));
        }

        let parsed: serde_json::Value =
            serde_json::from_str(&text).map_err(|e| format!("Respuesta inválida: {e}"))?;

        let mut models: Vec<String> = parsed["data"]
            .as_array()
            .map(|arr| {
                arr.iter()
                    .filter_map(|m| m["id"].as_str().map(str::to_string))
                    .collect()
            })
            .unwrap_or_default();

        models.sort();
        models.dedup();
        Ok(models)
    }
}

impl AiProvider for OpenAiCompatible {
    async fn chat(&self, req: ChatRequest) -> Result<String, String> {
        let url = format!("{}/chat/completions", req.base_url.trim_end_matches('/'));
        let body = json!({
            "model": req.model,
            "messages": [
                { "role": "system", "content": req.system },
                { "role": "user", "content": req.user }
            ],
            "response_format": { "type": "json_object" }
        });

        let mut builder = self
            .client
            .post(&url)
            .header("Content-Type", "application/json")
            .header("HTTP-Referer", "https://librejob.local")
            .header("X-Title", "LibreJob");
        if !req.api_key.is_empty() {
            builder = builder.header("Authorization", format!("Bearer {}", req.api_key));
        }
        let resp = builder
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Error de red: {e}"))?;

        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();

        if !status.is_success() {
            return Err(format!("El proveedor devolvió {status}: {text}"));
        }

        let parsed: serde_json::Value =
            serde_json::from_str(&text).map_err(|e| format!("Respuesta inválida: {e}"))?;

        let content = parsed["choices"][0]["message"]["content"]
            .as_str()
            .ok_or_else(|| "La respuesta no contiene contenido".to_string())?;

        Ok(content.to_string())
    }
}
