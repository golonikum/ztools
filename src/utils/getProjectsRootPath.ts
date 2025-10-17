import * as vscode from "vscode";
import { PROJECTS_ROOT_PATH } from "./constants";

export function getProjectsRootPath(): string {
  if (!PROJECTS_ROOT_PATH) {
    vscode.window.showErrorMessage("zetratools.projectsPath не настроен");
    throw new Error("zetratools.projectsPath не настроен");
  }

  return PROJECTS_ROOT_PATH;
}
