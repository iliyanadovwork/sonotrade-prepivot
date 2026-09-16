"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import * as stylex from "@stylexjs/stylex";
import STLogo from "./STLogo";

const MENU_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const STUDIO_LINKS = [
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  // { href: "/register", label: "Waitlist" },
];

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://instagram.com/sonotradehq",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        {...props}
      >
        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.25-.88a.88.88 0 1 1 0 1.76.88.88 0 0 1 0-1.76Z" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://x.com/SonotradeHQ",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1227" fill="currentColor" {...props}>
        <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 87.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1143.69H892.476L569.165 687.854V687.828Z" />
      </svg>
    ),
  },
  {
    name: "Discord",
    href: "https://discord.com/invite/sonotrade",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -28.5 256 256"
        fill="currentColor"
        {...props}
      >
        <path
          fillRule="nonzero"
          d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z
           M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z
           M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
        />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/105421065",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.271c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 10.271h-3v-4.5c0-1.121-.879-2-2-2s-2 .879-2 2v4.5h-3v-9h3v1.189c.819-1.064 2.319-1.189 3.5-1.189 2.209 0 4 1.791 4 4v5z" />
      </svg>
    ),
  },
];

const styles = stylex.create({
  footer: {
    width: "100%",
    backgroundColor: "#000000",
    color: "#ffffff",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: "#171717",
    fontFamily: "var(--font-geist-sans)",
    marginTop: "4rem",
    "@media (max-width: 768px)": {
      marginTop: "8rem",
    },
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    paddingLeft: "1.25rem",
    paddingRight: "1.25rem",
    paddingTop: "4rem",
    paddingBottom: "4rem",
    boxSizing: "border-box",
    "@media (max-width: 640px)": {
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "2rem",
      paddingBottom: "2rem",
    },
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "3rem",
    "@media (max-width: 640px)": {
      gap: "1.5rem",
    },
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "repeat(12, 1fr)",
    },
  },
  leftSection: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    paddingLeft: "0.5rem",
    paddingRight: "0.5rem",
    "@media (min-width: 1024px)": {
      gridColumn: "span 6 / span 6",
    },
    "@media (max-width: 640px)": {
      paddingLeft: 0,
      paddingRight: 0,
      gap: "0.75rem",
    },
  },
  tagline: {
    color: "#7a7a7a",
    fontSize: "0.9rem",
    letterSpacing: "-0.025em",
  },
  socialLinks: {
    display: "flex",
    gap: "1.5rem",
    marginTop: "1rem",
    "@media (max-width: 640px)": {
      marginBottom: "0.75rem",
    },
  },
  socialLink: {
    color: "#7a7a7a",
    transitionProperty: "color",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    ":hover": {
      color: "#ffffff",
    },
  },
  socialIcon: {
    width: "1.5rem",
    height: "1.5rem",
  },
  rightSection: {
    paddingLeft: "0.5rem",
    paddingRight: "0.5rem",
    "@media (min-width: 1024px)": {
      gridColumn: "span 6 / span 6",
    },
    "@media (max-width: 640px)": {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  navGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "2rem",
    "@media (max-width: 640px)": {
      gap: "1.5rem",
      marginTop: "1rem",
    },
    "@media (min-width: 640px)": {
      gap: "3rem",
    },
  },
  navColumn: {
    display: "flex",
    flexDirection: "column",
  },
  navTitle: {
    fontSize: "1rem",
    fontWeight: 500,
    marginBottom: "1rem",
    "@media (max-width: 640px)": {
      marginBottom: "0.5rem",
    },
  },
  navList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    listStyle: "none",
    margin: 0,
    padding: 0,
    "@media (max-width: 640px)": {
      gap: "0.5rem",
    },
  },
  navLink: {
    color: "#7a7a7a",
    fontSize: "0.875rem",
    letterSpacing: "-0.025em",
    transitionProperty: "color",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    textDecoration: "none",
    ":hover": {
      color: "#ffffff",
    },
  },
  bottomSection: {
    marginTop: "4rem",
    paddingTop: "2rem",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: "#171717",
    "@media (max-width: 640px)": {
      marginTop: "2rem",
      paddingTop: "1rem",
    },
  },
  bottomContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    "@media (min-width: 768px)": {
      flexDirection: "row",
    },
  },
  copyright: {
    fontSize: "0.875rem",
    color: "#7a7a7a",
    letterSpacing: "-0.025em",
  },
  legalLinks: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "1.5rem",
    paddingBottom: "2rem",
  },
});

export default function Footer() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const id = setInterval(() => {
      const y = new Date().getFullYear();
      if (y !== year) setYear(y);
    }, 1000 * 60 * 60);
    return () => clearInterval(id);
  }, [year]);

  return (
    <footer {...stylex.props(styles.footer)}>
      <div {...stylex.props(styles.container)}>
        {/* Main footer content */}
        <div {...stylex.props(styles.mainContent)}>
          {/* Left section */}
          <div {...stylex.props(styles.leftSection)}>
            <STLogo footer />
            <p {...stylex.props(styles.tagline)}>The future of entertainment</p>
            <div {...stylex.props(styles.socialLinks)}>
              {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...stylex.props(styles.socialLink)}
                >
                  <Icon {...stylex.props(styles.socialIcon)} />
                </a>
              ))}
            </div>
          </div>

          {/* Right section - Navigation */}
          <div {...stylex.props(styles.rightSection)}>
            <div {...stylex.props(styles.navGrid)}>
              <div {...stylex.props(styles.navColumn)}>
                <h3 {...stylex.props(styles.navTitle)}>Menu</h3>
                <ul {...stylex.props(styles.navList)}>
                  {MENU_LINKS.map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} {...stylex.props(styles.navLink)}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div {...stylex.props(styles.navColumn)}>
                <h3 {...stylex.props(styles.navTitle)}>Other</h3>
                <ul {...stylex.props(styles.navList)}>
                  {STUDIO_LINKS.map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} {...stylex.props(styles.navLink)}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section - Legal */}
        <div {...stylex.props(styles.bottomSection)}>
          <div {...stylex.props(styles.bottomContent)}>
            <div {...stylex.props(styles.copyright)}>
              © {year} Sonotrade
            </div>
            <div {...stylex.props(styles.legalLinks)}>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
