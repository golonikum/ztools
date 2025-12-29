import * as vscode from "vscode";
import {
  readInputAndCloneAllProjects,
  readInputsAndCommitAllChanges,
  listAllProcessProjects,
} from "./commands";

export function activate(context: vscode.ExtensionContext) {
  const commitAllChangesCommand = vscode.commands.registerCommand(
    "zetratools.commitAllChanges",
    async () => readInputsAndCommitAllChanges()
  );

  const cloneAllProjectsCommand = vscode.commands.registerCommand(
    "zetratools.cloneAllProjects",
    async () => readInputAndCloneAllProjects()
  );

  const listAllProjectsPackagesCommand = vscode.commands.registerCommand(
    "zetratools.listAllProjectsPackages",
    async () => listAllProcessProjects()
  );

  context.subscriptions.push(commitAllChangesCommand);
  context.subscriptions.push(cloneAllProjectsCommand);
  context.subscriptions.push(listAllProjectsPackagesCommand);
}

export function deactivate() {}
