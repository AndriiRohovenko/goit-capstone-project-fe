"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Check,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/Button";
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
    description:
      "Bring in requirements and artifacts that explain what to test.",
  },
  {
    number: "03",
    title: "Review coverage",
    description: "Explore AI-assisted results and find missing test scenarios.",
  },
];

export default function Home() {
  const router = useRouter();

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
              <Button type="button" onClick={() => router.push("/register")}>
                Start for free
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/login")}
              >
                Log in to your workspace
              </Button>
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
        </section>

        <section className={styles.features} aria-labelledby="features-title">
          <div className={styles.sectionHeading}>
            <span>Everything in one place</span>
            <h2 id="features-title">From requirements to confident coverage</h2>
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
            <h2 id="workflow-title">
              Move from idea to insight in three steps
            </h2>
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
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/register")}
            className={styles.ctaAction}
          >
            Create your workspace
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </section>
      </main>
    </GuestOnly>
  );
}
