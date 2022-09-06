import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>humanlog.io</title>
        <meta name="description" content="humanlog.io" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <code className={styles.titlecode}>humanlog.io</code>
      </main>
    </div>
  )
}
