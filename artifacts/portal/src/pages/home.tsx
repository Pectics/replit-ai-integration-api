import { useProxyData } from "@/hooks/use-proxy-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Terminal, Key, Cpu, Zap, Activity, CheckCircle, XCircle, Shield, Globe, Layers, ArrowRight, BookOpen, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800">
      <Copy className={`h-4 w-4 ${copied ? "text-emerald-500" : ""}`} />
      <span className="sr-only">Copy</span>
    </Button>
  );
}

function CodeSnippet({ code, language = "bash" }: { code: string; language?: string }) {
  return (
    <div className="relative group rounded-lg bg-zinc-950 border border-zinc-800/80 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
          </div>
          <span className="ml-2 text-xs font-mono text-zinc-500 font-medium">{language}</span>
        </div>
        <CopyButton text={code} />
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-zinc-300 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { health, info, loading } = useProxyData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-8 animate-pulse">
          <div className="h-12 w-3/4 bg-zinc-900 rounded-lg mx-auto"></div>
          <div className="h-6 w-1/2 bg-zinc-900 rounded mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="h-64 bg-zinc-900 rounded-xl"></div>
            <div className="h-64 bg-zinc-900 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for styling if not running in the real environment
  const displayInfo = info || {
    description: "A transparent proxy for OpenAI, Anthropic, Gemini, and OpenRouter APIs.",
    authentication: { header: "Authorization", scheme: "Bearer <PROXY_API_KEY>", note: "Required for all endpoints" },
    streaming: "Supported via SSE",
    providers: {
      openai: { sdkBaseUrl: "/openai", note: "Compatible with official OpenAI SDK", passthrough: ["/v1/chat/completions", "/v1/embeddings"], fakeResponse: ["/v1/models"], notImplemented: ["/v1/images/generations"], models: ["gpt-4-turbo", "gpt-4o", "gpt-3.5-turbo", "text-embedding-3-small"] },
      anthropic: { sdkBaseUrl: "/anthropic", note: "Compatible with official Anthropic SDK", passthrough: ["/v1/messages"], fakeResponse: [], notImplemented: ["/v1/complete"], models: ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"] },
      gemini: { sdkBaseUrl: "/gemini", note: "Compatible with official Google GenAI SDK", passthrough: ["/v1beta/models"], fakeResponse: [], notImplemented: [], models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"] },
      openrouter: { sdkBaseUrl: "/openrouter", note: "Compatible with OpenAI SDK using OpenRouter base URL", passthrough: ["/api/v1/chat/completions"], fakeResponse: [], notImplemented: [], models: ["meta-llama/llama-3-70b-instruct", "mistralai/mixtral-8x7b-instruct"] }
    }
  };

  const isHealthy = health?.status === "ok";

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground overflow-hidden">
      {/* Abstract Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]"></div>
      </div>

      {/* Navigation / Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl transition-all">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Layers className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">AI Proxy</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
              <a href="#how-it-works" className="hover:text-white transition-colors">Architecture</a>
              <a href="#providers" className="hover:text-white transition-colors">Providers</a>
              <a href="#sdks" className="hover:text-white transition-colors">SDKs</a>
            </div>
            <div className="h-4 w-px bg-zinc-800 hidden md:block"></div>
            <div className="flex items-center gap-2 text-sm font-medium bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800/50">
              <span className="relative flex h-2 w-2">
                {isHealthy ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
                )}
              </span>
              <span className={isHealthy ? "text-emerald-500 text-xs uppercase tracking-wider" : "text-zinc-400 text-xs uppercase tracking-wider"}>
                {isHealthy ? "Operational" : "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Section 1: Hero */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-6">
          <div className="container mx-auto max-w-5xl text-center">
            <FadeIn>
              <Badge variant="outline" className="mb-8 border-primary/30 text-primary bg-primary/10 px-4 py-1.5 text-sm rounded-full font-mono">
                v1.0.0 is now live
              </Badge>
            </FadeIn>
            <FadeIn delay={100}>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
                One Gateway.<br />Every Foundation Model.
              </h1>
            </FadeIn>
            <FadeIn delay={200}>
              <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                {displayInfo.description} Build multi-model applications without juggling keys, managing billing, or rewriting SDK logic.
              </p>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-14 px-8 rounded-full w-full sm:w-auto shadow-[0_0_40px_-10px_rgba(20,184,102,0.5)] transition-all hover:shadow-[0_0_60px_-10px_rgba(20,184,102,0.6)]">
                  Start Routing Requests <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-zinc-700 hover:bg-zinc-800 w-full sm:w-auto text-zinc-300 font-medium">
                  <BookOpen className="mr-2 h-4 w-4" /> View Documentation
                </Button>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Section 2: Value Proposition */}
        <section className="py-24 bg-zinc-950/30 border-y border-white/5 relative">
          <div className="container mx-auto px-6 max-w-6xl">
            <FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Zero Key Management</h3>
                  <p className="text-zinc-400 leading-relaxed">Stop circulating provider API keys in your environment variables. Use a single proxy token and handle rotation centrally.</p>
                </div>
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Code2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Native SDK Support</h3>
                  <p className="text-zinc-400 leading-relaxed">Don't rewrite your codebase. Simply change the `baseURL` in your existing OpenAI, Anthropic, or Gemini SDK instances.</p>
                </div>
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Full Streaming</h3>
                  <p className="text-zinc-400 leading-relaxed">First-class support for Server-Sent Events (SSE). {displayInfo.streaming}. Zero added latency to your token generation.</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Section 3: How it Works (Architecture) */}
        <section id="how-it-works" className="py-32 px-6">
          <div className="container mx-auto max-w-5xl">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Transparent by Design</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">The proxy sits invisible between your application and the model providers, translating authentication while passing bodies verbatim.</p>
              </div>
            </FadeIn>
            
            <FadeIn delay={200}>
              <div className="relative p-8 md:p-12 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
                
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                  {/* Client */}
                  <div className="flex-1 w-full p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/50">
                      <Terminal className="h-5 w-5 text-zinc-400" />
                      <span className="font-medium text-zinc-200">Your Application</span>
                    </div>
                    <div className="space-y-3 font-mono text-sm">
                      <div className="text-emerald-400">POST <span className="text-zinc-300">/openai/v1/chat/completions</span></div>
                      <div className="text-zinc-500">Authorization: <span className="text-zinc-300">Bearer &lt;PROXY_KEY&gt;</span></div>
                      <div className="text-zinc-500">{"{"}</div>
                      <div className="text-zinc-500 pl-4">"model": <span className="text-amber-300">"gpt-4o"</span>,</div>
                      <div className="text-zinc-500 pl-4">"messages": [...]</div>
                      <div className="text-zinc-500">{"}"}</div>
                    </div>
                  </div>

                  {/* Gateway */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <div className="h-16 w-[2px] bg-gradient-to-b from-transparent via-primary to-transparent lg:hidden my-2"></div>
                    <div className="hidden lg:block w-16 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mx-2"></div>
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(20,184,102,0.4)] z-10">
                      <Layers className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <div className="h-16 w-[2px] bg-gradient-to-b from-transparent via-primary to-transparent lg:hidden my-2"></div>
                    <div className="hidden lg:block w-16 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mx-2"></div>
                  </div>

                  {/* Provider */}
                  <div className="flex-1 w-full p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-full w-1 bg-blue-500"></div>
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/50">
                      <Globe className="h-5 w-5 text-blue-400" />
                      <span className="font-medium text-zinc-200">Provider API</span>
                    </div>
                    <div className="space-y-3 font-mono text-sm">
                      <div className="text-blue-400">POST <span className="text-zinc-300">/v1/chat/completions</span></div>
                      <div className="text-zinc-500">Authorization: <span className="text-zinc-300">Bearer sk-proj-***</span></div>
                      <div className="text-zinc-500">{"{"}</div>
                      <div className="text-zinc-500 pl-4">"model": <span className="text-amber-300">"gpt-4o"</span>,</div>
                      <div className="text-zinc-500 pl-4">"messages": [...]</div>
                      <div className="text-zinc-500">{"}"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Section 4: Configuration */}
        <section className="py-24 bg-zinc-950/80 border-y border-zinc-800/50 px-6">
          <div className="container mx-auto max-w-5xl">
            <FadeIn>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                  <Key className="h-5 w-5 text-zinc-300" />
                </div>
                <h2 className="text-2xl font-bold">Global Authentication</h2>
              </div>
              <p className="text-zinc-400 mb-8 max-w-2xl">{displayInfo.authentication.note}. Use this exact scheme across all supported providers regardless of their native authentication requirements.</p>
              
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800">
                  <div className="p-6">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Header Name</div>
                    <div className="font-mono text-zinc-200">{displayInfo.authentication.header}</div>
                  </div>
                  <div className="p-6 sm:col-span-2">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Header Value format</div>
                    <div className="font-mono text-primary flex items-center gap-2">
                      {displayInfo.authentication.scheme}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Section 5: Providers Catalog */}
        <section id="providers" className="py-32 px-6">
          <div className="container mx-auto max-w-6xl">
            <FadeIn>
              <h2 className="text-4xl font-bold mb-4">Supported Providers</h2>
              <p className="text-xl text-zinc-400 mb-16 max-w-2xl">Drop-in replacement for 4 major ecosystems. Route requests by simply changing the base URL.</p>
            </FadeIn>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Object.entries(displayInfo.providers).map(([id, provider], index) => (
                <FadeIn key={id} delay={index * 100}>
                  <Card className="bg-zinc-900/40 border-zinc-800/80 overflow-hidden h-full flex flex-col hover:border-zinc-700 transition-colors duration-300">
                    <div className="p-8 border-b border-zinc-800/50 bg-gradient-to-b from-zinc-900/80 to-transparent">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold capitalize flex items-center gap-3 mb-2">
                            <Cpu className={`h-6 w-6 ${id === 'openai' ? 'text-emerald-500' : id === 'anthropic' ? 'text-amber-500' : id === 'gemini' ? 'text-blue-500' : 'text-purple-500'}`} />
                            {id}
                          </h3>
                          <p className="text-zinc-400">{provider.note}</p>
                        </div>
                        <Badge variant="secondary" className="bg-zinc-950 text-zinc-300 border-zinc-800 font-mono py-1 px-3">
                          {provider.sdkBaseUrl}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-0 flex-1 flex flex-col">
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800/50 flex-1">
                        
                        {/* Left Col: Endpoints */}
                        <div className="p-8 space-y-8 bg-zinc-950/20">
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-500/90 mb-4 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" /> Allowed Endpoints
                            </h4>
                            <ul className="space-y-3">
                              {provider.passthrough.map(endpoint => (
                                <li key={endpoint} className="text-sm font-mono text-zinc-300 flex items-start gap-2">
                                  <span className="text-emerald-500/50 mt-0.5">→</span> {endpoint}
                                </li>
                              ))}
                              {provider.fakeResponse.map(endpoint => (
                                <li key={endpoint} className="text-sm font-mono text-zinc-300 flex items-start gap-2">
                                  <span className="text-blue-500/50 mt-0.5">→</span> {endpoint} <span className="text-zinc-600 text-xs ml-1">(static)</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {provider.notImplemented.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-500/90 mb-4 flex items-center gap-2">
                                <XCircle className="h-4 w-4" /> Blocked
                              </h4>
                              <ul className="space-y-3">
                                {provider.notImplemented.map(endpoint => (
                                  <li key={endpoint} className="text-sm font-mono text-zinc-500 flex items-start gap-2">
                                    <span className="text-rose-500/50 mt-0.5">×</span> {endpoint}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        {/* Right Col: Models */}
                        <div className="p-8 bg-zinc-950/50 flex flex-col">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                            <Terminal className="h-4 w-4" /> Available Models
                          </h4>
                          <div className="flex flex-col gap-2 mb-8">
                            {Array.isArray(provider.models) ? (
                              <>
                                {provider.models.slice(0, 4).map((model: string) => (
                                  <div key={model} className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm font-mono text-zinc-300">
                                    {model}
                                  </div>
                                ))}
                                {provider.models.length > 4 && (
                                  <div className="text-xs text-zinc-500 font-medium px-1 mt-2">
                                    + {provider.models.length - 4} additional models
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-400 italic">
                                {provider.models}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Code Examples */}
        <section id="sdks" className="py-24 bg-zinc-950 border-t border-zinc-800/50 px-6">
          <div className="container mx-auto max-w-5xl">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Zero Friction Integration</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">Use the SDKs you already know. Just point them at the proxy and inject your token.</p>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    OpenAI — Node.js SDK
                  </h3>
                  <CodeSnippet 
                    language="typescript"
                    code={`import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.PROXY_API_KEY,
  baseURL: '<YOUR_PROXY_BASE>/openai/v1',
});

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
});`} 
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Anthropic — Python SDK
                  </h3>
                  <CodeSnippet 
                    language="python"
                    code={`import anthropic, os

client = anthropic.Anthropic(
    api_key=os.environ["PROXY_API_KEY"],
    base_url="<YOUR_PROXY_BASE>/anthropic",
)

msg = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hi"}],
)`} 
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    Gemini — Python SDK
                  </h3>
                  <CodeSnippet 
                    language="python"
                    code={`import google.generativeai as genai
import os

genai.configure(
    api_key=os.environ["PROXY_API_KEY"],
    client_options={
        "api_endpoint": "<YOUR_PROXY_BASE>/gemini",
    },
)

model = genai.GenerativeModel("gemini-2.5-flash")
response = model.generate_content("Hello!")`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    OpenRouter — OpenAI-compatible SDK
                  </h3>
                  <CodeSnippet 
                    language="typescript"
                    code={`import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.PROXY_API_KEY,
  baseURL: '<YOUR_PROXY_BASE>/openrouter/api/v1',
});

const response = await client.chat.completions.create({
  model: 'meta-llama/llama-3.3-70b-instruct',
  messages: [{ role: 'user', content: 'Hello!' }],
});`}
                  />
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      
      {/* Footer / Final CTA */}
      <footer className="border-t border-zinc-800/80 bg-background relative z-10">
        <div className="container mx-auto px-6 py-20">
          <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl font-bold mb-6">Ready to simplify your AI stack?</h2>
            <p className="text-zinc-400 mb-8">Get your proxy key and start routing requests to any model in minutes.</p>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 px-8 rounded-full">
              Generate API Key
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-800/50 gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded flex items-center justify-center bg-zinc-900 border border-zinc-800">
                <Layers className="h-3 w-3 text-zinc-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-300">Replit Proxy</span>
            </div>
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} Replit, Inc. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm font-medium text-zinc-500">
              <a href="#" className="hover:text-zinc-300 transition-colors">Documentation</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">Status</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
