import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Copy, Share2, Info } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

interface NpsOperacaoPanelProps {
  vendors: string[];
}

export function NpsOperacaoPanel({ vendors }: NpsOperacaoPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const baseUrl = "https://feedback-conexao.lovable.app";
  const surveyUrl = `${baseUrl}/`;

  const copyLink = async (url: string, key: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(key);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(null), 2000);
  };

  const shareWhatsApp = (url: string, text: string) => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      "_blank",
    );
  };

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3 pb-2 border-b border-border/40">
        <div className="p-2 rounded-lg bg-primary/10">
          <Share2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            Operação Manual
          </h2>
          <p className="text-xs text-muted-foreground">
            Gerenciamento de disparos de formulários via links
          </p>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {/* Compartilhar Links */}
        <AccordionItem
          value="share"
          className="border border-border/30 rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden px-1"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5 rounded-t-xl transition-colors">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-primary/70" />
              <div className="text-left">
                <h3 className="text-sm font-semibold text-foreground">
                  Compartilhar Links
                </h3>
                <p className="text-xs text-muted-foreground font-normal mt-0.5">
                  Gere links gerais ou personalizados para envio aos clientes
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2">
            <div className="space-y-4">
              <div className="space-y-2 p-3 bg-secondary/30 rounded-lg border border-border/40">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Link Geral da Pesquisa
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={surveyUrl}
                    readOnly
                    className="bg-background/50 border-border/50 font-mono text-xs"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => copyLink(surveyUrl, "geral")}
                      className="min-w-[100px]"
                    >
                      {copied === "geral" ? (
                        "Copiado!"
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" /> Copiar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        shareWhatsApp(
                          surveyUrl,
                          "Olá! Gostaríamos de saber sua opinião sobre nosso atendimento:",
                        )
                      }
                      className="w-10 p-0 text-green-400 hover:text-green-300 hover:bg-green-400/10 border-green-400/30"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {vendors.length > 0 && (
                <div className="space-y-3 p-4 bg-secondary/20 rounded-lg border border-border/30">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-primary/10 p-2.5 rounded-md border border-primary/20">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p>
                      Links parametrizados. Ao enviar este link, as respostas já
                      cairão no banco de dados vinculadas ao vendedor
                      específico.
                    </p>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {vendors.map((vendor) => {
                      const vendorUrl = `${surveyUrl}?vend=${encodeURIComponent(vendor)}`;
                      return (
                        <div
                          key={vendor}
                          className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-background/60 rounded-md border border-border/50"
                        >
                          <span
                            className="text-sm font-medium text-foreground w-[180px] truncate"
                            title={vendor}
                          >
                            {vendor}
                          </span>
                          <Input
                            value={vendorUrl}
                            readOnly
                            className="h-8 bg-transparent border-border/30 font-mono text-[10px] text-muted-foreground"
                          />
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 px-3"
                              onClick={() => copyLink(vendorUrl, vendor)}
                            >
                              {copied === vendor ? (
                                "Copiado!"
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 w-8 p-0 text-green-400 hover:text-green-300 border-border/40"
                              onClick={() =>
                                shareWhatsApp(
                                  vendorUrl,
                                  `Olá! Gostaríamos de saber como foi seu atendimento com ${vendor}:`,
                                )
                              }
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
