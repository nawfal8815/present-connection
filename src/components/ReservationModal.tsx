import { useState } from "react";
import type { Room, Reservation } from "../types";
import { confirmReservation } from "../services/roomServices";

interface ReservationsProps {
	room: Room;
	userId: string;
	onClose: () => void;
}

export function ReservationModal({
	room,
	userId,
	onClose,
}: ReservationsProps) {
	const today = new Date();

	// The earliest selectable date is tomorrow.
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	// The booking horizon ends 90 days from today.
	const maxDate = new Date(today);
	maxDate.setDate(maxDate.getDate() + 90);

	const formatDate = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	};

	const [title, setTitle] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [attendees, setAttendees] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);


	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setSuccess(false);

		if (!room.isActive) {
			setError("This room is inactive and cannot be booked.");
			return;
		}

		if (!title.trim()) {
			setError("Please enter a meeting title.");
			return;
		}

		if (attendees < 1 || attendees > room.capacity) {
			setError(`Attendees must be between 1 and ${room.capacity}.`);
			return;
		}

		if (
			!startDate ||
			startDate < formatDate(tomorrow) ||
			startDate > formatDate(maxDate)
		) {
			setError("Choose a start date between tomorrow and 90 days from today.");
			return;
		}

		if (!endDate || endDate < startDate || endDate > formatDate(maxDate)) {
			setError("Choose a valid end date within the 90-day booking horizon.");
			return;
		}
		
		const data: Reservation = {
			id: null,
			roomId: room.id,
			userId: userId,
			startTime: startDate,
			endTime: endDate,
			attendees: Number(attendees),
			status: 0,
			title: title.trim(),
		};

		try {
			setLoading(true);
			await confirmReservation(data);
			setSuccess(true);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to handle your request"
			);
		} finally {
			setLoading(false);
		}
	};

	if (!room.isActive) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
			onClick={onClose}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="reservation-title"
				className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="mb-6 flex items-start justify-between gap-4">
					<div>
						<h2
							id="reservation-title"
							className="text-xl font-semibold text-text"
						>
							Book a room
						</h2>
						<p className="mt-1 text-sm text-second">
							Room: {room.name} · Capacity: {room.capacity}
						</p>
					</div>

					<button
						type="button"
						onClick={onClose}
						aria-label="Close reservation form"
						className="rounded-lg px-3 py-1 text-second hover:bg-background hover:text-text"
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="mb-1 block text-sm font-medium text-text">
							Meeting title
						</label>
						<input
							required
							maxLength={200}
							value={title}
							onChange={(event) => setTitle(event.target.value)}
							placeholder="e.g. Project planning"
							className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text outline-none focus:border-main"
						/>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-text">
							Number of attendees
						</label>
						<input
							required
							type="number"
							min={1}
							max={room.capacity}
							step={1}
							value={attendees}
							onChange={(event) => setAttendees(Number(event.target.value))}
							className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text outline-none focus:border-main"
						/>
						<p className="mt-1 text-xs text-second">
							Choose between 1 and {room.capacity} attendees.
						</p>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-text">
							Start date
						</label>
						<input
							required
							type="date"
							min={formatDate(tomorrow)}
							max={formatDate(maxDate)}
							value={startDate}
							onChange={(event) => {
								setStartDate(event.target.value);
								if (endDate && event.target.value > endDate) {
									setEndDate("");
								}
							}}
							className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text outline-none focus:border-main"
						/>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-text">
							End date
						</label>
						<input
							required
							type="date"
							min={startDate || formatDate(tomorrow)}
							max={formatDate(maxDate)}
							value={endDate}
							onChange={(event) => setEndDate(event.target.value)}
							className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text outline-none focus:border-main"
						/>
					</div>

					{error && (
						<p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
							{error}
						</p>
					)}

					{success && (
						<p className="text-success">
							Reservation created successfully!
						</p>
					)}

					<div className="flex justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="rounded-lg border border-border px-4 py-2 text-sm text-text hover:bg-background"
						>
							Cancel
						</button>

						<button
							type="submit"
							disabled={loading}
							className="rounded-lg bg-main px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{loading ? "Submitting..." : "Confirm booking"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}