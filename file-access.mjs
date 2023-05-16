export function readFile(path) {
  return fs.readFileSync(path, "utf-8");
}
