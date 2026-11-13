export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { startPublicSnapshotRefreshSchedule } = await import(
    "./lib/publicSnapshot"
  );
  startPublicSnapshotRefreshSchedule();
}
