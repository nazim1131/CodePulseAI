export const StatCard = ({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-card p-5 card-hover">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      {icon && <span className="text-primary">{icon}</span>}
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
  </div>
);
