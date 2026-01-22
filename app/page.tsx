"use client";

import { useState, useEffect } from "react";
import { data } from "@/data/schedule";

type DateEntry = {
  date: string;
  subject: string;
};

type Person = {
  surname: string;
  dates: DateEntry[];
};

// Функции для работы с cookies
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Person | null>(null);
  const [upcomingDates, setUpcomingDates] = useState<DateEntry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const filterDates = (dates: DateEntry[]) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const todayPassed = isTodayPassed();

    return dates.filter((item) => {
      const [dayStr, monthStr] = item.date.split(".");
      const day = parseInt(dayStr);
      const month = parseInt(monthStr) - 1;

      let year = currentYear;
      if (currentMonth >= 8 && month < 8) {
        year = currentYear + 1;
      } else if (currentMonth < 8 && month >= 8) {
        year = currentYear - 1;
      }

      const itemDate = new Date(year, month, day);

      if (itemDate.getTime() > now.getTime()) {
        return true;
      }

      if (itemDate.getTime() === now.getTime()) {
        return !todayPassed;
      }

      return false;
    });
  };

  const handleSearch = () => {
    if (!query.trim()) return;

    setCookie("last_surname", query.trim(), 90);
    setHasSearched(true);
    const found = data.find(
      (p) => p.surname.toLowerCase() === query.toLowerCase().trim(),
    );

    if (found) {
      setResult(found);
      setUpcomingDates(filterDates(found.dates));
      setIsCompact(true);
    } else {
      setResult(null);
      setUpcomingDates([]);
    }
  };

  const isTodayPassed = () => {
    const now = new Date();
    return now.getHours() >= 18;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleReset = () => {
    setQuery("");
    setResult(null);
    setUpcomingDates([]);
    setHasSearched(false);
    setIsCompact(false);
    setCookie("last_surname", "", -1);
  };

  const handleAutoSearch = (surname: string) => {
    const found = data.find(
      (p) => p.surname.toLowerCase() === surname.toLowerCase().trim(),
    );

    if (found) {
      setResult(found);
      setHasSearched(true);
      setUpcomingDates(filterDates(found.dates));
      setIsCompact(true);
    }
  };
  useEffect(() => {
    const savedSurname = getCookie("last_surname");
    if (savedSurname) {
      setQuery(savedSurname);
      handleAutoSearch(savedSurname);
    }
  }, []);

  return (
    <main className="min-h-screen w-full bg-[#0f172a] relative overflow-hidden flex flex-col items-center justify-center px-3 py-4 sm:p-6 text-white selection:bg-purple-500 selection:text-white">
      {/* Background Gradients - уменьшены для мобильных */}
      <div className="absolute top-[-30%] left-[-30%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-purple-600/30 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-30%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-blue-600/20 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-4 sm:gap-6 md:gap-8">
        {/* Header */}
        <div
          className={`text-center space-y-1 sm:space-y-2 transition-all duration-300 ${isCompact ? "scale-90 opacity-80 mt-0 sm:mt-2" : ""}`}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-sm leading-tight px-1">
            Симулятор терпения
          </h1>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg px-1">
            Узнай, сколько еще осталось впитывать
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full relative group">
          <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 sm:opacity-25 group-hover:opacity-40 sm:group-hover:opacity-50 transition duration-500"></div>
          <div className="relative flex bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-1.5 sm:p-2 shadow-2xl">
            {isCompact && result && (
              <button
                onClick={handleReset}
                className="absolute left-2.5 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors z-20 text-sm sm:text-base"
                aria-label="Вернуться к поиску"
              >
                ←
              </button>
            )}
            <input
              className={`flex-1 bg-transparent border-none outline-none text-white px-2.5 sm:px-4 py-2 sm:py-3 placeholder:text-slate-500 text-sm sm:text-base md:text-lg min-w-0 ${
                isCompact && result ? "pl-7 sm:pl-10" : ""
              }`}
              placeholder="Введите фамилию..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium px-3 sm:px-5 md:px-8 py-1.5 sm:py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-500/20 text-xs sm:text-sm md:text-base whitespace-nowrap ml-1"
              onClick={handleSearch}
            >
              Найти
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div
          className={`w-full transition-all duration-300 ${
            hasSearched
              ? "min-h-[300px] sm:min-h-[400px]"
              : "min-h-[50px] sm:min-h-[100px]"
          }`}
        >
          {hasSearched && !result && (
            <div className="p-4 sm:p-6 text-center border border-red-500/30 bg-red-500/10 rounded-xl sm:rounded-2xl backdrop-blur-md">
              <p className="text-red-400 text-sm sm:text-base md:text-lg font-medium">
                Фамилия не найдена
              </p>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Возможно, вы уже свободны?
              </p>
            </div>
          )}

          {result && (
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-2xl w-full transition-all max-h-[60vh] sm:max-h-[500px] flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 border-b border-slate-700/50 pb-2 sm:pb-3 md:pb-4 gap-2 sm:gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 truncate">
                    {result.surname}
                  </h2>
                  <p className="text-purple-300 font-medium text-xs sm:text-sm md:text-base animate-pulse whitespace-nowrap">
                    Осталось терпеть: {upcomingDates.length}{" "}
                    {getDeclension(upcomingDates.length)} 💀
                  </p>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto">
                  <button
                    onClick={handleReset}
                    className="text-[10px] sm:text-xs text-slate-400 hover:text-slate-300 transition-colors px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-slate-800/50 whitespace-nowrap"
                    title="Ввести другую фамилию"
                  >
                    Сменить
                  </button>
                  <span className="bg-slate-700/50 text-slate-400 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs border border-slate-600 whitespace-nowrap">
                    Всего: {result.dates.length}
                  </span>
                </div>
              </div>

              {upcomingDates.length === 0 ? (
                <div className="text-center py-4 sm:py-6 md:py-8 flex-1 flex flex-col justify-center">
                  <p className="text-xl sm:text-2xl mb-1 sm:mb-2">🎉</p>
                  <p className="text-green-400 font-bold text-lg sm:text-xl md:text-2xl">
                    Ты свободен!
                  </p>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
                    Больше никаких обязательных посещений.
                  </p>
                </div>
              ) : (
                <ul className="grid grid-cols-1 gap-1.5 sm:gap-2 md:gap-3 flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                  {upcomingDates.map((d, i) => {
                    const isToday = isDateToday(d.date);
                    const todayPassed = isTodayPassed();

                    return (
                      <li
                        key={i}
                        className={`group flex flex-col xs:flex-row justify-between items-start xs:items-center px-2.5 sm:px-3 md:px-4 lg:px-5 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl transition-all duration-300 border gap-1.5 sm:gap-2 ${
                          isToday && !todayPassed
                            ? "bg-gradient-to-r from-green-900/40 to-slate-900/40 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.15)]"
                            : "bg-slate-900/50 hover:bg-slate-800/80 border-slate-700/50 hover:border-purple-500/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full xs:w-auto">
                          <div
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0 ${
                              d.subject === "АСОИУ"
                                ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]"
                                : "bg-pink-400 shadow-[0_0_6px_rgba(244,114,182,0.6)]"
                            }`}
                          />
                          <div className="flex flex-col">
                            <span
                              className={`font-mono text-sm sm:text-base md:text-lg tracking-wide ${
                                isToday && !todayPassed
                                  ? "text-green-300 font-bold"
                                  : "text-slate-200"
                              }`}
                            >
                              {d.date}
                            </span>
                            {isToday && !todayPassed && (
                              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-green-400 font-bold">
                                Сегодня!
                              </span>
                            )}
                            {isToday && todayPassed && (
                              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-red-400 font-bold">
                                Уже прошло
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`font-semibold px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm md:text-sm whitespace-nowrap self-start xs:self-auto ${
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

// Хелпер для склонения слов
function getDeclension(number: number) {
  const words = ["посещение", "посещения", "посещений"];
  const n = Math.abs(number) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return words[2];
  if (n1 > 1 && n1 < 5) return words[1];
  if (n1 === 1) return words[0];
  return words[2];
}

// Хелпер проверки на "Сегодня"
function isDateToday(dateStr: string) {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const [d, m] = dateStr.split(".").map(Number);
  return d === day && m === month;
}
