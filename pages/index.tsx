import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import logger from 'pino'

const log = logger()

export default function Home() {
  log.info("serving page")
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
