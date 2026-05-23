import { YoeGuideBody } from "@/components/guides/yoe-guide-body";

type YoePrepSectionProps = {
  content: string;
  title?: string;
};

export function YoePrepSection({ content, title = "Antes de tu turno" }: YoePrepSectionProps) {
  return (
    <section className="mt-8 rounded-2xl border border-[var(--premium-gold)]/20 bg-[rgba(228,202,105,0.04)] px-4 py-4">
      <h2 className="mb-4 font-heading text-[17px] tracking-[0.02em] text-[var(--premium-gold)]">{title}</h2>
      <YoeGuideBody content={content} />
    </section>
  );
}
