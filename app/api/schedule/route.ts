import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

// Функция для получения "веса" даты для сортировки в рамках учебного года
// Учебный год: Сентябрь (9) -> Декабрь (12) -> Январь (1) -> Июнь (6)
const getDateValue = (dateStr: string) => {
  try {
    if (!dateStr) return 0;

    // Очистка от пробелов и парсинг
    const [dayStr, monthStr] = dateStr.trim().split(".");
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);

    if (isNaN(day) || isNaN(month)) return 0;

    // Логика сортировки учебного года:
    // Если месяц >= 9 (сентябрь-декабрь), то это "текущий" год (вес 0)
    // Если месяц < 9 (январь-август), то это "следующий" год (вес 1)
    const yearOffset = month >= 9 ? 0 : 1;

    // Возвращаем timestamp условной даты
    // Используем 2024 как базовый год для сентября, 2025 для января и т.д.
    return new Date(2024 + yearOffset, month - 1, day).getTime();
  } catch (e) {
    return 0;
  }
};

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "schedule.xlsx");

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });

  const sheet1 = XLSX.utils.sheet_to_json<any>(
    workbook.Sheets[workbook.SheetNames[0]],
    { defval: null },
  );
  const sheet2 = XLSX.utils.sheet_to_json<any>(
    workbook.Sheets[workbook.SheetNames[1]],
    { defval: null },
  );

  const map = new Map<string, any>();

  function processSheet(sheet: any[], subject: string) {
    sheet.forEach((row) => {
      const surname = row["Фамилия"];
      if (!surname || typeof surname !== "string" || surname.includes("Кворум"))
        return;

      const cleanSurname = surname.trim();

      if (!map.has(cleanSurname)) {
        map.set(cleanSurname, { surname: cleanSurname, dates: [] });
      }

      const entry = map.get(cleanSurname);

      Object.keys(row).forEach((key) => {
        // Игнорируем служебные колонки
        if (["№", "Фамилия", "СУММА", "__EMPTY"].includes(key)) return;

        // Проверяем, что значение в ячейке есть (не null и не пусто)
        if (row[key] !== null && row[key] !== "") {
          entry.dates.push({
            date: key.trim(), // Дата из заголовка колонки (например "15.09")
            subject,
          });
        }
      });
    });
  }

  processSheet(sheet1, "АСОИУ");
  processSheet(sheet2, "ТОАУ");

  const results = Array.from(map.values());

  // СОРТИРОВКА: Сначала объединили всё, теперь сортируем строго по дате
  results.forEach((person) => {
    person.dates.sort((a: any, b: any) => {
      return getDateValue(a.date) - getDateValue(b.date);
    });
  });

  return NextResponse.json(results);
}
