interface MissingSkillsProps {
    skills: string[];
}

const MissingSkills = ({ skills }: MissingSkillsProps) => {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                    Missing Skills
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    Skills recommended for a stronger match with this job.
                </p>
            </div>

            {skills.length > 0 ? (
                <div className="flex flex-wrap gap-3">

                    {skills.map((skill, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 transition-all duration-200 hover:scale-105 hover:bg-red-100"
                        >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                !
                            </div>

                            <span className="text-sm font-medium text-gray-800">
                                {skill}
                            </span>
                        </div>
                    ))}

                </div>
            ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 py-8 text-center">

                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold text-white">
                        ✓
                    </div>

                    <h4 className="text-lg font-semibold text-emerald-700">
                        Excellent Match
                    </h4>

                    <p className="mt-2 text-sm text-emerald-600">
                        No important skills are missing.
                    </p>

                </div>
            )}

        </div>
    );
};

export default MissingSkills;