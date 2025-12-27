import path from "path";
import fs from "fs";
import { AnalyzerConfig, ProjectInfo } from "./types";

/**
 * Класс для извлечения информации о пакетах
 */
export class PackageExtractor {
  constructor(private config: AnalyzerConfig) {}

  /**
   * Извлекает информацию о зависимостях проекта из package.json
   * @param projectsPath - корневой путь к проектам
   * @param projectPath - путь к проекту
   * @param projectName - имя проекта
   * @returns объект с информацией о проекте и его зависимостях
   */
  public extractProjectPackages(
    projectsPath: string,
    projectPath: string,
    projectName: string
  ): ProjectInfo {
    try {
      const packageJsonPath = path.resolve(
        projectsPath,
        projectPath,
        "package.json"
      );

      // Проверка существования файла
      if (!fs.existsSync(packageJsonPath)) {
        console.warn(`Файл package.json не найден для проекта: ${projectName}`);
        return {
          projectName,
          dependencies: {},
        };
      }

      const packageFileContent = fs.readFileSync(packageJsonPath, {
        encoding: "utf8",
      });

      const packageObj = JSON.parse(packageFileContent);

      const result: ProjectInfo = {
        projectName,
        dependencies: packageObj.dependencies || {},
      };

      if (this.config.includeDevDependencies && packageObj.devDependencies) {
        result.devDependencies = packageObj.devDependencies;
      }

      return result;
    } catch (error) {
      console.error(`Ошибка при обработке проекта ${projectName}:`, error);
      return {
        projectName,
        dependencies: {},
      };
    }
  }

  /**
   * Извлекает информацию о пакетах для всех проектов
   * @param projectsRootPath - корневой путь к проектам
   * @param projectsMap - карта проектов и их путей
   * @returns массив объектов с информацией о проектах и их зависимостях
   */
  public extractAllProjectsPackages(
    projectsRootPath: string,
    projectsMap: Record<string, string>
  ): ProjectInfo[] {
    return Object.keys(projectsMap).map((projectName) =>
      this.extractProjectPackages(
        projectsRootPath,
        projectsMap[projectName],
        projectName
      )
    );
  }
}
