/**
 * Интерфейс для конфигурации анализатора пакетов
 */
export interface AnalyzerConfig {
  /** Имя выходного HTML-файла */
  outputFileName: string;
  /** Показывать только пакеты с конфликтами версий */
  showOnlyConflicts: boolean;
  /** Кэшировать результаты анализа */
  enableCache: boolean;
  /** Включать dev-зависимости в анализ */
  includeDevDependencies: boolean;
  /** Путь к файлу кэша */
  cacheFilePath?: string;
}

/**
 * Интерфейс для представления информации о проекте и его зависимостях
 */
export interface ProjectInfo {
  projectName: string;
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * Интерфейс для представления кэшированных данных
 */
export interface CacheData {
  timestamp: number;
  projects: Record<string, { lastModified: number; data: ProjectInfo }>;
}
