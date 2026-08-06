import Container from "../../common/Container";

const companies = [
    "Google",
    "Microsoft",
    "OpenAI",
    "Amazon",
    "Netflix",
    "Adobe",
];

export default function Companies() {
    return (
        <section id="companies" className="overflow-hidden border-y border-neutral-200 bg-white py-14">
            <Container>
                <div className="text-center">
                    <p className="text-sm font-medium uppercase tracking-[0.25em] text-gray-500">
                        Trusted by innovative companies
                    </p>

                    <div className="mc-marquee mt-9 flex w-max gap-4">
                        {[...companies, ...companies].map((company, index) => (
                            <div
                                key={`${company}-${index}`}
                                className="flex h-14 w-40 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-base font-semibold text-neutral-400 grayscale transition hover:border-neutral-400 hover:bg-white hover:text-neutral-900 hover:grayscale-0"
                            >
                                {company}
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}
