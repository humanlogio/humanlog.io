import Logo from "./logo";
import Image from "next/image";

const iconSocialLinks = [
  {
    href: "https://github.com/humanlogio/humanlog",
    icon: "/icons/github-mark-white.svg",
    alt: "GitHub",
  },
];

const footerLinks = [
  {
    href: "/pricing",
    text: "Pricing",
  },
  {
    href: "mailto:antoine@webscale.lol",
    text: "Contact Us",
  },
  {
    href: "/legal/siteterms",
    text: "Terms of Service",
  },
  {
    href: "/legal/privacy",
    text: "Privacy Policy",
  },
];

const PageFooter = () => {
  return (
    <footer className="bg-darkBg py-10 text-slate-100 dark:bg-slate-950">
      <div className="container">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="flex flex-col items-center gap-4 text-center md:col-span-8 md:items-start md:text-start">
            <Logo sm />
            <p className="text-white">
              WebScale LLC, 2024.
              <br />
              Humanlog.io © All rights reserved.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 md:col-span-2 md:items-start">
            {Object.values(footerLinks).map((link) => (
              <a
                className="text-main transition-colors hover:text-white"
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.text}
              </a>
            ))}
          </div>

          <div className="flex items-start justify-center gap-4 md:col-span-2 md:justify-end">
            {Object.values(iconSocialLinks).map((link) => (
              <a
                className="contents"
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  className="transition-transform hover:scale-110"
                  src={link.icon}
                  alt={link.alt}
                  width={24}
                  height={24}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
