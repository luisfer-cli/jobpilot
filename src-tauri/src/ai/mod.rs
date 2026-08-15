pub mod openrouter;

pub use openrouter::OpenRouter;

#[derive(Debug, Clone)]
pub struct ChatRequest {
    pub api_key: String,
    pub model: String,
    pub system: String,
    pub user: String,
}

/// Abstracción de proveedor de IA. Actualmente solo existe OpenRouter,
/// pero nuevos proveedores solo tienen que implementar `chat`.
pub trait AiProvider: Send + Sync {
    async fn chat(&self, req: ChatRequest) -> Result<String, String>;
}
