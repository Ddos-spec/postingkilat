import { useState } from 'react';
import { 
  LayoutDashboard, 
  PenTool, 
  Image as ImageIcon, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Zap,
  CreditCard,
  Loader2,
  Copy,
  CheckCircle2
} from 'lucide-react';

const CONTENT_TYPES = [
  'Artikel SEO', 
  'Caption Instagram', 
  'Thread Twitter', 
  'Email Marketing', 
  'Deskripsi Produk', 
  'Script Video'
];

function App() {
  const [activeTab, setActiveTab] = useState('generate'); // Default ke generate buat testing
  
  // State untuk form generate
  const [selectedType, setSelectedType] = useState('Caption Instagram');
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async () => {
    if (!promptInput.trim()) {
      setErrorMsg('Topik atau kata kunci nggak boleh kosong, Bos!');
      return;
    }
    
    setErrorMsg('');
    setIsGenerating(true);
    setGeneratedContent('');
    setIsCopied(false);

    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      
      if (!apiKey) {
        throw new Error("API Key OpenRouter belum diset di file .env (VITE_OPENROUTER_API_KEY)");
      }

      const systemPrompt = `Lu adalah asisten AI profesional spesialis pembuat konten. Buatkan konten dengan tipe "${selectedType}" berdasarkan instruksi berikut. Gunakan bahasa Indonesia yang luwes dan sesuai konteks.`;
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:5173", // Site URL
          "X-Title": "KontenKilat AI Local Testing", // Site Name
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash", // Pakai model yg lumayan cepat dan pintar sbg default
          messages: [
            {"role": "system", "content": systemPrompt},
            {"role": "user", "content": promptInput}
          ],
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Gagal generate konten dari OpenRouter.');
      }

      const data = await response.json();
      setGeneratedContent(data.choices[0].message.content);
      
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Zap className="w-6 h-6 text-indigo-600 mr-2" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            KontenKilat AI
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('generate')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'generate' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <PenTool className="w-5 h-5 mr-3" /> Generate Konten
          </button>
          <button className="w-full flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all">
            <ImageIcon className="w-5 h-5 mr-3" /> Studio Gambar
          </button>
          <button className="w-full flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all">
            <MessageSquare className="w-5 h-5 mr-3" /> Chat Assistant
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-200">
            <p className="text-xs text-slate-500 font-medium mb-1">Sisa Kuota AI</p>
            <div className="flex items-end justify-between">
              <span className="text-lg font-bold text-slate-800">4,250 <span className="text-xs font-normal">kata</span></span>
              <button className="text-indigo-600 hover:text-indigo-700 p-1">
                <CreditCard className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          
          <button className="w-full flex items-center px-4 py-2 text-slate-600 hover:text-red-600 transition-colors">
            <Settings className="w-5 h-5 mr-3" /> Settings
          </button>
          <button className="w-full flex items-center px-4 py-2 text-slate-600 hover:text-red-600 transition-colors mt-1">
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold text-slate-800">
            {activeTab === 'dashboard' ? 'Overview' : 'AI Generator Studio'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
              FA
            </div>
          </div>
        </header>

        {/* SCROLLABLE AREA */}
        <div className="flex-1 overflow-auto p-8">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-500 text-sm font-medium">Total Konten Dibuat</h3>
                <p className="text-3xl font-bold text-slate-800 mt-2">128</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-500 text-sm font-medium">Pengeluaran API</h3>
                <p className="text-3xl font-bold text-slate-800 mt-2">Rp 45.000</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
                <h3 className="text-indigo-600 text-sm font-bold">Paket Aktif</h3>
                <p className="text-xl font-bold text-slate-800 mt-1">Pro Creator</p>
                <p className="text-xs text-slate-400 mt-1">Aktif s/d 12 Jun 2026</p>
              </div>
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-xl font-bold mb-6">Pilih Tipe Konten</h2>
              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-8">
                {CONTENT_TYPES.map((type) => (
                  <button 
                    key={type} 
                    onClick={() => setSelectedType(type)}
                    className={`p-4 border rounded-xl text-left transition-all group ${selectedType === type ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                  >
                    <h3 className={`font-semibold ${selectedType === type ? 'text-indigo-700' : 'text-slate-800 group-hover:text-indigo-600'}`}>{type}</h3>
                    <p className="text-xs text-slate-500 mt-1">Generate otomatis dengan AI</p>
                  </button>
                ))}
              </div>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Topik atau Kata Kunci</label>
                <textarea 
                  className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                  placeholder="Contoh: Buatkan caption instagram untuk promosi sepatu lari terbaru dengan gaya bahasa anak skena jaksel..."
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  disabled={isGenerating}
                ></textarea>
                
                <div className="flex justify-end">
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-8 rounded-xl flex items-center transition-all shadow-md shadow-indigo-200"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />} 
                    {isGenerating ? 'Sedang Mikir...' : 'Generate Sekarang'}
                  </button>
                </div>

                {generatedContent && (
                  <div className="mt-8 pt-8 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-slate-800">Hasil Generate</h3>
                      <button 
                        onClick={handleCopy}
                        className={`flex items-center text-sm px-3 py-1.5 rounded-lg transition-all ${isCopied ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {isCopied ? 'Tercopy!' : 'Copy Text'}
                      </button>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 whitespace-pre-wrap text-slate-700 leading-relaxed">
                      {generatedContent}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;