import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Map, Calendar, CloudSun, MapPin, 
  ChevronRight, Plus, Trash2, Sun, Cloud, 
  CloudRain, Snowflake, Wind, Navigation, Sparkles, CheckCircle, Search, Filter, ImageOff,
  Utensils, Castle, Trees, Camera, ShoppingBag, Droplets, Info, X, FileDown, Save, ChevronDown, Loader2
} from 'lucide-react';

// --- Gemini API 核心設定 ---
const apiKey = ""; // 執行環境將自動注入 Key

const fetchGemini = async (prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: "你是一位精通日本旅遊的專業規劃導師。你的回答必須簡潔、友善、富有吸引力，且使用繁體中文。請針對使用者的行程或天氣提供具體的建議。" }] }
  };
  const retryWithBackoff = async (fn, retries = 5, delay = 1000) => {
    try { return await fn(); } catch (err) {
      if (retries <= 0) throw err;
      await new Promise(res => setTimeout(res, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
  };
  return retryWithBackoff(async () => {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error('API call failed');
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "抱歉，我現在無法生成建議。";
  });
};

// --- 景點資料庫 ---
const ATTRACTIONS = [
  { id: 'a1', name: '淺草寺 雷門', area: '東京', type: '文化', img: 'https://images.unsplash.com/photo-1673187100526-09961b6636a7?q=80&w=800&auto=format&fit=crop' },
  { id: 'a2', name: '伏見稻荷大社', area: '京都', type: '文化', img: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?q=80&w=800&auto=format&fit=crop' },
  { id: 'a3', name: '道頓堀 固力果', area: '大阪', type: '美食', img: 'https://images.unsplash.com/photo-1542210940661-5f91cb7afe02?q=80&w=800&auto=format&fit=crop' },
  { id: 'a4', name: '富士山 河口湖', area: '山梨', type: '自然', img: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?q=80&w=800&auto=format&fit=crop' },
  { id: 'a5', name: '美瑛 拼布之路', area: '北海道', type: '自然', img: 'https://images.unsplash.com/photo-1694155011869-6ec870281cfa?q=80&w=800&auto=format&fit=crop' },
  { id: 'a6', name: '奈良公園 小鹿', area: '奈良', type: '體驗', img: 'https://images.unsplash.com/photo-1726737699208-bee1475d3a3f?q=80&w=800&auto=format&fit=crop' },
  { id: 'a7', name: '築地場外市場', area: '東京', type: '美食', img: 'https://images.unsplash.com/photo-1590582917892-a6e11d1b32bc?q=80&w=800&auto=format&fit=crop' },
  { id: 'a8', name: '東京晴空塔', area: '東京', type: '體驗', img: 'https://images.unsplash.com/photo-1650201885448-a04bc6bb4319?q=80&w=800&auto=format&fit=crop' },
  { id: 'a9', name: '金閣寺', area: '京都', type: '文化', img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=800&auto=format&fit=crop' },
  { id: 'a10', name: '心齋橋商店街', area: '大阪', type: '購物', img: 'https://images.unsplash.com/photo-1621640100416-6ca78546b306?q=80&w=800&auto=format&fit=crop' },
  { id: 'a11', name: '嵐山 竹林小徑', area: '京都', type: '自然', img: 'https://images.unsplash.com/photo-1510134882522-861074e2777f?q=80&w=800&auto=format&fit=crop' },
  { id: 'a12', name: '東京鐵塔', area: '東京', type: '文化', img: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=800&auto=format&fit=crop' },
  { id: 'a13', name: '新宿御苑', area: '東京', type: '自然', img: 'https://images.unsplash.com/photo-1582294152504-209214798a72?q=80&w=800&auto=format&fit=crop' },
  { id: 'a14', name: '大阪城公園', area: '大阪', type: '文化', img: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=800&auto=format&fit=crop' },
  { id: 'a15', name: '銀座 購物區', area: '東京', type: '購物', img: 'https://images.unsplash.com/photo-1586940866943-7f287383a152?q=80&w=800&auto=format&fit=crop' },
  { id: 'a16', name: '橫濱 未來港', area: '神奈川', type: '體驗', img: 'https://images.unsplash.com/photo-1555529324-da1794990391?q=80&w=800&auto=format&fit=crop' },
  { id: 'a20', name: '明治神宮', area: '東京', type: '文化', img: 'https://images.unsplash.com/photo-1608316104867-628d098e7276?q=80&w=800&auto=format&fit=crop' },
];

const FLOWER_SEASONS = [
  { id: 'spring', season: '春季', name: '櫻花 (Sakura)', period: '3月下旬 - 5月', months: [3, 4, 5], locations: ['新宿御苑', '哲學之道'], description: '2026 櫻花預想期：預計提早一週盛開。', imgUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=80', color: 'bg-pink-100 text-pink-700' },
  { id: 'summer', season: '夏季', name: '紫陽花 (Ajisai)', period: '6月 - 8月', months: [6, 7, 8], locations: ['鎌倉 長谷寺', '京都 三室戶寺'], description: '盛夏的紫色浪漫，名所紫陽花將迎來年度盛開高峰。', imgUrl: 'https://images.unsplash.com/photo-1569164062867-5c33655a4c94?auto=format&fit=crop&w=1200&q=80', color: 'bg-purple-100 text-purple-700' },
  { id: 'autumn', season: '秋季', name: '紅葉 (Momiji)', period: '10月中旬 - 12月', months: [9, 10, 11], locations: ['京都 清水寺', '嵐山渡月橋'], description: '2026 秋季紅葉特別點燈預約中，體驗層林盡染的詩意。', imgUrl: 'https://images.unsplash.com/photo-1670598669307-bcbad6b83727?auto=format&fit=crop&w=1200&q=80', color: 'bg-red-100 text-red-700' },
  { id: 'winter', season: '冬季', name: '雪祭 (Matsuri)', period: '12月 - 2月', months: [12, 1, 2], locations: ['札幌 大通公園', '金閣寺雪景'], description: '2026 札幌雪祭預計於 2 月初登場，體驗純白冰雪世界。', imgUrl: 'https://images.unsplash.com/photo-1701310869011-b560f5d75401?auto=format&fit=crop&w=1200&q=80', color: 'bg-blue-100 text-blue-700' }
];

const MOCK_WEATHER = [
  { city: '東京', temp: 18, condition: '晴朗', icon: Sun, humidity: 45, wind: '5 km/h', tip: '氣候宜人，建議穿著薄長袖搭配薄外套。' },
  { city: '京都', temp: 16, condition: '多雲', icon: CloudSun, humidity: 55, wind: '3 km/h', tip: '古都早晚溫差大，記得洋蔥式穿法。' },
  { city: '大阪', temp: 19, condition: '陰天', icon: Cloud, humidity: 60, wind: '8 km/h', tip: '適合美食散策，建議攜帶輕便雨具備用。' },
  { city: '札幌', temp: 5, condition: '小雪', icon: Snowflake, humidity: 80, wind: '12 km/h', tip: '積雪路滑，請穿著防滑靴與保暖大衣。' },
  { city: '福岡', temp: 20, condition: '小雨', icon: CloudRain, humidity: 75, wind: '10 km/h', tip: '空氣濕度高，出門記得帶把傘。' },
];

const CATEGORIES = ['全部', '美食', '文化', '自然', '體驗', '購物'];
const CITIES = ['全部', ...new Set(ATTRACTIONS.map(a => a.area))];

// --- Helper Components ---

const ImageWithFallback = ({ src, alt, type, className }) => {
  const [error, setError] = useState(false);
  const getIcon = () => {
    switch(type) {
      case '美食': return <Utensils className="w-8 h-8 opacity-30" />;
      case '文化': return <Castle className="w-8 h-8 opacity-30" />;
      case '自然': return <Trees className="w-8 h-8 opacity-30" />;
      case '購物': return <ShoppingBag className="w-8 h-8 opacity-30" />;
      default: return <Camera className="w-8 h-8 opacity-30" />;
    }
  };
  if (error) return (
    <div className={`${className} bg-slate-100 flex flex-col items-center justify-center p-2 text-slate-300 border border-slate-200/50`}>
      {getIcon()}
      <span className="mt-1 text-[8px] font-bold text-center uppercase tracking-tighter leading-none">{alt}</span>
    </div>
  );
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setError(true)} />;
};

// --- Main Components ---

const Header = ({ activeTab, setActiveTab }) => (
  <header className="sticky top-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-rose-100/30 px-4 h-16 flex items-center">
    <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
      <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setActiveTab('home')}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
          <MapPin className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-500 tracking-tight">Nippon Explorer</span>
      </div>
      <nav className="hidden md:flex gap-1">
        {[
          { id: 'home', icon: Navigation, label: '首頁探索' },
          { id: 'seasons', icon: Calendar, label: '花季資訊' },
          { id: 'weather', icon: CloudSun, label: '天氣預報' },
          { id: 'itinerary', icon: Map, label: '行程規劃' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ${activeTab === tab.id ? 'bg-rose-500 text-white shadow-xl font-bold' : 'text-gray-500 hover:bg-gray-100'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </nav>
    </div>
  </header>
);

const HomeSection = ({ setActiveTab }) => (
  <div className="flex flex-col flex-grow animate-fade-in relative min-h-[calc(100vh-4rem)] overflow-hidden">
    <div className="absolute inset-0 w-full h-full">
      <ImageWithFallback src="https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2000&auto=format&fit=crop" alt="Japan Immersion" type="自然" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
    </div>
    
    <div className="relative flex-grow flex flex-col justify-end p-6 md:p-16 lg:pb-32 z-10 text-left">
      <div className="max-w-6xl mx-auto w-full animate-fade-in">
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-rose-500 text-white rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg">
          <Sparkles className="w-3 h-3" /> 2026 Japan Edition
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] drop-shadow-2xl tracking-tighter">
          遇見最美的日本
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl font-medium leading-relaxed drop-shadow-md">
          從櫻花紛飛的古寺，到繁華街頭。帶您深入 2026 日本每一處驚喜與秘境。
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl">
          <button onClick={() => setActiveTab('itinerary')} className="group bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-[2.5rem] text-left hover:bg-white/20 transition-all flex flex-col gap-4 shadow-xl">
            <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white"><Map className="w-5 h-5" /></div>
            <div><h3 className="text-white font-black text-lg">行程規劃</h3><p className="text-white/50 text-[10px] mt-1 tracking-wider uppercase">Design Route</p></div>
          </button>
          <button onClick={() => setActiveTab('seasons')} className="group bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-[2.5rem] text-left hover:bg-white/20 transition-all flex flex-col gap-4 shadow-xl">
            <div className="w-10 h-10 bg-pink-500 rounded-2xl flex items-center justify-center text-white"><Calendar className="w-5 h-5" /></div>
            <div><h3 className="text-white font-black text-lg">花季預報</h3><p className="text-white/50 text-[10px] mt-1 tracking-wider uppercase">Flower Front</p></div>
          </button>
          <button onClick={() => setActiveTab('weather')} className="group bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-[2.5rem] text-left hover:bg-white/20 transition-all flex flex-col gap-4 shadow-xl">
            <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-white"><CloudSun className="w-5 h-5" /></div>
            <div><h3 className="text-white font-black text-lg">城市天氣</h3><p className="text-white/50 text-[10px] mt-1 tracking-wider uppercase">Forecast</p></div>
          </button>
        </div>
      </div>
      <div className="relative z-10 w-full text-center pb-8 opacity-40">
        <p className="text-white text-[10px] font-black tracking-[0.5em] uppercase">
          © 2026 Nippon Explorer // Crafting Your Soul Journey
        </p>
      </div>
    </div>
  </div>
);

const SeasonsSection = () => (
  <div className="max-w-6xl mx-auto px-4 py-20 animate-fade-in text-left">
    <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8 px-4">
      <h2 className="text-6xl font-black text-slate-900 leading-tight tracking-tighter">2026 <br />四季花卉曆</h2>
      <p className="text-slate-400 text-lg md:text-xl font-medium border-l-[6px] border-rose-500 pl-8 leading-relaxed max-w-md">
        日本的靈魂在於季節的流轉。我們為您精選了 2026 最具代表性的色彩。
      </p>
    </div>
    <div className="space-y-32">
      {FLOWER_SEASONS.map((s, i) => (
        <div key={s.id} className={`flex flex-col md:flex-row gap-16 items-center ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
          <div className="w-full md:w-[60%] rounded-[4rem] overflow-hidden shadow-2xl h-[450px]">
            <ImageWithFallback src={s.imgUrl} alt={s.name} type="自然" className="w-full h-full object-cover transition-transform hover:scale-105 duration-1000" />
          </div>
          <div className="w-full md:w-[40%] space-y-6">
            <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase ${s.color} shadow-sm inline-block`}>
              {s.season} • {s.period}
            </span>
            <h3 className="text-6xl font-black text-slate-900 tracking-tighter">{s.name}</h3>
            <p className="text-slate-500 text-xl leading-relaxed font-medium">{s.description}</p>
            <div className="pt-4 flex flex-wrap gap-2">
              {s.locations.map(l => <span key={l} className="bg-white border border-slate-100 shadow-sm px-4 py-2 rounded-2xl text-xs font-bold text-slate-600">📍 {l}</span>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const WeatherSection = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeCity, setActiveCity] = useState(null);
  const [aiTip, setAiTip] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  const dynamicWeather = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < selectedDate.length; i++) hash = selectedDate.charCodeAt(i) + ((hash << 5) - hash);
    return MOCK_WEATHER.map((w, idx) => ({ ...w, temp: w.temp + (Math.abs(hash + idx) % 5 - 2) }));
  }, [selectedDate]);

  const handleCityClick = async (city) => {
    setActiveCity(city);
    setAiTip("");
    setLoadingAi(true);
    const prompt = `針對 2026 年 ${selectedDate} 在 ${city.city} 的天氣情況（氣溫 ${city.temp}度，狀態為 ${city.condition}），請以時尚穿搭達人的角度，提供三句簡潔的穿衣與旅遊建議。`;
    try {
      const result = await fetchGemini(prompt);
      setAiTip(result);
    } catch {
      setAiTip("無法獲取 AI 建議。");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 animate-fade-in text-left">
      <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-8 md:p-14 mb-14 shadow-3xl text-left">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div>
            <h2 className="text-5xl font-black text-white mb-3 tracking-tight">氣候觀測站</h2>
            <p className="text-slate-400 text-xl font-medium">日本 2026 即時預報與 ✨ AI 達人穿搭建議</p>
          </div>
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-2 rounded-[2rem] flex items-center shadow-2xl">
            <div className="px-8 py-3 flex flex-col">
              <span className="text-[10px] text-rose-400 font-black uppercase tracking-widest mb-1">預測日期</span>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-transparent border-none text-white font-black text-2xl outline-none focus:ring-0 p-0 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {dynamicWeather.map(w => (
          <div key={w.city} onClick={() => handleCityClick(w)} className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all cursor-pointer group hover:-translate-y-2">
            <div className="flex justify-between items-start mb-8 text-left">
              <span className="font-black text-3xl text-slate-800 tracking-tighter">{w.city}</span>
              <w.icon className={`w-12 h-12 ${w.condition === '晴朗' ? 'text-yellow-400' : 'text-blue-300'}`} />
            </div>
            <div className="text-7xl font-black mb-6 tracking-tighter">{w.temp}°<span className="text-xl font-normal text-slate-300">C</span></div>
            <div className="space-y-3 pt-6 border-t border-slate-50 text-[11px] font-bold text-slate-400 uppercase">
              <div className="flex justify-between"><span>💧 濕度</span><span className="text-slate-800">{w.humidity}%</span></div>
              <div className="flex justify-between"><span>🌬️ 風速</span><span className="text-slate-800">{w.wind}</span></div>
            </div>
          </div>
        ))}
      </div>
      
      {activeCity && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-3xl relative animate-fade-in text-left">
            <button onClick={() => setActiveCity(null)} className="absolute top-10 right-10 p-4 bg-slate-100 rounded-full hover:bg-rose-500 hover:text-white transition-all"><X className="w-5 h-5" /></button>
            <h3 className="text-5xl font-black mb-3 tracking-tighter">{activeCity.city}</h3>
            <p className="text-rose-500 font-black text-2xl mb-10 uppercase">{activeCity.condition} // Forecast</p>
            <div className="bg-slate-50 p-8 rounded-[3rem] mb-10 border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" /> ✨ AI 穿搭達人建議
              </h4>
              {loadingAi ? (
                <div className="flex items-center gap-2 py-4 text-slate-400"><Loader2 className="animate-spin w-4 h-4" /> 分析天氣中...</div>
              ) : (
                <p className="text-slate-700 text-lg leading-relaxed font-bold italic">{aiTip || activeCity.tip}</p>
              )}
            </div>
            <button onClick={() => setActiveCity(null)} className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl text-xl hover:bg-rose-600 transition-colors">了解了</button>
          </div>
        </div>
      )}
    </div>
  );
};

const ItinerarySection = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0]);
  const [activeDay, setActiveDay] = useState(1);
  const [tripDays, setTripDays] = useState({ 1: [] });
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterMode, setFilterMode] = useState('all');
  const [filterValue, setFilterValue] = useState('全部');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [aiOptimization, setAiOptimization] = useState("");
  const [optimizing, setOptimizing] = useState(false);

  const totalDays = useMemo(() => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    return (e >= s) ? Math.ceil((e - s) / 86400000) + 1 : 1;
  }, [startDate, endDate]);

  const currentActiveDate = useMemo(() => {
    return new Date(new Date(startDate).getTime() + (activeDay - 1) * 86400000);
  }, [startDate, activeDay]);

  const seasonalTip = useMemo(() => {
    const month = currentActiveDate.getMonth() + 1;
    return FLOWER_SEASONS.find(s => s.months.includes(month));
  }, [currentActiveDate]);

  const filteredAttractions = useMemo(() => {
    return ATTRACTIONS.filter(a => {
      const matchSearch = a.name.includes(searchTerm) || a.area.includes(searchTerm);
      let matchFilter = true;
      if (filterMode === 'city' && filterValue !== '全部') matchFilter = a.area === filterValue;
      if (filterMode === 'category' && filterValue !== '全部') matchFilter = a.type === filterValue;
      return matchSearch && matchFilter;
    });
  }, [searchTerm, filterMode, filterValue]);

  const addToTrip = (attr) => {
    setTripDays(prev => {
      const list = prev[activeDay] || [];
      if (list.find(i => i.id === attr.id)) return prev;
      return { ...prev, [activeDay]: [...list, attr] };
    });
    setAiOptimization(""); 
  };

  const handleAiOptimize = async () => {
    const spots = tripDays[activeDay] || [];
    if (spots.length === 0) return;
    setOptimizing(true);
    const spotNames = spots.map(s => s.name).join('、');
    const prompt = `我在 ${currentActiveDate.toLocaleDateString()} 的行程包含了：${spotNames}。請作為專業導遊，幫我排序遊玩順序，並給予一個該天的交通與用餐的亮點建議。字數控制在 150 字內。`;
    try {
      const result = await fetchGemini(prompt);
      setAiOptimization(result);
    } catch {
      setAiOptimization("AI 暫時休息中，請稍後再試。");
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 animate-fade-in text-left">
      <div className="grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7">
          <div className="mb-14 bg-white p-10 rounded-[3.5rem] border border-rose-100 shadow-sm border-l-[16px] border-l-rose-500">
            <h3 className="font-black text-4xl mb-8">2026 計畫起點</h3>
            <div className="grid grid-cols-2 gap-10 mb-8">
              <div className="space-y-3">
                <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">出發日期</span>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-50 border-none rounded-[1.5rem] p-5 font-black text-slate-800 shadow-inner" />
              </div>
              <div className="space-y-3">
                <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">最後日期</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-50 border-none rounded-[1.5rem] p-5 font-black text-slate-800 shadow-inner" />
              </div>
            </div>
            {seasonalTip && (
              <div className={`p-8 rounded-[3rem] flex items-start gap-8 ${seasonalTip.color} bg-opacity-40 border border-current border-opacity-10 backdrop-blur-md`}>
                <Sparkles className="w-10 h-10 shrink-0 animate-bounce text-rose-600" />
                <div>
                  <h4 className="font-black text-2xl mb-2 tracking-tight text-left text-inherit">Day {activeDay} 靈感 ({currentActiveDate.getMonth()+1}月)：</h4>
                  <p className="text-lg font-bold opacity-80 leading-relaxed italic text-left text-inherit">「 {seasonalTip.description} 」</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-10 space-y-8">
            <div className="relative flex items-center group overflow-hidden">
              <div className="absolute left-8 z-10 text-slate-300 group-focus-within:text-rose-500 transition-colors pointer-events-none">
                <Search className="w-8 h-8" />
              </div>
              <input 
                type="text" 
                placeholder="尋找東京、京都景點..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full pl-24 pr-10 py-7 rounded-[3.5rem] border border-slate-100 shadow-sm focus:ring-[12px] focus:ring-rose-50 outline-none text-2xl font-medium transition-all" 
              />
            </div>

            <div className="flex flex-row items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} 
                  className="flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-full text-sm font-black transition-all hover:bg-black whitespace-nowrap"
                >
                  <Filter className="w-4 h-4" /> 
                  {filterMode === 'all' ? '全部景點' : filterMode === 'city' ? '按城市' : '按類別'} 
                  <ChevronDown className={`w-4 h-4 transition-transform ${isFilterMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isFilterMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl z-50 py-3 overflow-hidden animate-fade-in">
                    <button onClick={() => { setFilterMode('all'); setFilterValue('全部'); setIsFilterMenuOpen(false); }} className="w-full px-6 py-4 text-left text-sm font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors">全部顯示</button>
                    <button onClick={() => { setFilterMode('city'); setFilterValue('全部'); setIsFilterMenuOpen(false); }} className="w-full px-6 py-4 text-left text-sm font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors">按城市分區</button>
                    <button onClick={() => { setFilterMode('category'); setFilterValue('全部'); setIsFilterMenuOpen(false); }} className="w-full px-6 py-4 text-left text-sm font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors">按功能分類</button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-row gap-3 overflow-x-auto pb-6 scrollbar-custom items-center min-h-[80px]">
                {filterMode === 'city' && CITIES.map(c => (
                  <button key={c} onClick={() => setFilterValue(c)} className={`px-10 py-4 rounded-full text-xs font-black transition-all whitespace-nowrap shadow-sm border ${filterValue === c ? 'bg-rose-500 text-white border-rose-500 shadow-lg scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-rose-200'}`}>{c}</button>
                ))}
                {filterMode === 'category' && CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setFilterValue(cat)} className={`px-10 py-4 rounded-full text-xs font-black transition-all whitespace-nowrap shadow-sm border ${filterValue === cat ? 'bg-rose-500 text-white border-rose-500 shadow-lg scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-rose-200'}`}>{cat}</button>
                ))}
                {filterMode === 'all' && (
                  <div className="px-6 text-slate-300 text-xs font-bold tracking-widest uppercase whitespace-nowrap">顯示所有收錄景點</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-10 max-h-[800px] overflow-y-auto pr-6 custom-scroll">
            {filteredAttractions.map(a => (
              <div key={a.id} className="bg-white p-6 rounded-[3rem] border border-slate-50 flex items-center gap-6 hover:shadow-2xl transition-all group relative text-left">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] overflow-hidden shrink-0 shadow-lg"><ImageWithFallback src={a.img} alt={a.name} type={a.type} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /></div>
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="font-black text-slate-900 text-lg md:text-xl mb-1 tracking-tight leading-snug break-words">{a.name}</h4>
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest truncate">{a.area} - {a.type}</p>
                </div>
                <button onClick={() => addToTrip(a)} className="bg-rose-500 text-white p-2.5 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:rotate-180 transform translate-x-4 group-hover:translate-x-0 shrink-0"><Plus className="w-6 h-6" /></button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[4rem] p-12 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.12)] border border-slate-50 sticky top-28">
            <div className="flex justify-between items-center mb-14 text-left">
              <h3 className="text-4xl font-black flex items-center gap-6"><Sparkles className="w-12 h-12 text-rose-500" /> 探險筆記</h3>
              {(tripDays[activeDay] || []).length > 1 && (
                <button onClick={handleAiOptimize} disabled={optimizing} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50">
                  {optimizing ? <Loader2 className="animate-spin w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                  ✨ AI 智能優化
                </button>
              )}
            </div>
            
            <div className="flex flex-row gap-5 overflow-x-auto pb-8 mb-8 items-center min-h-[140px] scrollbar-custom-wide">
              {Array.from({ length: totalDays }).map((_, i) => {
                const day = i + 1;
                const dObj = new Date(new Date(startDate).getTime() + i * 86400000);
                return (
                  <button 
                    key={day} 
                    onClick={() => setActiveDay(day)} 
                    className={`px-12 py-7 rounded-[2.5rem] text-sm font-black shrink-0 transition-all text-center whitespace-nowrap min-w-[160px] shadow-sm ${activeDay === day ? 'bg-slate-900 text-white shadow-2xl scale-110' : 'bg-slate-50 text-slate-300 hover:bg-slate-100 hover:scale-105'}`}
                  >
                    Day {day}
                    <span className="block text-[12px] font-bold mt-2 opacity-60 tracking-widest uppercase">{dObj.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="space-y-6 min-h-[400px] overflow-y-auto max-h-[550px] pr-2 custom-scroll text-left">
              {aiOptimization && (
                <div className="p-8 bg-gradient-to-br from-rose-50 to-pink-50 rounded-[3rem] border border-rose-100 animate-fade-in mb-8">
                  <div className="flex items-center gap-3 mb-4 text-rose-500 font-black text-sm uppercase tracking-widest text-left"><Sparkles className="w-5 h-5" /> AI 行程大師建議</div>
                  <p className="text-slate-700 text-base leading-relaxed font-bold italic text-left">「 {aiOptimization} 」</p>
                </div>
              )}
              {(tripDays[activeDay] || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 border-[10px] border-dashed border-slate-50 rounded-[4rem] text-slate-200">
                  <Navigation className="w-20 h-20 mb-8 opacity-5" />
                  <p className="font-black text-2xl tracking-tighter uppercase opacity-30">Await Exploration</p>
                </div>
              ) : (
                tripDays[activeDay].map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex items-center gap-6 bg-slate-50/70 p-8 rounded-[2.5rem] border border-white hover:border-rose-200 transition-all group text-left">
                    <div className="w-14 h-14 rounded-[1.5rem] bg-white shadow-sm text-rose-500 flex items-center justify-center text-xl font-black shrink-0">{idx+1}</div>
                    <div className="flex-1 font-black text-2xl text-slate-800 tracking-tighter leading-none break-words">{item.name}</div>
                    <button onClick={() => setTripDays(p => ({...p, [activeDay]: p[activeDay].filter((_,i)=>i!==idx)}))} className="text-slate-300 hover:text-rose-500 transition-colors p-3 shrink-0"><Trash2 className="w-8 h-8" /></button>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-16 grid grid-cols-2 gap-6">
              <button onClick={() => {setIsSaved(true); setTimeout(()=>setIsSaved(false),2000)}} className={`py-7 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 transition-all shadow-2xl ${isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-black hover:-translate-y-2'}`}>{isSaved ? <CheckCircle className="w-8 h-8" /> : <Save className="w-8 h-8" />} {isSaved ? '計畫鎖定' : '儲存行程'}</button>
              <button className="py-7 rounded-[2.5rem] bg-rose-500 text-white font-black text-xl flex items-center justify-center gap-4 shadow-2xl shadow-rose-100 hover:bg-rose-600 hover:-translate-y-2 transition-all"><FileDown className="w-8 h-8" /> 匯出清單</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = `
      .animate-fade-in { animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      .custom-scroll::-webkit-scrollbar { width: 8px; }
      .custom-scroll::-webkit-scrollbar-thumb { background: #fee2e2; border-radius: 40px; }
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .shadow-3xl { box-shadow: 0 50px 120px -30px rgba(0,0,0,0.15); }
      .no-wrap { flex-wrap: nowrap !important; }
      .scrollbar-custom::-webkit-scrollbar { height: 10px; display: block !important; }
      .scrollbar-custom::-webkit-scrollbar-thumb { background: #fee2e2; border-radius: 10px; border: 2px solid white; }
      .scrollbar-custom::-webkit-scrollbar-track { background: #f9fafb; border-radius: 10px; }
      .scrollbar-custom-wide::-webkit-scrollbar { height: 12px; display: block !important; }
      .scrollbar-custom-wide::-webkit-scrollbar-thumb { background: #fee2e2; border-radius: 10px; border: 3px solid white; }
      .scrollbar-custom-wide::-webkit-scrollbar-track { background: #f9fafb; border-radius: 10px; }
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900 selection:bg-rose-100 selection:text-rose-600 overflow-x-hidden">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-grow flex flex-col">
        {activeTab === 'home' && <HomeSection setActiveTab={setActiveTab} />}
        {activeTab === 'seasons' && <SeasonsSection />}
        {activeTab === 'weather' && <WeatherSection />}
        {activeTab === 'itinerary' && <ItinerarySection />}
      </main>
      {activeTab !== 'home' && (
        <footer className="max-w-6xl mx-auto px-4 py-10 w-full text-slate-200 text-[11px] font-black tracking-[0.5em] text-center uppercase shrink-0">
          © 2026 Nippon Explorer // Crafting Your Soul Journey
        </footer>
      )}
    </div>
  );
}