import { useState } from "react";
import { scheduleInterview } from "../../services/interview.service";
import type { ScheduleInterviewDto } from "../../types/interview";

type Props = {
    open: boolean;
    applicationId: string;
    onClose: () => void;
    onSuccess: () => void;
};

const ScheduleInterviewModal = ({
    open,
    applicationId,
    onClose,
    onSuccess,
}: Props) => {
    const [loading, setLoading] =
        useState(false);

    const [form, setForm] =
        useState<ScheduleInterviewDto>({
            applicationId,
            interviewDate: "",
            duration: 60,
            mode: "Online",
            meetingLink: "",
            venue: "",
            notes: "",
        });

    if (!open) return null;

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        try {
            setLoading(true);

            await scheduleInterview({
                ...form,
                applicationId,
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Unable to schedule interview.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="w-full max-w-xl rounded-3xl bg-white p-8">

                <h2 className="mb-8 text-2xl font-bold">
                    Schedule Interview
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div>

                        <label className="mb-2 block font-medium">
                            Interview Date
                        </label>

                        <input
                            type="datetime-local"
                            required
                            value={form.interviewDate}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    interviewDate:
                                        e.target.value,
                                })
                            }
                            className="w-full rounded-xl border p-3"
                        />

                    </div>

                    <div>

                        <label className="mb-2 block font-medium">
                            Duration (Minutes)
                        </label>

                        <input
                            type="number"
                            value={form.duration}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    duration:
                                        Number(
                                            e.target.value
                                        ),
                                })
                            }
                            className="w-full rounded-xl border p-3"
                        />

                    </div>

                    <div>

                        <label className="mb-2 block font-medium">
                            Mode
                        </label>

                        <select
                            value={form.mode}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    mode:
                                        e.target
                                            .value as
                                        "Online" |
                                        "Offline",
                                })
                            }
                            className="w-full rounded-xl border p-3"
                        >

                            <option>
                                Online
                            </option>

                            <option>
                                Offline
                            </option>

                        </select>

                    </div>

                    {form.mode === "Online" ? (

                        <div>

                            <label className="mb-2 block font-medium">
                                Meeting Link
                            </label>

                            <input
                                type="text"
                                value={
                                    form.meetingLink
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        meetingLink:
                                            e.target
                                                .value,
                                    })
                                }
                                className="w-full rounded-xl border p-3"
                            />

                        </div>

                    ) : (

                        <div>

                            <label className="mb-2 block font-medium">
                                Venue
                            </label>

                            <input
                                type="text"
                                value={
                                    form.venue
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        venue:
                                            e.target
                                                .value,
                                    })
                                }
                                className="w-full rounded-xl border p-3"
                            />

                        </div>

                    )}

                    <div>

                        <label className="mb-2 block font-medium">
                            Notes
                        </label>

                        <textarea
                            rows={4}
                            value={form.notes}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    notes:
                                        e.target
                                            .value,
                                })
                            }
                            className="w-full rounded-xl border p-3"
                        />

                    </div>

                    <div className="flex justify-end gap-3">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border px-6 py-3"
                        >
                            Cancel
                        </button>

                        <button
                            disabled={loading}
                            className="rounded-xl bg-black px-6 py-3 text-white"
                        >
                            {loading
                                ? "Scheduling..."
                                : "Schedule"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default ScheduleInterviewModal;