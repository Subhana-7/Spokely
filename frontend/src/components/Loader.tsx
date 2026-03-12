function Loader() {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.text}> Loading...</p>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  text: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "500",
  },
};

export default Loader;
