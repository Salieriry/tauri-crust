import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ code, onChange }: CodeEditorProps) {
  const { resolvedTheme } = useTheme();

  // Mapeia o tema do 'next-themes' (dark/light) para o do Monaco (vs-dark/light)
  // Se o tema ainda não foi resolvido (carregando), usamos o 'vs-dark' como fallback
  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "light";

  return (
    <div className="h-full border rounded-xl overflow-hidden shadow-sm bg-card">
      <Editor
        height="100%"
        defaultLanguage="cpp"
        value={code}
        onChange={(value) => onChange(value || "")}
        theme={editorTheme}
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