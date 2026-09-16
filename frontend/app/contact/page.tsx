import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  pageSection: {
    display: "flex",
    justifyContent: "center",
    flex: 1,
    fontFamily: "var(--font-geist-sans)",
  },
  contentBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  pageTitle: {
    fontSize: "3rem",
    fontWeight: 700,
    color: "#ffffff",
    margin: 0,
    fontFamily: "var(--font-geist-sans)",
    "@media (min-width: 640px)": {
      fontSize: "4rem",
      paddingBottom: "1.5rem",
    },
  },
  supportingText: {
    fontSize: "1.25rem",
    margin: 0,
    color: "#ffffff",
    fontFamily: "var(--font-geist-sans)",
  },
  emailLink: {
    color: "#ffffff",
    fontFamily: "var(--font-geist-sans)",
    ":hover": {
      textDecoration: "underline"
    },
  },
});

export default function Contact() {
  return (
    <main {...stylex.props(styles.pageSection)}>
      <div {...stylex.props(styles.contentBlock)}>
        <h1 {...stylex.props(styles.pageTitle)}>Contact us</h1>
        <p {...stylex.props(styles.supportingText)}>
          <a href="mailto:support@sonotrade.io" {...stylex.props(styles.emailLink)}>
            support@sonotrade.io
          </a>
        </p>
      </div>
    </main>
  );
}
