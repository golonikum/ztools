import * as vscode from "vscode";

export function getGitDomain(): string {
  const GIT_DOMAIN: string | undefined = vscode.workspace
    .getConfiguration("zetratools")
    .get("gitDomain");

  if (!GIT_DOMAIN) {
    vscode.window.showErrorMessage("zetratools.gitDomain не настроен");
    throw new Error("zetratools.gitDomain не настроен");
  }

  return GIT_DOMAIN;
}
