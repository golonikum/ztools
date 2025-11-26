export const extractMergeRequestUrl = (inputString: string) => {
  // The input string
  // const inputString = `
  // warning: redirecting to https://gitlab.zetra.space/kub/man/ui/worker-ui.git/ remote: remote: To create a merge request for PROM-000, visit:         remote:   https://gitlab.zetra.space/kub/man/ui/worker-ui/-/merge_requests/new?merge_request%5Bsource_branch%5D=PROM-000         remote:  To https://gitlab.zetra.space/kub/man/ui/worker-ui
  // `;

  /**
   * A regular expression to find URLs in a string.
   *
   * Breakdown of the regex:
   * - `https?:\/\/`: Matches "http://" or "https://". The `s?` makes the 's' optional.
   * - `(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}`: Matches the domain name (e.g., gitlab.zetra.space).
   *   - `(?:[a-zA-Z0-9-]+\.)+`: Matches one or more subdomains (like "gitlab.", followed by "zetra.").
   *   - `[a-zA-Z]{2,}`: Matches the top-level domain (like "com", "space", "org"), which is at least two letters.
   * - `(?:\/[^\s]*)?`: Matches the optional path, query parameters, and fragment.
   *   - `\/`: Matches the leading slash.
   *   - `[^\s]*`: Matches any sequence of characters that are not whitespace.
   *   - `?`: Makes the entire path part optional.
   * - `g`: Global flag to find all matches in the string, not just the first one.
   */
  const urlRegex = /https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?/g;

  // Use matchAll to find all matches. It returns an iterator.
  const matches = inputString.replace(/\n/gim, " ").matchAll(urlRegex);

  // Convert the iterator to an array of strings.
  const extractedUrls = Array.from(matches, (match) => match[0]);

  // Print the result
  console.log(extractedUrls);
  const url = extractedUrls.find((item) => item.includes("merge_requests/new"));

  return url || "";
};
