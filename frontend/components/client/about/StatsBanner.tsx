import { aboutStats } from "@/constants";

export default function StatsBanner() {
  return (
    <section className="bg-brand-black text-white">
      <div className="custom-container grid grid-cols-2 md:grid-cols-4 gap-y-8 text-center py-12">
        {aboutStats.map((stat) => (
          <div key={stat.label}>
            <h2 className="font-roboto-serif text-3xl md:text-4xl font-semibold">
              {stat.value}
            </h2>
            <p className="mt-2 text-sm text-gray-300">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

