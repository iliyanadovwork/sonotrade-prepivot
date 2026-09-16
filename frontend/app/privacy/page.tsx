"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/faq", label: "FAQ" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

const styles = stylex.create({
  pageSection: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: "100vh",
    fontFamily: "var(--font-geist-sans)",
  },
  banner: {
    paddingTop: "3rem",
    paddingBottom: "3rem",
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    "@media (min-width: 640px)": {
      paddingTop: "4rem",
      paddingBottom: "4rem",
    },
  },
  pageTitle: {
    fontSize: "2rem",
    fontWeight: 400,
    color: "#ffffff",
    margin: 0,
    fontFamily: "var(--font-geist-sans)",
    textAlign: "center",
    "@media (min-width: 640px)": {
      fontSize: "2.5rem",
    },
  },
  navLinks: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: "0.875rem",
  },
  navLink: {
    color: "rgba(255, 255, 255, 0.85)",
    textDecoration: "none",
    fontFamily: "var(--font-geist-sans)",
    ":hover": {
      color: "#ffffff",
      textDecoration: "underline",
    },
  },
  contentSection: {
    flex: 1,
    paddingTop: "2rem",
    paddingBottom: "3rem",
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    "@media (min-width: 640px)": {
      paddingLeft: "2rem",
      paddingRight: "2rem",
      paddingTop: "2.5rem",
      paddingBottom: "4rem",
    },
  },
  contentInner: {
    maxWidth: "768px",
    margin: "0 auto",
  },
  sectionHeading: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#ffffff",
    margin: 0,
    marginTop: "1.5rem",
    marginBottom: "0.75rem",
    fontFamily: "var(--font-geist-sans)",
  },
  sectionHeadingFirst: {
    marginTop: 0,
  },
  bodyText: {
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    color: "#a3a3a3",
    fontFamily: "var(--font-geist-sans)",
    margin: 0,
    marginBottom: "1rem",
  },
});

export default function PrivacyPage() {
  return (
    <main {...stylex.props(styles.pageSection)}>
      <section {...stylex.props(styles.banner)}>
        <h1 {...stylex.props(styles.pageTitle)}>Privacy Policy</h1>
      </section>

      <section {...stylex.props(styles.contentSection)}>
        <div {...stylex.props(styles.contentInner)}>
          <p {...stylex.props(styles.bodyText)}>
            Last updated: February 2026. Sonotrade (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy. This policy describes how we collect, use, and protect your information when you use our platform.
          </p>

          <h2 {...stylex.props(styles.sectionHeading, styles.sectionHeadingFirst)}>Information we collect</h2>
          <p {...stylex.props(styles.bodyText)}>
            We collect information you provide when you register (e.g. email address), information from your use of the service (e.g. trading activity, device and log data), and cookies or similar technologies where applicable.
          </p>

          <h2 {...stylex.props(styles.sectionHeading)}>How we use your information</h2>
          <p {...stylex.props(styles.bodyText)}>
            We use your information to operate and improve the platform, process transactions, communicate with you, enforce our terms, and comply with legal obligations. We may use aggregated or anonymised data for analytics and product development.
          </p>

          <h2 {...stylex.props(styles.sectionHeading)}>Sharing and disclosure</h2>
          <p {...stylex.props(styles.bodyText)}>
            We do not sell your personal data. We may share information with service providers who assist our operations, with regulators or law enforcement when required by law, or in connection with a merger or sale of assets, subject to applicable law.
          </p>

          <h2 {...stylex.props(styles.sectionHeading)}>Security and retention</h2>
          <p {...stylex.props(styles.bodyText)}>
            We implement appropriate technical and organisational measures to protect your data. We retain your information for as long as needed to provide the service and to comply with legal, regulatory, or contractual requirements.
          </p>

          <h2 {...stylex.props(styles.sectionHeading)}>Your rights</h2>
          <p {...stylex.props(styles.bodyText)}>
            Depending on where you live, you may have rights to access, correct, delete, or port your data, or to object to or restrict certain processing. To exercise these rights or ask questions about this policy, please contact us at the details on our <Link href="/contact" {...stylex.props(styles.navLink)}>Contact</Link> page.
          </p>

          <h2 {...stylex.props(styles.sectionHeading)}>Changes</h2>
          <p {...stylex.props(styles.bodyText)}>
            We may update this privacy policy from time to time. We will post the updated policy on this page and, where appropriate, notify you by email or through the platform. Your continued use of the service after changes constitutes acceptance of the updated policy.
          </p>
        </div>
      </section>
    </main>
  );
}
