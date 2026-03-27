import React, { useState, useEffect, useMemo } from 'react';
import { 
  Map, Calendar, CloudSun, MapPin, 
  ChevronRight, Plus, Trash2, Sun, Cloud, 
  CloudRain, Snowflake, Wind, Navigation, Sparkles, CheckCircle
} from 'lucide-react';

// --- Mock Data ---

const FLOWER_SEASONS = [
  {
    id: 'spring',
    season: '春季',
    name: '櫻花 (Sakura)',
    period: '2026年 3月下旬 - 5月上旬',
    months: [3, 4, 5],
    locations: ['東京 新宿御苑', '京都 哲學之道', '青森 弘前公園'],
    description: '2026最新櫻花前線！今年關東地區預計提早綻放，全國各地將再次被粉色浪漫包圍。',
    imgUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    color: 'bg-pink-100 text-pink-700'
  },
  {
    id: 'summer',
    season: '夏季',
    name: '薰衣草 & 紫陽花',
    period: '2026年 6月中旬 - 8月上旬',
    months: [6, 7, 8],
    locations: ['北海道 富良野', '鎌倉 長谷寺', '京都 三室戶寺'],
    description: '2026年氣候溫暖，預期富良野的薰衣草將迎來近年最美的滿開狀態。',
    imgUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=800&q=80',
    color: 'bg-purple-100 text-purple-700'
  },
  {
    id: 'autumn',
    season: '秋季',
    name: '紅葉 (Momiji)',
    period: '2026年 10月下旬 - 12月上旬',
    months: [9, 10, 11],
    locations: ['京都 清水寺', '日光 東照宮', '奈良公園'],
    description: '漫山遍野的楓紅與銀杏，2026秋季特別夜間點燈活動將於京都各大寺院擴大舉辦。',
    imgUrl: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=800&q=80',
    color: 'bg-red-100 text-red-700'
  },
  {
    id: 'winter',
    season: '冬季',
    name: '梅花 & 水仙',
    period: '2026年 1月下旬 - 3月上旬',
    months: [12, 1, 2],
    locations: ['茨城 偕樂園', '福岡 太宰府天滿宮', '靜岡 伊豆'],
    description: '在2026年嚴寒中綻放的梅花，宣告著春天的腳步即將到來，早春賞梅人潮預計大增。',
    imgUrl: 'https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&w=800&q=80',
    color: 'bg-blue-100 text-blue-700'
  }
];

const MOCK_WEATHER = [
  { city: '東京', temp: 18, condition: 'Sunny', icon: Sun, high: 22, low: 12 },
  { city: '京都', temp: 16, condition: 'Partly Cloudy', icon: CloudSun, high: 20, low: 10 },
  { city: '大阪', temp: 19, condition: 'Cloudy', icon: Cloud, high: 23, low: 14 },
  { city: '札幌', temp: 5, condition: 'Snow', icon: Snowflake, high: 8, low: -2 },
  { city: '福岡', temp: 20, condition: 'Rain', icon: CloudRain, high: 24, low: 16 },
  { city: '那霸', temp: 26, condition: 'Sunny', icon: Sun, high: 28, low: 22 },
];

const ATTRACTIONS = [
  { id: 'a1', name: '淺草寺 雷門', area: '東京', type: '文化', img: 'https://images.unsplash.com/photo-1532236204992-f5e85c024202?auto=format&fit=crop&w=400&q=80' },
  { id: 'a2', name: '伏見稻荷大社', area: '京都', type: '神社', img: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=400&q=80' },
  { id: 'a3', name: '道頓堀', area: '大阪', type: '美食', img: 'https://images.unsplash.com/photo-1590559899731-a382839ce501?auto=format&fit=crop&w=400&q=80' },
  { id: 'a4', name: '富士山 河口湖', area: '山梨', type: '自然', img: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=400&q=80' },
  { id: 'a5', name: '美瑛 拼布之路', area: '北海道', type: '自然', img: 'https://images.unsplash.com/photo-1570114686525-24c600100f91?auto=format&fit=crop&w=400&q=80' },
  { id: 'a6', name: '奈良公園', area: '奈良', type: '體驗', img: 'https://images.unsplash.com/photo-1588614959060-4d144f28b2ea?auto=format&fit=crop&w=400&q=80' },
];

// --- Components ---

const Header = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Navigation, label: '首頁探索' },
    { id: 'seasons', icon: Calendar, label: '花季資訊' },
    { id: 'weather', icon: CloudSun, label: '天氣預報' },
    { id: 'itinerary', icon: Map, label: '行程規劃' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-400 to-pink-500 flex items-center justify-center">
              <MapPin className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-500">
              Nippon Explorer
            </span>
          </div>
          <nav className="hidden md:flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-rose-50 text-rose-600 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-500' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
          {/* Mobile menu button could go here */}
          <div className="md:hidden flex items-center">
            <select 
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="bg-rose-50 border-none text-rose-600 font-medium rounded-lg p-2 focus:ring-0"
            >
              {tabs.map(tab => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

const HomeSection = ({ setActiveTab }) => (
  <div className="animate-fade-in">
    <div className="relative h-[70vh] rounded-3xl overflow-hidden mx-4 mt-6 shadow-2xl flex items-center justify-center">
      <img 
        src="https://images.unsplash.com/photo-1522324021575-d1ce7bf32185?auto=format&fit=crop&w=2000&q=80" 
        alt="Japan Landscape" 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
      <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full max-w-3xl z-20">
        <span className="px-3 py-1 bg-rose-500/80 text-white rounded-full text-sm font-medium backdrop-blur-sm mb-4 inline-block">
          Explore Japan 2026
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          遇見最美的日本 <br /> 展開專屬旅程
        </h1>
        <p className="text-lg text-gray-200 mb-8 max-w-xl line-clamp-2 md:line-clamp-none">
          從櫻花紛飛的京都古寺，到白雪皚皚的北海道大地。在這裡掌握最新花季、天氣動態，輕鬆規劃您的完美行程。
        </p>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setActiveTab('itinerary')}
            className="bg-white text-rose-600 px-6 py-3 rounded-full font-bold hover:bg-rose-50 transition-colors shadow-lg flex items-center gap-2"
          >
            開始規劃行程 <ChevronRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('seasons')}
            className="bg-black/30 backdrop-blur-md border border-white/50 text-white px-6 py-3 rounded-full font-bold hover:bg-black/50 transition-colors flex items-center gap-2"
          >
            查看當季花況
          </button>
        </div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-4 mt-16 mb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer border border-gray-100" onClick={() => setActiveTab('seasons')}>
          <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 text-pink-600">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">四季花卉指南</h3>
          <p className="text-gray-500 leading-relaxed">掌握櫻花前線、賞楓最佳時機，不錯過任何一處絕美風景。</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer border border-gray-100" onClick={() => setActiveTab('weather')}>
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
            <CloudSun className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">即時天氣掌握</h3>
          <p className="text-gray-500 leading-relaxed">提供日本各大城市即時天氣與氣溫，協助您準備最適合的行囊。</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer border border-gray-100" onClick={() => setActiveTab('itinerary')}>
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
            <Map className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">客製行程規劃</h3>
          <p className="text-gray-500 leading-relaxed">輕鬆挑選喜愛的景點，一鍵加入您的專屬旅遊清單中。</p>
        </div>
      </div>
    </div>
  </div>
);

const SeasonsSection = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">日本四季花卉曆</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">日本的魅力在於四季分明，每個季節都有專屬的色彩與花卉。為您的旅程挑選最美的背景吧。</p>
      </div>

      <div className="space-y-12">
        {FLOWER_SEASONS.map((season, index) => (
          <div key={season.id} className={`flex flex-col md:flex-row gap-8 items-center ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
            <div className="w-full md:w-1/2">
              <div className="relative overflow-hidden rounded-3xl shadow-xl group">
                <img 
                  src={season.imgUrl} 
                  alt={season.name} 
                  className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-6 md:px-8">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${season.color}`}>
                {season.season} • {season.period}
              </span>
              <h3 className="text-4xl font-bold text-gray-900">{season.name}</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                {season.description}
              </p>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" /> 推薦賞花名所
                </h4>
                <div className="flex flex-wrap gap-2">
                  {season.locations.map((loc, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WeatherSection = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const refreshWeather = () => {
    setLastUpdated(new Date().toLocaleTimeString());
  };

  // 根據選擇的日期計算出模擬的天氣變化
  const displayWeather = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < selectedDate.length; i++) {
      hash = selectedDate.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return MOCK_WEATHER.map((data, idx) => {
      const offset = (Math.abs(hash + idx) % 11) - 5; // 產生 -5 到 +5 的溫度波動
      const conditionRoll = Math.abs(hash + idx * 3) % 4; // 隨機天氣狀態
      
      let newCond = data.condition;
      let newIcon = data.icon;
      
      if (conditionRoll === 0) { newCond = 'Rain'; newIcon = CloudRain; }
      else if (conditionRoll === 1) { newCond = 'Cloudy'; newIcon = Cloud; }
      else if (conditionRoll === 2) { newCond = 'Sunny'; newIcon = Sun; }
      else if (conditionRoll === 3 && data.temp < 10) { newCond = 'Snow'; newIcon = Snowflake; }
      
      return {
        ...data,
        temp: data.temp + offset,
        high: data.high + offset,
        low: data.low + offset,
        condition: newCond,
        icon: newIcon
      };
    });
  }, [selectedDate]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">即時天氣概況</h2>
          <p className="text-gray-500">掌握各地氣候，聰明打包行李 (更新時間: {lastUpdated})</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 flex items-center shadow-sm">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none focus:ring-0 text-sm text-gray-700 bg-transparent outline-none cursor-pointer"
            />
          </div>
          <button 
            onClick={refreshWeather}
            className="text-rose-500 hover:text-rose-600 font-medium text-sm flex items-center gap-1 bg-rose-50 px-3 py-2 rounded-lg"
          >
            <Wind className="w-4 h-4" /> 更新數據
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayWeather.map((data, idx) => {
          const Icon = data.icon;
          return (
            <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
              {/* Decorative background blur */}
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-blue-50 to-rose-50 rounded-full blur-2xl opacity-60"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{data.city}</h3>
                  <p className="text-gray-500 text-sm">{data.condition}</p>
                </div>
                <Icon className={`w-10 h-10 ${
                  data.condition === 'Sunny' ? 'text-yellow-400' : 
                  data.condition === 'Snow' ? 'text-blue-300' : 'text-gray-400'
                }`} />
              </div>
              
              <div className="mt-8 flex items-baseline gap-2 relative z-10">
                <span className="text-5xl font-black text-gray-900">{data.temp}°</span>
                <span className="text-gray-500 font-medium">C</span>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between text-sm relative z-10">
                <span className="text-gray-500 flex items-center gap-1">
                  最高 <span className="font-semibold text-gray-900">{data.high}°</span>
                </span>
                <span className="text-gray-500 flex items-center gap-1">
                  最低 <span className="font-semibold text-gray-900">{data.low}°</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ItinerarySection = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeDay, setActiveDay] = useState(1);
  const [tripDays, setTripDays] = useState({ 1: [] }); // 記錄每一天的行程
  const [isSaved, setIsSaved] = useState(false); // 新增儲存狀態

  // 計算總天數
  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 1;
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  // 如果總天數縮減，自動將 activeDay 設回最後一天
  useEffect(() => {
    if (activeDay > totalDays) setActiveDay(totalDays);
  }, [totalDays, activeDay]);

  const addToTrip = (attraction) => {
    setTripDays(prev => {
      const currentDayTrip = prev[activeDay] || [];
      if (currentDayTrip.find(item => item.id === attraction.id)) return prev;
      return { ...prev, [activeDay]: [...currentDayTrip, attraction] };
    });
  };

  const removeFromTrip = (dayIndex, id) => {
    setTripDays(prev => ({
      ...prev,
      [dayIndex]: prev[dayIndex].filter(item => item.id !== id)
    }));
  };

  // 取得目前選定天數的陣列
  const currentDayAttractions = tripDays[activeDay] || [];
  
  // 計算所有天數加入的總景點數
  const totalAttractionsCount = Object.values(tripDays).reduce((acc, curr) => acc + curr.length, 0);

  // 根據選擇的出發日期推薦當季花季活動
  const suggestedSeason = useMemo(() => {
    if (!startDate) return null;
    const month = new Date(startDate).getMonth() + 1; // 取得月份 (1-12)
    return FLOWER_SEASONS.find(season => season.months.includes(month));
  }, [startDate]);

  // 處理儲存行程的動畫與邏輯
  const handleSaveTrip = () => {
    setIsSaved(true);
    // 模擬 API 儲存的過程，3秒後恢復按鈕狀態
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">我的專屬行程</h2>
        <p className="text-gray-500">從熱門景點中挑選，輕鬆打造獨一無二的日本之旅。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Available Attractions */}
        <div className="lg:col-span-7">
          <div className="mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-rose-500">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-500" /> 設定旅遊日期 (新功能✨)
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">出發日期</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-700 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">回程日期</label>
                <input 
                  type="date" 
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-700 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>
            </div>

            {/* 智慧推薦區塊 */}
            {suggestedSeason && (
              <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${suggestedSeason.color} bg-opacity-50 border border-current border-opacity-20 animate-fade-in`}>
                <Sparkles className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-1">💡 旅遊靈感：目前是【{suggestedSeason.name}】的季節！</h4>
                  <p className="text-sm opacity-90 mb-2">{suggestedSeason.description}</p>
                  <p className="text-xs font-semibold">📍 推薦順遊：{suggestedSeason.locations.join('、')}</p>
                </div>
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Map className="w-5 h-5 text-rose-500" /> 探索熱門景點
            </span>
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              目前將加入至：第 {activeDay} 天
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ATTRACTIONS.map(attr => (
              <div key={attr.id} className="bg-white rounded-2xl p-3 border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow group">
                <img src={attr.img} alt={attr.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{attr.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{attr.area}</span>
                    <span className="text-gray-400">{attr.type}</span>
                  </div>
                </div>
                <button 
                  onClick={() => addToTrip(attr)}
                  disabled={currentDayAttractions.some(item => item.id === attr.id)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-rose-500 hover:bg-rose-50"
                  title={`加入至第 ${activeDay} 天`}
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: My Trip */}
        <div className="lg:col-span-5">
          <div className="bg-gradient-to-b from-gray-50 to-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-lg sticky top-24">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">我的行程表</h3>
            <p className="text-sm text-gray-500 mb-6">總計已選取 {totalAttractionsCount} 個景點</p>

            {/* 天數切換標籤 */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
              {Array.from({ length: totalDays }).map((_, i) => {
                const dayNum = i + 1;
                // 計算當天的實際日期顯示
                let dateDisplay = '';
                if (startDate) {
                  const dateObj = new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000);
                  dateDisplay = dateObj.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
                }
                
                return (
                  <button
                    key={dayNum}
                    onClick={() => setActiveDay(dayNum)}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap font-bold text-sm transition-all duration-300 ${
                      activeDay === dayNum 
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-200' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    第 {dayNum} 天 {dateDisplay && <span className="font-normal opacity-90 text-xs ml-1">({dateDisplay})</span>}
                  </button>
                );
              })}
            </div>

            {currentDayAttractions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">第 {activeDay} 天還沒有安排景點<br/>趕快從左側加入吧！</p>
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {currentDayAttractions.map((item, index) => (
                  <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active animate-fade-in">
                    {/* Timeline dot */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-rose-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-white font-bold text-sm z-10 absolute left-0 md:left-1/2 -ml-5 md:ml-0">
                      {index + 1}
                    </div>
                    
                    {/* Card */}
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-14 md:ml-0 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group-hover:shadow-md transition-shadow">
                      <div>
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <span className="text-xs text-gray-500">{item.area}</span>
                      </div>
                      <button 
                        onClick={() => removeFromTrip(activeDay, item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalAttractionsCount > 0 && (
              <button 
                onClick={handleSaveTrip}
                disabled={isSaved}
                className={`w-full mt-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg flex justify-center items-center gap-2 ${
                  isSaved 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white scale-[0.98]' 
                    : 'bg-gray-900 hover:bg-black text-white'
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle className="w-5 h-5 animate-pulse" />
                    行程已成功儲存！
                  </>
                ) : (
                  '儲存完整行程'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  // Simple fade-in animation styles defined in global context
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .animate-fade-in {
        animation: fadeIn 0.6s ease-out forwards;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 selection:bg-rose-200 selection:text-rose-900 pb-20">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main>
        {activeTab === 'home' && <HomeSection setActiveTab={setActiveTab} />}
        {activeTab === 'seasons' && <SeasonsSection />}
        {activeTab === 'weather' && <WeatherSection />}
        {activeTab === 'itinerary' && <ItinerarySection />}
      </main>

      {/* Simple Footer */}
      <footer className="max-w-6xl mx-auto px-4 mt-20 py-8 border-t border-gray-200 text-center text-gray-400 text-sm">
        <p>© 2026 Nippon Explorer. All rights reserved.</p>
      </footer>
    </div>
  );
}