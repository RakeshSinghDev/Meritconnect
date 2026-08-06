import { Search } from "lucide-react";

const JobFilters = () => {
    return (

        <div className="mb-8 flex flex-wrap items-center gap-4">

            <div className="relative">

                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    placeholder="Search jobs..."
                    className="h-11 w-80 rounded-xl border border-gray-200 bg-white pl-11 outline-none focus:border-black"
                />

            </div>

            <select className="h-11 rounded-xl border border-gray-200 px-4">

                <option>Status</option>
                <option>Active</option>
                <option>Closed</option>

            </select>

            <select className="h-11 rounded-xl border border-gray-200 px-4">

                <option>Employment</option>
                <option>Full Time</option>
                <option>Internship</option>

            </select>

        </div>

    );
};

export default JobFilters;