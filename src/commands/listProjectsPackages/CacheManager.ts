import fs from "fs";
import { AnalyzerConfig, CacheData, ProjectInfo } from "./types";
import path from "path";

/**
 * Класс для работы с кэшем
 */
export class CacheManager {
  private cache: CacheData | null = null;

  constructor(private config: AnalyzerConfig) {
    if (config.enableCache && config.cacheFilePath) {
      this.loadCache();
    }
  }

  /**
   * Загружает кэш из файла
   */
  private loadCache(): void {
    try {
      if (
        this.config.cacheFilePath &&
        fs.existsSync(this.config.cacheFilePath)
      ) {
        const cacheContent = fs.readFileSync(this.config.cacheFilePath, "utf8");
        this.cache = JSON.parse(cacheContent) as CacheData;
      }
    } catch (error) {
      console.warn("Ошибка при загрузке кэша:", error);
      this.cache = null;
    }
  }

  /**
   * Сохраняет кэш в файл
   */
  public saveCache(): void {
    try {
      if (this.config.cacheFilePath && this.cache) {
        fs.writeFileSync(
          this.config.cacheFilePath,
          JSON.stringify(this.cache, null, 2),
          "utf8"
        );
      }
    } catch (error) {
      console.warn("Ошибка при сохранении кэша:", error);
    }
  }

  /**
   * Проверяет, является ли кэш актуальным
   * @param projectsRootPath - корневой путь к проектам
   * @param projectsMap - карта проектов и их путей
   * @returns true, если кэш актуальный, иначе false
   */
  public isCacheValid(projectsMap: Record<string, string>): boolean {
    if (!this.cache || !this.config.enableCache) {
      return false;
    }

    // Проверяем, что кэш не старше 1 часа
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - this.cache.timestamp > oneHour) {
      return false;
    }

    // Проверяем, что файлы package.json не изменялись с момента кэширования
    for (const [project, cachedData] of Object.entries(this.cache.projects)) {
      if (!projectsMap[project]) continue; // Пропускаем проекты, которых больше нет

      const packageJsonPath = path.resolve(
        // projectsRootPath,
        projectsMap[project],
        "package.json"
      );

      if (!fs.existsSync(packageJsonPath)) {
        continue;
      }

      const stats = fs.statSync(packageJsonPath);
      if (stats.mtime.getTime() > cachedData.lastModified) {
        return false;
      }
    }

    return true;
  }

  /**
   * Обновляет кэш данными о проектах
   * @param projectsRootPath - корневой путь к проектам
   * @param items - массив объектов с информацией о проектах и их зависимостях
   * @param projectsMap - карта проектов и их путей
   */
  public updateCache(
    items: ProjectInfo[],
    projectsMap: Record<string, string>
  ): void {
    if (!this.config.enableCache) {
      return;
    }

    this.cache = {
      timestamp: Date.now(),
      projects: {},
    };

    items.forEach((item) => {
      const packageJsonPath = path.resolve(
        projectsMap[item.projectName],
        "package.json"
      );

      if (fs.existsSync(packageJsonPath)) {
        const stats = fs.statSync(packageJsonPath);
        this.cache!.projects[item.projectName] = {
          lastModified: stats.mtime.getTime(),
          data: item,
        };
      }
    });

    this.saveCache();
  }

  /**
   * Получает данные из кэша
   * @returns массив объектов с информацией о проектах и их зависимостях или null, если кэш недействителен
   */
  public getFromCache(): ProjectInfo[] | null {
    if (!this.cache) {
      return null;
    }

    return Object.values(this.cache.projects).map(
      (cachedData) => cachedData.data
    );
  }
}
