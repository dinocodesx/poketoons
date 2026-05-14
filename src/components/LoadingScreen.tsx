export function LoadingScreen() {
  return (
    <main className="loading-screen">
      <div className="loading-screen__panel">
        <p className="eyebrow">Hydrating Local Save</p>
        <h1>Preparing the next encounter</h1>
        <p>
          Loading the first 251 Pokemon, rarity buckets, and your browser-stored
          progress.
        </p>
        <div className="loading-bar" aria-hidden="true">
          <span />
        </div>
      </div>
    </main>
  );
}
