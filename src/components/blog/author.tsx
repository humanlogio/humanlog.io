import { Link } from "lucide-react";

type Author = {
  name: string;
  github?: string;
  twitter?: string;
  instagram?: string;
};

export function AuthorBlock({ author }: { author: Author }) {
  return (
    <>
      <h1>by {author.name}</h1>
      {author.github && (
        <a
          href={
            "https://github.com/" +
            author.github +
            "?utm_source=humanlog_io_blog"
          }
        >
          GitHub
        </a>
      )}
      {author.twitter && (
        <a
          href={
            "https://X.com/" + author.twitter + "?utm_source=humanlog_io_blog"
          }
        >
          Twitter (latterly known as X)
        </a>
      )}
      {author.instagram && (
        <a
          href={
            "https://www.instagram.com/" +
            author.instagram +
            "?utm_source=humanlog_io_blog"
          }
        >
          IG
        </a>
      )}
    </>
  );
}

export const Authors: {
  antoine: Author;
} = {
  antoine: {
    name: "Antoine Grondin",
    github: "aybabtme",
    twitter: "AntoineGrondin",
    instagram: "grondin.antoine",
  },
};
