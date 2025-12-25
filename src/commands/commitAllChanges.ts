import * as vscode from "vscode";
import {
  execCommand,
  extractMergeRequestUrl,
  getCurrentGitBranch,
  getProjectsSrcMap,
} from "../utils";

async function tryCommitProject({
  dir,
  branch,
  message,
}: {
  dir: string;
  branch: string;
  message: string;
}) {
  const statusOutput = await execCommand({ dir, command: "git status" });
  let committed = false;

  if (statusOutput.includes(`On branch ${branch}`)) {
    vscode.window.showInformationMessage(`Start pushing project "${dir}"`);

    if (!statusOutput.includes("nothing to commit")) {
      await execCommand({ dir, command: "git add ." });
      await execCommand({
        dir,
        command: `git commit -m "${branch}: ${message.replace(/"/g, '\\"')}"`,
      });
    }

    const pushOutput = await execCommand({
      dir,
      command: `git push origin ${branch}`,
    });
    const mrUrl = extractMergeRequestUrl(pushOutput);

    await vscode.env.openExternal(vscode.Uri.parse(mrUrl));
    committed = true;
  }

  return committed;
}

async function commitAllChanges({
  branch,
  message,
}: {
  branch: string;
  message: string;
}) {
  const REAL_PROJECTS_SRC_MAP = getProjectsSrcMap();
  const keys = Object.keys(REAL_PROJECTS_SRC_MAP);
  let count = 0;

  try {
    const promises = keys.map(async (dir) => {
      const committed = await tryCommitProject({ dir, branch, message });
      return committed ? 1 : 0;
    });

    const results = await Promise.all(promises);
    count = results.reduce<number>((sum, result) => sum + result, 0);
  } finally {
    if (count) {
      vscode.window.showInformationMessage(
        `Successfully committed ${count} project(s)`
      );
    } else {
      vscode.window.showWarningMessage("Nothing to commit");
    }
  }
}

export async function readInputsAndCommitAllChanges() {
  const proposedBranch = await getCurrentGitBranch();
  const branch = await vscode.window.showInputBox({
    value: proposedBranch,
    placeHolder: "Git бранч, например PROM-1234",
    validateInput: (value) => {
      if (!value) {
        return "Надо заполнить";
      }

      if (!value.match(/^[A-Z]+-\d+$/)) {
        return "Надо заполнить правильно";
      }

      return undefined;
    },
  });

  if (!branch) {
    vscode.window.showErrorMessage("Пустой git branch!");
    return;
  }

  const message = await vscode.window.showInputBox({
    value: "",
    placeHolder: "Git commit message (without branch number)",
    validateInput: (value) => {
      if (!value) {
        return "Надо заполнить";
      }

      return undefined;
    },
  });

  if (!message) {
    vscode.window.showErrorMessage("Пустой git commit message!");
    return;
  }

  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window,
      title: `Commit changes in all projects for branch ${branch}`,
      cancellable: false,
    },
    async (progress) => {
      progress.report({ increment: 0, message: "in progress..." });
      await commitAllChanges({ branch, message });
      progress.report({ increment: 100 });
    }
  );
}
