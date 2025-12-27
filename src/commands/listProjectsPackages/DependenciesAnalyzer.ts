import { ProjectInfo } from "./types";

/**
 * Класс для анализа зависимостей
 */
export class DependenciesAnalyzer {
  /**
   * Собирает все уникальные зависимости из всех проектов
   * @param items - массив объектов с информацией о проектах и их зависимостях
   * @param includeDevDependencies - включать ли dev-зависимости
   * @returns отсортированный массив имен всех зависимостей
   */
  public collectAllDependencies(
    items: ProjectInfo[],
    includeDevDependencies: boolean
  ): string[] {
    // Объединение всех зависимостей из всех проектов
    const allDeps = items.reduce((res, cur) => {
      const deps = { ...res, ...cur.dependencies };
      if (cur.devDependencies && includeDevDependencies) {
        Object.assign(deps, cur.devDependencies);
      }
      return deps;
    }, {} as Record<string, string>);

    // Фильтрация зависимостей (исключение "link" зависимостей) и сортировка
    return Object.entries(allDeps)
      .filter(([_, version]) => !version.includes("link"))
      .map(([name, _]) => name)
      .sort();
  }

  /**
   * Проверяет, есть ли конфликты версий для пакета в разных проектах
   * @param items - массив объектов с информацией о проектах и их зависимостях
   * @param packageName - имя пакета
   * @param includeDevDependencies - включать ли dev-зависимости
   * @returns true, если есть конфликты версий, иначе false
   */
  public hasVersionConflicts(
    items: ProjectInfo[],
    packageName: string,
    includeDevDependencies: boolean
  ): boolean {
    const versions = new Set<string>();

    items.forEach((item) => {
      if (item.dependencies[packageName]) {
        versions.add(item.dependencies[packageName]);
      }

      if (
        includeDevDependencies &&
        item.devDependencies &&
        item.devDependencies[packageName]
      ) {
        versions.add(item.devDependencies[packageName]);
      }
    });

    return versions.size > 1;
  }

  /**
   * Фильтрует зависимости в соответствии с конфигурацией
   * @param items - массив объектов с информацией о проектах и их зависимостях
   * @param allDependencies - массив всех зависимостей
   * @param showOnlyConflicts - показывать только пакеты с конфликтами версий
   * @param includeDevDependencies - включать ли dev-зависимости
   * @returns отфильтрованный массив зависимостей
   */
  public filterDependencies(
    items: ProjectInfo[],
    allDependencies: string[],
    showOnlyConflicts: boolean,
    includeDevDependencies: boolean
  ): string[] {
    if (!showOnlyConflicts) {
      return allDependencies;
    }

    // Возвращаем только те зависимости, у которых есть конфликты версий
    return allDependencies.filter((dependency) =>
      this.hasVersionConflicts(items, dependency, includeDevDependencies)
    );
  }
}
