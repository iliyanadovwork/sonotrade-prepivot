"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import Image from "next/image";

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
  partnerLogosBlock: {
    paddingTop: "1.5rem",
    paddingBottom: "1.5rem",
    marginTop: "1rem",
    marginBottom: "1rem",
  },
  logoWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.75rem",
  },
  partnerLogo: {
    height: "20px",
    width: "auto",
    objectFit: "contain",
  },
  logoSeparator: {
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: 1,
  },
});

export default function TermsPage() {
  return (
    <main {...stylex.props(styles.pageSection)}>
      <section {...stylex.props(styles.banner)}>
        <h1 {...stylex.props(styles.pageTitle)}>Terms &amp; Conditions</h1>
      </section>

      <section {...stylex.props(styles.contentSection)}>
        <div {...stylex.props(styles.contentInner)}>
          <p {...stylex.props(styles.bodyText)}>
            Last updated: February 2026. Please read these Terms and Conditions (&quot;Terms&quot;) carefully before using the Sonotrade platform. By accessing or using our service, you agree to be bound by these Terms.
          </p>

          <h2 {...stylex.props(styles.sectionHeading, styles.sectionHeadingFirst)}>Account and conduct</h2>
          <p {...stylex.props(styles.bodyText)}>
            You must provide accurate information when registering and keep your account secure. You are responsible for all activity under your account. You agree not to use the platform for any illegal purpose, to manipulate markets, to harass others, or to violate any applicable rules or policies we publish.
          </p>

          <h2 {...stylex.props(styles.sectionHeading)}>Trading and funds</h2>
          <p {...stylex.props(styles.bodyText)}>
            Trading on prediction markets involves risk. You may lose the funds you use to trade. We do not provide financial, legal, or tax advice. Resolution of markets and payouts are subject to our rules and the specific market terms. Withdrawals and processing may be subject to verification and applicable limits.
          </p>

          <h2 {...stylex.props(styles.sectionHeading)}>Intellectual property</h2>
          <p {...stylex.props(styles.bodyText)}>
            The Sonotrade platform, including its design, branding, and content (other than user-generated content), is owned by us or our licensors. You may not copy, modify, or exploit our intellectual property without permission.
          </p>

          <h2 {...stylex.props(styles.sectionHeading)}>Disclaimer and limitation of liability</h2>
          <p {...stylex.props(styles.bodyText)}>
            The service is provided &quot;as is&quot;. We disclaim warranties to the fullest extent permitted by law. We are not liable for any indirect, incidental, special, or consequential damages, or for loss of profits or data, arising from your use of the platform. Our total liability is limited to the amount you have paid us in the twelve months preceding the claim, or as otherwise required by law.
          </p>

          <h2 {...stylex.props(styles.sectionHeading)}>Changes and termination</h2>
          <p {...stylex.props(styles.bodyText)}>
            We may change these Terms or the platform at any time. We will notify you of material changes (e.g. by email or a notice on the platform). Continued use after changes constitutes acceptance. We may suspend or terminate your account or access to the service for breach of these Terms or for any other reason at our discretion.
          </p>

          <h2 {...stylex.props(styles.sectionHeading)}>Disclaimers</h2>
          <p {...stylex.props(styles.bodyText)}>
            <strong>Sonotrade Radio.</strong> Sonotrade Radio is fully streamed via SoundCloud. None of the songs or music played on Sonotrade Radio are owned by Sonotrade or us. We do not own the rights to the songs being played and are simply streaming them as any user could themselves via digital service providers (DSPs). We have no intent to redistribute content illegally. If you are a rights holder and wish to have content removed, please <Link href="/contact" {...stylex.props(styles.navLink)}>contact us</Link> and we will take it down upon request.
          </p>

          <h2 {...stylex.props(styles.sectionHeading)}>Liquidity and infrastructure</h2>
          <p {...stylex.props(styles.bodyText)}>
            Prediction market liquidity on the platform is provided in partnership with Kalshi via Dflow. Their infrastructure and services support the operation of our markets.
          </p>
          <div {...stylex.props(styles.partnerLogosBlock)}>
            <div {...stylex.props(styles.logoWrap)}>
              <Image
                src="/kalshi-whitete.png"
                alt="Kalshi"
                width={63}
                height={20}
                {...stylex.props(styles.partnerLogo)}
              />
              <span {...stylex.props(styles.logoSeparator)} aria-hidden="true">×</span>
              <Image
                src="/sonotext.png"
                alt="Sonotrade"
                width={86}
                height={20}
                {...stylex.props(styles.partnerLogo)}
              />
            </div>
          </div>

          <h2 {...stylex.props(styles.sectionHeading)}>Contact</h2>
          <p {...stylex.props(styles.bodyText)}>
            For questions about these Terms, please contact us via the details on our <Link href="/contact" {...stylex.props(styles.navLink)}>Contact</Link> page.
          </p>
        </div>
      </section>
    </main>
  );
}
