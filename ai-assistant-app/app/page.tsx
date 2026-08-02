import Image from "next/image";
import { GuestOnly } from "@/features/auth/components/GuestOnly";
import styles from "./Home.module.scss";

export default function Home() {
  return (
    <GuestOnly>
      <div className={styles.home}>
        <main className={styles.main}>
          <div>
            <h1>AI Assistant</h1>
            <p>
              Homepage AI Assistant is a tool that helps you with your tasks.
            </p>
          </div>
        </main>
      </div>
    </GuestOnly>
  );
}
