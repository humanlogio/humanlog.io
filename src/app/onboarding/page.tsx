"use client";

export default function OnboardingPage() {
  return (
    <html>
      <head>
        <title>Welcome to Humanlog</title>
        <meta httpEquiv="refresh" content="3;url=/localhost/query" />
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 2rem;
            box-sizing: border-box;
          }
          .card {
            max-width: 500px;
            width: 100%;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            background-color: white;
            text-align: center;
          }
          h1 {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }
          p {
            margin-bottom: 1rem;
          }
          .loader {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
            margin-top: 2rem;
          }
          .spinner {
            width: 1rem;
            height: 1rem;
            border-radius: 50%;
            border: 2px solid #3b82f6;
            border-top-color: transparent;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}} />
      </head>
      <body>
        <div className="card">
          <h1>Welcome to Humanlog!</h1>
          <p>Setting up your account...</p>
          <p>You'll be redirected to the query interface in a moment.</p>
          <div className="loader">
            <div className="spinner"></div>
            <span>Redirecting...</span>
          </div>
        </div>
      </body>
    </html>
  );
}
