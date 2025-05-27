import fs from "fs";
import path from "path";

export interface NavItem {
  title: string;
  path: string;
  children?: NavItem[];
}

export const scanDirectory = (
  dir: string,
  basePath: string = "",
): NavItem[] => {
  const items: NavItem[] = [];
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      const children = scanDirectory(filePath, `${basePath}/${file}`);

      items.push({
        title: file.charAt(0) + file.slice(1),
        path: `${basePath}/${file}`,
        children: children.length > 0 ? children : undefined,
      });
    }
  });

  return items;
};

export const findFirstPath = (dirName: string): string | null => {
  const items = scanDirectory(dirName);

  if (items.length === 0) {
    return null;
  }

  return findDeepestFirstPath(items[0]);
};

const findDeepestFirstPath = (item: NavItem): string => {
  if (item.children && item.children.length > 0) {
    return findDeepestFirstPath(item.children[0]);
  }

  return item.path;
};
