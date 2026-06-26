import { YoeGuideBody } from "@/components/guides/yoe-guide-body";

type YoePrepSectionProps = {
  content: string;
  title?: string;
};

export function YoePrepSection({ content, title = "Antes de tu turno" }: YoePrepSectionProps) {
  return (
    <section className="mt-8 rounded-2xl border border-[#B88E2F]/25 bg-[#B88E2F]/8 px-4 py-4">
      <h2 className="mb-4 font-heading text-[17px] tracking-[0.02em] text-[#996515]">{title}</h2>
      <YoeGuideBody content={content} />
    </section>
  );
}
