interface SkillMatchProps {
    skills: string[];
}

const SkillMatch = ({ skills }: SkillMatchProps) => {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                    Matched Skills
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    Skills identified from the candidate's resume.
                </p>
            </div>

            <div className="flex flex-wrap gap-3">

                {skills.map((skill, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 transition-all duration-200 hover:scale-105 hover:bg-emerald-100"
                    >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                            ✓
                        </div>

                        <span className="text-sm font-medium text-gray-800">
                            {skill}
                        </span>
                    </div>
                ))}

            </div>

            {skills.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 py-8 text-center">
                    <p className="text-gray-500">
                        No matched skills found.
                    </p>
                </div>
            )}

        </div>
    );
};

export default SkillMatch;