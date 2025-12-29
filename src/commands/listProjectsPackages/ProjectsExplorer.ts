import fs from "fs";
import path from "path";
import { ProjectsMapType, ProjectType } from "./types";

/**
 * Класс для поиска проектов в указанной директории.
 */
export class ProjectsExplorer {
  private readonly projects: ProjectsMapType = {};

  constructor(private projectsDir: string = "..") {
    this.searchProjects(path.resolve(process.cwd(), this.projectsDir));
  }

  /**
   * Получает проект по имени
   */
  public get(name: string): ProjectType | undefined {
    return this.projects[name];
  }

  /**
   * Возвращает все проекты
   */
  public getAll(): ProjectsMapType {
    return this.projects;
  }

  /**
   * Ищет проекты в директории
   */
  private searchProjects(baseDir: string): void {
    if (!fs.existsSync(baseDir)) {
      console.warn(`⚠️ Projects directory not found: ${baseDir}`);
      return;
    }

    const entries = fs.readdirSync(baseDir, { withFileTypes: true });

    for (const entry of entries) {
      if (this.shouldProcessEntry(entry)) {
        const fullPath = path.join(baseDir, entry.name);
        const packageJsonPath = this.findPackageJson(fullPath);

        if (packageJsonPath) {
          const hasWorkspaces = this.hasProjectWorkspaces(packageJsonPath);

          if (hasWorkspaces) {
            // TODO: what if dir name "packages" changes
            this.searchProjects(path.resolve(fullPath, "packages"));
          }

          this.projects[entry.name] = fullPath;
        }
      }
    }
  }

  /**
   * Проверяет, нужно ли обрабатывать запись директории
   */
  private shouldProcessEntry(entry: fs.Dirent): boolean {
    return entry.isDirectory() && !entry.name.startsWith(".");
  }

  /**
   * Ищет package.json в директории
   */
  private findPackageJson(dir: string): string | null {
    const filePath = path.join(dir, "package.json");

    if (fs.existsSync(filePath)) {
      return filePath;
    }

    return null;
  }

  /**
   * Проверяет package.json на наличие workspaces
   */
  private hasProjectWorkspaces(packageJsonPath: string): boolean {
    try {
      const content = fs.readFileSync(packageJsonPath, "utf-8");

      return content.includes('"workspaces":');
    } catch (err) {
      return false;
    }
  }
}
