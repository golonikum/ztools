import * as vscode from "vscode";
import {
  PROJECTS_COMMANDS_MAP,
  PROJECTS_SRC_MAP,
  execCommand,
  getProjectsRootPath,
} from "../utils";
import fs from "fs";

async function cloneProject({
  dir,
  newPath,
  buildCommand,
}: {
  newPath: string;
  dir: keyof typeof PROJECTS_SRC_MAP;
  buildCommand?: string;
}) {
  await execCommand({
    root: newPath,
    command: `git clone ${PROJECTS_SRC_MAP[dir]} ${dir}`,
  });
  await execCommand({ root: newPath, dir, command: "yarn" });

  if (buildCommand) {
    await execCommand({ root: newPath, dir, command: buildCommand });
  }
}

async function cloneAllProjects(newPath: string): Promise<string> {
  const startDate = new Date();

  const keys = Object.keys(
    PROJECTS_SRC_MAP
  ) as (keyof typeof PROJECTS_SRC_MAP)[];

  const syncDirs = ["developer-kit", "core-api"];

  for (let dir of keys) {
    const buildCommand = PROJECTS_COMMANDS_MAP[dir];

    if (syncDirs.includes(dir)) {
      await cloneProject({ dir, buildCommand, newPath });
    }
  }

  await Promise.all(
    keys
      .filter((item) => !syncDirs.includes(item))
      .map(
        (dir) =>
          new Promise(async (resolve) => {
            await cloneProject({
              dir,
              buildCommand: PROJECTS_COMMANDS_MAP[dir],
              newPath,
            });
            resolve(true);
          })
      )
  );

  const difference = new Date().valueOf() - startDate.valueOf();
  return `Clone projects completed in ${difference} ms.`;
}

export async function readInputAndCloneAllProjects() {
  const newPath = await vscode.window.showInputBox({
    value: `${getProjectsRootPath()}_clone`,
    placeHolder: "Путь к пустой папке для проектов",
    validateInput: (value) => {
      if (!value) {
        return "Надо заполнить";
      }

      if (fs.existsSync(value)) {
        return "Такая папка уже существует";
      }

      return undefined;
    },
  });

  if (!newPath) {
    vscode.window.showErrorMessage("Пустой путь!");
    return;
  }

  if (!fs.existsSync(newPath)) {
    try {
      fs.mkdirSync(newPath, { recursive: true });
    } catch (err) {
      vscode.window.showErrorMessage(`Ошибка создания директории: ${err}`);
    }
  }

  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window, // or .Window, .SourceControl, etc.
      title: `Cloning projects into "${newPath}"`,
      cancellable: false, // Allows the user to cancel the operation
    },
    async (progress) => {
      progress.report({ increment: 0, message: "in progress..." });

      const completeMessage = await cloneAllProjects(newPath);
      progress.report({ increment: 100, message: completeMessage });
      vscode.window.showInformationMessage(completeMessage);

      return new Promise((resolve) => setTimeout(resolve, 1000));
    }
  );
}
