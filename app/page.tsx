"use client";

import { useEffect, useState } from "react";

type DateEntry = {
  date: string;
  subject: string;
};

type Person = {
  surname: string;
  dates: DateEntry[];
};

export default function Home() {
  const [data, setData] = useState<Person[]>([]);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Person | null>(null);

  // Состояние для отфильтрованных дат (будущее + сегодня)
  const [upcomingDates, setUpcomingDates] = useState<DateEntry[]>([]);

  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetch("/api/schedule")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Функция для проверки: дата в будущем/сегодня или в прошлом?
  const filterDates = (dates: DateEntry[]) => {
    const now = new Date();
    // Сбрасываем время в 00:00:00 для корректного сравнения "сегодня"
    now.setHours(0, 0, 0, 0);
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();

    return dates.filter((item) => {
      const [dayStr, monthStr] = item.date.split(".");
      const day = parseInt(dayStr);
      const month = parseInt(monthStr) - 1; // JS месяцы 0-11

      // ОПРЕДЕЛЕНИЕ ГОДА ДЛЯ ДАТЫ ИЗ РАСПИСАНИЯ:
      // Логика: учебный год обычно идет с Сентября по Июнь.
      // Если сейчас Сентябрь-Декабрь (8-11), а дата в расписании Январь-Август (0-7), значит это СЛЕДУЮЩИЙ год.
      // Если сейчас Январь-Август, а дата Сентябрь-Декабрь, значит это ПРОШЛЫЙ год.

      let year = currentYear;

      // Если сейчас осень/зима (начало уч. года), а пара весной -> это след. год
      if (currentMonth >= 8 && month < 8) {
        year = currentYear + 1;
      }
      // Если сейчас весна (конец уч. года), а пара осенью -> это прошлый год (уже прошло)
      else if (currentMonth < 8 && month >= 8) {
        year = currentYear - 1;
      }

      const itemDate = new Date(year, month, day);

      // Оставляем только те, что больше или равны сегодняшнему дню
      return itemDate.getTime() >= now.getTime();
    });
  };

  const handleSearch = () => {
    if (!query) return;
    setHasSearched(true);
    const found = data.find(
      (p) => p.surname.toLowerCase() === query.toLowerCase().trim(),
    );

    if (found) {
      setResult(found);
      // Сразу фильтруем даты
      setUpcomingDates(filterDates(found.dates));
    } else {
      setResult(null);
      setUpcomingDates([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <main className="min-h-screen w-full bg-[#0f172a] relative overflow-hidden flex flex-col items-center justify-center p-6 text-white font-sans selection:bg-purple-500 selection:text-white">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-8">
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in-down">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-sm">
            Квота Посещений
          </h1>
          <p className="text-slate-400 text-lg">
            Узнай, сколько еще осталось терпеть
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full relative group animate-fade-in-up delay-100">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative flex bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-2 shadow-2xl">
            <input
              className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder:text-slate-500 text-lg"
              placeholder="Введите фамилию..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium px-8 py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Загрузка..." : "Найти"}
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="w-full min-h-[100px] animate-fade-in-up delay-200">
          {hasSearched && !result && (
            <div className="p-6 text-center border border-red-500/30 bg-red-500/10 rounded-2xl backdrop-blur-md">
              <p className="text-red-400 text-lg font-medium">
                Фамилия не найдена
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Возможно, вы уже свободны?
              </p>
            </div>
          )}

          {result && (
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-2xl w-full transition-all">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 border-b border-slate-700/50 pb-4 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    {result.surname}
                  </h2>
                  {/* НОВЫЙ ТЕКСТ: СКОЛЬКО ТЕРПЕТЬ */}
                  <p className="text-purple-300 font-medium text-sm md:text-base animate-pulse">
                    Тебе осталось терпеть {upcomingDates.length}{" "}
                    {getDeclension(upcomingDates.length)} 💀
                  </p>
                </div>

                {/* Бейдж с общим количеством в базе (опционально) */}
                <span className="bg-slate-700/50 text-slate-400 px-3 py-1 rounded-full text-xs font-mono border border-slate-600">
                  Всего в плане: {result.dates.length}
                </span>
              </div>

              {upcomingDates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-green-400 font-bold text-xl">
                    Ты свободен!
                  </p>
                  <p className="text-slate-500 text-sm">
                    Больше никаких обязательных посещений.
                  </p>
                </div>
              ) : (
                <ul className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {upcomingDates.map((d, i) => {
                    // Проверка на "Сегодня" для подсветки
                    const isToday = isDateToday(d.date);

                    return (
                      <li
                        key={i}
                        className={`group flex justify-between items-center px-5 py-4 rounded-xl transition-all duration-300 border
                          ${
                            isToday
                              ? "bg-gradient-to-r from-green-900/40 to-slate-900/40 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                              : "bg-slate-900/50 hover:bg-slate-800/80 border-slate-700/50 hover:border-purple-500/50"
                          }
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${d.subject === "АСОИУ" ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.6)]"}`}
                          />
                          <div className="flex flex-col">
                            <span
                              className={`font-mono text-lg tracking-wide ${isToday ? "text-green-300 font-bold" : "text-slate-200"}`}
                            >
                              {d.date}
                            </span>
                            {isToday && (
                              <span className="text-[10px] uppercase tracking-wider text-green-400 font-bold">
                                Сегодня!
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`font-semibold px-3 py-1 rounded-lg text-xs md:text-sm whitespace-nowrap ${
                            d.subject === "АСОИУ"
                              ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                              : "bg-pink-500/10 text-pink-300 border border-pink-500/20"
                          }`}
                        >
                          {d.subject}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Хелпер для склонения слов (1 посещение, 2 посещения, 5 посещений)
function getDeclension(number: number) {
  const words = ["посещение", "посещения", "посещений"];
  const n = Math.abs(number) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return words[2];
  if (n1 > 1 && n1 < 5) return words[1];
  if (n1 === 1) return words[0];
  return words[2];
}

// Хелпер проверки на "Сегодня" по строке "ДД.ММ"
function isDateToday(dateStr: string) {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1; // 1-12

  // Добавляем ведущий ноль если нужно для строгого сравнения, или просто парсим числа
  const [d, m] = dateStr.split(".").map(Number);
  return d === day && m === month;
}
