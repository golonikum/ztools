import path from "path";
import fs from "fs";
import * as vscode from "vscode";
import { CacheManager } from "./CacheManager";
import { DependenciesAnalyzer } from "./DependenciesAnalyzer";
import { ErrorHandler } from "./ErrorHandler";
import { HtmlReportGenerator } from "./HtmlReportGenerator";
import { PackageExtractor } from "./PackageExtractor";
import { AnalyzerConfig, ProjectInfo } from "./types";
import { getProjectsRootPath } from "../../utils";
import { ProjectsExplorer } from "./ProjectsExplorer";

/**
 * Основной класс для анализа и визуализации зависимостей в проектах
 */
export class ProjectsPackagesAnalyzer {
  // Конфигурация анализатора
  private config: AnalyzerConfig;

  // Менеджеры для различных задач
  private cacheManager: CacheManager;
  private packageExtractor: PackageExtractor;
  private dependenciesAnalyzer: DependenciesAnalyzer;
  private htmlReportGenerator: HtmlReportGenerator;
  private errorHandler: ErrorHandler;

  /**
   * Создает экземпляр анализатора пакетов
   * @param config - конфигурация анализатора
   */
  constructor(config: Partial<AnalyzerConfig> = {}) {
    // Конфигурация по умолчанию
    this.config = {
      outputFileName: "projects-packages-statistics.html",
      cacheFilePath: path.join(process.cwd(), ".packages-cache.json"),
      showOnlyConflicts: false,
      enableCache: false,
      includeDevDependencies: true,
      ...config,
    };

    // Инициализация менеджеров
    this.cacheManager = new CacheManager(this.config);
    this.packageExtractor = new PackageExtractor(this.config);
    this.dependenciesAnalyzer = new DependenciesAnalyzer();
    this.htmlReportGenerator = new HtmlReportGenerator();
    this.errorHandler = new ErrorHandler();
  }

  /**
   * Создает отчет о зависимостях проектов и открывает его в браузере
   */
  public async generateReport(): Promise<void> {
    try {
      const projectsRootPath = this.getProjectsRootPath();
      if (!projectsRootPath) return;

      const projectsExplorer = new ProjectsExplorer(projectsRootPath);
      const projects = projectsExplorer.getAll();

      // Проверяем актуальность кэша
      let items: ProjectInfo[];

      if (this.cacheManager.isCacheValid(projects)) {
        console.log("Использование кэшированных данных");
        items = this.cacheManager.getFromCache() || [];
      } else {
        console.log("Обновление данных о пакетах");
        items = this.packageExtractor.extractAllProjectsPackages(
          projectsRootPath,
          projects
        );
        this.cacheManager.updateCache(items, projects);
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
      await this.saveAndOpenReport(
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

  /**
   * Сохраняет HTML-отчет и открывает его в браузере
   * @param projectsRootPath - корневой путь к проектам
   * @param htmlContent - HTML-содержимое отчета
   * @param outputFileName - имя выходного файла
   */
  private async saveAndOpenReport(
    projectsRootPath: string,
    htmlContent: string,
    outputFileName: string
  ): Promise<void> {
    // Сохранение HTML-файла
    const filePath = path.resolve(projectsRootPath, outputFileName);

    fs.writeFileSync(filePath, htmlContent, {
      encoding: "utf8",
    });

    // Открытие файла в браузере
    const fileUri = vscode.Uri.file(filePath);
    await vscode.env.openExternal(fileUri);

    vscode.window.showInformationMessage(
      `Отчет о зависимостях создан: ${filePath}`
    );
  }
}
