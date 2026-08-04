import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  ClipboardCheck,
  FileSearch,
  FolderKanban,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { GuestOnly } from "@/features/auth/components/GuestOnly";
import styles from "./Home.module.scss";


const features = [
  {
    icon: FolderKanban,
    title: "Organize test projects",
    description:
      "Keep requirements, supporting artifacts, and coverage results together in one focused workspace.",
  },
  {
    icon: Sparkles,
    title: "Design with AI assistance",
    description:
      "Turn project context into structured testing ideas and spend more time reviewing what matters.",
  },
  {
    icon: BarChart3,
    title: "Understand coverage",
    description:
      "See which requirements are covered, identify gaps, and make decisions with clear traceability.",
  },
];

const workflow = [
  {
    number: "01",
    title: "Create a project",
    description: "Set up a dedicated workspace for a product or feature.",
  },
  {
    number: "02",
    title: "Add context",
    description: "Bring in requirements and artifacts that explain what to test.",
  },
  {
    number: "03",
    title: "Review coverage",
    description: "Explore AI-assisted results and find missing test scenarios.",
  },
];

export default function Home() {
  return (
    <GuestOnly>
      <main className={styles.home}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <Sparkles size={15} aria-hidden="true" />
              AI-assisted test design
            </div>
            <h1>
              Build better test coverage,
              <span> with less guesswork.</span>
            </h1>
            <p className={styles.heroDescription}>
              AI Test Design Workspace helps QA teams turn requirements into
              clear, traceable test coverage—from project context to actionable
              insights.
            </p>
            <div className={styles.heroActions}>
              <Link href="/register" className={styles.primaryAction}>
                Start for free
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/login" className={styles.secondaryAction}>
                Log in to your workspace
              </Link>
            </div>
            <div className={styles.reassurance}>
              <span>
                <Check size={15} aria-hidden="true" /> Quick setup
              </span>
              <span>
                <Check size={15} aria-hidden="true" /> Built for QA workflows
              </span>
            </div>
          </div>

          <div className={styles.preview} aria-label="Product workflow preview">
            <div className={styles.previewGlow} />
            <div className={styles.previewWindow}>
              <div className={styles.previewHeader}>
                <div className={styles.windowControls} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <span>Checkout redesign</span>
                <span className={styles.liveBadge}>Active</span>
              </div>
              <div className={styles.previewBody}>
                <div className={styles.previewSidebar} aria-hidden="true">
                  <span className={styles.sidebarActive} />
                  <span />
                  <span />
                  <span />
                </div>
                <div className={styles.previewContent}>
                  <div className={styles.previewTitle}>
                    <div>
                      <span>Coverage overview</span>
                      <strong>Requirements analysis</strong>
                    </div>
                    <ShieldCheck size={28} aria-hidden="true" />
                  </div>
                  <div className={styles.coverageCard}>
                    <div className={styles.coverageScore}>
                      <span>Coverage</span>
                      <strong>86%</strong>
                    </div>
                    <div className={styles.progressTrack}>
                      <span />
                    </div>
                    <div className={styles.coverageMeta}>
                      <span>24 covered</span>
                      <span>4 need attention</span>
                    </div>
                  </div>
                  <div className={styles.requirementList}>
                    <div>
                      <ClipboardCheck size={18} aria-hidden="true" />
                      <span>
                        <strong>Payment validation</strong>
                        8 test scenarios
                      </span>
                      <span className={styles.complete}>Covered</span>
                    </div>
                    <div>
                      <FileSearch size={18} aria-hidden="true" />
                      <span>
                        <strong>Guest checkout flow</strong>
                        5 test scenarios
                      </span>
                      <span className={styles.review}>Review</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.features} aria-labelledby="features-title">
          <div className={styles.sectionHeading}>
            <span>Everything in one place</span>
            <h2 id="features-title">
              From requirements to confident coverage
            </h2>
            <p>
              A practical workspace designed to make test planning easier to
              manage, understand, and improve.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {features.map(({ icon: Icon, title, description }) => (
              <article className={styles.featureCard} key={title}>
                <div className={styles.featureIcon}>
                  <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.howItWorks} aria-labelledby="workflow-title">
          <div className={styles.workflowIntro}>
            <span>Simple by design</span>
            <h2 id="workflow-title">Move from idea to insight in three steps</h2>
            <p>
              Start with the information you already have. The workspace keeps
              the process structured as your project grows.
            </p>
          </div>
          <ol className={styles.workflowList}>
            {workflow.map(({ number, title, description }) => (
              <li key={number}>
                <span className={styles.stepNumber}>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.cta}>
          <div>
            <span>Ready to improve your test design?</span>
            <h2>Give every requirement the coverage it deserves.</h2>
          </div>
          <Link href="/register" className={styles.ctaAction}>
            Create your workspace
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>

       
      </main>
    </GuestOnly>
  );
}
