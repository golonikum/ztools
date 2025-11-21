import * as vscode from "vscode";

export const PROJECTS_ROOT_PATH: string | undefined = vscode.workspace
  .getConfiguration("zetratools")
  .get("projectsPath");

export const GIT_DOMAIN: string | undefined = vscode.workspace
  .getConfiguration("zetratools")
  .get("projectsPath");

export const PROJECTS_SRC_MAP = {
  "developer-kit": `${GIT_DOMAIN}/kub/platform/ui/developer-kit`,
  "core-api": `${GIT_DOMAIN}/kub/platform/ui/core-api`,
  "core-ui": `${GIT_DOMAIN}/kub/platform/ui/core-ui`,
  "simulator-ui": `${GIT_DOMAIN}/kub/forecast/simulator-ui`,
  "geo-ui": `${GIT_DOMAIN}/kub/geo/ui`,
  "forces-ui": `${GIT_DOMAIN}/kub/man/ui/forces-ui`,
  "manager-ui": `${GIT_DOMAIN}/kub/man/ui/manager-ui`,
  "worker-ui": `${GIT_DOMAIN}/kub/man/ui/worker-ui`,
  "vesp-ui": `${GIT_DOMAIN}/kub/vesp/ui/vesp-ui`,
  "admin-ui": `${GIT_DOMAIN}/kub/admin/admin-ui`,
  "inventory-ui": `${GIT_DOMAIN}/kub/inventory/ui/inventory-ui`,
  "pas-ui": `${GIT_DOMAIN}/kub/forecast/ui/pas-ui.git`,
};

export const PROJECTS_COMMANDS_MAP: Partial<
  Record<keyof typeof PROJECTS_SRC_MAP, string>
> = {
  "developer-kit": "yarn build:all",
  "core-api": "yarn build:webpack",
};
