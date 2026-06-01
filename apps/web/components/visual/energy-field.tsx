import styles from "./energy-field.module.css";

const bars = [
  34, 52, 42, 70, 58, 86, 48, 64, 92, 74, 40, 62, 78, 56, 88, 68, 46, 60, 82,
  72, 50, 94, 66, 44, 76, 90, 54, 69, 84, 57, 38, 73, 96, 63, 49, 81, 59, 87,
  71, 43, 65, 79
];

export function EnergyField() {
  return (
    <div className={styles.field} aria-hidden="true">
      <div className={styles.waveform}>
        {bars.map((height, index) => (
          <span
            // The index is stable because this is a fixed visual spectrum.
            key={`${height}-${index}`}
            className={styles.bar}
            style={{
              height: `${height}px`,
              animationDelay: `${index * 70}ms`
            }}
          />
        ))}
      </div>
    </div>
  );
}
