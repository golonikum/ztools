import { ProjectsPackagesAnalyzer } from "./ProjectsPackagesAnalyzer";

// Создание экземпляра анализатора и экспорт основной функции
const analyzer = new ProjectsPackagesAnalyzer();

/**
 * Создает отчет о зависимостях проектов и открывает его в браузере
 */
export const listProcessProjects = async (): Promise<void> => {
  await analyzer.generateReport();
};
