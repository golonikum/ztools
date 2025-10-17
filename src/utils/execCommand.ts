import path from "path";
import { exec as execBase } from "child_process";
import util from "util";
import * as vscode from "vscode";
import { getProjectsRootPath } from "./getProjectsRootPath";

const exec = util.promisify(execBase);

export async function execCommand({
  dir = "",
  command,
  root,
}: {
  dir?: string;
  command: string;
  root?: string;
}) {
  const projectsRootPath = root || getProjectsRootPath();
  const cwd = path.resolve(projectsRootPath, dir);
  console.log(`${cwd} > ${command}`);
  let output = "";

  try {
    const { stdout, stderr } = await exec(command, { cwd });
    console.log(stdout);
    console.warn(stderr);
    output = `${stdout}\n${stderr}`;
  } catch (e) {
    const error = `Ошибка исполнения команды "${command}" в директории "${cwd}".`;
    console.error(error);
    vscode.window.showErrorMessage(error);
    if (e instanceof Error) {
      console.error(e.message);
    }
    throw e;
  } finally {
    return output;
  }
}
