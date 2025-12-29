import { isPackageVersionNotObvious } from "../../utils";
import { ProjectInfo } from "./types";

/**
 * Класс для генерации HTML-отчета
 */
export class HtmlReportGenerator {
  /**
   * Создает HTML-обертку для таблицы зависимостей
   * @param body - содержимое таблицы
   * @returns полный HTML-документ
   */
  public wrapHtml(body: string): string {
    return `<html>
<head>
  <meta charset="UTF-8">
  <title>Статистика зависимостей проектов</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: monospace;
    }

    table {
      border-spacing: 4px;
      border-collapse: separate;
      border: 1px solid #ddd;
      width: 100%;
    }

    th, td {
      padding: 8px;
      text-align: center;
      border: 1px solid #ddd;
    }

    th:first-child, td:first-child {
      text-align: left;
    }

    th {
      position: sticky;
      top: 0;
      background-color: #F9CB85;
    }

    .odd-row {
      background-color: #f0ece3ff;
    }

    .highlighted {
      background-color: #EB4C4F;
      color: white;
    }

    a {
      color: #0066cc;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
<table cellspacing="4px">
${body}
</table>
</body>
</html>`;
  }

  /**
   * Создает заголовок таблицы
   * @param items - массив объектов с информацией о проектах и их зависимостях
   * @returns заголовок таблицы в виде HTML-строки
   */
  public createTableHead(items: ProjectInfo[]): string {
    return `<tr class="header"><th>Пакет</th>${items
      .map((item) => `<th>${item.projectName}</th>`)
      .join("")}</tr>`;
  }

  /**
   * Создает ячейку с версией пакета
   * @param version - версия пакета
   * @returns ячейка таблицы в виде HTML-строки
   */
  public createVersionCell(version: string): string {
    return `<td class="${
      isPackageVersionNotObvious(version) ? "highlighted" : ""
    }">${version}</td>`;
  }

  /**
   * Создает одну строку таблицы для конкретного пакета
   * @param items - массив объектов с информацией о проектах и их зависимостях
   * @param packageName - имя пакета
   * @param index - индекс строки
   * @param includeDevDependencies - включать ли dev-зависимости
   * @param hasVersionConflicts - есть ли конфликты версий для этого пакета
   * @returns строка таблицы в виде HTML-строки
   */
  public createTableRow(
    items: ProjectInfo[],
    packageName: string,
    index: number,
    includeDevDependencies: boolean,
    hasVersionConflicts: (packageName: string) => boolean
  ): string {
    const firstColumn = `<td><a href="https://www.npmjs.com/package/${packageName}" target="_blank">${packageName}</a></td>`;

    // Создание ячеек для каждого проекта
    const otherColumns = items
      .map((item) => {
        const version = item.dependencies[packageName] || "";
        const devVersion =
          includeDevDependencies && item.devDependencies
            ? item.devDependencies[packageName] || ""
            : "";
        const realVersion = item.realVersions?.[packageName] || "";

        // Если есть и dev, и prod версии, показываем обе через запятую
        let displayVersion =
          version && devVersion
            ? `${version}, ${devVersion}`
            : version || devVersion;

        if (realVersion) {
          displayVersion = `${displayVersion} (${realVersion})`;
        }

        return this.createVersionCell(displayVersion);
      })
      .join("");

    const hasConflicts = hasVersionConflicts(packageName);
    const isOddRow = index % 2 === 0;

    return `<tr class="${hasConflicts ? "highlighted" : ""} ${
      isOddRow ? "odd-row" : ""
    }">${firstColumn}${otherColumns}</tr>`;
  }

  /**
   * Создает строки таблицы с зависимостями
   * @param items - массив объектов с информацией о проектах и их зависимостях
   * @param dependencies - массив зависимостей для отображения
   * @param includeDevDependencies - включать ли dev-зависимости
   * @param hasVersionConflicts - функция проверки наличия конфликтов версий
   * @returns строки таблицы в виде HTML-строки
   */
  public createTableRows(
    items: ProjectInfo[],
    dependencies: string[],
    includeDevDependencies: boolean,
    hasVersionConflicts: (packageName: string) => boolean
  ): string {
    return dependencies
      .map((packageName, index) =>
        this.createTableRow(
          items,
          packageName,
          index,
          includeDevDependencies,
          hasVersionConflicts
        )
      )
      .join("");
  }

  /**
   * Создает HTML-таблицу с зависимостями
   * @param items - массив объектов с информацией о проектах и их зависимостях
   * @param dependencies - массив зависимостей для отображения
   * @param includeDevDependencies - включать ли dev-зависимости
   * @param hasVersionConflicts - функция проверки наличия конфликтов версий
   * @returns HTML-таблица в виде строки
   */
  public createTableHtml(
    items: ProjectInfo[],
    dependencies: string[],
    includeDevDependencies: boolean,
    hasVersionConflicts: (packageName: string) => boolean
  ): string {
    const filteredItems = items.filter((item) => this.needToShow(item));

    // Создание заголовка таблицы
    const tableHead = this.createTableHead(filteredItems);

    // Создание строк таблицы
    const tableRows = this.createTableRows(
      filteredItems,
      dependencies,
      includeDevDependencies,
      hasVersionConflicts
    );

    return `${tableHead}${tableRows}`;
  }

  private needToShow(item: ProjectInfo) {
    return (
      !!Object.keys(item.dependencies).length ||
      !!Object.keys(item.devDependencies || {}).length
    );
  }
}
