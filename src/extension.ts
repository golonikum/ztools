import * as vscode from "vscode";
import {
  listProcessProjects,
  readInputAndCloneAllProjects,
  readInputsAndCommitAllChanges,
} from "./commands";

export function activate(context: vscode.ExtensionContext) {
  const commitAllChangesCommand = vscode.commands.registerCommand(
    "zetratools.commitAllChanges",
    async () => readInputsAndCommitAllChanges()
  );

  const listProjectsPackagesCommand = vscode.commands.registerCommand(
    "zetratools.listProjectsPackages",
    async () => listProcessProjects()
  );

  const cloneAllProjectsCommand = vscode.commands.registerCommand(
    "zetratools.cloneAllProjects",
    async () => readInputAndCloneAllProjects()
  );

  context.subscriptions.push(commitAllChangesCommand);
  context.subscriptions.push(listProjectsPackagesCommand);
  context.subscriptions.push(cloneAllProjectsCommand);
}

export function deactivate() {}
