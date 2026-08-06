import Button from "../../ui/Button";

const DashboardHeader = () => {
    return (
        <div className="mb-10 flex items-center justify-between">

            <div>

                <h1 className="text-4xl font-bold tracking-tight">
                    Good Evening 👋
                </h1>

                <p className="mt-2 text-gray-500">
                    Welcome back. Manage your hiring pipeline from one place.
                </p>

            </div>

            <Button>
                + Create Job
            </Button>

        </div>
    );
};

export default DashboardHeader;