import path from "path";
import * as vscode from "vscode";
import { CacheManager } from "./CacheManager";
import { DependenciesAnalyzer } from "./DependenciesAnalyzer";
import { ErrorHandler } from "./ErrorHandler";
import { HtmlReportGenerator } from "./HtmlReportGenerator";
import { PackageExtractor } from "./PackageExtractor";
import { ReportManager } from "./ReportManager";
import { AnalyzerConfig, ProjectInfo } from "./types";
import { getProjectsRootPath } from "../../utils";

/**
 * Основной класс для анализа и визуализации зависимостей в проектах
 */
export class ProjectsPackagesAnalyzer {
  // Определение проектов и их путей
  // TODO: сделать автоматически
  private readonly PROJECTS: Record<string, string> = {
    "admin-ui": "admin-ui",
    "core-api": "core-api",
    "core-ui": "core-ui",
    "global-config": "developer-kit/packages/global-config",
    "linter-config": "developer-kit/packages/linter-config",
    "test-utils": "developer-kit/packages/test-utils",
    "webpack-config": "developer-kit/packages/webpack-config",
    "geo-ui": "geo-ui",
    "manager-ui": "manager-ui",
    "simulator-ui": "simulator-ui",
    "forces-widgets": "forces-widgets",
    "project-widgets": "project-widgets",
    "vesp-ui": "vesp-ui",
    "worker-ui": "worker-ui",
    "inventory-ui": "inventory-ui",
    "pas-ui": "pas-ui",
  };

  // Конфигурация анализатора
  private config: AnalyzerConfig;

  // Менеджеры для различных задач
  private cacheManager: CacheManager;
  private packageExtractor: PackageExtractor;
  private dependenciesAnalyzer: DependenciesAnalyzer;
  private htmlReportGenerator: HtmlReportGenerator;
  private reportManager: ReportManager;
  private errorHandler: ErrorHandler;

  /**
   * Создает экземпляр анализатора пакетов
   * @param config - конфигурация анализатора
   */
  constructor(config: Partial<AnalyzerConfig> = {}) {
    // Конфигурация по умолчанию
    this.config = {
      outputFileName: "projects-packages-statistics.html",
      showOnlyConflicts: false,
      enableCache: true,
      includeDevDependencies: true,
      cacheFilePath: path.join(process.cwd(), ".packages-cache.json"),
      ...config,
    };

    // Инициализация менеджеров
    this.cacheManager = new CacheManager(this.config);
    this.packageExtractor = new PackageExtractor(this.config);
    this.dependenciesAnalyzer = new DependenciesAnalyzer();
    this.htmlReportGenerator = new HtmlReportGenerator();
    this.reportManager = new ReportManager();
    this.errorHandler = new ErrorHandler();
  }

  /**
   * Создает отчет о зависимостях проектов и открывает его в браузере
   */
  public async generateReport(): Promise<void> {
    try {
      const projectsRootPath = this.getProjectsRootPath();
      if (!projectsRootPath) return;

      // Проверяем актуальность кэша
      let items: ProjectInfo[];

      if (this.cacheManager.isCacheValid(projectsRootPath, this.PROJECTS)) {
        console.log("Использование кэшированных данных");
        items = this.cacheManager.getFromCache() || [];
      } else {
        console.log("Обновление данных о пакетах");
        items = this.packageExtractor.extractAllProjectsPackages(
          projectsRootPath,
          this.PROJECTS
        );
        this.cacheManager.updateCache(projectsRootPath, items, this.PROJECTS);
      }

      // Собираем все зависимости
      const allDependencies = this.dependenciesAnalyzer.collectAllDependencies(
        items,
        this.config.includeDevDependencies
      );

      // Фильтрация зависимостей в соответствии с конфигурацией
      const filteredDependencies = this.dependenciesAnalyzer.filterDependencies(
        items,
        allDependencies,
        this.config.showOnlyConflicts,
        this.config.includeDevDependencies
      );

      // Функция для проверки наличия конфликтов версий
      const hasVersionConflicts = (packageName: string) =>
        this.dependenciesAnalyzer.hasVersionConflicts(
          items,
          packageName,
          this.config.includeDevDependencies
        );

      // Создание HTML-таблицы
      const tableHtml = this.htmlReportGenerator.createTableHtml(
        items,
        filteredDependencies,
        this.config.includeDevDependencies,
        hasVersionConflicts
      );

      // Создание полного HTML-документа
      const fullHtml = this.htmlReportGenerator.wrapHtml(tableHtml);

      // Сохранение и открытие отчета
      await this.reportManager.saveAndOpenReport(
        projectsRootPath,
        fullHtml,
        this.config.outputFileName
      );
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  /**
   * Получает корневой путь к проектам
   * @returns корневой путь к проектам или null, если путь не определен
   */
  private getProjectsRootPath(): string | null {
    const projectsRootPath = getProjectsRootPath();

    if (!projectsRootPath) {
      vscode.window.showErrorMessage(
        "Не удалось определить корневой путь к проектам"
      );
      return null;
    }

    return projectsRootPath;
  }
}
