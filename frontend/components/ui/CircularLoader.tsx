export function CircularLoader({ size = 24 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `${Math.max(2, size / 8)}px solid rgba(255, 255, 255, 0.2)`,
        borderTop: `${Math.max(2, size / 8)}px solid white`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
}
