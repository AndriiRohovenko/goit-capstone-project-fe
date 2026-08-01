import Image from "next/image";
import { GuestOnly } from "@/features/auth/components/GuestOnly";
import styles from "./Home.module.scss";

export default function Home() {
  return (
    <GuestOnly>
      <div className={styles.home}>
        <main className={styles.main}>
          <Image
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <div className={styles.content}>
            <h1 className={styles.title}>
              To get started, edit the page.tsx file.
            </h1>
            <p className={styles.description}>
              Looking for a starting point or more instructions? Head over to{" "}
              <a
                href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              >
                Templates
              </a>{" "}
              or the{" "}
              <a
                href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              >
                Learning
              </a>{" "}
              center.
            </p>
          </div>
          <div className={styles.actions}>
            <a
              className={styles.primary}
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/vercel.svg"
                alt="Vercel logomark"
                width={16}
                height={16}
              />
              Deploy Now
            </a>
            <a
              className={styles.secondary}
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
          </div>
        </main>
      </div>
    </GuestOnly>
  );
}
