import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { CodeEditor } from "./components/CodeEditor";
import { TokenOutput } from "./components/TokenOutput";
import { ASTOutput } from "./components/ASTOutput";
import { Button } from "./components/ui/button";
import { ModeToggle } from "./components/mode-toggle";
import { Play } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

interface Token {
  type: string;
  value: string;
  line: number;
  column: number;
}

interface CompileResult {
  tokens: Token[];
  ast: any | null;
  error?: string | null;
}

export default function App() {
  const [code, setCode] = useState(`// Código de Exemplo em C++
#include <iostream>
using namespace std;

int main() {
    int n1 = 67;

    cout << "Hello, World!";

    return 0;
}`);

  const [tokens, setTokens] = useState<Token[]>([]);
  const [ast, setAst] = useState<any>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [errorLine, setErrorLine] = useState<number | null>(null);

  async function handleCompile() {
    setIsCompiling(true);

    // limpa estado anterior
    setTokens([]);
    setAst(null);
    setErrorLine(null);

    const loadingToast = toast.loading("Compilamento iniciado...");

    try {
      const result = await invoke<CompileResult>("compile", { code });

      // atualiza tokens mesmo com erro de sintaxe
      setTokens(result.tokens);

      if (result.error) {
        toast.dismiss(loadingToast);

        // extrai linha do erro da mensagem do rust
        const regexErroLinha = /Erro na linha (\d+):/;
        const match = result.error.match(regexErroLinha);

        if (match && match[1]) {
          const linha = parseInt(match[1], 10);
          setErrorLine(linha);
        }

        toast.error("Erro de Compilação", {
          description: result.error,
          duration: 5000,
        });
      } else {
        toast.dismiss(loadingToast);
        setAst(result.ast);
        toast.success("Compilação Concluída!", {
          description: "Análise léxica e sintática finalizadas com sucesso.",
          duration: 5000,
        });
      }

    } catch (error) {
      console.error(error);
      toast.dismiss(loadingToast);

      toast.error("Erro Crítico", {
        description: "Falha na comunicação com o compilador: " + error,
      });
    } finally {
      setIsCompiling(false);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="border-b px-6 py-3 flex items-center justify-between bg-card">
        <div>
          <h1 className="text-lg font-bold">Compilador C++ (Rust + Tauri)</h1>
          <p className="text-sm text-muted-foreground">Análise Léxica e Sintática</p>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />

          <Button onClick={handleCompile} disabled={isCompiling} className="gap-2">
            <Play className="size-4" />
            {isCompiling ? "Compilando..." : "Compilar"}
          </Button>
        </div>
      </header>

      <Toaster />

      <Tabs defaultValue="editor" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 mt-4">
          <TabsList className="w-fit">
            <TabsTrigger value="editor">Editor de Código</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="ast">AST (Sintático)</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="editor" className="h-full m-0 p-6 pt-2">
            <CodeEditor code={code} onChange={setCode} errorLine={errorLine} />
          </TabsContent>

          <TabsContent value="tokens" className="h-full m-0 p-6 pt-2 overflow-auto">
            <TokenOutput tokens={tokens} />
          </TabsContent>

          <TabsContent value="ast" className="h-full m-0 p-6 pt-2 overflow-auto">
            <ASTOutput ast={ast} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}