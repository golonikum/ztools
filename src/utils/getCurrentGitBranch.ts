import * as vscode from "vscode";
import { execCommand } from "./execCommand";

export async function getCurrentGitBranch(): Promise<string> {
  const dir = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  if (!dir) {
    console.warn("No workspace dir");
    return "";
  }
  const statusOutput = await execCommand({ dir, command: "git status" });
  const message = statusOutput
    .replace(/\n/gim, " ")
    .replace(/^On branch ([^\s]+)\s.+$/, "$1");

  return message;
}
