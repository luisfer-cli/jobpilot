pub mod openai_compatible;

pub use openai_compatible::OpenAiCompatible;

#[derive(Debug, Clone)]
pub struct ChatRequest {
    pub base_url: String,
    pub api_key: String,
    pub model: String,
    pub system: String,
    pub user: String,
}

/// Abstracción de proveedor de IA. Cualquier proveedor compatible con el
/// formato OpenAI (`/chat/completions`) se maneja con `OpenAiCompatible`.
pub trait AiProvider: Send + Sync {
    async fn chat(&self, req: ChatRequest) -> Result<String, String>;
}
