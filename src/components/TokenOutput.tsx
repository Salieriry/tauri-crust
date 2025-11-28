import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";


interface TokenOutputProps {
  tokens: any[];
}

// cores baseadas no tipo de token
const getTokenColor = (type: string) => {
  if (type.includes("Inclusao") || type.includes("Diretiva")) return "bg-pink-500/10 text-pink-500 border-pink-500/20";
  if (type.includes("Numero") || type.includes("Texto") || type.includes("Char")) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
  if (type === "Identificador") return "bg-green-500/10 text-green-500 border-green-500/20";
  if (["Mais", "Menos", "Igual", "Asterisco", "Divisao"].some(t => type.includes(t))) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
  
  return "bg-gray-500/10 text-gray-500 border-gray-500/20";
};

export function TokenOutput({ tokens }: TokenOutputProps) {
  if (!tokens || tokens.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center border-dashed border-2 bg-muted/20">
        <CardContent className="text-center pt-6">
          <p className="text-muted-foreground">
            Nenhum token gerado. Clique em "Compilar" para ver a saída.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border-none shadow-none">
      <CardHeader className="pb-2 px-4 pt-4 border-b">
        <CardTitle className="text-lg">Tokens do Lexer</CardTitle>
        <CardDescription>
          {tokens.length} token{tokens.length !== 1 ? "s" : ""} encontrados
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0 bg-card/50">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor (Rust Enum)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token: any, index) => {
               // extrai dados do enum do rust
               const typeKey = typeof token === 'string' ? token : Object.keys(token)[0];
               
               let displayValue = typeof token === 'string' ? token : JSON.stringify(token[typeKey]);
               
               if (displayValue.startsWith('"') && displayValue.endsWith('"')) {
                   displayValue = displayValue.slice(1, -1);
               }

               return (
                <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="text-muted-foreground text-xs font-mono">{index + 1}</TableCell>
                    <TableCell>
                    <Badge variant="outline" className={`${getTokenColor(typeKey)} font-mono text-xs font-normal`}>
                        {typeKey}
                    </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground/80 truncate max-w-[300px]" title={displayValue}>
                        {displayValue}
                    </TableCell>
                </TableRow>
               )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}