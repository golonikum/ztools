import fs from "fs";
import * as vscode from "vscode";
import path from "path";
import { getProjectsRootPath } from "../utils";

const PROJECTS = {
  "admin-ui": "admin-ui",
  "core-api": "core-api",
  "core-ui": "core-ui",
  "global-config": "developer-kit/packages/global-config",
  "linter-config": "developer-kit/packages/linter-config",
  "test-utils": "developer-kit/packages/test-utils",
  "webpack-config": "developer-kit/packages/webpack-config",
  "geo-ui": "geo-ui",
  "manager-ui": "manager-ui",
  "simulator-ui": "simulator-ui",
  "forces-ui": "forces-ui",
  "vesp-ui": "vesp-ui",
  "worker-ui": "worker-ui",
  "inventory-ui": "inventory-ui",
  "pas-ui": "pas-ui",
};

type ItemType = {
  projectName: string;
  dependencies: Record<string, string>;
};

let ALL_DEPENDENCIES: string[] = [];

const extractProjectPackages = (
  projectsPath: string,
  project: keyof typeof PROJECTS
): ItemType => {
  let packageObj = JSON.parse(
    fs.readFileSync(
      path.resolve(projectsPath, PROJECTS[project], "package.json"),
      {
        encoding: "utf8",
      }
    )
  );

  return {
    projectName: project,
    dependencies: {
      ...packageObj.devDependencies,
      ...packageObj.dependencies,
    },
  };
};

const fillAllDependencies = (items: ItemType[]) => {
  const obj = items.reduce((res, cur) => ({ ...res, ...cur.dependencies }), {});
  ALL_DEPENDENCIES = Object.entries(obj)
    .filter(([key, val]) => !(val as string).includes("link"))
    .map(([key, val]) => key)
    .sort();
};

const wrapHtml = (body: string) => `<html>
<body>
<head>
  <style>
    .column {
      width: 80px;
    }

    .odd-row {
      background: #f0ece3ff;
    }

    .highlighted {
      background: #EB4C4F;
      color: white;
    }
    
    .header {
      position: sticky;
      top: 0;
      background: #F9CB85;
    }
    
    * {
      font-family: monospace;
    }
  </style>
</head>
<table cellpadding="8" cellspacing="4" border="1">
${body}
</table>
</body>
</html>`;

export const listProcessProjects = async () => {
  const projectsRootPath = getProjectsRootPath();

  const items: ItemType[] = [];

  Object.keys(PROJECTS).forEach((project) => {
    items.push(extractProjectPackages(projectsRootPath!, project as any));
  });

  fillAllDependencies(items);

  const tableHead = `<tr class="header"><th></th>${items
    .map((item) => `<th>${item.projectName}</th>`)
    .join("")}</tr>`;
  const tableRows = ALL_DEPENDENCIES.map((name, index) => {
    const firstColumn = `<td><a href="https://www.npmjs.com/package/${name}" target="_blank">${name}</a></td>`;
    const otherColumns = items
      .map(
        ({ dependencies }) =>
          `<td class="${
            dependencies[name]?.includes("^") ? "highlighted" : ""
          } column">${dependencies[name] || ""}</td>`
      )
      .join("");
    const versions = new Set<string>();
    items.forEach((item) => {
      if (item.dependencies[name]) {
        versions.add(item.dependencies[name]);
      }
    });
    const differs = versions.size > 1;
    return `<tr class="${differs ? "highlighted" : ""} ${
      index % 2 === 0 ? "odd-row" : ""
    }">${firstColumn}${otherColumns}</tr>`;
  }).join("");

  const filePath = path.resolve(
    projectsRootPath,
    "projects-packages-statistics.html"
  );
  fs.writeFileSync(filePath, wrapHtml(`${tableHead}${tableRows}`), {
    encoding: "utf8",
  });

  const fileUri = vscode.Uri.file(filePath);
  await vscode.env.openExternal(fileUri);
};
