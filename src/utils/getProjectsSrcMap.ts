import { PROJECTS_SRC_MAP } from "./constants";
import { getGitDomain } from "./getGitDomain";

export function getProjectsSrcMap(): Record<
  keyof typeof PROJECTS_SRC_MAP,
  string
> {
  const GIT_DOMAIN = getGitDomain();

  return Object.entries(PROJECTS_SRC_MAP).reduce(
    (res, [key, value]) => ({
      ...res,
      [key]: value.replace("GIT_DOMAIN", GIT_DOMAIN),
    }),
    {} as Record<keyof typeof PROJECTS_SRC_MAP, string>
  );
}
