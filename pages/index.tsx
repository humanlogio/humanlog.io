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
        <meta name="go-import" content="humanlog.io/api git https://github.com/humanlog-io/api" />
        <meta name="go-source" content="humanlog.io https://github.com/humanlog-io/api https://github.com/humanlog-io/api/tree/master{/dir} https://github.com/humanlog-io/api/blob/master{/dir}/{file}#L{line}" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <code className={styles.titlecode}>humanlog.io</code>
      </main>
    </div>
  )
}
