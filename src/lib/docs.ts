import { DocSection } from "@/types/docs";
import { allDocs } from "contentlayer/generated";

export const groupDocsBySection = () => {
  const sectionMap = new Map<string, DocSection>();

  allDocs.forEach((doc) => {
    if (!doc.section) return;

    if (!sectionMap.has(doc.section)) {
      sectionMap.set(doc.section, {
        title: doc.section,
        order: doc.order || 999,
        items: [],
      });
    }

    const section = sectionMap.get(doc.section)!;
    const path = doc._raw.flattenedPath;
    const cleanPath = path.endsWith("/page") ? path.slice(0, -5) : path;

    section.items.push({
      title: doc.title,
      description: doc.description,
      section: doc.section,
      slug: doc.slugAsParams.split("/").slice(0, -1).pop() || "",
      order: doc.order || 999,
      fullPath: `/${cleanPath}`,
    });
  });

  sectionMap.forEach((section) => {
    section.items.sort((a, b) => a.order - b.order);
  });

  const sortedSections = Array.from(sectionMap.values()).sort(
    (a, b) => a.order - b.order,
  );

  return sortedSections;
};

export const getDocBySlug = (slug: string[]) => {
  const slugPath = `${slug.join("/")}/page`;
  return allDocs.find((doc) => doc.slugAsParams === slugPath);
};

export const getFirstDoc = () => {
  const sections = groupDocsBySection();
  if (sections.length === 0 || sections[0].items.length === 0) {
    return null;
  }
  return sections[0].items[0];
};
