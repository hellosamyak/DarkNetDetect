function Card({ title, value, color, children }) {
  const colors = {
    rose: "text-rose-400",
    emerald: "text-emerald-400",
    blue: "text-blue-400",
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow">
      {title && <h3 className="text-sm text-gray-400">{title}</h3>}
      {value && (
        <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
      )}
      {children}
    </div>
  );
}

function CardContent({ children }) {
  return <div className="mt-2">{children}</div>;
}

export { Card, CardContent };
