// /types/docs.ts
export interface DocSection {
  title: string;
  order: number;
  items: DocItem[];
}

export interface DocItem {
  title: string;
  description?: string;
  section: string;
  slug: string;
  order: number;
  fullPath?: string;
}
