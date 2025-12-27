import * as vscode from "vscode";

/**
 * Класс для обработки ошибок
 */
export class ErrorHandler {
  /**
   * Обрабатывает ошибки при создании отчета
   * @param error - объект ошибки
   */
  public handleError(error: unknown): void {
    console.error("Ошибка при создании отчета о зависимостях:", error);
    vscode.window.showErrorMessage(
      `Ошибка при создании отчета: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
