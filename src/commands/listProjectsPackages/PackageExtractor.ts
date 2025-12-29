import path from "path";
import fs from "fs";
import { AnalyzerConfig, ProjectInfo } from "./types";
import { isPackageVersionNotObvious } from "../../utils";

/**
 * Класс для извлечения информации о пакетах
 */
export class PackageExtractor {
  constructor(private config: AnalyzerConfig) {}

  /**
   * Извлекает информацию о зависимостях проекта из package.json
   * @param projectPath - путь к проекту
   * @param projectName - имя проекта
   * @returns объект с информацией о проекте и его зависимостях
   */
  private extractProjectPackages(
    projectsRootPath: string,
    projectPath: string,
    projectName: string
  ): ProjectInfo {
    try {
      const packageJsonPath = path.resolve(projectPath, "package.json");

      // Проверка существования файла
      if (!fs.existsSync(packageJsonPath)) {
        console.warn(`Файл package.json не найден для проекта: ${projectName}`);
        return {
          projectName,
          dependencies: {},
          projectPath,
        };
      }

      const packageFileContent = fs.readFileSync(packageJsonPath, {
        encoding: "utf8",
      });

      const packageObj = JSON.parse(packageFileContent);

      const result: ProjectInfo = {
        projectName,
        projectPath,
        dependencies: this.filterOutLinkedDependencies(
          packageObj.dependencies || {}
        ),
      };

      if (this.config.includeDevDependencies && packageObj.devDependencies) {
        result.devDependencies = this.filterOutLinkedDependencies(
          packageObj.devDependencies
        );
      }

      this.processNotObviousVersions(projectsRootPath, result);

      return result;
    } catch (error) {
      console.error(`Ошибка при обработке проекта ${projectName}:`, error);
      return {
        projectName,
        projectPath,
        dependencies: {},
      };
    }
  }

  /**
   * Обрабатывает проект для поиска пакетов с "неочевидными" версиями.
   *
   * Если такие пакеты найдены (в основных или dev-зависимостях), выводит предупреждение
   * и пытается определить их реальные установленные версии, сохраняя результат в `project.realVersions`.
   *
   * @param projectsRootPath Корневой путь, где находятся все проекты.
   * @param project Объект с информацией о текущем обрабатываемом проекте.
   */
  private processNotObviousVersions(
    projectsRootPath: string,
    project: ProjectInfo
  ) {
    const notObviousDependencies = this.notObviousVersionsPackages(
      project.dependencies || {}
    );

    const notObviousDevDependencies = this.config.includeDevDependencies
      ? this.notObviousVersionsPackages(project.devDependencies || {})
      : [];

    if (notObviousDependencies.length || notObviousDevDependencies.length) {
      console.warn(
        `В проекте ${project.projectName} найдены неочевидные версии пакетов ${[
          ...notObviousDependencies,
          ...notObviousDevDependencies,
        ].join(", ")}`
      );

      project.realVersions = [
        ...notObviousDependencies,
        ...notObviousDevDependencies,
      ].reduce(
        (res, dep) => ({
          ...res,
          [dep]: this.findRealVersionOfPackage(
            projectsRootPath,
            project.projectPath,
            dep
          ),
        }),
        {} as Record<string, string>
      );
    }
  }

  /**
   * Находит реальную установленную версию пакета, выполняя поиск его файла `package.json`.
   * Поиск начинается в директории текущего проекта и поднимается вверх по дереву директорий
   * до корневого пути всех проектов, пока не будет найден `node_modules/<dependency>/package.json`.
   *
   * @param projectsRootPath Абсолютный путь к корневой директории, где находятся все проекты.
   * @param projectPath Абсолютный путь к директории текущего проекта.
   * @param dependency Имя зависимости, реальную версию которой нужно найти.
   * @returns Строка с версией из `package.json` найденного пакета или пустая строка, если пакет не найден.
   */
  private findRealVersionOfPackage(
    projectsRootPath: string,
    projectPath: string,
    dependency: string
  ) {
    let curPath = projectPath;
    let dependencyPackageJsonPath = "";

    do {
      dependencyPackageJsonPath = path.resolve(
        curPath,
        "node_modules",
        dependency,
        "package.json"
      );
      curPath = path.resolve(curPath, "..");
    } while (
      !fs.existsSync(dependencyPackageJsonPath) &&
      curPath !== projectsRootPath
    );

    if (fs.existsSync(dependencyPackageJsonPath)) {
      const dependencyFileContent = fs.readFileSync(dependencyPackageJsonPath, {
        encoding: "utf8",
      });
      const dependencyObj = JSON.parse(dependencyFileContent);

      return dependencyObj.version;
    }

    return "";
  }

  /**
   * Извлекает имена пакетов, версии которых не соответствуют стандартному формату "X.Y.Z".
   */
  private notObviousVersionsPackages(dependencies: Record<string, string>) {
    return Object.entries(dependencies)
      .filter(([_, version]) => isPackageVersionNotObvious(version))
      .map(([dep]) => dep);
  }

  /**
   * Фильтрует объект зависимостей, исключая те, которые являются "ссылочными" (linked).
   * Зависимость считается "ссылочной", если её строка версии содержит подстроку "link",
   * что характерно для локальных зависимостей, подключенных через `npm link` или `yarn link`.
   */
  private filterOutLinkedDependencies(dependencies: Record<string, string>) {
    return Object.entries(dependencies)
      .filter(([_, version]) => !version.includes("link"))
      .reduce(
        (res, [dep, version]) => ({
          ...res,
          [dep]: version,
        }),
        {} as Record<string, string>
      );
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
