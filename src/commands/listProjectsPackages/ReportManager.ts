import path from "path";
import fs from "fs";
import * as vscode from "vscode";

/**
 * Класс для сохранения и открытия отчета
 */
export class ReportManager {
  /**
   * Сохраняет HTML-отчет и открывает его в браузере
   * @param projectsRootPath - корневой путь к проектам
   * @param htmlContent - HTML-содержимое отчета
   * @param outputFileName - имя выходного файла
   */
  public async saveAndOpenReport(
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
