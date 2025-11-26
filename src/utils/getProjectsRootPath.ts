import * as vscode from "vscode";
import { PROJECTS_SRC_MAP } from "./constants";

export function getProjectsRootPath(): string {
  const PROJECTS_ROOT_PATH: string | undefined = vscode.workspace
    .getConfiguration("zetratools")
    .get("projectsPath");

  if (!PROJECTS_ROOT_PATH) {
    vscode.window.showErrorMessage("zetratools.projectsPath не настроен");
    throw new Error("zetratools.projectsPath не настроен");
  }

  return PROJECTS_ROOT_PATH;
}
