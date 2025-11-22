// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use serde::Serialize;
use CompiladorRustC::{Lexer, Parser, Stmt, Token};

#[derive(Serialize)]
struct CompilerOutput {
    tokens: Vec<Token>,
    ast: Vec<Stmt>,
}

#[tauri::command]
fn compile(code: String) -> Result<CompilerOutput, String> {
    // catch_unwind impede que erros de sintaxe (panic!) fechem o programa
    let result = std::panic::catch_unwind(|| {
        // 1. Léxico
        let mut lexer = Lexer::new(code);
        let mut tokens: Vec<Token> = Vec::new();

        loop {
            let token = lexer.prox_token();
            let is_fundo = matches!(token, Token::Fundo);
            
            tokens.push(token);

            if is_fundo {
                break;
            }
        }

        // 2. Sintático
        // Clonamos tokens pois o parser consome o vetor
        let mut parser = Parser::new(tokens.clone());
        let ast = parser.parse();

        CompilerOutput {
            tokens,
            ast,
        }
    });

    // Aqui tratamos o resultado do panic para extrair a mensagem
    match result {
        Ok(output) => Ok(output),
        Err(e) => {
            // Tenta extrair a mensagem se for uma string estática (ex: panic!("erro"))
            if let Some(msg) = e.downcast_ref::<&str>() {
                return Err(format!("Erro de Sintaxe: {}", msg));
            }
            // Tenta extrair a mensagem se for uma String formatada (ex: panic!("{}", erro))
            if let Some(msg) = e.downcast_ref::<String>() {
                return Err(format!("Erro de Sintaxe: {}", msg));
            }
            // Fallback para erro desconhecido
            Err("Ocorreu um erro de compilação desconhecido.".to_string())
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![compile])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
