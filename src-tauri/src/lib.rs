// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use serde::Serialize;
use CompiladorRustC::{Lexer, Parser, Stmt, Token};

#[derive(Serialize)]
struct CompilerOutput {
    tokens: Vec<Token>,
    ast: Option<Vec<Stmt>>,
    error: Option<String>,   
}

#[tauri::command]
fn compile(code: String) -> Result<CompilerOutput, String> {
    // 1. Executamos o Lexer isoladamente.
    // Agora o Lexer retorna (Token, usize), então precisamos ajustar o tipo do vetor.
    let lexer_result = std::panic::catch_unwind(|| {
        let mut lexer = Lexer::new(code);
        let mut tokens_with_lines: Vec<(Token, usize)> = Vec::new(); // [ALTERADO] Armazena tuplas

        loop {
            let (token, linha) = lexer.prox_token(); // [ALTERADO] Desestrutura a tupla
            let is_fundo = matches!(token, Token::Fundo);
            
            tokens_with_lines.push((token, linha));

            if is_fundo {
                break;
            }
        }
        tokens_with_lines
    });

    // se o Lexer falhar, retornamos erro de sistema
    let tokens_with_lines = match lexer_result {
        Ok(t) => t,
        Err(_) => return Err("Erro fatal durante a análise léxica.".to_string()),
    };

    // 2. Clonamos os tokens COM LINHAS para o parser
    let tokens_for_parser = tokens_with_lines.clone();
    
    let parser_result = std::panic::catch_unwind(|| {
        // [ALTERADO] O Parser::new agora aceita Vec<(Token, usize)> naturalmente
        let mut parser = Parser::new(tokens_for_parser);
        parser.parse()
    });

    // 3. Preparamos os tokens para enviar ao Front-end (Removendo a informação da linha por enquanto)
    // Fazemos isso para manter a compatibilidade com a struct CompilerOutput e o teu front-end atual
    let tokens_simple: Vec<Token> = tokens_with_lines
        .into_iter()
        .map(|(t, _)| t) // Descarta a linha e fica só com o Token
        .collect();

    // Construímos a resposta baseada no sucesso ou falha do Parser
    match parser_result {
        Ok(ast) => Ok(CompilerOutput {
            tokens: tokens_simple,
            ast: Some(ast),
            error: None,
        }),
        Err(e) => {
            // recupera a mensagem de erro do panic
            // Como alteraste as mensagens no parser.rs, o 'm' aqui já conterá "Erro na linha X: ..."
            let msg = if let Some(m) = e.downcast_ref::<&str>() {
                format!("Erro de Sintaxe: {}", m)
            } else if let Some(m) = e.downcast_ref::<String>() {
                format!("Erro de Sintaxe: {}", m)
            } else {
                "Erro de compilação desconhecido.".to_string()
            };

            // retorna os tokens com o erro
            Ok(CompilerOutput {
                tokens: tokens_simple,
                ast: None,
                error: Some(msg),
            })
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