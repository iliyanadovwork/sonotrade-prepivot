"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

// ——— FAQ data: add questions/answers here ———
const FAQ_ENTRIES: { id: string; question: string; answer: string }[] = [
  {
    id: "prediction-markets",
    question: "What are prediction markets?",
    answer:
      "Prediction markets are financial markets but for real-world events, such as elections, award shows, weather, sports, and more.\n\nOn a prediction market, you can buy **YES** contracts or **NO** contracts.\n\nIf you are right; meaning you bought a YES contract and the event happens, or a NO contract and it does not happen; you get paid out **$1** per contract. If you&apos;re wrong, you get paid **$0**.",
  },
  {
    id: "sonotrade-different",
    question: "How is Sonotrade different to other prediction markets?",
    answer:
      "Sonotrade is a platform to trade on music, film, pop culture and more. You can read more about our mission [here](/about).",
  },
  {
    id: "sonotrade-beta",
    question: "Is Sonotrade in beta?",
    answer:
      "Yes, as of the 8th February 2026 the platform is in beta. We&apos;re still working on new features as well as our flagship product which will change everything. If you notice any bugs or have any feedback, please [contact us](/contact) via email or drop a question in the [Discord](https://discord.gg/sonotrade).",
  },
];

const FAQ_NAV_LINKS = [
  { href: "/contact", label: "Help" },
  { href: "/about", label: "About" },
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
  categoryHeading: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#ffffff",
    margin: 0,
    marginBottom: "1.5rem",
    fontFamily: "var(--font-geist-sans)",
  },
  accordionRoot: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  accordionItem: {
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#262626",
  },
  accordionHeader: {
    margin: 0,
    display: "flex",
    width: "100%",
  },
  accordionTrigger: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    width: "100%",
    paddingTop: "1rem",
    paddingBottom: "1rem",
    paddingLeft: 0,
    paddingRight: 0,
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "transparent",
    cursor: "pointer",
    color: "#ffffff",
    fontSize: "1rem",
    fontFamily: "var(--font-geist-sans)",
    textAlign: "left",
    transitionProperty: "color",
    transitionDuration: "150ms",
    ":hover": {
      color: "#fafafa",
    },
    ":focus-visible": {
      outlineWidth: "2px",
      outlineStyle: "solid",
      outlineColor: "rgba(255, 255, 255, 0.5)",
      outlineOffset: "2px",
    },
  },
  chevron: {
    flexShrink: 0,
    width: "1rem",
    height: "1rem",
    color: "rgba(255, 255, 255, 0.6)",
    transitionProperty: "transform",
    transitionDuration: "200ms",
  },
  chevronOpen: {
    transform: "rotate(90deg)",
  },
  accordionContent: {
    overflow: "hidden",
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    color: "#a3a3a3",
    fontFamily: "var(--font-geist-sans)",
  },
  accordionContentInner: {
    paddingBottom: "1.25rem",
    paddingLeft: "1.75rem",
    "@media (min-width: 640px)": {
      paddingLeft: "2rem",
    },
  },
  answerParagraph: {
    margin: 0,
    marginBottom: "0.75rem",
  },
  answerBold: {
    fontWeight: 600,
  },
  answerList: {
    margin: "0.5rem 0",
    paddingLeft: "1.25rem",
  },
  answerListItem: {
    marginBottom: "0.25rem",
  },
  answerLink: {
    color: "#a3a3a3",
    textDecoration: "underline",
    fontFamily: "var(--font-geist-sans)",
    ":hover": {
      color: "#fafafa",
    },
  },
});

function FAQAnswer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p {...stylex.props(styles.answerParagraph)}>{children}</p>
        ),
        strong: ({ children }) => (
          <strong {...stylex.props(styles.answerBold)}>{children}</strong>
        ),
        ul: ({ children }) => (
          <ul {...stylex.props(styles.answerList)}>{children}</ul>
        ),
        ol: ({ children }) => (
          <ol {...stylex.props(styles.answerList)}>{children}</ol>
        ),
        li: ({ children }) => (
          <li {...stylex.props(styles.answerListItem)}>{children}</li>
        ),
        a: ({ href, children }) => {
          const isInternal = href?.startsWith("/");
          const props = stylex.props(styles.answerLink);
          if (isInternal && href) {
            return (
              <Link href={href} {...props}>
                {children}
              </Link>
            );
          }
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function FAQPage() {
  const [openValue, setOpenValue] = React.useState<string[]>([]);

  return (
    <main {...stylex.props(styles.pageSection)}>
      <section {...stylex.props(styles.banner)}>
        <h1 {...stylex.props(styles.pageTitle)}>Frequently Asked Questions</h1>
        <nav aria-label="FAQ categories" {...stylex.props(styles.navLinks)}>
          {FAQ_NAV_LINKS.map(({ href, label }, i) => (
            <React.Fragment key={href}>
              {i > 0 && <span aria-hidden="true">|</span>}
              <Link href={href} {...stylex.props(styles.navLink)}>
                {label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </section>

      <section {...stylex.props(styles.contentSection)}>
        <div {...stylex.props(styles.contentInner)}>
          <h2 {...stylex.props(styles.categoryHeading)}>General</h2>
          <AccordionPrimitive.Root
            type="multiple"
            value={openValue}
            onValueChange={setOpenValue}
            {...stylex.props(styles.accordionRoot)}
          >
            {FAQ_ENTRIES.map((entry) => {
              const isOpen = openValue.includes(entry.id);
              return (
                <AccordionPrimitive.Item
                  key={entry.id}
                  value={entry.id}
                  {...stylex.props(styles.accordionItem)}
                >
                  <AccordionPrimitive.Header {...stylex.props(styles.accordionHeader)}>
                    <AccordionPrimitive.Trigger {...stylex.props(styles.accordionTrigger)}>
                      <ChevronRight
                        {...stylex.props(styles.chevron, isOpen && styles.chevronOpen)}
                        aria-hidden
                      />
                      <span>{entry.question}</span>
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>
                  <AccordionPrimitive.Content {...stylex.props(styles.accordionContent)}>
                    <div {...stylex.props(styles.accordionContentInner)}>
                      <FAQAnswer content={entry.answer} />
                    </div>
                  </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
              );
            })}
          </AccordionPrimitive.Root>
        </div>
      </section>
    </main>
  );
}
