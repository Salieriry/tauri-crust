import { useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
// Não precisamos mais importar o monaco diretamente aqui, usaremos a instância injetada

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  errorLine: number | null;
}

export function CodeEditor({ code, onChange, errorLine }: CodeEditorProps) {
  const { resolvedTheme } = useTheme();

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null); // Precisamos guardar a instância do Monaco

  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "light";

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance; // Guardamos o 'monaco' aqui
  };

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor.getModel();

    if (errorLine !== null) {
      monaco.editor.setModelMarkers(model, "owner", [
        {
          startLineNumber: errorLine,
          startColumn: 1,
          endLineNumber: errorLine,
          endColumn: model.getLineContent(errorLine).length + 1, // Sublinha a linha toda
          message: "Erro de compilação encontrado aqui", // Mensagem do tooltip
          severity: monaco.MarkerSeverity.Error, // Define a cor vermelha e ícone de erro
        },
      ]);

      // Rola até o erro
      editor.revealLineInCenter(errorLine);
    } else {
      // Limpa os erros
      monaco.editor.setModelMarkers(model, "owner", []);
    }
  }, [errorLine]);

  return (
    <div className="h-full border rounded-xl overflow-hidden shadow-sm bg-card">
      <Editor
        height="100%"
        defaultLanguage="cpp"
        value={code}
        onChange={(value) => onChange(value || "")}
        theme={editorTheme}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: "on",
          padding: { top: 16 },
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontLigatures: true,
        }}
      />
    </div>
  );
}