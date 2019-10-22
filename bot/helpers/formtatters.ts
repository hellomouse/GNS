/**
 * @param  {string} s The commit hash string
 * @return {string}   Returns formatted commit hash string
 */
function fmt_url(s: string): string {
  return `\x0302\x1F${s}\x0F`;
}

/**
 * @param  {string} s The commit hash string
 * @return {string}   Returns formatted commit hash string
 */
function fmt_repo(s: string): string {
  return `\x0313${s}\x0F`;
}

/**
 * @param  {string} s The author name string
 * @return {string}   Returns formatted author name string
 */
function fmt_name(s: string): string {
  return `\x0315${s}\x0F`;
}

/**
 * @param  {string} s The branch name string
 * @return {string}   Returns formatted branch name string
 */
function fmt_branch(s: string): string {
  return `\x0306${s}\x0F`;
}

/**
 * @param  {string} s The tag name string
 * @return {string}   Returns formatted tag name string
 */
function fmt_tag(s: string): string {
  return `\x0306${s}\x0F`;
}

/**
 * @param  {string} s The commit hash string
 * @return {string}   Returns formatted commit hash string
 */
function fmt_hash(s: string): string {
  return `\x0314${s}\x0F`;
}

export = {
  fmt_branch,
  fmt_hash,
  fmt_name,
  fmt_repo,
  fmt_tag,
  fmt_url
};
