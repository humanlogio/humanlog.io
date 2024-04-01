import logger from 'pino';

const log = logger();

export default function Home() {
  log.info("serving Home");
  return (
    <div>
      
    </div>
  );
}