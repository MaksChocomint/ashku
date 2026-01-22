"use client";

import { useState } from "react";
import { data } from "@/data/schedule"; // Импортируем статические данные

type DateEntry = {
  date: string;
  subject: string;
};

type Person = {
  surname: string;
  dates: DateEntry[];
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Person | null>(null);
  const [upcomingDates, setUpcomingDates] = useState<DateEntry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Проверяем, прошла ли сегодняшняя пара (после 18:00)
  const isTodayPassed = () => {
    const now = new Date();
    const currentHour = now.getHours();

    // Если сейчас 18:00 или позже, считаем что сегодняшняя пара прошла
    return currentHour >= 18;
  };

  // Функция для проверки: дата в будущем или сегодня (если пара еще не прошла)
  const filterDates = (dates: DateEntry[]) => {
    const now = new Date();
    // Сбрасываем время в 00:00:00 для корректного сравнения дат
    now.setHours(0, 0, 0, 0);
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();

    // Проверяем, прошла ли сегодняшняя пара
    const todayPassed = isTodayPassed();

    return dates.filter((item) => {
      const [dayStr, monthStr] = item.date.split(".");
      const day = parseInt(dayStr);
      const month = parseInt(monthStr) - 1; // JS месяцы 0-11

      // ОПРЕДЕЛЕНИЕ ГОДА ДЛЯ ДАТЫ ИЗ РАСПИСАНИЯ:
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

      // Если дата точно в будущем (завтра или позже), оставляем
      if (itemDate.getTime() > now.getTime()) {
        return true;
      }

      // Если дата сегодня
      if (itemDate.getTime() === now.getTime()) {
        // Оставляем только если сегодняшняя пара еще не прошла (до 18:00)
        return !todayPassed;
      }

      // Если дата в прошлом, не показываем
      return false;
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
    <main className="min-h-screen w-full bg-[#0f172a] relative overflow-x-hidden flex flex-col items-center justify-start p-4 md:p-6 text-white selection:bg-purple-500 selection:text-white">
      {/* Background Gradients - уменьшены для мобильных */}
      <div className="absolute top-[-30%] left-[-30%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-purple-600/30 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-30%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-600/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-6 md:gap-8 mt-4 md:mt-0">
        {/* Header */}
        <div className="text-center space-y-1 md:space-y-2 animate-fade-in-down px-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-sm leading-tight">
            Симулятор терпения
          </h1>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg">
            Узнай, сколько еще осталось впитывать
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full relative group animate-fade-in-up delay-100 px-2">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative flex flex-col sm:flex-row bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-2 sm:p-2 shadow-2xl gap-2 sm:gap-0">
            <input
              className="flex-1 bg-transparent border-none outline-none text-white px-3 sm:px-4 py-2 sm:py-3 placeholder:text-slate-500 text-base sm:text-lg w-full"
              placeholder="Введите фамилию..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium px-4 sm:px-6 md:px-8 py-2 sm:py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-500/20 text-sm sm:text-base"
              onClick={handleSearch}
            >
              Найти
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="w-full min-h-[100px] animate-fade-in-up delay-200 px-2">
          {hasSearched && !result && (
            <div className="p-4 sm:p-6 text-center border border-red-500/30 bg-red-500/10 rounded-2xl backdrop-blur-md">
              <p className="text-red-400 text-base sm:text-lg font-medium">
                Фамилия не найдена
              </p>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Возможно, вы уже свободны?
              </p>
            </div>
          )}

          {result && (
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl w-full transition-all">
              <div className="flex flex-col items-start justify-between mb-4 sm:mb-6 border-b border-slate-700/50 pb-3 sm:pb-4 gap-3">
                <div className="w-full">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 break-all">
                    {result.surname}
                  </h2>
                  <p className="text-purple-300 font-medium text-xs sm:text-sm md:text-base animate-pulse">
                    Тебе осталось терпеть {upcomingDates.length}{" "}
                    {getDeclension(upcomingDates.length)} 💀
                  </p>
                </div>

                {/* Бейдж с общим количеством в базе */}
                <div className="w-full flex justify-start">
                  <span className="bg-slate-700/50 text-slate-400 px-3 py-1 rounded-full text-xs border border-slate-600 self-start">
                    Всего в плане: {result.dates.length}
                  </span>
                </div>
              </div>

              {upcomingDates.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-green-400 font-bold text-lg sm:text-xl">
                    Ты свободен!
                  </p>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Больше никаких обязательных посещений.
                  </p>
                </div>
              ) : (
                <ul className="grid grid-cols-1 gap-2 sm:gap-3 max-h-[50vh] sm:max-h-[400px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                  {upcomingDates.map((d, i) => {
                    // Проверка на "Сегодня" для подсветки
                    const isToday = isDateToday(d.date);
                    // Проверяем, прошла ли сегодняшняя пара
                    const todayPassed = isTodayPassed();

                    return (
                      <li
                        key={i}
                        className={`group flex flex-col sm:flex-row justify-between items-start sm:items-center px-3 sm:px-5 py-3 sm:py-4 rounded-xl transition-all duration-300 border gap-2 sm:gap-0
                          ${
                            isToday && !todayPassed
                              ? "bg-gradient-to-r from-green-900/40 to-slate-900/40 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                              : "bg-slate-900/50 hover:bg-slate-800/80 border-slate-700/50 hover:border-purple-500/50"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div
                            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${
                              d.subject === "АСОИУ"
                                ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                                : "bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.6)]"
                            }`}
                          />
                          <div className="flex flex-col">
                            <span
                              className={`font-mono text-base sm:text-lg tracking-wide ${
                                isToday && !todayPassed
                                  ? "text-green-300 font-bold"
                                  : "text-slate-200"
                              }`}
                            >
                              {d.date}
                            </span>
                            {isToday && !todayPassed && (
                              <span className="text-[10px] uppercase tracking-wider text-green-400 font-bold mt-0.5">
                                Сегодня!
                              </span>
                            )}
                            {isToday && todayPassed && (
                              <span className="text-[10px] uppercase tracking-wider text-red-400 font-bold mt-0.5">
                                Уже прошло
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`font-semibold px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm whitespace-nowrap self-start sm:self-auto ${
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

  const [d, m] = dateStr.split(".").map(Number);
  return d === day && m === month;
}
